import { addons } from "storybook/manager-api"
import { create } from "storybook/theming"

const version = process.env.VITE_STORYBOOK_VERSION

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: `Storybook <br/>BetSwirl UI React${version ? `: ${version}` : ""}`,
  }),
})
