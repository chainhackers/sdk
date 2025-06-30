import type { Meta, StoryObj } from "@storybook/react"
import { CoinTossGame, type CoinTossGameProps } from "../../components/game/CoinTossGame"
import { STORYBOOK_TOKENS, StorybookProviders } from "../../storybook/StorybookProviders"
import gameBg1 from "../assets/game/game-background-1.jpg"
import gameBg2 from "../assets/game/game-background-2.jpg"
import gameBg3 from "../assets/game/game-background-3.jpg"
import gameBg4 from "../assets/game/game-background-4.jpg"
import gameBg5 from "../assets/game/game-background-5.png"
import gameBg6 from "../assets/game/game-background-6.jpg"
import gameBg7 from "../assets/game/game-background-7.png"
import gameBg8 from "../assets/game/game-background-8.jpg"

interface StoryArgs extends CoinTossGameProps {
  token?: keyof typeof STORYBOOK_TOKENS
}

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
  decorators: [
    (Story, context) => {
      const token = context.args.token ? STORYBOOK_TOKENS[context.args.token] : STORYBOOK_TOKENS.ETH
      return (
        <StorybookProviders token={token}>
          <Story />
        </StorybookProviders>
      )
    },
  ],
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
    token: {
      control: "radio",
      options: ["ETH", "DEGEN"],
      description: "Token to use for betting",
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
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

const Template: Story = {
  render: (args) => <CoinTossGame {...args} />,
}

export const LightTheme: Story = {
  ...Template,
  args: {
    theme: "light",
    token: "ETH",
  },
}

export const DarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    token: "ETH",
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
    token: "ETH",
    backgroundImage: gameBg4,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const SheepsLightTheme: Story = {
  ...Template,
  args: {
    theme: "light",
    token: "ETH",
    customTheme: {
      "--primary": "#4dae52",
      "--play-btn-font": "#1B5E20",
    } as React.CSSProperties,
    backgroundImage: gameBg1,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const ChickletLightTheme: Story = {
  ...Template,
  args: {
    theme: "light",
    token: "DEGEN",
    customTheme: {
      "--primary": "rgb(239 185 1)",
      "--play-btn-font": "#ffffff",
    } as React.CSSProperties,
    backgroundImage: gameBg3,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const CatsDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    token: "ETH",
    customTheme: {
      "--primary": "#ffb74d",
      "--play-btn-font": "#3e2723",
    } as React.CSSProperties,
    backgroundImage: gameBg5,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const LightfishDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    token: "DEGEN",
    customTheme: {
      "--primary": "#b8d32f",
      "--play-btn-font": "#002a47",
    } as React.CSSProperties,
    backgroundImage: gameBg6,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const MarticoinDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    token: "ETH",
    customTheme: {
      "--primary": "hsl(13.9deg 83.1% 41.76%)",
      "--play-btn-font": "#ffffff",
    } as React.CSSProperties,
    backgroundImage: gameBg7,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const FrogDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    token: "DEGEN",
    customTheme: {
      "--primary": "rgb(44 52 51)",
      "--play-btn-font": "rgb(171 181 171)",
    } as React.CSSProperties,
    backgroundImage: gameBg8,
  },
  parameters: {
    chromatic: { disable: true },
  },
}
