import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"
import { useState } from "react"
import { DiceGameControls } from "./DiceGameControls"

const meta = {
  title: "Game/DiceGameControls",
  component: DiceGameControls,
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
    selectedNumber: {
      control: { type: "number", min: 1, max: 99, step: 1 },
      description: "The currently selected number on the slider",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "50" },
      },
    },
    multiplier: {
      control: { type: "number", min: 1, max: 10, step: 0.01 },
      description: "The multiplier value displayed above the slider",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1.94" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the slider is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    onNumberChange: {
      description: "Callback function called when the slider value changes",
      table: {
        type: { summary: "(value: number) => void" },
      },
    },
  },
  args: {
    selectedNumber: 50,
    multiplier: 1.94,
    isDisabled: false,
    onNumberChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="relative w-[400px] h-[200px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiceGameControls>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveDiceGameControls({
  initialSelectedNumber = 50,
  multiplier = 1.94,
  isDisabled = false,
}: {
  initialSelectedNumber?: number
  multiplier?: number
  isDisabled?: boolean
}) {
  const [selectedNumber, setSelectedNumber] = useState(initialSelectedNumber)

  const handleNumberChange = (value: number) => {
    setSelectedNumber(value)
  }

  return (
    <div className="relative w-[400px] h-[200px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden">
      <DiceGameControls
        selectedNumber={selectedNumber}
        onNumberChange={handleNumberChange}
        multiplier={multiplier}
        isDisabled={isDisabled}
      />
    </div>
  )
}

export const Default: Story = {
  name: "Default (50)",
  args: {},
}

export const MinimumValue: Story = {
  name: "Minimum Value (1)",
  args: {
    selectedNumber: 1,
  },
}

export const LowValue: Story = {
  name: "Low Value (25)",
  args: {
    selectedNumber: 25,
  },
}

export const HighValue: Story = {
  name: "High Value (75)",
  args: {
    selectedNumber: 75,
  },
}

export const MaximumValue: Story = {
  name: "Maximum Value (99)",
  args: {
    selectedNumber: 99,
  },
}

export const DisabledLow: Story = {
  name: "Disabled (Low Value)",
  args: {
    selectedNumber: 20,
    isDisabled: true,
  },
}

export const DisabledHigh: Story = {
  name: "Disabled (High Value)",
  args: {
    selectedNumber: 80,
    isDisabled: true,
  },
}

export const Interactive: Story = {
  name: "Interactive",
  render: (args) => (
    <InteractiveDiceGameControls
      initialSelectedNumber={args.selectedNumber}
      multiplier={args.multiplier}
      isDisabled={args.isDisabled}
    />
  ),
  args: {
    selectedNumber: 65,
    multiplier: 2.5,
    isDisabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Move the slider to change the selected number. The component state updates in real-time as you drag the slider.",
      },
    },
  },
}
