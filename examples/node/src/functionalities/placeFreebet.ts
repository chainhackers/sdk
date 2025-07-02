import {
  BetSwirlError,
  bigIntFormatter,
  casinoChainById,
  type NormalCasinoPlacedBet,
  WEIGHTED_CASINO_GAME_TYPES,
  type WeightedCasinoPlacedBet,
  type WeightedGameChoiceInput,
} from "@betswirl/sdk-core";
import chalk from "chalk";
import { checkEnvVariables } from "../../utils";
import {
  _checkFreebetAndBalances,
  _fetchCasinoTokens,
  _getBetRequirements,
  _getTokenInfo,
  _placeFreebet,
  _refreshLeaderboardsWithBet,
  _selectFreebet,
  _selectGame,
  _selectInput,
  _waitRoll,
  _waitWeightedRoll,
} from "./common";

export async function startPlaceFreebetProcess() {
  try {
    // 0. Check if env variables are set
    checkEnvVariables();
    // 1. Select a freebet to wager
    const selectedFreebet = await _selectFreebet();
    if (!selectedFreebet) {
      console.log(
        chalk.bgYellow(
          `Your wallet has no active freebets ${process.env.AFFILIATE_ADDRESS ? `received from ${process.env.AFFILIATE_ADDRESS} affiliate` : ""}. Reach out @kinco_dev on Telegram to be able to create freebet campaigns in the test environement.`,
        ),
      );
      return;
    }

    // 2. Select game
    const casinoChain = casinoChainById[selectedFreebet.chainId];
    const selectedGame = await _selectGame(casinoChain);

    // 3. Fetch tokens (we already know the token to use via the freebet but we need to fetch the casino tokens to know if the token is paused)
    const tokens = await _fetchCasinoTokens(false, selectedGame.chainId);
    const freebetToken = tokens.find((t) => t.address === selectedFreebet.token.address);
    if (!freebetToken || freebetToken.paused) {
      console.log(
        chalk.bgYellow(
          `The token ${selectedFreebet.token.symbol} is paused or not found. Please select another freebet.`,
        ),
      );
      return;
    }

    // 4. Get token info (user balance, house edge, etc)
    const { gameToken, userTokenBalance, userGasBalance } = await _getTokenInfo(
      freebetToken,
      selectedGame,
    );
    // 5. Select input
    const selectedInput = await _selectInput(gameToken);
    // 6. Get bet requirements
    const betRequirements = await _getBetRequirements(selectedInput, gameToken);

    // 7. Check if the freebet amount and user balances are valid
    await _checkFreebetAndBalances(
      selectedFreebet,
      betRequirements,
      gameToken,
      userTokenBalance,
      userGasBalance,
    );
    // 8. Place freebet
    const placedFreebet = await _placeFreebet(selectedFreebet, gameToken, selectedInput);

    // 9. Wait for the roll
    if (WEIGHTED_CASINO_GAME_TYPES.includes(placedFreebet.game)) {
      await _waitWeightedRoll(
        placedFreebet as WeightedCasinoPlacedBet,
        (selectedInput as WeightedGameChoiceInput).config,
        gameToken.affiliateHouseEdge,
      );
    } else {
      await _waitRoll(placedFreebet as NormalCasinoPlacedBet);
    }

    // 10. [OPTIONAL] Refresh leaderboards manually with the placed freebet
    await _refreshLeaderboardsWithBet(placedFreebet.id, selectedGame.chainId);
  } catch (error) {
    if (error instanceof BetSwirlError) {
      console.error(
        chalk.red(
          `[${error.code}] BetSwirl error occured while placing freebet: ${
            error.message
          } ${JSON.stringify(error.context, bigIntFormatter)}`,
        ),
      );
    } else {
      console.error(chalk.red("Node example error occured:", error));
    }
  }
}
