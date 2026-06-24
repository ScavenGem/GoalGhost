import { NextResponse } from "next/server";
import { z } from "zod";
import { sealEciesJsonOnServer } from "@/lib/0g/storage/seal-ecies-server";
import { getStorageEnvStatus } from "@/lib/0g/storage/storage-env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  walletAddress: z.string().min(1),
  storageSignature: z.string().min(1),
  json: z.record(z.string(), z.unknown()),
});

function formatError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return `Invalid request: ${error.issues.map((i) => i.message).join("; ")}`;
  }
  if (error instanceof Error) return error.message;
  return "0G Storage seal failed";
}

export async function POST(req: Request) {
  let body: z.infer<typeof schema>;

  try {
    body = schema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: formatError(e) }, { status: 400 });
  }

  const env = getStorageEnvStatus();

  try {
    if (!env.uploaderKeySet) {
      throw new Error(env.issues.join(" "));
    }

    const result = await sealEciesJsonOnServer({
      json: body.json,
      walletAddress: body.walletAddress,
      storageSignature: body.storageSignature,
    });

    console.info("[seal-ghost] ECIES seal succeeded", {
      wallet: body.walletAddress.slice(0, 10),
      rootHash: result.rootHash.slice(0, 14),
      txHash: result.txHash ? result.txHash.slice(0, 14) : null,
      indexerRpc: env.indexerRpc,
      chainRpc: env.chainRpc,
    });

    return NextResponse.json({
      rootHash: result.rootHash,
      txHash: result.txHash,
      source: "server-ecies",
    });
  } catch (e) {
    const msg = formatError(e);
    console.error("[seal-ghost] ECIES seal failed:", msg, {
      envIssues: env.issues,
      indexerRpc: env.indexerRpc,
      chainRpc: env.chainRpc,
      uploaderKeySet: env.uploaderKeySet,
    });

    const status = msg.includes("not configured") || env.issues.length > 0 ? 503 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}