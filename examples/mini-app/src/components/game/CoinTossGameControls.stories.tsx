import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"
import { useState } from "react"
import { COINTOSS_FACE } from "@betswirl/sdk-core"
import { CoinTossGameControls } from "./CoinTossGameControls"

const meta = {
  title: "Game/CoinTossGameControls",
  component: CoinTossGameControls,
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
    selectedSide: {
      control: "radio",
      options: [COINTOSS_FACE.HEADS, COINTOSS_FACE.TAILS],
      description: "The currently selected coin side",
      table: {
        type: { summary: "COINTOSS_FACE" },
        defaultValue: { summary: "COINTOSS_FACE.HEADS" },
      },
    },
    multiplier: {
      control: { type: "number", min: 1, max: 10, step: 0.01 },
      description: "The multiplier value displayed above the coin",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1.94" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the coin button is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    onCoinClick: {
      description: "Callback function called when the coin is clicked",
      table: {
        type: { summary: "() => void" },
      },
    },
  },
  args: {
    selectedSide: COINTOSS_FACE.HEADS,
    multiplier: 1.94,
    isDisabled: false,
    onCoinClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="relative w-[300px] h-[200px] bg-gradient-to-b from-blue-900 to-purple-900 rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CoinTossGameControls>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveCoinTossControls({
  initialSelectedSide = COINTOSS_FACE.HEADS,
  multiplier = 1.94,
  isDisabled = false,
}: {
  initialSelectedSide?: COINTOSS_FACE
  multiplier?: number
  isDisabled?: boolean
}) {
  const [selectedSide, setSelectedSide] = useState(initialSelectedSide)

  const handleCoinClick = () => {
    if (isDisabled) return
    setSelectedSide((prevSide) =>
      prevSide === COINTOSS_FACE.HEADS
        ? COINTOSS_FACE.TAILS
        : COINTOSS_FACE.HEADS,
    )
  }

  return (
    <div className="relative w-[300px] h-[200px] bg-gradient-to-b from-blue-900 to-purple-900 rounded-lg overflow-hidden">
      <CoinTossGameControls
        selectedSide={selectedSide}
        onCoinClick={handleCoinClick}
        multiplier={multiplier}
        isDisabled={isDisabled}
      />
    </div>
  )
}

export const Default: Story = {
  name: "Default (Heads)",
  args: {},
}

export const TailsSelected: Story = {
  name: "Tails Selected",
  args: {
    selectedSide: COINTOSS_FACE.TAILS,
  },
}

export const DisabledHeads: Story = {
  name: "Disabled (Heads)",
  args: {
    isDisabled: true,
  },
}

export const DisabledTails: Story = {
  name: "Disabled (Tails)",
  args: {
    selectedSide: COINTOSS_FACE.TAILS,
    isDisabled: true,
  },
}

export const Interactive: Story = {
  name: "Interactive",
  render: (args) => (
    <InteractiveCoinTossControls
      initialSelectedSide={args.selectedSide}
      multiplier={args.multiplier}
      isDisabled={args.isDisabled}
    />
  ),
  args: {
    selectedSide: COINTOSS_FACE.HEADS,
    multiplier: 2.5,
    isDisabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Click the coin to toggle between HEADS and TAILS. The component state updates in real-time to demonstrate interactivity.",
      },
    },
  },
}
