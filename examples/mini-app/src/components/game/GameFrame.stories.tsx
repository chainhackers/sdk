import type { Meta, StoryObj } from "@storybook/react"
import { GameFrame } from "./GameFrame"
import { TokenImage } from "@coinbase/onchainkit/token"
import { ETH_TOKEN } from "../../lib/tokens"
import { type HistoryEntry } from "./HistorySheetPanel"
import gameBg from "../../assets/game/game-background.png"
import { COINTOSS_FACE } from "@betswirl/sdk-core"
import { parseUnits } from "viem"

const meta = {
  title: "Game/GameFrame",
  component: GameFrame,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "oklch(0.15 0 0)" },
      ],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GameFrame>

export default meta
type Story = StoryObj<typeof meta>

const connectWalletBtnStub = <div></div>

const mockHistoryData: HistoryEntry[] = [
  {
    id: "1",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: "1.94675",
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~24h ago",
  },
  {
    id: "2",
    status: "Won bet",
    multiplier: 1.2,
    payoutAmount: 0.2,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "3",
    status: "Busted",
    multiplier: 1.94,
    payoutAmount: 1.94,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "4",
    status: "Won bet",
    multiplier: 1.946,
    payoutAmount: 2.453,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "5",
    status: "Busted",
    multiplier: 1.94,
    payoutAmount: 1.94,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "6",
    status: "Won bet",
    multiplier: 1.946,
    payoutAmount: 2.453,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "7",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: 0.1,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "8",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: 0.1,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "9",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: 0.1,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
]

const Template: Story = {
  args: {
    themeSettings: {
      backgroundImage: gameBg,
    },
    historyData: mockHistoryData,
    balance: 1123456n * 10n ** 12n,
    connectWallletBtn: connectWalletBtnStub,
    isConnected: false,
    onPlayBtnClick: () => console.log("onPlayBtnClick"),
    tokenDecimals: 18,
    gameResult: null,
    betStatus: null,

    betAmount: parseUnits("0.1234567", 18),
    targetPayoutAmount: (parseUnits("0.1234567", 18) * 194n) / 100n,
    onBetAmountChange: (amount: bigint | undefined) =>
      console.log("onBetAmountChange: ", amount),
  },
  render: (args) => <GameFrame {...args} />,
}

export const WalletNotConnected: Story = {
  args: {
    ...Template.args,
  },
}

export const WalletConnected: Story = {
  args: {
    ...Template.args,
    isConnected: true,
  },
}

export const PlacingBet: Story = {
  args: {
    ...Template.args,
    isConnected: true,
    betStatus: "pending",
  },
}

export const ErrorBet: Story = {
  args: {
    ...Template.args,
    isConnected: true,
    betStatus: "error",
  },
}

export const Win: Story = {
  args: {
    ...Template.args,
    isConnected: true,
    betStatus: "success",
    gameResult: {
      isWin: true,
      payout: (parseUnits("0.1234567", 18) * 194n) / 100n,
      currency: "ETH",
      rolled: COINTOSS_FACE.HEADS,
    },
  },
}

export const Loss: Story = {
  args: {
    ...Template.args,
    isConnected: true,
    betStatus: "success",
    gameResult: {
      isWin: false,
      payout: (parseUnits("0.1234567", 18) * 194n) / 100n,
      currency: "ETH",
      rolled: COINTOSS_FACE.TAILS,
    },
  },
}
