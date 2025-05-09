import React, { type ReactNode } from "react"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { baseSepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: ReactNode }) {
  const apiKey = import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY as string

  if (!apiKey && import.meta.env.DEV) {
    console.warn(
      "OnchainKit API Key (VITE_PUBLIC_ONCHAINKIT_API_KEY) is missing. Some OnchainKit features might not work as expected.",
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <OnchainKitProvider
        apiKey={apiKey}
        chain={baseSepolia}
        config={{
          wallet: {
            display: "modal",
            termsUrl: "https://example.com/terms",
            privacyUrl: "https://example.com/privacy",
          },
          appearance: {
            name: "CoinToss Game",
            mode: "auto",
          },
        }}
      >
        {children}
      </OnchainKitProvider>
    </QueryClientProvider>
  )
}
