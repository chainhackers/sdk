import type { Meta, StoryObj } from "@storybook/react"
import { CoinTossGame } from "./CoinTossGame"

const meta = {
  title: "Game/CoinTossGame",
  component: CoinTossGame,
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
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
  },
} satisfies Meta<typeof CoinTossGame>

export default meta
type Story = StoryObj<typeof meta>

const Template: Story = {
  render: (args) => <CoinTossGame {...args} />,
}

export const LightTheme: Story = {
  ...Template,
  args: {
    theme: "light",
  },
}

export const DarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const SystemTheme: Story = {
  ...Template,
  args: {
    theme: "system",
  },
}

export const CustomTheme: Story = {
  ...Template,
  args: {
    theme: "light",
    customTheme: {
      "--primary": "green",
      "--play-btn": "#ff9305",
      "--play-btn-font": "#ff4805",
      "--game-window-overlay": 'oklch(0 0 0 / 40%)',
    } as React.CSSProperties,
  },
}
