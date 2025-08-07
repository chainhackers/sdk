import { useLeaderboards } from "../../hooks/useLeaderboards"
import { cn } from "../../lib/utils"
import { Switch } from "../ui/switch"
import { LeaderboardCard } from "./LeaderboardCard"

interface Props {
  onViewOverview?: (id: string) => void
}

export function LeaderboardsView({ onViewOverview }: Props) {
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
      <h1 className="text-[24px] font-bold text-foreground mb-4">Leaderboards</h1>

      {/* Partner toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[16px] font-semibold text-foreground">Ongoing</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[12px] leading-[18px] text-foreground">
            Show partner leaderboards
          </span>
          <Switch
            checked={showPartner}
            onCheckedChange={setShowPartner}
            className={cn(
              "h-[20px] w-[36px]",
              "data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300",
              "rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          />
        </label>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {/* Ongoing section - Show items directly without extra title */}
        {ongoingLeaderboards.length > 0 && (
          <div className="flex flex-col gap-2">
            {ongoingLeaderboards.map((item) => (
              <LeaderboardCard key={item.id} item={item} onViewOverview={onViewOverview} />
            ))}
          </div>
        )}

        {/* Ended section */}
        {endedLeaderboards.length > 0 && (
          <>
            <h2 className="text-[16px] font-semibold text-foreground mt-2">Ended</h2>
            <div className="flex flex-col gap-2">
              {endedLeaderboards.map((item) => (
                <LeaderboardCard key={item.id} item={item} onViewOverview={onViewOverview} />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {ongoingLeaderboards.length === 0 && endedLeaderboards.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-foreground text-center">
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
