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
}: {
  initialSelectedNumbers?: RouletteNumber[]
  multiplier?: number
  isDisabled?: boolean
}) {
  const [selectedNumbers, setSelectedNumbers] = useState<RouletteNumber[]>(initialSelectedNumbers)

  const handleNumbersChange = (numbers: RouletteNumber[]) => {
    setSelectedNumbers(numbers)
  }

  return (
    <div className="relative w-[328px] h-[194px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden">
      <RouletteGameControls
        selectedNumbers={selectedNumbers}
        onNumbersChange={handleNumbersChange}
        multiplier={multiplier}
        isDisabled={isDisabled}
      />
    </div>
  )
}

function StaticRouletteGameControls({
  selectedNumbers = [],
  multiplier = 35.1,
  isDisabled = false,
}: {
  selectedNumbers?: RouletteNumber[]
  multiplier?: number
  isDisabled?: boolean
}) {
  return (
    <div className="relative w-[328px] h-[194px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden">
      <RouletteGameControls
        selectedNumbers={selectedNumbers}
        onNumbersChange={() => {}}
        multiplier={multiplier}
        isDisabled={isDisabled}
      />
    </div>
  )
}

export const Default: Story = {
  name: "Default (Empty)",
  render: () => <InteractiveRouletteGameControls initialSelectedNumbers={[]} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story:
          "Default roulette table with no numbers selected. Click numbers or betting areas to select them.",
      },
    },
  },
}

export const MultipleNumbers: Story = {
  name: "Multiple Numbers",
  render: () => <InteractiveRouletteGameControls initialSelectedNumbers={[7, 14, 21, 28]} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story:
          "Roulette table with multiple numbers selected. Demonstrates multi-selection functionality.",
      },
    },
  },
}

export const FirstDozen: Story = {
  name: "First Dozen (1-12)",
  render: () => (
    <InteractiveRouletteGameControls
      initialSelectedNumbers={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
      multiplier={2.92}
    />
  ),
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story:
          "First dozen (1-12) selected. Demonstrates dozen betting with appropriate multiplier.",
      },
    },
  },
}

export const DisabledEmpty: Story = {
  name: "Disabled (Empty)",
  render: () => <StaticRouletteGameControls selectedNumbers={[]} isDisabled={true} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story:
          "Disabled roulette table with no selections. Numbers cannot be clicked when disabled.",
      },
    },
  },
}

export const DisabledWithSelections: Story = {
  name: "Disabled (With Selections)",
  render: () => (
    <StaticRouletteGameControls
      selectedNumbers={[0, 7, 14, 21]}
      isDisabled={true}
      multiplier={8.75}
    />
  ),
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Disabled roulette table with existing selections. Shows disabled state styling.",
      },
    },
  },
}
