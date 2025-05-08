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
  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent className={cn("!h-[70%] !max-h-full", "p-0")}>
        <ScrollArea className="h-full w-full rounded-t-[16px] overflow-hidden">
          <div className="p-1 pt-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50">
                  <TableHead className="px-3 py-2.5 text-muted-foreground font-medium top-0 bg-card sticky z-10">
                    Draw
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-muted-foreground font-medium top-0 bg-card sticky z-10">
                    X
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-muted-foreground font-medium top-0 bg-card sticky z-10">
                    Payout
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-muted-foreground font-medium top-0 bg-card sticky z-10">
                    Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((entry) => (
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
                    <TableCell className="px-3 py-2.5 text-right text-foreground font-medium">
                      {entry.payoutAmount}
                      {entry.payoutCurrencyIcon}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right text-muted-foreground font-medium">
                      {entry.timestamp}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}
