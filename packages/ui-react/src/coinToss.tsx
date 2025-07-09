import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { CoinTossGame } from "./components/game/CoinTossGame.tsx"
import { AppProviders } from "./providers.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <CoinTossGame />
    </AppProviders>
  </StrictMode>,
)
