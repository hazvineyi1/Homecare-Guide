import Anthropic from "@anthropic-ai/sdk";

if (!process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
  throw new Error(
    "AI_INTEGRATIONS_ANTHROPIC_API_KEY must be set. Provide an Anthropic API key.",
  );
}

// Base URL is optional: when unset, the SDK targets the real Anthropic API
// (https://api.anthropic.com). Set AI_INTEGRATIONS_ANTHROPIC_BASE_URL only when
// routing through a proxy or gateway.
const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || undefined;

export const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  ...(baseURL ? { baseURL } : {}),
});

/**
 * Default model id for tutor/chat calls. Overridable per-deploy via
 * ANTHROPIC_MODEL so the model can be pinned or upgraded without a code change.
 */
export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
