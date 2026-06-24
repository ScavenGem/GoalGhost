# Changelog

All notable changes to GoalGhost are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-24

### Added

- **GoalGhost creation** — Nation and personality selection with 0G Compute identity generation
- **0G Storage seal** — ECIES-encrypted profiles and fan journey records with content-addressed roots
- **0G Chain ownership** — Agentic ID mint linked to storage roots on Aristotle mainnet
- **My Ghost** — Evolution score, mood, confidence, and on-demand Evolve Narrative
- **Fan Journey** — Chronological evolution timeline with Storage verification links
- **Match Center** — Live match feed, emoji reactions, and 0G Compute match reactions
- **World Cup news** — Home-page headlines with wallet-signed comments and media attachments
- **Legacy Wrapped** — Cinematic Spirit ceremony with share, seal, download, and replay
- **Legacy comments** — Wallet-signed public comments wall on `/legacy`
- **0G irreplaceable banners** — Compute, Storage, and Chain callouts across key surfaces
- **Production deployment** — [goalghost.vercel.app](https://goalghost.vercel.app) on Vercel with Neon Postgres index cache

### Technical

- Next.js 15 App Router, TypeScript, Tailwind CSS v4, Framer Motion
- RainbowKit + Wagmi wallet integration on 0G Aristotle (chain `16661`)
- Prisma + Neon PostgreSQL for index caching (`rootHash` lookups)
- `@0gfoundation/0g-compute-ts-sdk` and `@0gfoundation/0g-storage-ts-sdk` integration
- Compute API routes: `create-ghost`, `match-reaction`, `evolve`, `legacy`

[1.0.0]: https://github.com/ScavenGem/GoalGhost/releases/tag/v1.0.0