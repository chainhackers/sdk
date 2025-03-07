export * from "./clients";

// Fragments
export type { BetFragment, BetFragmentDoc } from "./documents/fragments/bet";

// Queries
export type { BetQuery, BetQueryVariables, BetDocument } from "./documents/bet";
export type {
  BetsQuery,
  BetsQueryVariables,
  BetsDocument,
} from "./documents/bets";

//Enums
export { Bet_OrderBy, OrderDirection } from "./documents/types";
