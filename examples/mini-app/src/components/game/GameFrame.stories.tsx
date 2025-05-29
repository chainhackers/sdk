import type { Meta, StoryObj } from "@storybook/react"
import { GameFrame } from "./GameFrame"
import { TokenImage } from "@coinbase/onchainkit/token"
import { ETH_TOKEN } from "../../lib/tokens"
import { type HistoryEntry } from "./HistorySheetPanel"
import gameBg from "../../assets/game/game-background.png"
import { COINTOSS_FACE } from "@betswirl/sdk-core"
import type { ComponentProps } from "react"

type GameFrameProps = ComponentProps<typeof GameFrame>

type StoryArgs = Omit<
  GameFrameProps,
  "balance" | "betAmount" | "targetPayoutAmount" | "gameResult"
> & {
  balance: string
  betAmount: string | undefined
  targetPayoutAmount: string
  gameResult:
    | (Omit<NonNullable<GameFrameProps["gameResult"]>, "payout"> & {
        payout: string
      })
    | null
}

const MOCK_BALANCE = "1123456000000000000" // 1.123456 ETH
const MOCK_BET_AMOUNT = "123456700000000000" // 0.1234567 ETH
const MOCK_TARGET_PAYOUT = "239505998000000000" // 0.239505998 ETH

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
type Story = StoryObj<StoryArgs>

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
    balance: MOCK_BALANCE,
    connectWallletBtn: connectWalletBtnStub,
    isConnected: false,
    onPlayBtnClick: () => console.log("onPlayBtnClick"),
    tokenDecimals: 18,
    gameResult: null,
    betStatus: null,
    betAmount: MOCK_BET_AMOUNT,
    targetPayoutAmount: MOCK_TARGET_PAYOUT,
    onBetAmountChange: (amount: bigint | undefined) =>
      console.log("onBetAmountChange: ", amount?.toString()),
  },
  render: (args) => {
    const gameResult = args.gameResult
      ? ({
          ...args.gameResult,
          payout: BigInt(args.gameResult.payout),
        } as GameFrameProps["gameResult"])
      : null

    return (
      <GameFrame
        {...args}
        balance={BigInt(args.balance)}
        betAmount={args.betAmount ? BigInt(args.betAmount) : undefined}
        targetPayoutAmount={BigInt(args.targetPayoutAmount)}
        gameResult={gameResult}
      />
    )
  },
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
      payout: MOCK_TARGET_PAYOUT,
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
      payout: MOCK_TARGET_PAYOUT,
      currency: "ETH",
      rolled: COINTOSS_FACE.TAILS,
    },
  },
}
