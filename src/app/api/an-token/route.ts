import { type NextRequest } from "next/server";
import { createTokenHandler } from "@/mock/@21st-sdk/nextjs/server";
import { applyEdgeGuard } from "@/lib/rate-limit";

export const runtime = "edge";

const handler = createTokenHandler({
  apiKey: process.env.API_KEY_21ST!,
});

export async function POST(req: NextRequest) {
  const guard = applyEdgeGuard(req);
  if (guard) return guard;
  return handler.POST(req);
}
