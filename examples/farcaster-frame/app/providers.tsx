"use client";

import { BetSwirlSDKProvider, type TokenWithImage } from "@betswirl/ui-react";
import { type AppConfig } from "@coinbase/onchainkit";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { type Hex, http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";

const DEGEN_TOKEN: TokenWithImage = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
  symbol: "DEGEN",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/DEGEN.svg",
};

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});

const onChainKitConfig: AppConfig = {
  wallet: {
    display: "modal",
  },
};

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={onChainKitConfig}
        >
          <BetSwirlSDKProvider initialChainId={base.id} bankrollToken={DEGEN_TOKEN}>
            {props.children}
          </BetSwirlSDKProvider>
        </MiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
