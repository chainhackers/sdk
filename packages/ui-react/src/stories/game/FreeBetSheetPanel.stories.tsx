import { SignedFreebet } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Ticket } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { FreeBetSheetPanel } from "../../components/game/FreeBetSheetPanel"
import { Button } from "../../components/ui/button"
import { Sheet, SheetTrigger } from "../../components/ui/sheet"
import { cn } from "../../lib/utils"
import { STORYBOOK_TOKENS, StorybookProviders } from "../../storybook/StorybookProviders"
import type { Theme, TokenWithImage } from "../../types/types"

// Mock tokens
const ETH_TOKEN: TokenWithImage = STORYBOOK_TOKENS.ETH
const DEGEN_TOKEN: TokenWithImage = STORYBOOK_TOKENS.DEGEN

// Mock free bets data
const mockFreeBets: SignedFreebet[] = [
  {
    id: 1,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: 10n,
    formattedAmount: "10",
    token: ETH_TOKEN,
    chainId: 8453,
    campaign: {
      id: 1,
      label: "Welcome Bonus",
    },
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    signature: "0x",
  },
  {
    id: 2,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: 50n,
    formattedAmount: "50",
    token: DEGEN_TOKEN,
    chainId: 8453,
    campaign: {
      id: 2,
      label: "Daily Bonus",
    },
    expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    signature: "0x",
  },
  {
    id: 3,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: 25n,
    formattedAmount: "25",
    token: ETH_TOKEN,
    chainId: 8453,
    campaign: {
      id: 3,
      label: "Weekend Special",
    },
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    signature: "0x",
  },
  {
    id: 4,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: 100n,
    formattedAmount: "100",
    token: DEGEN_TOKEN,
    chainId: 8453,
    campaign: {
      id: 4,
      label: "High Roller Bonus",
    },
    expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    signature: "0x",
  },
  {
    id: 5,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: 5n,
    formattedAmount: "5",
    token: ETH_TOKEN,
    chainId: 8453,
    campaign: {
      id: 5,
      label: "Starter Bonus",
    },
    expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    signature: "0x",
  },
  {
    id: 6,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: 75n,
    formattedAmount: "75",
    token: DEGEN_TOKEN,
    chainId: 8453,
    campaign: {
      id: 6,
      label: "Lucky Bonus",
    },
    expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    signature: "0x",
  },
  {
    id: 7,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: 20n,
    formattedAmount: "20",
    token: ETH_TOKEN,
    chainId: 8453,
    campaign: {
      id: 7,
      label: "Loyalty Reward",
    },
    expirationDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    signature: "0x",
  },
  {
    id: 8,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: 150n,
    formattedAmount: "150",
    token: DEGEN_TOKEN,
    chainId: 8453,
    campaign: {
      id: 8,
      label: "VIP Bonus",
    },
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    signature: "0x",
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

const FreeBetSheetWithWrapper = ({
  freeBets,
  selectedFreeBet,
  theme = "light",
}: {
  freeBets: SignedFreebet[]
  selectedFreeBet: SignedFreebet | null
  theme?: Theme
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const [selected, setSelected] = useState<SignedFreebet | null>(selectedFreeBet)

  const handleSelect = (freeBet: SignedFreebet) => {
    setSelected(freeBet)
    console.log("FreeBet selected:", freeBet)
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
                className="absolute bottom-2 right-2 text-primary border-primary data-[state=open]:text-primary data-[state=open]:border-primary"
              >
                <Ticket className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <FreeBetSheetPanel
              portalContainer={portalContainer}
              freeBets={freeBets}
              selectedFreeBet={selected}
              onSelect={handleSelect}
            />
          </Sheet>
        )}
      </PanelStoryWrapper>
    </StorybookProviders>
  )
}

const meta = {
  title: "Game/Components/FreeBetSheetPanel",
  component: FreeBetSheetWithWrapper,
  parameters: {
    layout: "centered",
    chromatic: { disable: true },
  },
  tags: ["autodocs"],
  argTypes: {
    freeBets: { control: "object" },
    selectedFreeBet: { control: "object" },
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
  },
  args: {
    freeBets: mockFreeBets,
    selectedFreeBet: null,
    theme: "light",
  },
} satisfies Meta<typeof FreeBetSheetWithWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    freeBets: mockFreeBets,
    selectedFreeBet: null,
    theme: "light",
  },
  name: "Default",
}

export const WithSelection: Story = {
  args: {
    freeBets: mockFreeBets,
    selectedFreeBet: mockFreeBets[1], // Pre-select the second item
    theme: "light",
  },
  name: "With Selection",
}

export const Empty: Story = {
  args: {
    freeBets: [],
    selectedFreeBet: null,
    theme: "light",
  },
  name: "Empty List",
}

export const DarkTheme: Story = {
  args: {
    freeBets: mockFreeBets,
    selectedFreeBet: null,
    theme: "dark",
  },
  name: "Dark Theme",
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const FewItems: Story = {
  args: {
    freeBets: mockFreeBets.slice(0, 3),
    selectedFreeBet: null,
    theme: "light",
  },
  name: "Few Items",
}

export const SingleItem: Story = {
  args: {
    freeBets: [mockFreeBets[0]],
    selectedFreeBet: mockFreeBets[0],
    theme: "light",
  },
  name: "Single Item",
}
