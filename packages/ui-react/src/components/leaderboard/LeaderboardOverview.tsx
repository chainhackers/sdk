import { LEADERBOARD_STATUS } from "@betswirl/sdk-core"
import { AlertCircle, ChevronLeft, ExternalLink, InfoIcon, StarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useLeaderboardDetails } from "../../hooks/useLeaderboardDetails"
import { getChainName } from "../../lib/chainIcons"
import { getBlockExplorerUrl } from "../../lib/chainUtils"
import { cn } from "../../lib/utils"
import type { RankingEntry } from "../../types/types"
import {
  generateCasinoExamplesText,
  generateCasinoRulesText,
} from "../../utils/leaderboardRulesUtils"
import { formatLeaderboardStatus, mapRankingToEntry } from "../../utils/leaderboardUtils"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Button } from "../ui/button"
import { ChainIcon } from "../ui/ChainIcon"
import { ScrollArea } from "../ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { LeaderboardActionButton } from "./LeaderboardActionButton"
import { LeaderboardRankingTab } from "./LeaderboardRankingTab"

interface LeaderboardOverviewProps {
  leaderboardId: string
  onBack: () => void
}

export function LeaderboardOverview({ leaderboardId, onBack }: LeaderboardOverviewProps) {
  const { data, refetch } = useLeaderboardDetails(leaderboardId)
  const [rankingData, setRankingData] = useState<RankingEntry[]>([])

  useEffect(() => {
    if (data?.enriched) {
      if (data.enriched.rankings && data.enriched.rankings.length > 0) {
        const mappedRankings = data.enriched.rankings.map((ranking) =>
          mapRankingToEntry(ranking, data.enriched),
        )
        setRankingData(mappedRankings)
      } else {
        setRankingData([])
      }
    } else {
      setRankingData([])
    }
  }, [data])

  if (!data) return null

  const overviewData = data.overview
  const enrichedLeaderboard = data.enriched

  const contractUrl = getBlockExplorerUrl(
    overviewData.chainId,
    overviewData.userStats.contractAddress,
  )

  const rulesParams = enrichedLeaderboard?.casinoRules
    ? {
        rules: enrichedLeaderboard.casinoRules,
        chainId: overviewData.chainId,
        wageredSymbol: enrichedLeaderboard.wageredSymbol as string,
        wageredDecimals: enrichedLeaderboard.wageredDecimals as number,
      }
    : null
  const ruleItems = rulesParams ? generateCasinoRulesText(rulesParams) : []
  const exampleItems = rulesParams ? generateCasinoExamplesText(rulesParams) : []

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 pb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ChevronLeft size={18} />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-semibold">{overviewData.title}</h2>
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
                <div className="text-[12px] text-roulette-disabled-text flex items-center gap-2">
                  <span>Status:</span>
                  {(() => {
                    const isEnded =
                      overviewData.userStats.status === LEADERBOARD_STATUS.FINALIZED ||
                      overviewData.userStats.status === LEADERBOARD_STATUS.EXPIRED ||
                      overviewData.userStats.status === LEADERBOARD_STATUS.ENDED
                    return (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-[8px] text-[11px] border",
                          !isEnded && "text-primary border-primary",
                          isEnded && "text-roulette-disabled-text border-roulette-disabled-text",
                        )}
                      >
                        {formatLeaderboardStatus(overviewData.userStats.status)}
                      </span>
                    )
                  })()}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[12px] text-roulette-disabled-text">Your position:</div>
                    <div className="text-[16px] font-semibold">
                      #{overviewData.userStats.position}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-roulette-disabled-text">Your points:</div>
                    <div className="text-[16px] font-semibold">{overviewData.userStats.points}</div>
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
                        src={overviewData.prize.token.image}
                        alt={overviewData.userStats.prize.tokenSymbol}
                        className="w-5 h-5"
                      />
                      <div className="text-[16px] font-semibold">
                        {overviewData.userStats.prize.amount}
                      </div>
                    </div>
                  </div>
                  <LeaderboardActionButton
                    leaderboard={enrichedLeaderboard}
                    userAction={overviewData.userAction}
                    onClaimSuccess={() => refetch()}
                    className="w-fit px-4 py-1.5"
                  />
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
                    <ChainIcon chainId={overviewData.chainId} size={18} />
                    <span className="text-[12px] leading-[20px] text-roulette-disabled-text">
                      {getChainName(overviewData.chainId).charAt(0).toUpperCase() +
                        getChainName(overviewData.chainId).slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
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
                    {ruleItems.map((text, idx) => (
                      <li
                        // biome-ignore lint/suspicious/noArrayIndexKey: Rule items are positionally keyed; array length is fixed
                        key={idx}
                        className="text-[14px] leading-[22px] text-foreground ml-4"
                      >
                        • {text}
                      </li>
                    ))}
                    {exampleItems.map((text, idx) => {
                      const parts = text.split(": ")
                      const title = parts[0] || `Example ${idx + 1}`
                      const rest = parts.slice(1).join(": ")
                      return (
                        <li
                          // biome-ignore lint/suspicious/noArrayIndexKey: Example items are positionally keyed; array length is fixed
                          key={idx}
                          className="text-[14px] leading-[22px] text-foreground"
                        >
                          <strong>{title}:</strong> {rest}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>

              {overviewData.userStats.status === LEADERBOARD_STATUS.EXPIRED && (
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
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ranking" className="flex-1">
          <ScrollArea className="h-full">
            <div className="pb-4 px-4 pt-1">
              <LeaderboardRankingTab
                rankingData={rankingData}
                lastUpdate="Last update: recently (refreshed once per hour)"
                claimableAmount={
                  Number.isFinite(Number(overviewData.userStats.prize.amount))
                    ? Number.parseFloat(overviewData.userStats.prize.amount)
                    : 0
                }
                claimableTokenSymbol={overviewData.userStats.prize.tokenSymbol}
                leaderboardStatus={overviewData.userStats.status}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
