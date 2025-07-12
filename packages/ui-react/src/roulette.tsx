import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { RouletteGame } from "./components/game/RouletteGame.tsx"
import { AppProviders } from "./providers.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouletteGame />
    </AppProviders>
  </StrictMode>,
)
