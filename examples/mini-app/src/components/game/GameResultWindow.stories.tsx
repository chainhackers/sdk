import type { Meta, StoryObj } from "@storybook/react"
import { GameResultWindow } from "./GameResultWindow"
import { parseUnits } from "viem"

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
    isVisible: {
      control: "boolean",
    },
    isWin: {
      control: "boolean",
    },
    amount: {
      control: "number",
    },
    payout: {
      control: "number",
    },
    currency: {
      control: "text",
    },
  },
} satisfies Meta<typeof GameResultWindow>

export default meta
type Story = StoryObj<typeof meta>

const Template: Story = {
  args: {
    isVisible: false,
    amount: parseUnits("0.094", 18),
    rolled: "HEADS",
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
    isVisible: true,
    isWin: true,
    payout: parseUnits("1.094", 18),
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
    isVisible: true,
    isWin: false,
    payout: 0n,
    rolled: "TAILS",
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
    isVisible: true,
    isWin: true,
    payout: parseUnits("1.094", 18),
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
    isVisible: true,
    isWin: false,
    payout: 0n,
    rolled: "TAILS",
  },
  render: (args) => (
    <div className="dark">
      <div className="w-[302px] h-[160px] relative rounded-[16px] overflow-hidden">
        <GameResultWindow {...args} />
      </div>
    </div>
  ),
}
