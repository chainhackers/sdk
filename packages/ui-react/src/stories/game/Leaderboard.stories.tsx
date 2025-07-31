import type { Meta, StoryObj } from "@storybook/react"
import { Trophy } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { LeaderboardSheetPanel } from "../../components/leaderboard/LeaderboardSheetPanel"
import { Button } from "../../components/ui/button"
import { Sheet, SheetTrigger } from "../../components/ui/sheet"
import { cn } from "../../lib/utils"
import { StorybookProviders } from "../../storybook/StorybookProviders"
import type { Theme } from "../../types/types"

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
        "w-[328px] h-[600px] border rounded-[20px] p-3 relative overflow-hidden",
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

const LeaderboardSheetWithWrapper = ({ theme = "light" }: { theme?: Theme }) => {
  const [isOpen, setIsOpen] = useState(true)

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
                <Trophy className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <LeaderboardSheetPanel portalContainer={portalContainer} />
          </Sheet>
        )}
      </PanelStoryWrapper>
    </StorybookProviders>
  )
}

const meta = {
  title: "Game/Components/LeaderboardSheetPanel",
  component: LeaderboardSheetWithWrapper,
  parameters: {
    layout: "centered",
    chromatic: { disable: true },
  },
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
  },
  args: {
    theme: "light",
  },
} satisfies Meta<typeof LeaderboardSheetWithWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    theme: "light",
  },
  name: "Default",
}

export const DarkTheme: Story = {
  args: {
    theme: "dark",
  },
  name: "Dark Theme",
  parameters: {
    backgrounds: { default: "dark" },
  },
}

// Story to show the leaderboard card component in isolation
import { LeaderboardCard } from "../../components/leaderboard/LeaderboardCard"
import { getTokenImage } from "../../lib/utils"
import type { LeaderboardItem } from "../../types/types"

const mockLeaderboardItem: LeaderboardItem = {
  id: "1",
  rank: 1,
  title: "Avalanche - July",
  chainId: 43114,
  startDate: "2024-07-09T00:00:00Z",
  endDate: "2024-08-09T00:00:00Z",
  status: "ongoing",
  badgeStatus: "pending",
  prize: {
    token: {
      address: "0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5",
      symbol: "BETS",
      decimals: 18,
      image: getTokenImage("BETS"),
    },
    amount: "5000000",
  },
  participants: 175,
  isPartner: false,
  userAction: { type: "play" },
}

export const LeaderboardCardStory: StoryObj<{ item: LeaderboardItem; theme?: Theme }> = {
  name: "Leaderboard Card",
  render: ({ item, theme = "light" }) => (
    <StorybookProviders>
      <div className={cn("w-[328px] p-4", theme)}>
        <LeaderboardCard item={item} />
      </div>
    </StorybookProviders>
  ),
  args: {
    item: mockLeaderboardItem,
    theme: "light",
  },
  argTypes: {
    item: { control: "object" },
    theme: {
      control: "radio",
      options: ["light", "dark"],
    },
  },
}

export const LeaderboardCardClaimAction: StoryObj<{ item: LeaderboardItem; theme?: Theme }> = {
  name: "Card with Claim Action",
  render: ({ item, theme = "light" }) => (
    <StorybookProviders>
      <div className={cn("w-[328px] p-4", theme)}>
        <LeaderboardCard item={item} />
      </div>
    </StorybookProviders>
  ),
  args: {
    item: {
      ...mockLeaderboardItem,
      userAction: { type: "claim", amount: "0.0001", tokenSymbol: "AVAX" },
    },
    theme: "light",
  },
}

export const LeaderboardCardEnded: StoryObj<{ item: LeaderboardItem; theme?: Theme }> = {
  name: "Ended Leaderboard Card",
  render: ({ item, theme = "light" }) => (
    <StorybookProviders>
      <div className={cn("w-[328px] p-4", theme)}>
        <LeaderboardCard item={item} />
      </div>
    </StorybookProviders>
  ),
  args: {
    item: {
      ...mockLeaderboardItem,
      status: "ended",
      badgeStatus: "expired",
      userAction: { type: "overview" },
    },
    theme: "light",
  },
}
