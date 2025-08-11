import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useLeaderboards } from "../../hooks/useLeaderboards"
import { cn } from "../../lib/utils"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Switch } from "../ui/switch"
import { LeaderboardCard } from "./LeaderboardCard"

interface Props {
  onViewOverview?: (id: string) => void
}

export function LeaderboardsView({ onViewOverview }: Props) {
  const { ongoingLeaderboards, endedLeaderboards, showPartner, setShowPartner } = useLeaderboards()
  const queryClient = useQueryClient()

  const handleClaimSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["leaderboards"] })
  }, [queryClient])

  return (
    <div className="flex flex-col p-[16px]">
      {/* Header */}
      <h1 className="text-[24px] font-bold text-foreground mb-4">Leaderboards</h1>

      {/* Partner toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[16px] font-semibold text-foreground">Ongoing</span>
        <label htmlFor="partner-toggle" className="flex items-center gap-2 cursor-pointer">
          <span className="text-[12px] leading-[18px] text-foreground">
            Show partner leaderboards
          </span>
          <Switch
            id="partner-toggle"
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
        {ongoingLeaderboards.length > 0 ? (
          <div className="flex flex-col gap-2">
            {ongoingLeaderboards.map((item) => (
              <LeaderboardCard
                key={item.id}
                item={item}
                onViewOverview={onViewOverview}
                onClaimSuccess={handleClaimSuccess}
              />
            ))}
          </div>
        ) : (
          <Alert className="text-center">
            <AlertTitle className="text-[14px] leading-[22px] font-semibold">
              There are no ongoing leaderboards
            </AlertTitle>
            <AlertDescription className="text-[12px] leading-[20px] justify-items-center">
              Come back later.
            </AlertDescription>
          </Alert>
        )}

        {/* Ended section */}
        {endedLeaderboards.length > 0 ? (
          <>
            <h2 className="text-[16px] font-semibold text-foreground mt-2">Ended</h2>
            <div className="flex flex-col gap-2">
              {endedLeaderboards.map((item) => (
                <LeaderboardCard
                  key={item.id}
                  item={item}
                  onViewOverview={onViewOverview}
                  onClaimSuccess={handleClaimSuccess}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-[16px] font-semibold text-foreground mt-2">Ended</h2>
            <Alert className="text-center">
              <AlertTitle className="text-[14px] leading-[22px] font-semibold">
                There are no ended leaderboards
              </AlertTitle>
              <AlertDescription className="text-[12px] leading-[20px] justify-items-center">
                Waiting a leaderboard ends.
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </div>
  )
}
