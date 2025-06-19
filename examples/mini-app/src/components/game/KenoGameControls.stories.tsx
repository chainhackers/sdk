import { KenoBall } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { KenoGameControls } from "./KenoGameControls"

const meta: Meta<typeof KenoGameControls> = {
  title: "Game/Controls/KenoGameControls",
  component: KenoGameControls,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Keno game controls with number selection grid and dynamic multipliers",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    selectedNumbers: {
      description: "Array of selected Keno numbers",
      control: { type: "object" },
    },
    onNumbersChange: {
      description: "Callback function when numbers selection changes",
      action: "numbers changed",
    },
    multiplier: {
      description: "Current game multiplier",
      control: { type: "number", min: 0, max: 1000, step: 0.01 },
    },
    isDisabled: {
      description: "Whether the controls are disabled",
      control: { type: "boolean" },
    },
    maxSelections: {
      description: "Maximum number of selections allowed",
      control: { type: "number", min: 1, max: 15, step: 1 },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

function InteractiveKenoGameControls({
  initialSelectedNumbers = [],
  multiplier = 2.5,
  isDisabled = false,
  theme = "dark",
  maxSelections = 7,
}: {
  initialSelectedNumbers?: KenoBall[]
  multiplier?: number
  isDisabled?: boolean
  theme?: "light" | "dark"
  maxSelections?: number
}) {
  const [selectedNumbers, setSelectedNumbers] = useState<KenoBall[]>(initialSelectedNumbers)

  const handleNumbersChange = (numbers: KenoBall[]) => {
    setSelectedNumbers(numbers)
  }

  return (
    <div className={theme}>
      <div className="relative w-[304px] h-[198px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden">
        <KenoGameControls
          selectedNumbers={selectedNumbers}
          onNumbersChange={handleNumbersChange}
          multiplier={multiplier}
          isDisabled={isDisabled}
          maxSelections={maxSelections}
        />
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <InteractiveKenoGameControls />,
}

export const WithSelectedNumbers: Story = {
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[3, 4, 5, 6, 8, 10, 12] as KenoBall[]}
      multiplier={15.2}
    />
  ),
}

export const MaxSelection: Story = {
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[1, 2, 3, 4, 5, 6, 7, 8] as KenoBall[]}
      multiplier={480.48}
    />
  ),
}

export const Disabled: Story = {
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[1, 7, 13, 15] as KenoBall[]}
      multiplier={8.5}
      isDisabled={true}
    />
  ),
}
