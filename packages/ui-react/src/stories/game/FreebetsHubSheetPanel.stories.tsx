import type { Meta, StoryObj } from "@storybook/react-vite"
import { Gift } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { FreebetsHubSheetPanel } from "../../components/game/FreebetsHubSheetPanel"
import { Button } from "../../components/ui/button"
import { Sheet, SheetTrigger } from "../../components/ui/sheet"
import { cn } from "../../lib/utils"
import { STORYBOOK_TOKENS, StorybookProviders } from "../../storybook/StorybookProviders"
import type { FreeBet, Theme, TokenWithImage } from "../../types/types"

// Mock tokens
const ETH_TOKEN: TokenWithImage = STORYBOOK_TOKENS.ETH
const DEGEN_TOKEN: TokenWithImage = STORYBOOK_TOKENS.DEGEN

// Mock type for Storybook (replaces bigint with string to avoid serialization issues)
type MockFreeBet = Omit<FreeBet, "amount"> & {
  amount: string
}

// Mock free bets data
const mockFreeBets: MockFreeBet[] = [
  {
    id: "1",
    amount: "10",
    formattedAmount: "10",
    token: ETH_TOKEN,
    chainId: 8453,
    title: "Welcome Bonus",
    expiresAt: "24.07.2024",
    signed: {} as any,
  },
  {
    id: "2",
    amount: "50",
    formattedAmount: "50",
    token: DEGEN_TOKEN,
    chainId: 8453,
    title: "Loyalty Reward",
    expiresAt: "31.07.2024",
    signed: {} as any,
  },
  {
    id: "3",
    amount: "25",
    formattedAmount: "25",
    token: ETH_TOKEN,
    chainId: 8453,
    title: "Weekend Special",
    expiresAt: "28.07.2024",
    signed: {} as any,
  },
  {
    id: "4",
    amount: "100",
    formattedAmount: "100",
    token: DEGEN_TOKEN,
    chainId: 8453,
    title: "VIP Bonus",
    expiresAt: "15.08.2024",
    signed: {} as any,
  },
  {
    id: "5",
    amount: "5",
    formattedAmount: "5",
    token: ETH_TOKEN,
    chainId: 8453,
    title: "Daily Reward",
    expiresAt: "25.07.2024",
    signed: {} as any,
  },
  {
    id: "6",
    amount: "75",
    formattedAmount: "75",
    token: DEGEN_TOKEN,
    chainId: 8453,
    title: "Achievement Unlock",
    expiresAt: "10.08.2024",
    signed: {} as any,
  },
]

interface PanelStoryWrapperProps {
  children: (container: HTMLDivElement) => React.ReactNode
  theme?: Theme
}

const PanelStoryWrapper: React.FC<PanelStoryWrapperProps> = ({ children, theme = "system" }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const themeClass = theme === "system" ? undefined : theme

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-[328px] h-[512px] border rounded-[20px] p-3 relative overflow-hidden",
        "bg-card text-card-foreground",
        themeClass,
      )}
    >
      {isMounted && containerRef.current ? (
        children(containerRef.current)
      ) : (
        <p>Preparing story...</p>
      )}
    </div>
  )
}

const FreebetsHubSheetWithWrapper = ({
  isConnected,
  freebets,
  theme = "light",
}: {
  isConnected: boolean
  freebets: MockFreeBet[]
  theme?: Theme
}) => {
  const [isOpen, setIsOpen] = useState(true)
  //const [claimedCodes, setClaimedCodes] = useState<string[]>([]) // TODO: Freebets code claim

  const handleConnectWallet = () => {
    console.log("Connect wallet clicked")
  }

  // TODO: Freebets code claim
  // const handleClaimCode = (code: string) => {
  //   console.log("Claim code:", code)
  //   setClaimedCodes([...claimedCodes, code])
  // }

  const handleSelectFreebet = (freebet: MockFreeBet) => {
    console.log("Select freebet: ", freebet)
  }

  return (
    <StorybookProviders>
      <PanelStoryWrapper theme={theme}>
        {(portalContainer) => (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="iconTransparent"
                size="iconRound"
                className="absolute top-2 right-2 text-primary border-primary data-[state=open]:text-primary data-[state=open]:border-primary"
              >
                <Gift className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <FreebetsHubSheetPanel
              portalContainer={portalContainer}
              isConnected={isConnected}
              freebets={freebets as unknown as FreeBet[]}
              onConnectWallet={handleConnectWallet}
              //onClaimCode={handleClaimCode} // TODO: Freebets code claim
              onSelectFreebet={handleSelectFreebet as any}
            />
          </Sheet>
        )}
      </PanelStoryWrapper>
    </StorybookProviders>
  )
}

const meta = {
  title: "Game/Components/FreebetsHubSheetPanel",
  component: FreebetsHubSheetWithWrapper,
  parameters: {
    layout: "centered",
    chromatic: { disable: true },
  },
  tags: ["autodocs"],
  argTypes: {
    isConnected: { control: "boolean" },
    freebets: { control: "object" },
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
  },
  args: {
    isConnected: false,
    freebets: mockFreeBets,
    theme: "light",
  },
} satisfies Meta<typeof FreebetsHubSheetWithWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Disconnected: Story = {
  args: {
    isConnected: false,
    freebets: mockFreeBets,
    theme: "light",
  },
  name: "Disconnected",
}

export const ConnectedWithFreebets: Story = {
  args: {
    isConnected: true,
    freebets: mockFreeBets,
    theme: "light",
  },
  name: "Connected With Freebets",
}

export const ConnectedEmpty: Story = {
  args: {
    isConnected: true,
    freebets: [],
    theme: "light",
  },
  name: "Connected Empty",
}

export const DisconnectedDark: Story = {
  args: {
    isConnected: false,
    freebets: mockFreeBets,
    theme: "dark",
  },
  name: "Disconnected Dark",
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const ConnectedDark: Story = {
  args: {
    isConnected: true,
    freebets: mockFreeBets,
    theme: "dark",
  },
  name: "Connected Dark",
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const ConnectedSingleFreebet: Story = {
  args: {
    isConnected: true,
    freebets: [mockFreeBets[0]],
    theme: "light",
  },
  name: "Connected Single Freebet",
}

export const ConnectedManyFreebets: Story = {
  args: {
    isConnected: true,
    freebets: [...mockFreeBets, ...mockFreeBets, ...mockFreeBets].map((fb, idx) => ({
      ...fb,
      id: `${fb.id}-${idx}`,
      title: `${fb.title} ${idx + 1}`,
    })),
    theme: "light",
  },
  name: "Connected Many Freebets (Scroll Test)",
}
