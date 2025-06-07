import type { Decorator, Preview } from "@storybook/react"
import React from "react"
import "../src/index.css"

const withAppProviders: Decorator = (StoryComponent: React.ComponentType) => {
  return <StoryComponent />
}

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
