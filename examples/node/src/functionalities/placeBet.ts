import {
  BetSwirlError,
  type NormalCasinoPlacedBet,
  WEIGHTED_CASINO_GAME_TYPES,
  type WeightedCasinoPlacedBet,
  type WeightedGameChoiceInput,
  bigIntFormatter,
} from "@betswirl/sdk-core";
import chalk from "chalk";
import { checkEnvVariables } from "../../utils";
import {
  _getTokenInfo,
  _placeBet,
  _selectBetAmount,
  _selectBetCount,
  _selectChain,
  _selectGame,
  _selectInput,
  _selectToken,
  _waitRoll,
  _waitWeightedRoll,
} from "./common";
import { _getBetRequirements } from "./common";

export async function startPlaceBetProcess() {
  try {
    // 0. Check if env variables are set
    checkEnvVariables();
    // 1. Select chain
    const selectedChain = await _selectChain();
    // 2. Select game
    const selectedGame = await _selectGame(selectedChain);
    // 3. Select token
    const selectedToken = await _selectToken(selectedGame);
    // 4. Get token info (user balance, house edge, etc)
    const { gameToken, userTokenBalance, userGasBalance } = await _getTokenInfo(
      selectedToken,
      selectedGame,
    );
    // 5. Select input
    const selectedInput = await _selectInput(gameToken);
    // 6. Get bet requirements
    const betRequirements = await _getBetRequirements(selectedInput, gameToken);
    // 7. Get bet count
    const betCount = await _selectBetCount(betRequirements);
    // 8. Get bet amount
    const betAmount = await _selectBetAmount(
      betRequirements,
      gameToken,
      betCount,
      userTokenBalance,
      userGasBalance,
    );
    // 9. Place bet
    const placedBet = await _placeBet(gameToken, selectedInput, betCount, betAmount);

    // 10. Wait for the roll
    if (WEIGHTED_CASINO_GAME_TYPES.includes(placedBet.game)) {
      await _waitWeightedRoll(
        placedBet as WeightedCasinoPlacedBet,
        (selectedInput as WeightedGameChoiceInput).config,
        gameToken.affiliateHouseEdge,
      );
    } else {
      await _waitRoll(placedBet as NormalCasinoPlacedBet);
    }
  } catch (error) {
    if (error instanceof BetSwirlError) {
      console.error(
        chalk.red(
          `[${error.code}] BetSwirl error occured while placing bet: ${
            error.message
          } ${JSON.stringify(error.context, bigIntFormatter)}`,
        ),
      );
    } else {
      console.error(chalk.red("Node example error occured:", error));
    }
  }
}
