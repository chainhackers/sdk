import { CASINO_GAME_TYPE, COINTOSS_FACE } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { parseUnits } from "viem"
import { GameResultWindow } from "../../components/game/GameResultWindow"
import { GameResult } from "../../types/types"

const meta = {
  title: "Game/GameResultWindow",
  component: GameResultWindow,
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
  argTypes: {
    currency: {
      control: "text",
    },
  },
} satisfies Meta<typeof GameResultWindow>

export default meta
type Story = StoryObj<typeof meta>

const createMockGameResult = (isWin: boolean, payout: bigint): GameResult => ({
  id: 1n,
  betAmount: parseUnits("1.1234567", 18),
  betCount: 1,
  totalBetAmount: parseUnits("1.1234567", 18),
  chargedVRFCost: 0n,
  token: {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    decimals: 18,
  },
  affiliate: "0x0000000000000000000000000000000000000000",
  receiver: "0x0000000000000000000000000000000000000000",
  stopGain: 0n,
  stopLoss: 0n,
  betTxnHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  betBlock: 0n,
  chainId: 42161,
  game: CASINO_GAME_TYPE.COINTOSS,
  isWin,
  isLost: !isWin,
  isStopLossTriggered: false,
  isStopGainTriggered: false,
  rollBetCount: 1,
  rollTotalBetAmount: parseUnits("1.1234567", 18),
  formattedRollTotalBetAmount: "1.1234567",
  payout,
  formattedPayout: (Number(payout) / 1e18).toFixed(7),
  benefit: payout - parseUnits("1.1234567", 18),
  formattedBenefit: ((Number(payout) - Number(parseUnits("1.1234567", 18))) / 1e18).toFixed(7),
  formattedPayoutMultiplier: "1.940",
  rollTxnHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  encodedRolled: [true],
  decodedRolled: [true],
  nativeCurrency: {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    decimals: 18,
  },
  formattedBetAmount: "1.1234567",
  formattedTotalBetAmount: "1.1234567",
  formattedStopLoss: "0",
  formattedStopGain: "0",
  formattedChargedVRFFees: "0",
  rolled: {
    game: CASINO_GAME_TYPE.COINTOSS,
    rolled: isWin ? COINTOSS_FACE.HEADS : COINTOSS_FACE.TAILS,
  },
  formattedRolled: isWin ? COINTOSS_FACE.HEADS : COINTOSS_FACE.TAILS,
})

const Template: Story = {
  args: {
    result: null,
    currency: "ETH",
  },
  render: (args) => (
    <div className="w-[302px] h-[160px] relative rounded-[16px] overflow-hidden">
      <GameResultWindow {...args} />
    </div>
  ),
}

export const WinLight: Story = {
  ...Template,
  args: {
    ...Template.args,
    result: createMockGameResult(true, (parseUnits("1.1234567", 18) * 194n) / 100n),
  },
  render: (args) => (
    <div className="light">
      <div className="w-[302px] h-[160px] relative rounded-[16px] overflow-hidden">
        <GameResultWindow {...args} />
      </div>
    </div>
  ),
}

export const LossLight: Story = {
  ...Template,
  args: {
    ...Template.args,
    result: createMockGameResult(false, 0n),
  },
  render: (args) => (
    <div className="light">
      <div className="w-[302px] h-[160px] relative rounded-[16px] overflow-hidden">
        <GameResultWindow {...args} />
      </div>
    </div>
  ),
}

export const WinDark: Story = {
  ...Template,
  parameters: {
    backgrounds: { default: "dark" },
  },
  args: {
    ...Template.args,
    result: createMockGameResult(true, (parseUnits("1.1234567", 18) * 194n) / 100n),
  },
  render: (args) => (
    <div className="dark">
      <div className="w-[302px] h-[160px] relative rounded-[16px] overflow-hidden">
        <GameResultWindow {...args} />
      </div>
    </div>
  ),
}

export const LossDark: Story = {
  ...Template,
  parameters: {
    backgrounds: { default: "dark" },
  },
  args: {
    ...Template.args,
    result: createMockGameResult(false, 0n),
  },
  render: (args) => (
    <div className="dark">
      <div className="w-[302px] h-[160px] relative rounded-[16px] overflow-hidden">
        <GameResultWindow {...args} />
      </div>
    </div>
  ),
}
