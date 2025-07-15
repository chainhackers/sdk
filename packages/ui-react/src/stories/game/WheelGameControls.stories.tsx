import { CASINO_GAME_TYPE, WeightedGameConfiguration } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react"
import { useRef } from "react"
import { Address } from "viem"
import { WheelController, WheelGameControls } from "../../components/game/WheelGameControls"
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

function createMockTooltipContent(token: TokenWithImage) {
  return {
    0: { chance: "50%", profit: 0, token },
    14580: {
      chance: <span className="text-[#55DC36]">10%</span>,
      profit: 1.4,
      token,
    },
    18760: {
      chance: <span className="text-[#15A2D8]">10%</span>,
      profit: 1.8,
      token,
    },
    20830: {
      chance: <span className="text-[#7340F4]">10%</span>,
      profit: 2.0,
      token,
    },
    31250: {
      chance: <span className="text-[#EC9E3C]">10%</span>,
      profit: 3.0,
      token,
    },
  }
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
    { chance?: string | React.ReactNode; profit?: number; token: TokenWithImage }
  >
}) {
  const wheelControllerRef = useRef<WheelController>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const totalSectors = config.multipliers.length

  const handleContinuousSpin = () => {
    wheelControllerRef.current?.startEndlessSpin()
  }

  const handleSpinWithResult = () => {
    const randomSectorIndex = Math.floor(Math.random() * totalSectors)
    wheelControllerRef.current?.spinWheelWithResult(randomSectorIndex)
  }

  const handleStop = () => {
    wheelControllerRef.current?.stopSpin()
  }

  const handleSpinComplete = () => {
    console.log("Spin completed!")
  }

  return (
    <div className={theme}>
      <div className="flex flex-col items-center space-y-4">
        <div
          ref={containerRef}
          className="relative w-[304px] h-[198px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden"
        >
          <WheelGameControls
            ref={wheelControllerRef}
            config={config}
            theme={theme}
            parent={containerRef}
            onSpinComplete={handleSpinComplete}
            tooltipContent={tooltipContent}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleContinuousSpin} size="sm">
            Start Continuous Spin
          </Button>
          <Button onClick={handleSpinWithResult} size="sm">
            Spin with Random Sector
          </Button>
          <Button onClick={handleStop} variant="destructive" size="sm">
            Stop
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Use the buttons above to control the wheel using sector indices (0-{totalSectors - 1})
        </div>
      </div>
    </div>
  )
}

export const LightThemeDefault: Story = {
  name: "Light Theme - Default",
  render: () => {
    const tooltipContent = createMockTooltipContent(DEGEN_TOKEN)
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
      ...createMockTooltipContent(DEGEN_TOKEN),
      0: { chance: <span className="text-[#29384C]">50%</span>, profit: 0, token: DEGEN_TOKEN },
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

function ImperativeAPIDemo() {
  const wheelControllerRef = useRef<WheelController>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const totalSectors = mockWheelConfig.multipliers.length

  const handleStartEndlessSpin = () => {
    wheelControllerRef.current?.startEndlessSpin()
  }

  const handleSpinWithResult = () => {
    const randomSectorIndex = Math.floor(Math.random() * totalSectors)
    wheelControllerRef.current?.spinWheelWithResult(randomSectorIndex)
  }

  const handleStop = () => {
    wheelControllerRef.current?.stopSpin()
  }

  const tooltipContent = {
    0: { chance: "50%", profit: 0, token: DEGEN_TOKEN },
    14580: { chance: "10%", profit: 1.4, token: DEGEN_TOKEN },
    18760: { chance: "10%", profit: 1.8, token: DEGEN_TOKEN },
    20830: { chance: "10%", profit: 2.0, token: DEGEN_TOKEN },
    31250: { chance: "10%", profit: 3.0, token: DEGEN_TOKEN },
  }

  return (
    <div className="dark">
      <div className="flex flex-col items-center space-y-4">
        <div
          ref={containerRef}
          className="relative w-[304px] h-[198px] bg-gradient-to-b from-green-900 to-blue-900 rounded-lg overflow-hidden"
        >
          <WheelGameControls
            ref={wheelControllerRef}
            config={mockWheelConfig}
            theme="dark"
            parent={containerRef}
            tooltipContent={tooltipContent}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleStartEndlessSpin} size="sm">
            Start Endless Spin
          </Button>
          <Button onClick={handleSpinWithResult} size="sm">
            Spin with Random Sector
          </Button>
          <Button onClick={handleStop} variant="destructive" size="sm">
            Stop
          </Button>
        </div>

        <div className="text-sm text-muted-foreground max-w-md text-center">
          <p className="font-semibold">Imperative API Demo</p>
          <p>
            This story demonstrates the imperative API using sector indices (0-{totalSectors - 1}).
            Use the buttons to control the wheel directly.
          </p>
        </div>
      </div>
    </div>
  )
}

export const ImperativeAPI: Story = {
  name: "Imperative API Demo",
  render: () => <ImperativeAPIDemo />,
  args: {} as any,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Demonstrates the new imperative API for controlling the wheel game. Use the buttons to directly call methods on the wheel controller.",
      },
    },
  },
}
