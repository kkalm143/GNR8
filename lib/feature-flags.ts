/**
 * Feature flags for launch and experiments.
 * Set NEXT_PUBLIC_FEATURE_<KEY>=true to enable.
 * To add a flag: add one entry to FLAG_KEYS below; type and featureFlags are derived from it.
 */

const FLAG_KEYS = ["groups"] as const;
export type FeatureFlagKey = (typeof FLAG_KEYS)[number];

function envFlag(name: string): boolean {
  return process.env[`NEXT_PUBLIC_FEATURE_${name.toUpperCase()}`] === "true";
}

export const featureFlags = Object.fromEntries(
  FLAG_KEYS.map((key) => [key, envFlag(key)])
) as Record<FeatureFlagKey, boolean>;
