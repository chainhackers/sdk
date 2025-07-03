import { COINTOSS_FACE } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { CoinTossGameControls } from "../../components/game/CoinTossGameControls"

const meta = {
  title: "Game/Controls/CoinTossGameControls",
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
} satisfies Meta<typeof CoinTossGameControls>

export default meta
type Story = StoryObj<typeof meta> & {
  args?: Partial<React.ComponentProps<typeof CoinTossGameControls>>
}

function InteractiveCoinTossGameControls({
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
    setSelectedSide(
      selectedSide === COINTOSS_FACE.HEADS ? COINTOSS_FACE.TAILS : COINTOSS_FACE.HEADS,
    )
  }

  return (
    <div className="relative w-[400px] h-[200px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden">
      <CoinTossGameControls
        selectedSide={selectedSide}
        onCoinClick={handleCoinClick}
        multiplier={multiplier}
        isDisabled={isDisabled}
      />
    </div>
  )
}

function StaticCoinTossGameControls({
  selectedSide = COINTOSS_FACE.HEADS,
  multiplier = 1.94,
  isDisabled = false,
}: {
  selectedSide?: COINTOSS_FACE
  multiplier?: number
  isDisabled?: boolean
}) {
  return (
    <div className="relative w-[400px] h-[200px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden">
      <CoinTossGameControls
        selectedSide={selectedSide}
        onCoinClick={() => {}}
        multiplier={multiplier}
        isDisabled={isDisabled}
      />
    </div>
  )
}

export const DefaultHeads: Story = {
  name: "Default (Heads)",
  render: () => <InteractiveCoinTossGameControls initialSelectedSide={COINTOSS_FACE.HEADS} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Default coin showing Heads. Click the coin to flip between Heads and Tails.",
      },
    },
  },
}

export const DefaultTails: Story = {
  name: "Default (Tails)",
  render: () => <InteractiveCoinTossGameControls initialSelectedSide={COINTOSS_FACE.TAILS} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Default coin showing Tails. Click the coin to flip between Heads and Tails.",
      },
    },
  },
}

export const DisabledHeads: Story = {
  name: "Disabled (Heads)",
  render: () => <StaticCoinTossGameControls selectedSide={COINTOSS_FACE.HEADS} isDisabled={true} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Disabled coin showing Heads. Coin cannot be clicked when disabled.",
      },
    },
  },
}

export const DisabledTails: Story = {
  name: "Disabled (Tails)",
  render: () => <StaticCoinTossGameControls selectedSide={COINTOSS_FACE.TAILS} isDisabled={true} />,
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story: "Disabled coin showing Tails. Shows disabled state styling.",
      },
    },
  },
}
