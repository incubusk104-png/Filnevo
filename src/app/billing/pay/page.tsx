export const runtime = "edge";
import { Suspense } from "react";
import { PayContent } from "./PayContent";

// Static (prerendered) so it is served from Cloudflare Pages assets rather than
// an Edge function — `?tier=` is read client-side in `PayContent`. This keeps
// the Worker bundle under the free-plan 3 MiB cap.
export default function PayPage() {
  return (
    <Suspense>
      <PayContent />
    </Suspense>
  );
}
