import { useLeaderboards } from "../../hooks/useLeaderboards"
import { cn } from "../../lib/utils"
import { ScrollArea } from "../ui/scroll-area"
import { LeaderboardCard } from "./LeaderboardCard"

export function LeaderboardsView() {
  const { ongoingLeaderboards, endedLeaderboards, showPartner, setShowPartner, isLoading, error } =
    useLeaderboards()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading leaderboards...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Error loading leaderboards</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-[16px]">
      {/* Header */}
      <h1 className="text-[24px] font-bold text-gray-900 mb-4">Leaderboards</h1>

      {/* Partner toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[16px] font-semibold text-gray-900">Ongoing</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[13px] text-gray-600">Show partner leaderboards</span>
          <button
            type="button"
            role="switch"
            aria-checked={showPartner}
            onClick={() => setShowPartner(!showPartner)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              showPartner ? "bg-blue-600" : "bg-gray-300",
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                showPartner ? "translate-x-[22px]" : "translate-x-[2px]",
              )}
            />
          </button>
        </label>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {/* Ongoing section - Show items directly without extra title */}
        {ongoingLeaderboards.length > 0 && (
          <div className="flex flex-col gap-2">
            {ongoingLeaderboards.map((item) => (
              <LeaderboardCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Ended section */}
        {endedLeaderboards.length > 0 && (
          <>
            <h2 className="text-[16px] font-semibold text-gray-900 mt-2">Ended</h2>
            <div className="flex flex-col gap-2">
              {endedLeaderboards.map((item) => (
                <LeaderboardCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {ongoingLeaderboards.length === 0 && endedLeaderboards.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500 text-center">
              No leaderboards available
              {!showPartner && (
                <>
                  <br />
                  <span className="text-sm">Try enabling partner leaderboards</span>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
