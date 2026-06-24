-- CreateTable
CREATE TABLE "CommentMediaCache" (
    "rootHash" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentMediaCache_pkey" PRIMARY KEY ("rootHash")
);