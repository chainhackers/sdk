import type { Meta, StoryObj } from "@storybook/react"
import { GameResultWindow } from "./GameResultWindow"

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
    result: {
      control: "radio",
      options: ["win", "loss", "pending"],
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
    result: "win",
    amount: 0.094,
    payout: 1.094,
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
    result: "win",
    amount: 0.094,
    payout: 1.094,
    currency: "ETH",
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
    result: "loss",
    amount: 0.094,
    payout: 0,
    currency: "ETH",
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
    result: "win",
    amount: 0.094,
    payout: 1.094,
    currency: "ETH",
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
    result: "loss",
    amount: 0.094,
    payout: 0,
    currency: "ETH",
  },
  render: (args) => (
    <div className="dark">
      <div className="w-[302px] h-[160px] relative rounded-[16px] overflow-hidden">
        <GameResultWindow {...args} />
      </div>
    </div>
  ),
}
