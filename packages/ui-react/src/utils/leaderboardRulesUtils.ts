import {
  type CasinoChainId,
  type CasinoRules,
  FORMAT_TYPE,
  formatRawAmount,
  LEADERBOARD_CASINO_RULES_GAME,
} from "@betswirl/sdk-core"
import { getChainName } from "../lib/chainIcons"

export interface RulesTextGeneratorParams {
  rules: CasinoRules
  chainId: CasinoChainId
  wageredSymbol: string
  wageredDecimals: number
}

function formatGameName(game: LEADERBOARD_CASINO_RULES_GAME): string {
  switch (game) {
    case LEADERBOARD_CASINO_RULES_GAME.DICE:
      return "dice"
    case LEADERBOARD_CASINO_RULES_GAME.COINTOSS:
      return "cointoss"
    case LEADERBOARD_CASINO_RULES_GAME.ROULETTE:
      return "roulette"
    case LEADERBOARD_CASINO_RULES_GAME.KENO:
      return "keno"
    case LEADERBOARD_CASINO_RULES_GAME.WHEEL:
      return "wheel"
    case LEADERBOARD_CASINO_RULES_GAME.PLINKO:
      return "plinko"
    case LEADERBOARD_CASINO_RULES_GAME.ALL:
      return "all"
    default:
      return String(game).toLowerCase()
  }
}

function formatGamesList(games: LEADERBOARD_CASINO_RULES_GAME[]): string {
  if (games.includes(LEADERBOARD_CASINO_RULES_GAME.ALL)) {
    return "all"
  }
  const names = games.map(formatGameName)
  return names.join(" or ")
}

function formatTokensList(symbols: string[]): string {
  if (symbols.length === 0) return ""
  if (symbols.length === 1) return symbols[0]
  return symbols.join(" or ")
}

export function generateCasinoRulesText(params: RulesTextGeneratorParams): string[] {
  const { rules, chainId, wageredSymbol } = params

  const chainName = getChainName(chainId)
  const capitalizedChain = chainName.charAt(0).toUpperCase() + chainName.slice(1)

  const gamesText = formatGamesList(rules.games)
  const tokensText = formatTokensList(rules.tokens.map((t) => t.symbol))

  const items: string[] = []

  items.push(`You have to play on the ${gamesText} games and on the chain ${capitalizedChain}`)
  items.push(`You have to play with ${tokensText} tokens`)
  items.push(
    `You earn ${rules.pointsPerInterval} points per interval of ${rules.formattedInterval} ${wageredSymbol}`,
  )

  if (rules.minValue) {
    items.push(`You have to bet at least ${rules.formattedMinValue} ${wageredSymbol}`)
  }
  if (rules.maxValue) {
    items.push(`You have to bet at maximum ${rules.formattedMaxValue} ${wageredSymbol}`)
  }

  return items
}

export function generateCasinoExamplesText(params: RulesTextGeneratorParams): string[] {
  const { rules, wageredSymbol, wageredDecimals } = params

  const exampleGame = (() => {
    const list = rules.games.filter((g) => g !== LEADERBOARD_CASINO_RULES_GAME.ALL)
    return list.length > 0 ? formatGameName(list[0]) : "games"
  })()

  const interval = rules.interval

  const amount1Raw = interval * 3n
  const amount1 = formatRawAmount(amount1Raw, wageredDecimals, FORMAT_TYPE.FULL_PRECISE)
  const points1 = rules.pointsPerInterval * 3

  const amount2Raw = interval * 10n + interval / 2n // ~10.5 intervals
  const amount2 = formatRawAmount(amount2Raw, wageredDecimals, FORMAT_TYPE.FULL_PRECISE)
  const points2 = rules.pointsPerInterval * 10 // floor(10.5) intervals

  return [
    `Example 1: You bet ${amount1} ${wageredSymbol} at ${exampleGame} ⇒ You earn ${points1} points`,
    `Example 2: You bet ${amount2} ${wageredSymbol} at ${exampleGame} ⇒ You earn ${points2} points`,
  ]
}
