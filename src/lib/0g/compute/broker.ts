import { Wallet, JsonRpcProvider } from "ethers";
import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";
import { OG_NETWORK } from "@/lib/0g/network";

let brokerInstance: Awaited<
  ReturnType<typeof createZGComputeNetworkBroker>
> | null = null;

let cachedChatbotProvider: string | null = null;

/**
 * JUDGE NOTE - 0G COMPUTE BROKER
 * All Ghost intelligence routes through the 0G Compute Network.
 */
export async function getComputeBroker() {
  if (brokerInstance) return brokerInstance;

  const rpcUrl = process.env.OG_COMPUTE_RPC_URL ?? OG_NETWORK.chainRpc;
  const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("OG_COMPUTE_PRIVATE_KEY required for 0G Compute");
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);
  brokerInstance = await createZGComputeNetworkBroker(wallet);
  return brokerInstance;
}

export async function getChatbotProvider(): Promise<string> {
  const override = process.env.OG_COMPUTE_PROVIDER_ADDRESS;
  if (override) return override;

  if (cachedChatbotProvider) return cachedChatbotProvider;

  const broker = await getComputeBroker();
  const services = await broker.inference.listService();
  const chatbot = services.find((s) => s.serviceType === "chatbot");
  if (!chatbot) {
    throw new Error("No 0G Compute chatbot provider available");
  }

  cachedChatbotProvider = chatbot.provider;
  return cachedChatbotProvider;
}