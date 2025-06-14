import type { Meta, StoryObj } from "@storybook/react"
import gameBg1 from "../../assets/game/game-background-1.jpg"
import gameBg2 from "../../assets/game/game-background-2.jpg"
import gameBg3 from "../../assets/game/game-background-3.jpg"
import gameBg4 from "../../assets/game/game-background-4.jpg"
import gameBg5 from "../../assets/game/game-background-5.png"
import gameBg6 from "../../assets/game/game-background-6.jpg"
import gameBg7 from "../../assets/game/game-background-7.png"
import gameBg8 from "../../assets/game/game-background-8.jpg"
import { AppProviders } from "../../providers"
import { RouletteGame } from "./RouletteGame"

const meta = {
  title: "Game/RouletteGame",
  component: RouletteGame,
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
} satisfies Meta<typeof RouletteGame>

export default meta
type Story = StoryObj<typeof meta>

const Template: Story = {
  render: (args) => <RouletteGame {...args} />,
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
  parameters: {
    chromatic: { disable: true },
  },
}

export const CasinoRedLightTheme: Story = {
  ...Template,
  args: {
    theme: "light",
    customTheme: {
      "--primary": "#dc2626",
      "--play-btn-font": "#ffffff",
    } as React.CSSProperties,
    backgroundImage: gameBg1,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const GoldenLightTheme: Story = {
  ...Template,
  args: {
    theme: "light",
    customTheme: {
      "--primary": "#d97706",
      "--play-btn-font": "#ffffff",
    } as React.CSSProperties,
    backgroundImage: gameBg3,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const ElegantDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    customTheme: {
      "--primary": "#059669",
      "--play-btn-font": "#ffffff",
    } as React.CSSProperties,
    backgroundImage: gameBg5,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const VelvetDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    customTheme: {
      "--primary": "#7c2d12",
      "--play-btn-font": "#fbbf24",
    } as React.CSSProperties,
    backgroundImage: gameBg6,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const NeonDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    customTheme: {
      "--primary": "#ec4899",
      "--play-btn-font": "#ffffff",
    } as React.CSSProperties,
    backgroundImage: gameBg7,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const ClassicDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    customTheme: {
      "--primary": "#1f2937",
      "--play-btn-font": "#f9fafb",
    } as React.CSSProperties,
    backgroundImage: gameBg8,
  },
  parameters: {
    chromatic: { disable: true },
  },
}
