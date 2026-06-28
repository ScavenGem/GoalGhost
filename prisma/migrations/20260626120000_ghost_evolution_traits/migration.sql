-- AlterTable
ALTER TABLE "GhostCache" ADD COLUMN "traits" JSONB;

-- AlterTable
ALTER TABLE "MemoryIndex" ADD COLUMN "evolutionDelta" INTEGER;