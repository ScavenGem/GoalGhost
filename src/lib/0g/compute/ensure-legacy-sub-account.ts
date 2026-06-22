"use client";

import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";
import { formatEther, JsonRpcProvider } from "ethers";
import { OG_NETWORK } from "@/lib/0g/network";
import { getBrowserStorageSigner } from "@/lib/0g/storage/browser-signer";

/** OG deposited into the compute ledger on first-time / low-balance init. */
export const LEGACY_FIRST_TIME_LEDGER_OG = 3;

/** OG transferred to the provider sub-account via transferFund. */
const LEGACY_SUB_ACCOUNT_TRANSFER_OG = LEGACY_FIRST_TIME_LEDGER_OG;

const LEGACY_INIT_TRANSFER_WEI = BigInt(LEGACY_SUB_ACCOUNT_TRANSFER_OG * 10 ** 18);

/** Minimum mainnet wallet balance (OG) required to unwrap legacy. */
export const MIN_WALLET_BALANCE_OG = LEGACY_FIRST_TIME_LEDGER_OG;

export type LegacyInitPhase =
  | "preparing"
  | "checking"
  | "initializing-ledger"
  | "generating";

export function legacyInitMessage(phase: LegacyInitPhase | null): string | null {
  switch (phase) {
    case "preparing":
      return "Connecting your wallet to 0G Compute…";
    case "checking":
      return "Checking your compute ledger and provider sub-account…";
    case "initializing-ledger":
      return "Initializing your legacy ledger...";
    case "generating":
      return "Unwrapping your legacy with 0G Compute…";
    default:
      return null;
  }
}

async function resolveChatbotProvider(
  broker: Awaited<ReturnType<typeof createZGComputeNetworkBroker>>
): Promise<string> {
  const services = await broker.inference.listService();
  const chatbot = services.find((service) => service.serviceType === "chatbot");
  if (!chatbot) {
    throw new Error("No 0G Compute chatbot provider available");
  }
  return chatbot.provider;
}

async function hasComputeLedger(
  broker: Awaited<ReturnType<typeof createZGComputeNetworkBroker>>
): Promise<boolean> {
  try {
    await broker.ledger.getLedger();
    return true;
  } catch {
    return false;
  }
}

async function hasProviderSubAccount(
  broker: Awaited<ReturnType<typeof createZGComputeNetworkBroker>>,
  providerAddress: string
): Promise<boolean> {
  try {
    await broker.inference.getAccount(providerAddress);
    return true;
  } catch {
    return false;
  }
}

/** Always hits Aristotle mainnet RPC directly — never uses a cached balance. */
export async function fetchFreshMainnetWalletBalance(
  address: string
): Promise<number> {
  const provider = new JsonRpcProvider(OG_NETWORK.chainRpc);
  const balanceWei = await provider.getBalance(address, "latest");
  return Number.parseFloat(formatEther(balanceWei));
}

export type LegacyComputeInitStatus = {
  mainWalletAddress: string;
  providerAddress: string;
  ledgerExists: boolean;
  subAccountReady: boolean;
  needsInitialization: boolean;
};

export function buildSubAccountInitHeadline(providerAddress: string): string {
  return `Sub-account not found. Initialize it by transferring funds via 'transfer-fund' (Address: ${providerAddress})`;
}

export async function getLegacyComputeInitStatus(): Promise<LegacyComputeInitStatus> {
  const { signer, address } = await getBrowserStorageSigner("public");
  const broker = await createZGComputeNetworkBroker(signer);
  const providerAddress = await resolveChatbotProvider(broker);
  const ledgerExists = await hasComputeLedger(broker);
  const subAccountReady = await hasProviderSubAccount(broker, providerAddress);

  return {
    mainWalletAddress: address,
    providerAddress,
    ledgerExists,
    subAccountReady,
    needsInitialization: !ledgerExists || !subAccountReady,
  };
}

export async function assertFreshMainnetWalletBalance(
  address: string
): Promise<number> {
  const balanceOg = await fetchFreshMainnetWalletBalance(address);
  if (!Number.isFinite(balanceOg) || balanceOg < MIN_WALLET_BALANCE_OG) {
    throw new Error(
      `Insufficient 0G balance on mainnet. You need at least ${MIN_WALLET_BALANCE_OG} OG (current: ${balanceOg.toFixed(4)} OG).`
    );
  }
  return balanceOg;
}

function formatInitError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/user rejected|denied|rejected/i.test(message)) {
    return "Wallet transaction declined. Approve to initialize your 0G Compute sub-account.";
  }
  if (/insufficient|balance/i.test(message)) {
    return "Insufficient 0G balance. Fund your wallet, then try unwrapping again.";
  }
  if (
    /revert|MIN_ACCOUNT_BALANCE|MIN_TRANSFER|minimum.*ledger|minimum.*0G/i.test(
      message
    )
  ) {
    return `0G Compute contract rejected the transaction: ${message}`;
  }
  return message || "Failed to initialize 0G Compute sub-account";
}

/**
 * Ensures the connected wallet has a funded 0G Compute provider sub-account
 * before legacy generation. Auto-deposits 3 OG to the ledger and transferFund
 * to the provider sub-account when initialization is required.
 */
export async function ensureLegacyComputeSubAccount(
  onPhase?: (phase: LegacyInitPhase | null) => void
): Promise<void> {
  onPhase?.("preparing");
  const { signer } = await getBrowserStorageSigner("public");

  let broker: Awaited<ReturnType<typeof createZGComputeNetworkBroker>>;
  try {
    broker = await createZGComputeNetworkBroker(signer);
  } catch (error) {
    throw new Error(formatInitError(error));
  }

  onPhase?.("checking");
  const providerAddress = await resolveChatbotProvider(broker);

  try {
    const ledgerExists = await hasComputeLedger(broker);
    const subAccountReady = await hasProviderSubAccount(
      broker,
      providerAddress
    );
    const needsInitialization = !ledgerExists || !subAccountReady;

    if (!needsInitialization) {
      return;
    }

    onPhase?.("initializing-ledger");

    if (!ledgerExists) {
      await broker.ledger.depositFund(LEGACY_FIRST_TIME_LEDGER_OG);
    } else if (!subAccountReady) {
      const ledger = await broker.ledger.getLedger();
      if (ledger.availableBalance < LEGACY_INIT_TRANSFER_WEI) {
        await broker.ledger.depositFund(LEGACY_FIRST_TIME_LEDGER_OG);
      }
    }

    if (!subAccountReady) {
      await broker.ledger.transferFund(
        providerAddress,
        "inference",
        LEGACY_INIT_TRANSFER_WEI
      );
    }
  } catch (error) {
    throw new Error(formatInitError(error));
  }
}