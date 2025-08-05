import { AlertCircle, ExternalLink, ChevronLeft, InfoIcon, StarIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { useLeaderboardDetails } from "../../hooks/useLeaderboardDetails"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { ChainIcon } from "../ui/ChainIcon"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { getChainName } from "../../lib/chainIcons"

interface LeaderboardOverviewProps {
  leaderboardId: string
  onBack: () => void
}

export function LeaderboardOverview({ leaderboardId, onBack }: LeaderboardOverviewProps) {
  const { data } = useLeaderboardDetails(leaderboardId)

  if (!data) return null

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

      <Tabs value="overview" className="px-4">
        <TabsList>
          <TabsTrigger value="overview">
            <InfoIcon size={20} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ranking" disabled>
            <StarIcon size={20} />
            Ranking
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="h-full">
        <div className="p-4 flex flex-col gap-4">
          {/* Status and user stats card */}
          <div className="bg-surface-secondary rounded-[12px] p-3 flex flex-col gap-3">
            <div className="text-[12px] text-roulette-disabled-text">Status: <span className="px-2 py-0.5 rounded-[8px] border text-[11px] border-roulette-disabled-text">{data.userStats.status}</span></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[12px] text-gray-500">Your position:</div>
                <div className="text-[16px] font-semibold">#{data.userStats.position}</div>
              </div>
              <div>
                <div className="text-[12px] text-gray-500">Your points:</div>
                <div className="text-[16px] font-semibold">{data.userStats.points}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="text-[12px] text-gray-500">Your current prize:</div>
                <div className="flex items-center gap-2">
                  <img src={data.prize.token.image} alt={data.userStats.prize.tokenSymbol} className="w-5 h-5" />
                  <div className="text-[16px] font-semibold">{data.userStats.prize.amount}</div>
                </div>
              </div>
              <Button
                className={cn(
                  "bg-primary hover:bg-primary/90",
                  "text-white font-semibold",
                  "rounded-[8px] h-[32px] px-4 py-1.5 w-fit",
                  "text-[12px] leading-[20px]",
                )}
              >
                Claim {data.userStats.prize.amount} {data.userStats.prize.tokenSymbol}
              </Button>
            </div>
            <a className="text-[12px] leading-[20px] text-primary flex items-center gap-1 font-bold" href="#" onClick={(e)=>e.preventDefault()}>
              Leaderboard contract
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Rules */}
          <div className="bg-surface-secondary rounded-[12px] p-3 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] leading-[24px] font-semibold">Rules</h3>
            <div className="flex items-center gap-2 ml-auto">
              <ChainIcon chainId={data.chainId} size={18} />
              <span className="text-[12px] leading-[20px] text-gray-500">
                {getChainName(data.chainId).charAt(0).toUpperCase() + getChainName(data.chainId).slice(1)}
              </span>
            </div>

            </div>
            <ul className="flex flex-col gap-2">
              {data.rules[0]?.isHighlighted && (
                <Alert variant="info" >
                  <AlertCircle className="h-[16px] w-[16px]" />
                  <AlertDescription className="text-[12px] leading-[20px] text-black">
                    {"A bet must be placed and rolled (not only placed) before end date to be taken into account in the ranking."}
                  </AlertDescription>
                </Alert>
              )}
              <ul className="flex flex-col gap-2">
                <li className="text-[14px] leading-[22px] text-gray-600">
                  <strong>The competition is scored using a point system:</strong>
                </li>
                <li className="text-[14px] leading-[22px] text-gray-600 ml-4">
                  • You have to play on the dice or cointoss or roulette or keno or wheel games and on the chain Base
                </li>
                <li className="text-[14px] leading-[22px] text-gray-600 ml-4">
                  • You have to play with BETS tokens
                </li>
                <li className="text-[14px] leading-[22px] text-gray-600 ml-4">
                  • You earn 100 points per interval of 100 BETS
                </li>
                <li className="text-[14px] leading-[22px] text-gray-600">
                  <strong>Example 1:</strong> You bet 300 BETS at dice ⇒ You earn 300 points
                </li>
                <li className="text-[14px] leading-[22px] text-gray-600">
                  <strong>Example 2:</strong> You bet 1050 BETS at cointoss ⇒ You earn 1000 points
                </li>
              </ul>
            </ul>
          </div>

          {data.isExpired && (
            <Alert variant="warning" >
              <AlertCircle className="h-[16px] w-[16px]" />
              <AlertTitle className="text-[14px] leading-[22px] font-medium text-black">Event expired</AlertTitle>
              <AlertDescription className="text-[12px] leading-[20px] text-black">
                Prizes cannot be withdrawn anymore
              </AlertDescription>
            </Alert>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
