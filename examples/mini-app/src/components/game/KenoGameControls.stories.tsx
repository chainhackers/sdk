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
    multipliers: {
      description: "Array of multiplier values",
      control: { type: "object" },
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
  multipliers = [480.48, 9.61, 1.07, 0.40, 0.46, 1.91, 1.02, 0.87],
  isDisabled = false,
  theme = "dark",
  maxSelections = 7,
}: {
  initialSelectedNumbers?: KenoBall[]
  multipliers?: number[]
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
          multipliers={multipliers}
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
      multipliers={[100, 50, 25, 15.2, 10, 5, 2.5, 1]}
    />
  ),
}

export const Disabled: Story = {
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[1, 7, 13, 15] as KenoBall[]}
      multipliers={[50, 25, 10, 8.5, 5, 2, 1, 0.5]}
      isDisabled={true}
    />
  ),
}
