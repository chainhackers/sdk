import { Info } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"
import { TokenIcon } from "../ui/TokenIcon"
import { Tooltip, TooltipPrimitive, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import type { FreeBet } from "./BettingPanel"

interface FreeBetSheetPanelProps {
  portalContainer: HTMLElement
  freeBets: FreeBet[]
  selectedFreeBet: FreeBet | null
  onSelect: (freeBet: FreeBet) => void
}

export function FreeBetSheetPanel({
  portalContainer,
  freeBets,
  selectedFreeBet,
  onSelect,
}: FreeBetSheetPanelProps) {
  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent className={cn("!h-auto !max-h-[70%]", "p-4")}>
        <TooltipProvider>
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-base font-semibold">Freebets</h2>
            </div>

            <ScrollArea className="h-60 [&>[data-slot=scroll-area-scrollbar]]:w-[6px] [&>[data-slot=scroll-area-scrollbar]]:border-l-0 [&>[data-slot=scroll-area-scrollbar]]:z-10 [&>[data-slot=scroll-area-scrollbar]]:-translate-x-[1px] [&_[data-slot=scroll-area-thumb]]:bg-scrollbar-thumb">
              <div className="flex flex-col gap-1 p-1">
                {freeBets.map((freeBet) => (
                  <Button
                    key={freeBet.id}
                    variant="ghost"
                    onClick={() => onSelect(freeBet)}
                    aria-pressed={selectedFreeBet?.id === freeBet.id}
                    aria-label={`Select freebet: ${freeBet.amount} ${freeBet.token.symbol}`}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-[8px] w-full text-left h-auto",
                      "hover:bg-surface-hover transition-colors",
                      selectedFreeBet?.id === freeBet.id && "bg-surface-selected",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        role="img"
                        aria-label={`${freeBet.token.symbol} token icon`}
                        title={`${freeBet.token.symbol} token`}
                      >
                        <TokenIcon token={freeBet.token} size={18} />
                      </div>
                      <span className="font-medium text-foreground">
                        {freeBet.amount} {freeBet.token.symbol}
                      </span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <Info size={16} className="text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipPrimitive.Content
                        side="left"
                        sideOffset={2.5}
                        className="h-auto max-w-[160px] px-2 py-1 text-[10px] font-medium rounded-[3px] bg-keno-multiplier-tooltip-bg text-keno-multiplier-tooltip-text border-none shadow-none flex items-center justify-center z-50 whitespace-normal"
                      >
                        <p className="text-sm">
                          {freeBet.expiresAt
                            ? `Expires ${freeBet.expiresAt}`
                            : "No expiration date"}
                        </p>
                        <TooltipPrimitive.Arrow
                          className="fill-keno-multiplier-tooltip-bg z-50 rounded-[1px]"
                          width={10}
                          height={5}
                        />
                      </TooltipPrimitive.Content>
                    </Tooltip>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TooltipProvider>
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}
