/**
 * Smoke-test server-side 0G Storage ECIES seal after funding.
 * Usage: node scripts/test-seal-upload.js
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { MemData } = require("@0gfoundation/0g-storage-ts-sdk");
const { Wallet, SigningKey, hashMessage, verifyMessage } = require("ethers");

const STORAGE_SIGN_PREFIX = "goalghost-storage:";

function storageSignMessage(addr) {
  return `${STORAGE_SIGN_PREFIX}${addr}`;
}

function getStorageKey() {
  const key = (
    process.env.OG_STORAGE_PRIVATE_KEY ??
    process.env.OG_STORAGE_UPLOADER_KEY ??
    process.env.OG_DEPLOYER_PRIVATE_KEY ??
    process.env.OG_COMPUTE_PRIVATE_KEY
  )?.trim();
  if (!key?.startsWith("0x")) return null;
  return key;
}

function recipientPubKeyFromSignature(walletAddress, storageSignature) {
  const message = storageSignMessage(walletAddress);
  const pubkey = SigningKey.recoverPublicKey(hashMessage(message), storageSignature);
  return SigningKey.computePublicKey(pubkey, true);
}

async function main() {
  const rpc = process.env.OG_CHAIN_RPC_URL?.trim() ?? "https://evmrpc.0g.ai";
  const indexerRpc =
    process.env.OG_STORAGE_INDEXER_RPC?.trim() ?? "https://indexer-storage-turbo.0g.ai";

  if (rpc.includes("localhost")) {
    console.error("Refusing localhost RPC.");
    process.exit(1);
  }

  const storageKey = getStorageKey();
  if (!storageKey) {
    console.error("No storage uploader key in env.");
    process.exit(1);
  }

  const provider = new (require("ethers").JsonRpcProvider)(rpc);
  const uploader = new Wallet(storageKey, provider);

  console.log("RPC:", rpc);
  console.log("Indexer:", indexerRpc);
  console.log("Uploader:", uploader.address);
  console.log("Uploader balance:", require("ethers").formatEther(await provider.getBalance(uploader.address)), "OG");

  const user = Wallet.createRandom();
  const message = storageSignMessage(user.address);
  const storageSignature = await user.signMessage(message);
  const recovered = verifyMessage(message, storageSignature);
  if (recovered.toLowerCase() !== user.address.toLowerCase()) {
    console.error("Signature self-check failed.");
    process.exit(1);
  }

  const recipientPubKey = recipientPubKeyFromSignature(user.address, storageSignature);
  const json = { test: "goalghost-seal-smoke", ts: Date.now() };
  const bytes = new TextEncoder().encode(JSON.stringify(json));
  const mem = new MemData(bytes);
  const [tree, treeErr] = await mem.merkleTree();
  if (treeErr) throw new Error(`Merkle error: ${treeErr}`);
  const rootHash = tree?.rootHash();
  if (!rootHash) throw new Error("No root hash");

  const { Indexer } = require("@0gfoundation/0g-storage-ts-sdk");
  const indexer = new Indexer(indexerRpc);

  console.log("Uploading ECIES seal…");
  const [tx, uploadErr] = await indexer.upload(mem, rpc, uploader, {
    encryption: { type: "ecies", recipientPubKey },
  });

  if (uploadErr) {
    const detail =
      uploadErr instanceof Error
        ? uploadErr.message
        : typeof uploadErr === "string"
          ? uploadErr
          : JSON.stringify(uploadErr);
    console.error("Upload failed:", detail);
    process.exit(1);
  }

  const txHash =
    tx && typeof tx === "object" && "txHash" in tx ? String(tx.txHash) : "";
  console.log("Seal OK — rootHash:", rootHash);
  console.log("txHash:", txHash || "(none)");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});