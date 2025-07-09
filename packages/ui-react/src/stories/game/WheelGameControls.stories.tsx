import { CASINO_GAME_TYPE, WeightedGameConfiguration } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { WheelGameControls } from "../../components/game/WheelGameControls"
import { Button } from "../../components/ui/button"
import { Theme } from "../../types/types"

const mockWheelConfig: WeightedGameConfiguration = {
  configId: 0,
  chainId: 137 as const,
  game: CASINO_GAME_TYPE.WHEEL,
  weights: [1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n],
  multipliers: [0n, 14580n, 0n, 18760n, 0n, 14580n, 0n, 20830n, 0n, 31250n],
  colors: [
    "#29384C",
    "#55DC36",
    "#29384C",
    "#15A2D8",
    "#29384C",
    "#55DC36",
    "#29384C",
    "#7340F4",
    "#29384C",
    "#EC9E3C",
  ],
}

const meta = {
  title: "Game/Controls/WheelGameControls",
  component: WheelGameControls,
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
    config: {
      control: "object",
      description: "Wheel configuration from SDK",
      table: {
        type: { summary: "WeightedGameConfiguration" },
        defaultValue: { summary: "mockWheelConfig" },
      },
    },
    winningMultiplier: {
      control: { type: "number", min: 0, max: 31250, step: 1 },
      description: "Winning multiplier to animate to (in BP)",
      table: {
        type: { summary: "number | undefined" },
        defaultValue: { summary: "undefined" },
      },
    },
    multiplier: {
      control: { type: "number", min: 1, max: 10, step: 0.01 },
      description: "Current multiplier displayed above the wheel",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "2.5" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the wheel controls are disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
} satisfies Meta<typeof WheelGameControls>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveWheelGameControls({
  config = mockWheelConfig,
  multiplier = 2.5,
  isDisabled = false,
  theme = "dark",
}: {
  config?: WeightedGameConfiguration
  multiplier?: number
  isDisabled?: boolean
  theme?: Theme
}) {
  const [winningMultiplier, setWinningMultiplier] = useState<number | undefined>()
  const [isSpinning, setIsSpinning] = useState(false)

  const possibleMultipliers = config.multipliers.map((m) => Number(m))

  const handleSpin = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setWinningMultiplier(undefined)

    const randomMultiplier =
      possibleMultipliers[Math.floor(Math.random() * possibleMultipliers.length)]

    setTimeout(() => {
      setWinningMultiplier(randomMultiplier)
      setIsSpinning(false)
    }, 500)
  }

  return (
    <div className={theme}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-[304px] h-[198px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden">
          <WheelGameControls
            config={config}
            winningMultiplier={winningMultiplier}
            multiplier={multiplier}
            isDisabled={isDisabled || isSpinning}
            theme={theme}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleSpin} disabled={isSpinning || isDisabled} size="sm">
            {isSpinning ? "Spinning..." : "Spin Wheel"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const LightThemeDefault: Story = {
  name: "Light Theme - Default",
  render: () => <InteractiveWheelGameControls theme="light" />,
  args: {} as any,
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story: "Light theme wheel game controls. Click 'Spin Wheel' to see the animation.",
      },
    },
  },
}

export const DarkThemeDefault: Story = {
  name: "Dark Theme - Default",
  render: () => <InteractiveWheelGameControls theme="dark" />,
  args: {} as any,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story: "Dark theme wheel game controls. Click 'Spin Wheel' to see the animation.",
      },
    },
  },
}
