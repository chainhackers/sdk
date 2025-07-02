import type { ChainId, LEADERBOARD_TYPE } from "../../../data";
import { BetSwirlError, ERROR_CODES } from "../../../errors";
import { getBetSwirlApiUrl } from "../../../utils";

const MAX_BET_IDS = 100;

/**
 * Refreshes leaderboards by adding the specified bet IDs.
 * It allows to avoid waiting up to 1h to take into account the bets in the leaderboards ranks.
 * If bets are not added to the leaderboards, they will be considered for the next automatic refresh (refreshed once per hour).
 *
 * This function sends a POST request to the BetSwirl API to add the given bet IDs to the leaderboards
 * for a specific chain and bet type. It returns true if the operation was successful, otherwise false.
 *
 * @param betIds - An array of bet IDs to add to the leaderboards.
 * @param chainId - The chain ID on which the bets were placed.
 * @param betType - The type of leaderboard (casino or sports).
 * @param testMode - Whether to use test mode API endpoint (default: false)
 *
 * @returns A promise that resolves to true if the refresh was successful, or false otherwise.
 */
export const refreshLeaderboardsWithBets = async (
  betIds: string[],
  chainId: ChainId,
  betType: LEADERBOARD_TYPE,
  testMode = false,
): Promise<boolean> => {
  try {
    if (betIds.length > MAX_BET_IDS) {
      throw new BetSwirlError("Too many bet ids", ERROR_CODES.LEADERBOARD.TOO_MANY_BETS, {
        betIdsCount: betIds.length,
        maxBetIdsCount: MAX_BET_IDS,
      });
    }
    const res = await fetch(`${getBetSwirlApiUrl(testMode)}/public/v1/leaderboards/add-bets`, {
      method: "POST",
      body: JSON.stringify({
        bet_ids: betIds,
        chain_id: chainId.toString(),
        bet_type: betType,
      }),
    });
    if (res.status === 200) {
      return true;
    }
    console.error(`${res.status} ${res.statusText} - ${JSON.stringify(await res.json())}`);
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};
