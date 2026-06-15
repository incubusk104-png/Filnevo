export const runtime = "edge";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center px-6">
      <h1 className="font-heading text-6xl font-bold mb-4 text-velocity-blue">404</h1>
      <p className="text-xl text-text-muted mb-8 font-body">The page you're looking for doesn't exist.</p>
      <Link href="/" className="btn-primary font-metrics uppercase tracking-wider text-xs">
        Return Home
      </Link>
    </div>
  );
}
