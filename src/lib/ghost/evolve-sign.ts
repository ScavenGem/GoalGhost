import { verifyMessage } from "viem";

export function buildEvolveNarrativeMessage(params: {
  address: string;
  tokenId: number;
  signedAt: string;
}): string {
  return [
    "goalghost-evolve-narrative:v1",
    params.address.toLowerCase(),
    String(params.tokenId),
    params.signedAt,
  ].join("\n");
}

export async function verifyEvolveNarrativeSignature(params: {
  address: string;
  tokenId: number;
  signedAt: string;
  signature: string;
}): Promise<boolean> {
  const address = params.address.toLowerCase() as `0x${string}`;
  const signature = params.signature as `0x${string}`;
  try {
    return await verifyMessage({
      address,
      message: buildEvolveNarrativeMessage({
        address: params.address,
        tokenId: params.tokenId,
        signedAt: params.signedAt,
      }),
      signature,
    });
  } catch {
    return false;
  }
}