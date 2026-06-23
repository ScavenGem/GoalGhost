-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "GhostCache" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "profileRoot" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "evolutionScore" INTEGER NOT NULL DEFAULT 0,
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "mood" TEXT NOT NULL DEFAULT 'calm',
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GhostCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryIndex" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "emotionalTone" TEXT,
    "matchId" TEXT,
    "rootHash" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoryIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchPollState" (
    "matchId" TEXT NOT NULL,
    "lastEventHash" TEXT NOT NULL,
    "lastPolledAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchPollState_pkey" PRIMARY KEY ("matchId")
);

-- CreateTable
CREATE TABLE "LegacyComment" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "walletAddress" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "rootHash" TEXT NOT NULL,
    "mediaRootHash" TEXT,
    "mediaType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegacyComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsComment" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "walletAddress" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "rootHash" TEXT NOT NULL,
    "mediaRootHash" TEXT,
    "mediaType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReaction" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "emojiId" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchEmojiReaction" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "reactionId" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "rootHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchEmojiReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GhostCache_tokenId_key" ON "GhostCache"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "GhostCache_walletAddress_key" ON "GhostCache"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryIndex_eventId_key" ON "MemoryIndex"("eventId");

-- CreateIndex
CREATE INDEX "MemoryIndex_tokenId_occurredAt_idx" ON "MemoryIndex"("tokenId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyComment_commentId_key" ON "LegacyComment"("commentId");

-- CreateIndex
CREATE INDEX "LegacyComment_createdAt_idx" ON "LegacyComment"("createdAt");

-- CreateIndex
CREATE INDEX "LegacyComment_walletAddress_idx" ON "LegacyComment"("walletAddress");

-- CreateIndex
CREATE INDEX "LegacyComment_parentCommentId_idx" ON "LegacyComment"("parentCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsComment_commentId_key" ON "NewsComment"("commentId");

-- CreateIndex
CREATE INDEX "NewsComment_articleId_createdAt_idx" ON "NewsComment"("articleId", "createdAt");

-- CreateIndex
CREATE INDEX "NewsComment_walletAddress_idx" ON "NewsComment"("walletAddress");

-- CreateIndex
CREATE INDEX "NewsComment_parentCommentId_idx" ON "NewsComment"("parentCommentId");

-- CreateIndex
CREATE INDEX "CommentReaction_scope_commentId_idx" ON "CommentReaction"("scope", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_scope_commentId_walletAddress_key" ON "CommentReaction"("scope", "commentId", "walletAddress");

-- CreateIndex
CREATE INDEX "MatchEmojiReaction_matchId_idx" ON "MatchEmojiReaction"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchEmojiReaction_matchId_walletAddress_key" ON "MatchEmojiReaction"("matchId", "walletAddress");

-- AddForeignKey
ALTER TABLE "MemoryIndex" ADD CONSTRAINT "MemoryIndex_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "GhostCache"("tokenId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegacyComment" ADD CONSTRAINT "LegacyComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "LegacyComment"("commentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsComment" ADD CONSTRAINT "NewsComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "NewsComment"("commentId") ON DELETE CASCADE ON UPDATE CASCADE;

