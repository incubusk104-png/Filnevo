// Single source of truth for AI provider/model routing.
//
// Routing policy (must stay in sync with the SQL function
// check_and_increment_quota in supabase/migrations/20260603000004_*.sql):
//
//   free tier  -> Cerebras (free account, zero marginal cost)
//   paid tiers -> cheap-but-accurate OpenAI model
//
// Free users never hit the paid provider, and every paid tier shares one cheap
// OpenAI model, so quota/spend is never wasted on the wrong vendor.

export type SubscriptionTier =
  | "free"
  | "starter"
  | "business_pro"
  | "agency_core";

export type AiProvider = "cerebras" | "openai";

export interface ModelAssignment {
  provider: AiProvider;
  /** Provider-native model id. */
  model: string;
}

// Recommended models: highest accuracy available within each cost bucket.
//  - gpt-oss-120b: Cerebras production model, free tier, supports structured
//    outputs/tool calling — strong accuracy for BIR document extraction.
//  - gpt-4o-mini: cheapest accurate OpenAI model; the margin math for the
//    ₱2,499 / 5,000-scan Agency tier assumes this model.
export const CEREBRAS_FREE_MODEL = "gpt-oss-120b";
export const OPENAI_PAID_MODEL = "gpt-4o-mini";

export const FREE_ASSIGNMENT: ModelAssignment = {
  provider: "cerebras",
  model: CEREBRAS_FREE_MODEL,
};

export const PAID_ASSIGNMENT: ModelAssignment = {
  provider: "openai",
  model: OPENAI_PAID_MODEL,
};

/** Resolve the provider/model a tier should be routed to. */
export function resolveModel(tier: SubscriptionTier): ModelAssignment {
  return tier === "free" ? FREE_ASSIGNMENT : PAID_ASSIGNMENT;
}

export interface ProviderEndpoint {
  apiKey: string | undefined;
  baseUrl: string;
}

// API keys are read from the environment only — never hard-coded or committed.
// Set CEREBRAS_API_KEY and OPENAI_API_KEY in deployment env (e.g. Cloudflare
// Pages / Vercel project secrets), not in the repo.
export function getProviderEndpoint(provider: AiProvider): ProviderEndpoint {
  switch (provider) {
    case "cerebras":
      return {
        apiKey: process.env.CEREBRAS_API_KEY,
        baseUrl: "https://api.cerebras.ai/v1",
      };
    case "openai":
      return {
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: "https://api.openai.com/v1",
      };
  }
}
