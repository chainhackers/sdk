import React from "react"
import { cn } from "../../lib/utils"
import { ScrollArea } from "../ui/scroll-area"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table"
import { SheetPortal, SheetOverlay, SheetBottomPanelContent } from "../ui/sheet"

export interface HistoryEntry {
  id: string
  status: "Won bet" | "Busted"
  multiplier: number | string
  payoutAmount: number | string
  payoutCurrencyIcon: React.ReactElement
  timestamp: string
}

interface HistorySheetPanelProps {
  portalContainer: HTMLElement
  historyData: HistoryEntry[]
}

export function HistorySheetPanel({
  portalContainer,
  historyData,
}: HistorySheetPanelProps) {
  const isEmpty = historyData.length === 0

  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent
        className={cn(
          isEmpty ? "!h-auto !max-h-[70%]" : "!h-[70%] !max-h-full",
          "p-0",
        )}
      >
        <ScrollArea className="h-full w-full rounded-t-[16px] overflow-hidden">
          <div className="p-1 pt-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50">
                  <TableHead className="px-3 py-2.5 text-muted-foreground font-medium top-0 bg-card">
                    Draw
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-muted-foreground font-medium top-0 bg-card">
                    X
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-muted-foreground font-medium top-0 bg-card">
                    Payout
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-muted-foreground font-medium top-0 bg-card">
                    Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isEmpty ? (
                  <TableRow className="border-b-0">
                    <TableCell
                      colSpan={4}
                      className="px-3 py-6 text-left align-top"
                    >
                      <div>
                        <p className="text-base text-card-foreground font-semibold">
                          No bets currently
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                          Play the game to make your first bet
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="border-b border-border/50 last:border-b-0"
                    >
                      <TableCell
                        className={cn(
                          "px-3 py-2.5 font-medium",
                          entry.status === "Won bet"
                            ? "text-game-win"
                            : "text-game-loss",
                        )}
                      >
                        {entry.status}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-foreground font-medium">
                        {entry.multiplier}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-foreground font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <span>{entry.payoutAmount}</span>
                          {entry.payoutCurrencyIcon}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-muted-foreground font-medium">
                        {entry.timestamp}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}
