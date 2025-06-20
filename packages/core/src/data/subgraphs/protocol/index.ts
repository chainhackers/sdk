export * from "./clients";
// Queries
export type { BetDocument, BetQuery, BetQueryVariables } from "./documents/bet";
export type {
  BetsDocument,
  BetsQuery,
  BetsQueryVariables,
} from "./documents/bets";
// Fragments
export type { BetFragment, BetFragmentDoc } from "./documents/fragments/bet";

//Enums
export { Bet_OrderBy, OrderDirection } from "./documents/types";
