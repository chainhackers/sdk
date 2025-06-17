import { RouletteNumber } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { RouletteGameControls } from "./RouletteGameControls"

const meta = {
  title: "Game/Controls/RouletteGameControls",
  component: RouletteGameControls,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "#1a1a1a" },
        { name: "game", value: "#0a0a0a" },
      ],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    selectedNumbers: {
      control: "object",
      description: "Array of currently selected roulette numbers",
      table: {
        type: { summary: "RouletteNumber[]" },
        defaultValue: { summary: "[]" },
      },
    },
    multiplier: {
      control: { type: "number", min: 1, max: 36, step: 0.01 },
      description: "The multiplier value displayed above the roulette table",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "35.1" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the roulette table is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
} satisfies Meta<typeof RouletteGameControls>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveRouletteGameControls({
  initialSelectedNumbers = [],
  multiplier = 35.1,
  isDisabled = false,
  theme = "dark",
}: {
  initialSelectedNumbers?: RouletteNumber[]
  multiplier?: number
  isDisabled?: boolean
  theme?: "light" | "dark"
}) {
  const [selectedNumbers, setSelectedNumbers] = useState<RouletteNumber[]>(initialSelectedNumbers)

  const handleNumbersChange = (numbers: RouletteNumber[]) => {
    setSelectedNumbers(numbers)
  }

  return (
    <div className={theme}>
      <div className="relative w-[304px] h-[206px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden">
        <RouletteGameControls
          selectedNumbers={selectedNumbers}
          onNumbersChange={handleNumbersChange}
          multiplier={multiplier}
          isDisabled={isDisabled}
        />
      </div>
    </div>
  )
}

export const LightThemeDefault: Story = {
  name: "Light Theme - Default (Empty)",
  render: () => <InteractiveRouletteGameControls initialSelectedNumbers={[]} theme="light" />,
  args: {} as any,
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Light theme roulette table with no numbers selected. Click numbers or betting areas to select them.",
      },
    },
  },
}

export const LightThemeMultipleNumbers: Story = {
  name: "Light Theme - Multiple Numbers",
  render: () => (
    <InteractiveRouletteGameControls initialSelectedNumbers={[7, 14, 21, 28]} theme="light" />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Light theme roulette table with multiple numbers selected. Demonstrates multi-selection functionality.",
      },
    },
  },
}

export const LightThemeDisabled: Story = {
  name: "Light Theme - Disabled (With Selections)",
  render: () => (
    <InteractiveRouletteGameControls
      initialSelectedNumbers={[0, 7, 14, 21]}
      isDisabled={true}
      multiplier={8.75}
      theme="light"
    />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Light theme disabled roulette table with existing selections. Shows disabled state styling.",
      },
    },
  },
}

export const DarkThemeDefault: Story = {
  name: "Dark Theme - Default (Empty)",
  render: () => <InteractiveRouletteGameControls initialSelectedNumbers={[]} theme="dark" />,
  args: {} as any,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Dark theme roulette table with no numbers selected. Click numbers or betting areas to select them.",
      },
    },
  },
}

export const DarkThemeMultipleNumbers: Story = {
  name: "Dark Theme - Multiple Numbers",
  render: () => (
    <InteractiveRouletteGameControls initialSelectedNumbers={[7, 14, 21, 28]} theme="dark" />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Dark theme roulette table with multiple numbers selected. Demonstrates multi-selection functionality.",
      },
    },
  },
}

export const DarkThemeDisabled: Story = {
  name: "Dark Theme - Disabled (With Selections)",
  render: () => (
    <InteractiveRouletteGameControls
      initialSelectedNumbers={[0, 7, 14, 21]}
      isDisabled={true}
      multiplier={8.75}
      theme="dark"
    />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Dark theme disabled roulette table with existing selections. Shows disabled state styling.",
      },
    },
  },
}
