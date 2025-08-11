import { fetchLeaderboard } from "@betswirl/sdk-core"
import { AlertCircle, ChevronLeft, ExternalLink, InfoIcon, StarIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useClaimLeaderboardRewards } from "../../hooks/useClaimLeaderboardRewards"
import { useLeaderboardDetails } from "../../hooks/useLeaderboardDetails"
import { getChainName } from "../../lib/chainIcons"
import { getBlockExplorerUrl } from "../../lib/chainUtils"
import { cn } from "../../lib/utils"
import type { RankingEntry } from "../../types/types"
import { mapRankingToEntry } from "../../utils/leaderboardUtils"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Button } from "../ui/button"
import { ChainIcon } from "../ui/ChainIcon"
import { ScrollArea } from "../ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { LeaderboardRankingTab } from "./LeaderboardRankingTab"

interface LeaderboardOverviewProps {
  leaderboardId: string
  onBack: () => void
}

export function LeaderboardOverview({ leaderboardId, onBack }: LeaderboardOverviewProps) {
  const { address } = useAccount()
  const { data, refetch } = useLeaderboardDetails(leaderboardId)
  const { claim, isPending, isSuccess, error } = useClaimLeaderboardRewards()
  const [rankingData, setRankingData] = useState<RankingEntry[]>([])
  const [fullLeaderboard, setFullLeaderboard] = useState<any>(null)

  useEffect(() => {
    const fetchFullLeaderboard = async () => {
      if (!leaderboardId) return

      try {
        const leaderboard = await fetchLeaderboard(Number(leaderboardId), address, false)

        if (leaderboard) {
          setFullLeaderboard(leaderboard)

          if (leaderboard.rankings && leaderboard.rankings.length > 0) {
            const mappedRankings = leaderboard.rankings.map((ranking: any) =>
              mapRankingToEntry(ranking, leaderboard),
            )
            setRankingData(mappedRankings)
          } else {
            setRankingData([])
          }
        }
      } catch (error) {
        console.error("Failed to fetch full leaderboard:", error)
        setRankingData([])
      }
    }

    fetchFullLeaderboard()
  }, [leaderboardId, address])

  useEffect(() => {
    if (isSuccess) {
      refetch()
    }
  }, [isSuccess, refetch])

  const handleClaim = useCallback(async () => {
    if (!data || !leaderboardId) return

    const leaderboard = fullLeaderboard || (await fetchLeaderboard(Number(leaderboardId), address))

    if (!leaderboard) {
      console.error("Failed to fetch leaderboard for claiming")
      return
    }

    claim({ leaderboard })
  }, [data, leaderboardId, address, claim, fullLeaderboard])

  if (!data) return null

  const canClaim = data.userStats.status === "Claimable" && data.userStats.prize.amount !== "0"

  const contractUrl = getBlockExplorerUrl(data.chainId, data.userStats.contractAddress)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 pb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ChevronLeft size={18} />
        </Button>
        <div className="flex items-center gap-2">
          <ChainIcon chainId={data.chainId} size={18} />
          <h2 className="text-[18px] font-semibold">{data.title}</h2>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col flex-1">
        <div className="px-4">
          <TabsList>
            <TabsTrigger value="overview">
              <InfoIcon size={20} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ranking">
              <StarIcon size={20} />
              Ranking
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="flex-1">
          <ScrollArea className="h-full">
            <div className="pb-4 px-4 pt-1 flex flex-col gap-4">
              {/* Status and user stats card */}
              <div className="bg-free-bet-card-section-bg rounded-[12px] p-3 flex flex-col gap-3">
                <div className="text-[12px] text-roulette-disabled-text">
                  Status:{" "}
                  <span className="px-2 py-0.5 rounded-[8px] border text-[11px] border-roulette-disabled-text">
                    {data.userStats.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[12px] text-roulette-disabled-text">Your position:</div>
                    <div className="text-[16px] font-semibold">#{data.userStats.position}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-roulette-disabled-text">Your points:</div>
                    <div className="text-[16px] font-semibold">{data.userStats.points}</div>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-leaderboard-separator" />
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="text-[12px] text-roulette-disabled-text">
                      Your current prize:
                    </div>
                    <div className="flex items-center gap-2">
                      <img
                        src={data.prize.token.image}
                        alt={data.userStats.prize.tokenSymbol}
                        className="w-5 h-5"
                      />
                      <div className="text-[16px] font-semibold">{data.userStats.prize.amount}</div>
                    </div>
                  </div>
                  {canClaim ? (
                    <Button
                      onClick={handleClaim}
                      disabled={isPending}
                      className={cn(
                        "bg-primary hover:bg-primary/90",
                        "text-white font-semibold",
                        "rounded-[8px] h-[32px] px-4 py-1.5 w-fit",
                        "text-[12px] leading-[20px]",
                        isPending && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {isPending
                        ? "Claiming..."
                        : `Claim ${data.userStats.prize.amount} ${data.userStats.prize.tokenSymbol}`}
                    </Button>
                  ) : (
                    <div className="text-[12px] text-muted-foreground">
                      {data.userStats.prize.amount === "0"
                        ? "No rewards to claim"
                        : data.userStats.status === "Expired"
                          ? "Claim period expired"
                          : "Not claimable"}
                    </div>
                  )}
                </div>
                {contractUrl ? (
                  <a
                    href={contractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] leading-[20px] text-primary flex items-center gap-1 font-bold"
                  >
                    Leaderboard contract
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-[12px] leading-[20px] text-roulette-disabled-text flex items-center gap-1 font-bold pointer-events-none">
                    Leaderboard contract
                    <ExternalLink size={12} />
                  </span>
                )}
              </div>

              {/* Rules */}
              <div className="bg-free-bet-card-section-bg rounded-[12px] p-3 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] leading-[24px] font-semibold">Rules</h3>
                  <div className="flex items-center gap-2 ml-auto">
                    <ChainIcon chainId={data.chainId} size={18} />
                    <span className="text-[12px] leading-[20px] text-roulette-disabled-text">
                      {getChainName(data.chainId).charAt(0).toUpperCase() +
                        getChainName(data.chainId).slice(1)}
                    </span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  <Alert variant="info">
                    <AlertCircle className="h-[16px] w-[16px]" />
                    <AlertDescription className="text-[12px] leading-[20px]">
                      {
                        "A bet must be placed and rolled (not only placed) before end date to be taken into account in the ranking."
                      }
                    </AlertDescription>
                  </Alert>
                  <ul className="flex flex-col gap-2">
                    <li className="text-[14px] leading-[22px] text-foreground">
                      <strong>The competition is scored using a point system:</strong>
                    </li>
                    <li className="text-[14px] leading-[22px] text-foreground ml-4">
                      • You have to play on the dice or cointoss or roulette or keno or wheel games
                      and on the chain Base
                    </li>
                    <li className="text-[14px] leading-[22px] text-foreground ml-4">
                      • You have to play with BETS tokens
                    </li>
                    <li className="text-[14px] leading-[22px] text-foreground ml-4">
                      • You earn 100 points per interval of 100 BETS
                    </li>
                    <li className="text-[14px] leading-[22px] text-foreground">
                      <strong>Example 1:</strong> You bet 300 BETS at dice ⇒ You earn 300 points
                    </li>
                    <li className="text-[14px] leading-[22px] text-foreground">
                      <strong>Example 2:</strong> You bet 1050 BETS at cointoss ⇒ You earn 1000
                      points
                    </li>
                  </ul>
                </ul>
              </div>

              {data.userStats.status === "Expired" && (
                <Alert variant="warning">
                  <AlertCircle className="h-[16px] w-[16px]" />
                  <AlertTitle className="text-[14px] leading-[22px] font-medium">
                    Event expired
                  </AlertTitle>
                  <AlertDescription className="text-[12px] leading-[20px]">
                    Prizes cannot be withdrawn anymore
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-[16px] w-[16px]" />
                  <AlertTitle className="text-[14px] leading-[22px] font-medium">
                    Claim failed
                  </AlertTitle>
                  <AlertDescription className="text-[12px] leading-[20px]">
                    {error.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ranking" className="flex-1">
          <ScrollArea className="h-full">
            <div className="pb-4 px-4 pt-1">
              <LeaderboardRankingTab
                rankingData={rankingData}
                lastUpdate="Last update: recently (refreshed once per hour)"
                claimableAmount={data.userStats.prize.amount}
                claimableTokenSymbol={data.userStats.prize.tokenSymbol}
                leaderboardStatus={data.userStats.status}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
