import { Gift } from "lucide-react"
import { useState } from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"
import type { FreeBet } from "./BettingPanel"

const PANEL_HEIGHT_CONNECTED = "!h-[70%]" // Larger height for connected state
const PANEL_HEIGHT_DISCONNECTED = "!h-[238px]" // Smaller height for disconnected state

interface FreebetsHubSheetPanelProps {
  portalContainer: HTMLElement
  isConnected: boolean
  freebets: FreeBet[]
  onConnectWallet: () => void
  onClaimCode: (code: string) => void
}

export function FreebetsHubSheetPanel({
  portalContainer,
  isConnected,
  freebets,
  onConnectWallet,
  onClaimCode,
}: FreebetsHubSheetPanelProps) {
  const [codeInput, setCodeInput] = useState("")

  const handleClaimCode = () => {
    if (codeInput.trim()) {
      onClaimCode(codeInput.trim())
      setCodeInput("")
    }
  }

  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent
        className={cn(
          isConnected ? PANEL_HEIGHT_CONNECTED : PANEL_HEIGHT_DISCONNECTED,
          "!max-h-full",
          "p-0",
        )}
      >
        <ScrollArea className="h-full w-full rounded-t-[16px] overflow-hidden">
          <div className="flex flex-col p-[16px]">
            <h2 className="text-xl font-bold mb-[12px] leading-[24px]">Freebets</h2>

            {!isConnected ? (
              // Disconnected state
              <div className="flex flex-col items-center gap-[12px]">
                <Button
                  onClick={onConnectWallet}
                  size="lg"
                  className={cn(
                    "w-full",
                    "bg-primary",
                    "rounded-[16px]",
                    "h-[48px]",
                    "text-play-btn-font font-bold",
                  )}
                >
                  Connect Wallet
                </Button>

                <div
                  className={cn(
                    "w-full h-[110px] p-[12px] rounded-[16px]",
                    "bg-surface-secondary",
                    "text-text-on-surface-variant",
                  )}
                >
                  <h3 className="font-semibold text-foreground mb-1">Casino freebets</h3>
                  <p className="leading-relaxed text-[12px]">Connect to check your freebets.</p>
                  <p className="leading-relaxed text-[12px]">
                    When you win a casino freebet, you receive the entire won payout.
                  </p>
                </div>
              </div>
            ) : (
              // Connected state
              <div className="flex flex-col">
                {/* Code claim section */}
                <div className={cn("p-4 rounded-[16px] mb-4", "bg-surface-secondary")}>
                  <p className="text-sm text-text-on-surface-variant mb-3">
                    If you have a code, you can claim your freebet here.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Code"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleClaimCode()
                        }
                      }}
                      className={cn(
                        "flex-1",
                        "bg-surface-secondary",
                        "border-border-stroke",
                        "rounded-[8px]",
                        "h-10",
                        "placeholder:text-text-on-surface-variant/60",
                        "brightness-95",
                      )}
                    />
                    <Button
                      onClick={handleClaimCode}
                      disabled={!codeInput.trim()}
                      className={cn(
                        "bg-primary text-primary-foreground",
                        "rounded-[8px]",
                        "h-10 px-4",
                        "font-semibold",
                        "disabled:opacity-50",
                      )}
                    >
                      Claim
                    </Button>
                  </div>
                </div>

                {/* Casino freebets section */}
                <div>
                  <h3 className="font-semibold text-base mb-3">Casino freebets</h3>

                  <div className="flex flex-col gap-2">
                    {freebets.map((freeBet) => (
                      <div
                        key={freeBet.id}
                        className={cn(
                          "p-4 rounded-[12px]",
                          "bg-surface-secondary",
                          "flex flex-col gap-3",
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-2">
                            <h4 className="font-semibold text-base">{freeBet.title}</h4>
                            <span
                              className={cn(
                                "inline-flex px-3 py-1 rounded-full",
                                "bg-game-win/20 text-game-win",
                                "text-xs font-medium",
                                "w-fit",
                              )}
                            >
                              {freeBet.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gift size={20} className="text-primary" />
                            <span className="font-bold text-lg">
                              {freeBet.amount} {freeBet.token.symbol}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-text-on-surface-variant">
                          Expire: {freeBet.expiresAt}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer text */}
                  <p className="text-sm text-text-on-surface-variant mt-4 leading-relaxed">
                    You can use your freebets directly while playing casino games. When you win a
                    casino freebet, you receive the entire won payout
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}
