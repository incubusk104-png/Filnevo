export const runtime = "edge";
import { Suspense } from "react";
import { SuccessContent } from "./SuccessContent";

// Static (prerendered) so it is served from Cloudflare Pages assets rather than
// an Edge function — the success/tier params are read client-side in
// `SuccessContent`. This keeps the Worker bundle under the free-plan 3 MiB cap.
export default function BillingSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
