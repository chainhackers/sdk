import React from "react"
import type { Preview, Decorator } from "@storybook/react"
//import { AppProviders } from "../src/providers"
import "../src/index.css"

const withAppProviders: Decorator = (StoryComponent) => {
  return (
    <>
      {/* <AppProviders> */}
        <StoryComponent />
      {/* </AppProviders> */}
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
  },
  decorators: [withAppProviders],
}

export default preview
