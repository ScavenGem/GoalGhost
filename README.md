# GoalGhost - 0G Zero Cup Submission

**Deadline: June 23, 2026**

> *Every World Cup creates memories. GoalGhost makes them permanent.*

A living football identity where **0G primitives are load-bearing** - not decorative. Remove any layer and the product breaks.

---

## Zero Cup Compliance Narrative

GoalGhost is built for the 0G Zero Cup thesis: **AI-native applications where 0G Compute, Storage, and Chain each own irreplaceable work.**

### What judges see in the UI

Every major action displays explicit judge badges:

| Badge | Meaning |
|---|---|
| **Powered by 0G Compute (intelligence)** | Ghost birth, match reactions, evolution, Legacy Wrapped |
| **0G Storage (permanent memories)** | ECIES-encrypted profiles, timeline cards, legacy seal |
| **0G Chain (verifiable ownership)** | Wallet connect, Agentic ID mint, milestone anchoring |

Plus the banner: **"0G does irreplaceable work here"** - on Home, Create success, My Ghost, Memory Timeline, and Legacy.

### Submission polish (June 2026)

| Check | Status | Implementation |
|---|---|---|
| **Football-themed avatars** | Verified | Procedural SVG ghosts in `src/lib/ghost/avatar.ts` - team kit palettes, jerseys, scarves, captain armbands, boots, pitch, stadium lights. Seeded by name + team + traits + mood so every ghost is unique. Used on Create, My Ghost, and birth ritual. |
| **Nation flags in Match Center** | Verified | `TeamWithFlag` + `flagForTeam()` in `src/lib/football/flags.ts`. Match cards pass `homeTeamCode` / `awayTeamCode`. Ghost banner on `/matches` shows nation flag. Home live cards use the same component. |
| **No em dashes in UI copy** | Verified | All `src/` UI strings use hyphens (`-`) or middle dots (`·`). Grep for `\u2013` / `\u2014` in `src/` returns zero matches. |
| **Production build** | Verified | `npm run build` completes with zero errors (Next.js 15.5.19, June 2026). |

### What judges verify technically

1. **Compute** - `POST /api/compute/*` routes use `@0gfoundation/0g-compute-ts-sdk` (live) or structured mock (demo). Search `JUDGE NOTE` in codebase.
2. **Storage** - Browser-wallet ECIES upload (`upload-browser.ts`). Every memory card links to [storagescan.0g.ai](https://storagescan.0g.ai).
3. **Chain** - `GoalGhostAgenticID.sol` with `iMint` + `logMilestone` (Galileo deployed; mainnet optional).
4. **Postgres is disposable** - Drop DB; ghosts survive on Storage. Cache indexes rootHashes only.

### The full user loop

```
Connect wallet     → 0G Chain (verifiable ownership)
Choose nation/soul → Premium Create flow
Awaken Soul        → Powered by 0G Compute (intelligence)
Seal to Storage    → 0G Storage (permanent memories)
Match Center       → Feel This Match → Compute + Storage
Memory Timeline    → Chronological proof layer (earliest → latest)
Legacy Wrapped     → Auto-play slides → Share link → Confetti
```

---

## Why 0G Is Irreplaceable

### Remove 0G Compute → intelligence dies

Ghosts have no birth story, no match feelings, no evolution narrative, no Legacy Wrapped. Static JSON replaces a living soul.

| Endpoint | Irreplaceable output |
|---|---|
| `/api/compute/create-ghost` | Name, backstory, mood, traits, voice |
| `/api/compute/match-reaction` | Emotional reaction + evolution delta |
| `/api/compute/evolve` | Transformation narrative |
| `/api/compute/legacy` | Spotify Wrapped-style summary |

### Remove 0G Storage → memories die

Without Storage, memories live in Postgres - centralized, deletable, not wallet-owned. Judges verify: complete Create → copy rootHash → confirm on Storage Scan → drop Postgres → ghost profile persists.

### Remove 0G Chain → ownership dies

Without Chain, identity is a cache row. No portable Agentic ID, no on-chain milestone proof, no verifiable ownership.

### The irreplaceability matrix

| Remove | GoalGhost becomes… |
|---|---|
| 0G Compute only | A static profile with no feelings |
| 0G Storage only | A centralized app that forgets |
| 0G Chain only | A database entry anyone could fake |
| All three | Nothing - the product does not exist |

---

## Quick Start

```bash
npm install
cp .env.example .env.local
npx prisma db push
npm run build
npm run dev
```

Open **http://localhost:3000**

### Network: 0G Aristotle Mainnet

| Setting | Value |
|---|---|
| Chain ID | `16661` |
| RPC | `https://evmrpc.0g.ai` |
| Storage Indexer | `https://indexer-storage-turbo.0g.ai` |
| Storage Explorer | [storagescan.0g.ai](https://storagescan.0g.ai) |

### Compute modes

| Mode | When |
|---|---|
| `mock` (default) | Demo without compute ledger deposit |
| `live` | Fund compute wallet ≥3 OG → `npm run compute:init` |

Storage uploads are **always real mainnet ECIES** regardless of compute mode.

---

## Pages

| Route | Experience |
|---|---|
| `/` | Premium hero, live matches with nation flags, irreplaceable banner |
| `/create` | Magical birth ritual, procedural football avatars, team/personality cards, Storage seal proof |
| `/ghost` | Breathing ghost avatar, evolution arc, nation flag, next-match teaser |
| `/matches` | Match Center with nation flags → Feel This Match → Compute + Storage |
| `/memories` | Proof layer - chronological, scroll animations, Storage verify |
| `/legacy` | Wrapped auto-play, confetti, share link, emotional chapters |

**Mobile:** Bottom nav on small screens. Responsive padding throughout.

---

## 60-Second Demo Video Script

| Time | Visual | Narration |
|---|---|---|
| **0-5s** | Home hero `#0A1020` + gold | *"Every World Cup creates memories. GoalGhost makes them permanent on 0G."* |
| **5-10s** | "0G does irreplaceable work" banner + badges | *"Compute for intelligence. Storage for permanent memories. Chain for verifiable ownership."* |
| **10-16s** | `/create` → wallet connect | *"Your wallet owns everything."* |
| **16-24s** | Nation cards hover → Loyal personality → Awaken | *"Choose your nation. Shape your soul. 0G Compute births a unique ghost."* |
| **24-32s** | Magical birth ritual → football avatar reveal → Seal | *"Watch the birth ritual. Then seal to mainnet Storage - ECIES encrypted."* |
| **32-36s** | Success proof screen → Storage Scan links | *"Judge proof: verify hashes on storagescan."* |
| **36-42s** | `/ghost` → breathing avatar, evolution arc | *"Your ghost lives. Evolves with every match you feel."* |
| **42-48s** | `/matches` → flags on teams → Feel This Match → toast | *"Real football. Real feelings. Permanent memories."* |
| **48-54s** | `/memories` → scroll chronological timeline | *"The proof layer. Every moment, verifiable on 0G Storage."* |
| **54-60s** | `/legacy` → confetti → auto-play → Share | *"Your World Cup Wrapped. Share your legacy. Forever on 0G."* |

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | RainbowKit |
| `DATABASE_URL` | Yes | Postgres cache (not source of truth) |
| `OG_COMPUTE_MODE` | Yes | `mock` or `live` |
| `NEXT_PUBLIC_OG_COMPUTE_MODE` | Yes | Client mock indicator |
| `NEXT_PUBLIC_AGENTIC_ID_CONTRACT` | No | Empty = storage-only create |
| `FOOTBALL_DATA_API_KEY` | Optional | football-data.org live matches |

---

## Build

```bash
npm run build    # zero errors required for submission
npm run dev      # do NOT run build while dev is active
```

Last verified: **June 18, 2026** - `npm run build` exits 0, all 16 routes compile, types and lint pass.

**Contract (Galileo):** `0xdf091dE4f77cb8E197E1cA7b14B53D7093631EE4`

---

## Tech Stack

Next.js 15 · Tailwind v4 · Framer Motion · RainbowKit · Wagmi · Prisma · `@0gfoundation/0g-compute-ts-sdk` · `@0gfoundation/0g-storage-ts-sdk`