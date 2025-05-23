import { COINTOSS_FACE } from "@betswirl/sdk-core";
import { TokenImage } from "@coinbase/onchainkit/token";
import type { Meta, StoryObj } from "@storybook/react";
import gameBg from "../../assets/game/game-background.png";
import { ETH_TOKEN } from "../../lib/tokens";
import { GameFrame } from "./GameFrame";
import { type HistoryEntry } from "./HistorySheetPanel";

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
} satisfies Meta<typeof GameFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

const connectWalletBtnStub = <div />;

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
];

const Template: Story = {
  args: {
    themeSettings: {
      backgroundImage: gameBg,
    },
    historyData: mockHistoryData,
    balance: 1.7,
    connectWallletBtn: connectWalletBtnStub,
    isConnected: false,
    onPlayBtnClick: (betAmount: string) => console.log("betAmount: ", betAmount),
    tokenDecimals: 18,
    gameResult: null,
    betStatus: null,
  },
  render: (args) => <GameFrame {...args} />,
};

export const WalletNotConnected: Story = {
  args: {
    ...Template.args,
  },
};

export const WalletConnected: Story = {
  args: {
    ...Template.args,
    isConnected: true,
  },
};

export const PlacingBet: Story = {
  args: {
    ...Template.args,
    isConnected: true,
    betStatus: "pending",
  },
};

export const ErrorBet: Story = {
  args: {
    ...Template.args,
    isConnected: true,
    betStatus: "error",
  },
};

export const Win: Story = {
  args: {
    ...Template.args,
    isConnected: true,
    betStatus: "success",
    gameResult: {
      isWin: true,
      payout: 0.19,
      currency: "ETH",
      rolled: COINTOSS_FACE.HEADS,
    },
  },
};

export const Loss: Story = {
  args: {
    ...Template.args,
    isConnected: true,
    betStatus: "success",
    gameResult: {
      isWin: false,
      payout: 0.19,
      currency: "ETH",
      rolled: COINTOSS_FACE.TAILS,
    },
  },
};
