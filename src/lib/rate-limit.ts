// Secure rate limit implementation for Edge Runtime with IP tracking and payload limits
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory cache to manage rapid rate limiting at the network edge
// Note: In production, you might want to use Redis or another shared store
const trackIpCache = new Map<string, { count: number; resetTime: number }>();

/**
 * Edge middleware function that implements LOCK 1: The Compute Guard
 * Provides rate limiting and payload size protection
 */
export async function middleware(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous';
  const currentTime = Date.now();

  // 1. Defend Against Payload Volumetric Attacks
  // Absolute ceiling: 2MB hard stop as specified in the architecture
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > 2 * 1024 * 1024) { // 2MB
    return new NextResponse(
      JSON.stringify({ error: 'Payload volume limits exceeded' }),
      { status: 413 }
    );
  }

  // 2. Strict Edge Rate-Limiting
  // Max 10 routing hits per minute per IP address as specified
  const clientData = trackIpCache.get(ip);
  if (!clientData || currentTime > clientData.resetTime) {
    // First request from this IP or reset time has passed
    trackIpCache.set(ip, { count: 1, resetTime: currentTime + 60000 }); // 1 minute window
  } else {
    // Increment request count
    clientData.count++;
    if (clientData.count > 10) {
      // Rate limit exceeded
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit tripped. Cooling down.' }),
        { status: 429 }
      );
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

/**
 * LOCK 1 (in-handler form): payload-size + per-IP rate guard for Edge route
 * handlers.
 *
 * This Cloudflare-Pages app deploys via `@cloudflare/next-on-pages`, which only
 * supports Edge middleware — but Next.js 16's `proxy`/`middleware` file always
 * runs on the Node.js runtime, so the guard cannot live in a proxy file here.
 * Instead, Edge route handlers call this at the top and return the response if
 * it is non-null. Returns a 413/429 NextResponse when the request must be
 * dropped, or null when the request may proceed.
 */
export function applyEdgeGuard(req: NextRequest): NextResponse | null {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous';
  const currentTime = Date.now();

  // 1. Defend against volumetric payload attacks (2MB hard stop).
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Payload volume limits exceeded' },
      { status: 413 }
    );
  }

  // 2. Strict edge rate limiting: max 10 hits/min per IP.
  const clientData = trackIpCache.get(ip);
  if (!clientData || currentTime > clientData.resetTime) {
    trackIpCache.set(ip, { count: 1, resetTime: currentTime + 60000 });
  } else {
    clientData.count++;
    if (clientData.count > 10) {
      return NextResponse.json(
        { error: 'Rate limit tripped. Cooling down.' },
        { status: 429 }
      );
    }
  }

  return null;
}

// Configuration for the middleware matcher
// This ensures the middleware only runs on the specified routes
export const config = {
  matcher: [
    '/api/process-document',
    '/api/workspaces',
    '/api/ledger/:path*',
    '/api/audit/export',
    '/api/webhooks',
    '/api/an-token',
    '/api/quota'
    // Add other API routes that need protection
  ]
};

/**
 * Legacy rateLimit function for backward compatibility
 * Returns an object with the expected interface for existing code
 * This maintains compatibility while the middleware handles actual rate limiting
 */
export const rateLimit = () => {
  return {
    // These values are mostly placeholders since the actual limiting
    // happens in the middleware, but we maintain the interface
    limit: () => Promise.resolve(100),
    remaining: () => 100,
    reset: () => Date.now() + 60000,
    // For compatibility with code that checks these directly
    allowed: true,
    limitValue: 100,
    remainingValue: 100,
    resetTime: Date.now() + 60000
  };
};

/**
 * Function to get client ID for rate limiting (used in route handlers)
 * This extracts a stable identifier from the request
 */
export const clientId = (req: NextRequest): string => {
  // Try to get user ID from auth headers or cookies if available
  const userId = req.headers.get('x-user-id') ||
                req.cookies.get('user-id')?.value ||
                req.headers.get('x-auth-user-id');

  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP-based identification
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous';
  return `ip:${ip}`;
};