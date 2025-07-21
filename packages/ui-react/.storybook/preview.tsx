import type { Decorator, Preview } from "@storybook/react"
import "../src/index.css"
import { StorybookProviders } from "../src/storybook/StorybookProviders"

const withAppProviders: Decorator = (Story) => (
  <StorybookProviders>
    <Story />
  </StorybookProviders>
)

const withVersionOnHeader: Decorator = (Story) => {
  //@ts-ignore
  const version = import.meta.env.VITE_STORYBOOK_VERSION
  return (
    <>
      {version && (
        <div
          style={{
            display: "inline-block",
            background: "#f2f2f2",
            padding: "4px 16px",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "10px",
            borderRadius: "4px",
            color: "#333333",
            letterSpacing: 1,
          }}
        >
          {version}
        </div>
      )}
      <Story />
    </>
  )
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
  decorators: [withVersionOnHeader, withAppProviders],
}

export default preview
