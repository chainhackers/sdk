import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "../../components/ui/input"
import { TokenIcon } from "../../components/ui/TokenIcon"
import type { TokenWithImage } from "../../types/types"

// Mock token for stories
const ETH_TOKEN: TokenWithImage = {
  address: "0x0000000000000000000000000000000000000000",
  symbol: "ETH",
  decimals: 18,
  image: "https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png",
}

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
    chromatic: { disable: true },
  },
  tags: ["autodocs"],
  argTypes: {
    type: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    className: { control: "text" },
    token: { control: "object" },
  },
  args: {
    type: "text",
    placeholder: "Enter text...",
    disabled: false,
    className: "w-64",
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: "number",
    placeholder: "0",
    value: "10.5",
    token: {
      icon: <TokenIcon token={ETH_TOKEN} size={18} className="mr-1" />,
      symbol: "ETH",
    },
  },
}

export const Disabled: Story = {
  args: {
    type: "number",
    placeholder: "0",
    value: "10.5",
    token: {
      icon: <TokenIcon token={ETH_TOKEN} size={18} className="mr-1" />,
      symbol: "ETH",
    },
    disabled: true,
  },
}
