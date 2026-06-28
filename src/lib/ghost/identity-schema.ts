import { z } from "zod";

const banterStyleSchema = z.enum([
  "fiery_debater",
  "poetic_supporter",
  "visual_banter",
  "analytical_voice",
  "loyal_chant_leader",
  "quiet_observer",
]);

const reactionPatternSchema = z.enum([
  "celebration_driven",
  "heartbreak_weighted",
  "social_reactor",
  "match_day_purist",
  "balanced_fan",
]);

export const walletIdentitySchema = z.object({
  walletFingerprint: z.string(),
  creationSeed: z.number(),
  banterStyle: banterStyleSchema,
  reactionPattern: reactionPatternSchema,
  evolutionArchetype: z.string(),
  personalityPresentation: z.string(),
  expressionStyle: z.string(),
  voiceSignature: z.string(),
  visualAccentKey: z.string(),
  nameEpithet: z.string(),
  distinctnessDirectives: z.string(),
  journeySignature: z.string(),
  banterExcerpts: z.array(z.string()),
});