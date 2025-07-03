import type { Decorator, Preview } from "@storybook/react"
import "../src/index.css"
import { StorybookProviders } from "../src/storybook/StorybookProviders"

const withAppProviders: Decorator = (Story) => (
  <StorybookProviders>
    <Story />
  </StorybookProviders>
)

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Game", ["CoinTossGame", "*"]],
      },
    },
  },
  decorators: [withAppProviders],
}

export default preview
