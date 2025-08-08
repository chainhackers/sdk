import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { DiceGameControls } from "../../components/game/DiceGameControls"

const meta = {
  title: "Game/Controls/DiceGameControls",
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
} satisfies Meta<typeof DiceGameControls>

export default meta
type Story = StoryObj<typeof meta> & {
  args?: Partial<React.ComponentProps<typeof DiceGameControls>>
}

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

function StaticDiceGameControls({
  selectedNumber = 50,
  multiplier = 1.94,
  isDisabled = false,
}: {
  selectedNumber?: number
  multiplier?: number
  isDisabled?: boolean
}) {
  return (
    <div className="relative w-[400px] h-[200px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden">
      <DiceGameControls
        selectedNumber={selectedNumber}
        onNumberChange={() => {}}
        multiplier={multiplier}
        isDisabled={isDisabled}
      />
    </div>
  )
}

export const Default: Story = {
  name: "Default (50)",
  render: () => <InteractiveDiceGameControls initialSelectedNumber={50} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Default slider position at 50. Drag the slider to see real-time updates.",
      },
    },
  },
}

export const MinimumValue: Story = {
  name: "Minimum Value (1)",
  render: () => <InteractiveDiceGameControls initialSelectedNumber={1} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Slider at minimum value (1). Drag to see how it behaves at the edge.",
      },
    },
  },
}

export const LowValue: Story = {
  name: "Low Value (25)",
  render: () => <InteractiveDiceGameControls initialSelectedNumber={25} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Slider at low value (25). Interactive slider with real-time feedback.",
      },
    },
  },
}

export const HighValue: Story = {
  name: "High Value (75)",
  render: () => <InteractiveDiceGameControls initialSelectedNumber={75} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Slider at high value (75). Drag to see smooth interaction.",
      },
    },
  },
}

export const MaximumValue: Story = {
  name: "Maximum Value (99)",
  render: () => <InteractiveDiceGameControls initialSelectedNumber={99} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Slider at maximum value (99). Test edge behavior by dragging.",
      },
    },
  },
}

export const DisabledLow: Story = {
  name: "Disabled (Low Value)",
  render: () => <StaticDiceGameControls selectedNumber={20} isDisabled={true} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Disabled slider at low value (20). Slider cannot be moved when disabled.",
      },
    },
  },
}

export const DisabledHigh: Story = {
  name: "Disabled (High Value)",
  render: () => <StaticDiceGameControls selectedNumber={80} isDisabled={true} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Disabled slider at high value (80). Shows disabled state styling.",
      },
    },
  },
}
