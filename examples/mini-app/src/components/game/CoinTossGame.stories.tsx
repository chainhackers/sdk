import type { Meta, StoryObj } from "@storybook/react"
import gameBg1 from "../../assets/game/game-background-1.jpg"
import gameBg2 from "../../assets/game/game-background-2.jpg"
import gameBg3 from "../../assets/game/game-background-3.jpg"
import gameBg4 from "../../assets/game/game-background-4.jpg"
import { AppProviders } from "../../providers"
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
    loki: {
      skip: true,
    },
  },
  decorators: [
    (Story) => (
      <AppProviders>
        <Story />
      </AppProviders>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
    customTheme: {
      control: "object",
      description: "Custom theme",
      table: {
        type: {
          summary: "object",
          detail: `{
            "--primary": string,
            "--play-btn-font": string,
            "--game-window-overlay": string,
          }`,
        },
      },
    },
    backgroundImage: {
      control: "file",
      description: "Background image",
      accept: "image/*",
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
    backgroundImage: gameBg2,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const SystemTheme: Story = {
  ...Template,
  args: {
    theme: "system",
    backgroundImage: gameBg4,
  },
}

export const CustomTheme1: Story = {
  ...Template,
  args: {
    theme: "light",
    customTheme: {
      "--primary": "#4dae52",
      "--play-btn-font": "#1B5E20",
    } as React.CSSProperties,
    backgroundImage: gameBg1,
  },
}

export const CustomTheme2: Story = {
  ...Template,
  args: {
    theme: "light",
    customTheme: {
      "--primary": "rgb(239 185 1)",
      "--play-btn-font": "#ffffff",
    } as React.CSSProperties,
    backgroundImage: gameBg3,
  },
}
