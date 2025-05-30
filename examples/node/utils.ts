import {
  type CasinoChain,
  type CasinoChainId,
  casinoChainById,
  casinoChains,
} from "@betswirl/sdk-core";
import { createConfig, webSocket } from "@wagmi/core";
import { http, type Hex, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export function getWagmiConfigForAllChains() {
  return createConfig({
    chains: [casinoChains[0].viemChain, ...casinoChains.slice(1).map((c) => c.viemChain)],
    client: (params) => {
      return getViemClientsFromCasinoChain(casinoChainById[params.chain.id as CasinoChainId])
        .walletClient;
    },
  });
}

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
  const account = privateKeyToAccount(privateKey as Hex);
  const userRpcUrl = process.env[`${casinoChain.viemChain.id}_RPC_URL`];
  const defaultRpcUrl = casinoChain.viemChain.rpcUrls.default.http[0]!;
  const effectiveRpcUrl = userRpcUrl ?? defaultRpcUrl;
  const transport = effectiveRpcUrl?.startsWith("wss")
    ? webSocket(effectiveRpcUrl)
    : http(defaultRpcUrl);
  const walletClient = createWalletClient({
    chain: casinoChain.viemChain,
    transport,
    account,
  });
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
