import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { DiceGame } from "./components/game/DiceGame.tsx"
import { AppProviders } from "./providers.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <DiceGame />
    </AppProviders>
  </StrictMode>,
)
