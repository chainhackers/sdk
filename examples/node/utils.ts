import { type CasinoChain } from "@betswirl/sdk-core";
import { createConfig, webSocket } from "@wagmi/core";
import { http, type Hex, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Config as WagmiConfig } from "@wagmi/core";

export function getWagmiConfigFromCasinoChain(casinoChain: CasinoChain) {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL;

  const account = privateKeyToAccount(privateKey as Hex);
  const transport = rpcUrl?.startsWith("wss")
    ? webSocket(rpcUrl)
    : http(rpcUrl);
  return createConfig({
    chains: [casinoChain.viemChain],

    client: ({ chain }) => {
      return createWalletClient({
        chain,
        transport,
        account,
      });
    },
  });
}

export function getPublicAddressFromWagmiConfig(wagmiConfig: WagmiConfig) {
  return wagmiConfig.getClient().account?.address;
}

export function checkEnvVariables() {
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY is not set in .env file ❌");
    process.exit(1);
  }
}
