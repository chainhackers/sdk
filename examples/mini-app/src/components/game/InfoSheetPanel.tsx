import { cn } from "../../lib/utils"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"

interface InfoSheetPanelProps {
  portalContainer: HTMLElement
  winChance: number
  rngFee: number | string
  targetPayout: string
  gasPrice: string
}

export function InfoSheetPanel({
  portalContainer,
  winChance,
  rngFee,
  targetPayout,
  gasPrice,
}: InfoSheetPanelProps) {
  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent
        className={cn("!h-auto !max-h-[70%]", "p-5 sm:p-6")}
      >
        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-4 text-sm">
          <div>
            <p className="text-muted-foreground font-medium">Win chance:</p>
            <p className="font-medium text-base text-card-foreground">
              {winChance}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">RNG fee:</p>
            <p className="font-medium text-base text-card-foreground">
              {rngFee} ETH
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">Target payout:</p>
            <p className="font-medium text-base text-card-foreground">
              {targetPayout} ETH
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">Gas price:</p>
            <p className="font-medium text-base text-card-foreground">
              {gasPrice}
            </p>
          </div>
        </div>
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}
