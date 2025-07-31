import { cn } from "../../lib/utils"
import { ScrollArea } from "../ui/scroll-area"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"
import { LeaderboardsView } from "./LeaderboardsView"

interface LeaderboardSheetPanelProps {
  portalContainer: HTMLElement
}

export function LeaderboardSheetPanel({ portalContainer }: LeaderboardSheetPanelProps) {
  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent className={cn("!h-[70%]", "!max-h-full", "p-0")}>
        <ScrollArea className="h-full w-full rounded-t-[16px] overflow-hidden">
          <LeaderboardsView />
        </ScrollArea>
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}
