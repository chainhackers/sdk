/**
 * Default configuration values for React Query and caching strategies
 */

// SWR (stale-while-revalidate) cache configuration
export const QUERY_DEFAULTS = {
  /** How long data is considered fresh (1 minute) */
  STALE_TIME: 60000,
  /** Number of retry attempts for failed queries */
  RETRY_COUNT: 3,
  /** Enable refetch when window regains focus */
  REFETCH_ON_WINDOW_FOCUS: true,
  /** Enable refetch when network connection is restored */
  REFETCH_ON_RECONNECT: true,
} as const

// Specific intervals for different types of data
export const REFETCH_INTERVALS = {
  /** Bet requirements refetch interval (2 minutes) - depends on bankroll changes */
  BET_REQUIREMENTS: 120000,
} as const
