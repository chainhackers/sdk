import {
  type CasinoChainId,
  type CasinoRules,
  FORMAT_TYPE,
  formatRawAmount,
  LEADERBOARD_CASINO_RULES_GAME,
  LEADERBOARD_CASINO_RULES_SOURCE,
} from "@betswirl/sdk-core"
import { getChainName } from "../lib/chainIcons"

const EXAMPLE_MULTIPLIERS = {
  FIRST: 3n,
  SECOND: 10n,
  SECOND_FRACTION: 2n, // Used as divisor for 10.5 intervals
} as const

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

function getActionText(source: LEADERBOARD_CASINO_RULES_SOURCE): string {
  switch (source) {
    case LEADERBOARD_CASINO_RULES_SOURCE.PAYOUT:
    case LEADERBOARD_CASINO_RULES_SOURCE.PAYOUT_USD:
      return "win"
    default:
      return "bet"
  }
}

function isUsdRulesSource(source: LEADERBOARD_CASINO_RULES_SOURCE): boolean {
  return (
    source === LEADERBOARD_CASINO_RULES_SOURCE.PAYOUT_USD ||
    source === LEADERBOARD_CASINO_RULES_SOURCE.BET_AMOUNT_USD
  )
}

function getTokenSymbol(rules: CasinoRules, fallbackSymbol: string): string {
  return rules.tokens.length > 0 ? rules.tokens[0].symbol : fallbackSymbol
}

export function generateCasinoRulesText(params: RulesTextGeneratorParams): string[] {
  const { rules, chainId, wageredSymbol } = params

  const chainName = getChainName(chainId)
  const capitalizedChain = chainName.charAt(0).toUpperCase() + chainName.slice(1)

  const gamesText = formatGamesList(rules.games)
  const tokensText = formatTokensList(rules.tokens.map((t) => t.symbol))
  const actionVerb = getActionText(rules.source)

  const isUsdSource = isUsdRulesSource(rules.source)
  const currencySymbol = isUsdSource ? "$" : wageredSymbol

  const items: string[] = []

  items.push(`You have to play on the ${gamesText} games and on the chain ${capitalizedChain}`)
  items.push(`You have to play with ${tokensText} tokens`)
  items.push(
    `You earn ${rules.pointsPerInterval} points per interval of ${rules.formattedInterval} ${currencySymbol}`,
  )

  if (rules.minValue) {
    items.push(`You have to ${actionVerb} at least ${rules.formattedMinValue} ${currencySymbol}`)
  }
  if (rules.maxValue) {
    items.push(`You have to ${actionVerb} at maximum ${rules.formattedMaxValue} ${currencySymbol}`)
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
  const actionText = getActionText(rules.source)

  const amount1Raw = interval * EXAMPLE_MULTIPLIERS.FIRST
  const amount1 = formatRawAmount(amount1Raw, wageredDecimals, FORMAT_TYPE.FULL_PRECISE)
  const points1 = rules.pointsPerInterval * Number(EXAMPLE_MULTIPLIERS.FIRST)

  const amount2Raw =
    interval * EXAMPLE_MULTIPLIERS.SECOND + interval / EXAMPLE_MULTIPLIERS.SECOND_FRACTION
  const amount2 = formatRawAmount(amount2Raw, wageredDecimals, FORMAT_TYPE.FULL_PRECISE)
  const points2 = rules.pointsPerInterval * Number(EXAMPLE_MULTIPLIERS.SECOND)

  const isUsdSource = isUsdRulesSource(rules.source)
  const tokenSymbol = getTokenSymbol(rules, wageredSymbol)

  if (isUsdSource) {
    return [
      `Example 1: You ${actionText} ${amount1} $ betting with ${tokenSymbol} at ${exampleGame} => You earn ${points1} points`,
      `Example 2: You ${actionText} ${amount2} $ betting with ${tokenSymbol} at ${exampleGame} => You earn ${points2} points`,
    ]
  }
  return [
    `Example 1: You ${actionText} ${amount1} ${tokenSymbol} at ${exampleGame} => You earn ${points1} points`,
    `Example 2: You ${actionText} ${amount2} ${tokenSymbol} at ${exampleGame} => You earn ${points2} points`,
  ]
}
