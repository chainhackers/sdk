import { cn } from "../../lib/utils"
import { ScrollArea } from "../ui/scroll-area"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"
import { LeaderboardsView } from "./LeaderboardsView"
import { useState } from "react"
import { LeaderboardOverview } from "./LeaderboardOverview"

interface LeaderboardSheetPanelProps {
  portalContainer: HTMLElement
}

export function LeaderboardSheetPanel({ portalContainer }: LeaderboardSheetPanelProps) {
  const [viewingLeaderboardId, setViewingLeaderboardId] = useState<string | null>(null)

  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent className={cn("!h-[70%]", "!max-h-full", "p-0")}>
        <ScrollArea className="h-full w-full rounded-t-[16px] overflow-hidden">
          {viewingLeaderboardId ? (
            <LeaderboardOverview leaderboardId={viewingLeaderboardId} onBack={() => setViewingLeaderboardId(null)} />
          ) : (
            <LeaderboardsView onViewOverview={setViewingLeaderboardId} />
          )}
        </ScrollArea>
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}
