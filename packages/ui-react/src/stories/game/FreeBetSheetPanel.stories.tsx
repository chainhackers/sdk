import type { Meta, StoryObj } from "@storybook/react-vite"
import { Ticket } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { FreeBetSheetPanel } from "../../components/game/FreeBetSheetPanel"
import { Button } from "../../components/ui/button"
import { Sheet, SheetTrigger } from "../../components/ui/sheet"
import { cn } from "../../lib/utils"
import { STORYBOOK_TOKENS, StorybookProviders } from "../../storybook/StorybookProviders"
import type { FreeBet, Theme, TokenWithImage } from "../../types/types"

// Mock tokens
const ETH_TOKEN: TokenWithImage = STORYBOOK_TOKENS.ETH
const DEGEN_TOKEN: TokenWithImage = STORYBOOK_TOKENS.DEGEN

// Mock free bets data
const mockFreeBets: FreeBet[] = [
  {
    id: "1",
    amount: 10,
    token: ETH_TOKEN,
    chainId: 8453,
    title: "Welcome Bonus",
    expiresAt: "24.07.2024",
  },
  {
    id: "2",
    amount: 50,
    token: DEGEN_TOKEN,
    chainId: 8453,
    title: "Loyalty Reward",
    expiresAt: "31.07.2024",
  },
  {
    id: "3",
    amount: 25,
    token: ETH_TOKEN,
    chainId: 8453,
    title: "Weekend Special",
    expiresAt: "28.07.2024",
  },
  {
    id: "4",
    amount: 100,
    token: DEGEN_TOKEN,
    chainId: 8453,
    title: "VIP Bonus",
    expiresAt: "15.08.2024",
  },
  {
    id: "5",
    amount: 5,
    token: ETH_TOKEN,
    chainId: 8453,
    title: "Daily Reward",
    expiresAt: "25.07.2024",
  },
  {
    id: "6",
    amount: 75,
    token: DEGEN_TOKEN,
    chainId: 8453,
    title: "Achievement Unlock",
    expiresAt: "10.08.2024",
  },
  {
    id: "7",
    amount: 20,
    token: ETH_TOKEN,
    chainId: 8453,
    title: "Referral Bonus",
    expiresAt: "05.08.2024",
  },
  {
    id: "8",
    amount: 150,
    token: DEGEN_TOKEN,
    chainId: 8453,
    title: "Monthly Cashback",
    expiresAt: "30.08.2024",
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
  freeBets: FreeBet[]
  selectedFreeBet: FreeBet | null
  theme?: Theme
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const [selected, setSelected] = useState<FreeBet | null>(selectedFreeBet)

  const handleSelect = (freeBet: FreeBet) => {
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
