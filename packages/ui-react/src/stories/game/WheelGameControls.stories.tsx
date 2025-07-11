import { CASINO_GAME_TYPE, WeightedGameConfiguration } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react"
import { useRef, useState } from "react"
import { Address } from "viem"
import { WheelGameControls } from "../../components/game/WheelGameControls"
import { Button } from "../../components/ui/button"
import { TokenWithImage } from "../../types/types"

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

const DEGEN_TOKEN: TokenWithImage = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Address,
  symbol: "DEGEN",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/DEGEN.svg",
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
    isSpinning: {
      control: "boolean",
      description: "Controls whether the wheel is spinning",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
    theme: {
      control: { type: "radio" },
      options: ["light", "dark"],
      description: "Visual theme of the wheel",
      table: {
        type: { summary: '"light" | "dark"' },
        defaultValue: { summary: '"dark"' },
      },
    },
    parent: {
      control: false,
      description: "Parent container ref for tooltip boundaries",
      table: {
        type: { summary: "RefObject<HTMLDivElement>" },
        defaultValue: { summary: "undefined" },
      },
    },
    onSpinComplete: {
      action: "onSpinComplete",
      description: "Callback when spin animation completes",
      table: {
        type: { summary: "() => void" },
        defaultValue: { summary: "undefined" },
      },
    },
    tooltipContent: {
      control: "object",
      description: "Tooltip content for each multiplier",
      table: {
        type: { summary: "Record<number, { chance?: string; profit?: React.ReactNode }>" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
} satisfies Meta<typeof WheelGameControls>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveWheelGameControls({
  config = mockWheelConfig,
  theme = "dark" as "light" | "dark",
  tooltipContent,
}: {
  config?: WeightedGameConfiguration
  theme?: "light" | "dark"
  tooltipContent?: Record<
    number,
    { chance?: string; profit?: React.ReactNode; token: TokenWithImage }
  >
}) {
  const [winningMultiplier, setWinningMultiplier] = useState<number | undefined>()
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinMode, setSpinMode] = useState<"continuous" | "landing">("continuous")
  const containerRef = useRef<HTMLDivElement>(null!)

  const possibleMultipliers = config.multipliers.map((m) => Number(m))

  const handleContinuousSpin = () => {
    if (isSpinning) return
    setSpinMode("continuous")
    setIsSpinning(true)
    setWinningMultiplier(undefined)
  }

  const handleSpinWithResult = () => {
    if (isSpinning && spinMode === "continuous") {
      // If already spinning continuously, land on a random multiplier
      const randomMultiplier =
        possibleMultipliers[Math.floor(Math.random() * possibleMultipliers.length)]
      setWinningMultiplier(randomMultiplier)
      setSpinMode("landing")
    } else if (!isSpinning) {
      // Start spinning and land on a result
      setSpinMode("landing")
      setIsSpinning(true)
      setWinningMultiplier(undefined)

      const randomMultiplier =
        possibleMultipliers[Math.floor(Math.random() * possibleMultipliers.length)]

      setTimeout(() => {
        setWinningMultiplier(randomMultiplier)
      }, 500)
    }
  }

  const handleStop = () => {
    setIsSpinning(false)
    setWinningMultiplier(undefined)
  }

  const handleSpinComplete = () => {
    console.log("Spin completed!")
    setTimeout(() => {
      setIsSpinning(false)
    }, 1000)
  }

  return (
    <div className={theme}>
      <div className="flex flex-col items-center space-y-4">
        <div
          ref={containerRef}
          className="relative w-[304px] h-[198px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden"
        >
          <WheelGameControls
            config={config}
            isSpinning={isSpinning}
            winningMultiplier={winningMultiplier}
            theme={theme}
            parent={containerRef}
            onSpinComplete={handleSpinComplete}
            tooltipContent={tooltipContent}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleContinuousSpin} disabled={isSpinning} size="sm">
            Start Continuous Spin
          </Button>
          <Button onClick={handleSpinWithResult} size="sm">
            {isSpinning && spinMode === "continuous" ? "Land on Result" : "Spin & Land"}
          </Button>
          {isSpinning && (
            <Button onClick={handleStop} variant="destructive" size="sm">
              Stop
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {isSpinning && spinMode === "continuous" && "Spinning continuously..."}
          {isSpinning &&
            spinMode === "landing" &&
            winningMultiplier !== undefined &&
            "Landing on result..."}
          {!isSpinning &&
            winningMultiplier !== undefined &&
            `Landed on: ${(winningMultiplier / 10000).toFixed(2)}x`}
        </div>
      </div>
    </div>
  )
}

export const LightThemeDefault: Story = {
  name: "Light Theme - Default",
  render: () => {
    const tooltipContent = {
      0: { chance: "50%", profit: "0", token: DEGEN_TOKEN },
      14580: {
        chance: "10%",
        profit: <span className="text-green-500">1.40</span>,
        token: DEGEN_TOKEN,
      },
      18760: {
        chance: "10%",
        profit: <span className="text-blue-500">1.80</span>,
        token: DEGEN_TOKEN,
      },
      20830: {
        chance: "10%",
        profit: <span className="text-purple-500">2.00</span>,
        token: DEGEN_TOKEN,
      },
      31250: {
        chance: "10%",
        profit: <span className="text-orange-500">3.00</span>,
        token: DEGEN_TOKEN,
      },
    }
    return <InteractiveWheelGameControls theme="light" tooltipContent={tooltipContent} />
  },
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
  render: () => {
    const tooltipContent = {
      0: { chance: "50%", profit: "0", token: DEGEN_TOKEN },
      14580: {
        chance: "10%",
        profit: <span className="text-green-500">1.40</span>,
        token: DEGEN_TOKEN,
      },
      18760: {
        chance: "10%",
        profit: <span className="text-blue-500">1.80</span>,
        token: DEGEN_TOKEN,
      },
      20830: {
        chance: "10%",
        profit: <span className="text-purple-500">2.00</span>,
        token: DEGEN_TOKEN,
      },
      31250: {
        chance: "10%",
        profit: <span className="text-orange-500">3.00</span>,
        token: DEGEN_TOKEN,
      },
    }
    return <InteractiveWheelGameControls theme="dark" tooltipContent={tooltipContent} />
  },
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
