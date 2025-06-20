import { KenoBall } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { KenoGameControls } from "./KenoGameControls"

const meta = {
  title: "Game/Controls/KenoGameControls",
  component: KenoGameControls,
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
      description: "Array of selected Keno numbers",
      table: {
        type: { summary: "KenoBall[]" },
        defaultValue: { summary: "[]" },
      },
    },
    onNumbersChange: {
      description: "Callback function when numbers selection changes",
      action: "numbers changed",
    },
    multipliers: {
      control: "object",
      description: "Array of multiplier values",
      table: {
        type: { summary: "number[]" },
        defaultValue: { summary: "[]" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the controls are disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    maxSelections: {
      control: { type: "number", min: 1, max: 15, step: 1 },
      description: "Maximum number of selections allowed",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "7" },
      },
    },
    lastGameWinningNumbers: {
      control: "object",
      description: "Array of winning numbers from the last game",
      table: {
        type: { summary: "number[]" },
        defaultValue: { summary: "[]" },
      },
    },
  },
} satisfies Meta<typeof KenoGameControls>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveKenoGameControls({
  initialSelectedNumbers = [],
  multipliers = [480.48, 9.61, 1.07, 0.4, 0.46, 1.91, 1.02, 0.87],
  isDisabled = false,
  theme = "dark",
  maxSelections = 7,
  lastGameWinningNumbers = [],
}: {
  initialSelectedNumbers?: KenoBall[]
  multipliers?: number[]
  isDisabled?: boolean
  theme?: "light" | "dark"
  maxSelections?: number
  lastGameWinningNumbers?: number[]
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
          lastGameWinningNumbers={lastGameWinningNumbers}
        />
      </div>
    </div>
  )
}

export const LightThemeDefault: Story = {
  name: "Light Theme - Default (Empty)",
  render: () => <InteractiveKenoGameControls initialSelectedNumbers={[]} theme="light" />,
  args: {} as any,
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Light theme Keno game controls with no numbers selected. Click numbers to select them.",
      },
    },
  },
}

export const LightThemeWithSelectedNumbers: Story = {
  name: "Light Theme - With Selected Numbers",
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[3, 4, 5, 6, 8, 10, 12] as KenoBall[]}
      multipliers={[100, 50, 25, 15.2, 10, 5, 2.5, 1]}
      theme="light"
    />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Light theme Keno game controls with multiple numbers selected. Demonstrates multi-selection functionality.",
      },
    },
  },
}

export const LightThemeDisabled: Story = {
  name: "Light Theme - Disabled (With Selections)",
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[1, 7, 13, 15] as KenoBall[]}
      multipliers={[50, 25, 10, 8.5, 5, 2, 1, 0.5]}
      isDisabled={true}
      theme="light"
    />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Light theme disabled Keno game controls with existing selections. Shows disabled state styling.",
      },
    },
  },
}

export const LightThemeWithWinningNumbers: Story = {
  name: "Light Theme - With Winning Numbers",
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[2, 5, 9] as KenoBall[]}
      lastGameWinningNumbers={[1, 5, 7, 10, 13]}
      multipliers={[100, 50, 25, 15.2, 10, 5, 2.5, 1]}
      theme="light"
    />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Light theme Keno game controls with winning numbers from the last game displayed.",
      },
    },
  },
}

export const LightThemeWithWinningNumbersDisabled: Story = {
  name: "Light Theme - With Winning Numbers (Disabled)",
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[2, 5, 9] as KenoBall[]}
      lastGameWinningNumbers={[1, 5, 7, 10, 13]}
      multipliers={[100, 50, 25, 15.2, 10, 5, 2.5, 1]}
      isDisabled={true}
      theme="light"
    />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Light theme disabled Keno game controls with winning numbers and existing selections.",
      },
    },
  },
}

export const DarkThemeDefault: Story = {
  name: "Dark Theme - Default (Empty)",
  render: () => <InteractiveKenoGameControls initialSelectedNumbers={[]} theme="dark" />,
  args: {} as any,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Dark theme Keno game controls with no numbers selected. Click numbers to select them.",
      },
    },
  },
}

export const DarkThemeWithSelectedNumbers: Story = {
  name: "Dark Theme - With Selected Numbers",
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[3, 4, 5, 6, 8, 10, 12] as KenoBall[]}
      multipliers={[100, 50, 25, 15.2, 10, 5, 2.5, 1]}
      theme="dark"
    />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Dark theme Keno game controls with multiple numbers selected. Demonstrates multi-selection functionality.",
      },
    },
  },
}

export const DarkThemeDisabled: Story = {
  name: "Dark Theme - Disabled (With Selections)",
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[1, 7, 13, 15] as KenoBall[]}
      multipliers={[50, 25, 10, 8.5, 5, 2, 1, 0.5]}
      isDisabled={true}
      theme="dark"
    />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Dark theme disabled Keno game controls with existing selections. Shows disabled state styling.",
      },
    },
  },
}

export const DarkThemeWithWinningNumbers: Story = {
  name: "Dark Theme - With Winning Numbers",
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[2, 5, 9] as KenoBall[]}
      lastGameWinningNumbers={[1, 5, 7, 10, 13]}
      multipliers={[100, 50, 25, 15.2, 10, 5, 2.5, 1]}
      theme="dark"
    />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Dark theme Keno game controls with winning numbers from the last game displayed.",
      },
    },
  },
}

export const DarkThemeWithWinningNumbersDisabled: Story = {
  name: "Dark Theme - With Winning Numbers (Disabled)",
  render: () => (
    <InteractiveKenoGameControls
      initialSelectedNumbers={[2, 5, 9] as KenoBall[]}
      lastGameWinningNumbers={[1, 5, 7, 10, 13]}
      multipliers={[100, 50, 25, 15.2, 10, 5, 2.5, 1]}
      isDisabled={true}
      theme="dark"
    />
  ),
  args: {} as any,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Dark theme disabled Keno game controls with winning numbers and existing selections.",
      },
    },
  },
}
