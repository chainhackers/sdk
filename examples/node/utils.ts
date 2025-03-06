import { type CasinoChain } from "@betswirl/sdk-core";
import { createConfig, webSocket } from "@wagmi/core";
import { http, type Hex, createWalletClient, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export function getWagmiConfigFromCasinoChain(casinoChain: CasinoChain) {

  return createConfig({
    chains: [casinoChain.viemChain],

    client: () => {
      return getViemClientsFromCasinoChain(casinoChain).walletClient;
    },
  });
}

export function getViemClientsFromCasinoChain(casinoChain: CasinoChain) {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL;
  const account = privateKeyToAccount(privateKey as Hex);
  const transport = rpcUrl?.startsWith("wss")
    ? webSocket(rpcUrl)
    : http(rpcUrl);
  const walletClient = createWalletClient({
    chain: casinoChain.viemChain,
    transport,
    account,
  })
  const publicClient = createPublicClient({
    chain: casinoChain.viemChain,
    transport,
  });
  return { walletClient, publicClient };
}


export function checkEnvVariables() {
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY is not set in .env file ❌");
    process.exit(1);
  }
}
