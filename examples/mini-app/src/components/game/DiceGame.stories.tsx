import type { Meta, StoryObj } from "@storybook/react"
import gameBg1 from "../../assets/game/game-background-9.png"
import gameBg2 from "../../assets/game/game-background-11.webp"
import gameBg3 from "../../assets/game/game-background-12.png"
import gameBg4 from "../../assets/game/game-background-10.png"
import gameBg5 from "../../assets/game/game-background-13.png"
import gameBg6 from "../../assets/game/game-background-14.png"
import { AppProviders } from "../../providers"
import { DiceGame } from "./DiceGame"

const meta = {
  title: "Game/DiceGame",
  component: DiceGame,
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
} satisfies Meta<typeof DiceGame>

export default meta
type Story = StoryObj<typeof meta>

const Template: Story = {
  render: (args) => <DiceGame {...args} />,
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
    backgrounds: { default: "light" },
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
      "--primary": "#7f5058",
      "--play-btn-font": "rgb(238 231 235)",
      "--game-window-overlay": "oklch(0 0 0 / 40%)",
    } as React.CSSProperties,
    backgroundImage: gameBg5,
  },
}

export const CustomTheme2: Story = {
  ...Template,
  args: {
    theme: "dark",
    customTheme: {
      "--primary": "#d7caab",
      "--play-btn-font": "#254450",
      "--game-window-overlay": "oklch(0 0 0 / 10%)",
    } as React.CSSProperties,
    backgroundImage: gameBg1,
  },
}

export const CustomTheme3: Story = {
  ...Template,
  args: {
    theme: "dark",
    customTheme: {
      "--primary": "#595b5c",
      "--play-btn-font": "#c5c2ab",
      "--game-window-overlay": "oklch(0 0 0 / 10%)",
    } as React.CSSProperties,
    backgroundImage: gameBg3,
  },
}

export const CustomTheme4: Story = {
  ...Template,
  args: {
    theme: "dark",
    customTheme: {
      "--primary": "rgb(74 41 24)",
      "--play-btn-font": "rgb(225 159 31)",
      "--game-window-overlay": "oklch(0 0 0 / 10%)",
    } as React.CSSProperties,
    backgroundImage: gameBg6,
  },
}
