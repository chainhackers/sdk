import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { KenoGame } from "./components/game/KenoGame.tsx"
import { AppProviders } from "./providers.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <KenoGame />
    </AppProviders>
  </StrictMode>,
)
