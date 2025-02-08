import {
  BetSwirlClient,
  BetSwirlError,
  bigIntFormatter,
  CASINO_GAME_TYPE,
  casinoChains,
  CoinToss,
  Dice,
  initBetSwirlClient,
  type BetRequirements,
  type CasinoChain,
  type CasinoGame,
  type CasinoGameToken,
  type CasinoToken,
  type ChoiceInput,
  type CoinTossChoiceInput,
  type DiceChoiceInput,
} from "@betswirl/sdk-core";
import { select, input } from "@inquirer/prompts";
import { checkEnvVariables, getWagmiConfigFromCasinoChain } from "./utils";
import { formatUnits, zeroAddress, type Hex } from "viem";
import chalk from "chalk";
import * as dotenv from "dotenv";
import { getBalance } from "@wagmi/core";
dotenv.config();
let betSwirlClient: BetSwirlClient;

// Main Menu
const showMenu = async () => {
  const answer = await select({
    message: "What do you want to do?",
    loop: false,
    choices: [
      {
        name: "Place a bet",
        value: "place_bet",
      },
      {
        name: "Show previous bets",
        value: "previous_bets",
        disabled: "(not yet implemented)",
      },
      {
        name: "Quit",
        value: "quit",
      },
    ],
  });

  switch (answer) {
    case "place_bet":
      await placeBet();
      break;
    case "previous_bets":
      await showPreviousBets();
      break;
    case "quit":
      console.log("Bye!");
      process.exit(0);
    default:
      console.log("Invalid choice, please try again.");
      await showMenu();
  }
  await showMenu();
};

async function placeBet() {
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
      selectedGame
    );
    // 5. Select input
    const selectedInput = await _selectInput(gameToken);
    // 6. Get bet requirements
    const betRequirements = await _getBetRequirements(selectedInput, gameToken);
    // 7. Get bet count
    const betCount = await _selectBetCount(betRequirements);
  } catch (error) {
    if (error instanceof BetSwirlError) {
      console.error(
        chalk.red(
          `[${error.code}] BetSwirl error occured: ${
            error.message
          } ${JSON.stringify(error.context, bigIntFormatter)}`
        )
      );
    } else {
      console.error(chalk.red("Unknown error occured:", error));
    }
  }
}

async function _selectChain(): Promise<CasinoChain> {
  const selectedChain = await select({
    message: "Select a chain on which to bet",
    loop: false,
    choices: casinoChains.map((c) => ({ name: c.viemChain.name, value: c })),
  });
  const wagmiConfig = getWagmiConfigFromCasinoChain(selectedChain);
  betSwirlClient = initBetSwirlClient(wagmiConfig, {
    chainId: selectedChain.id,
    affiliate: process.env.AFFILIATE_ADDRESS as Hex,
  });
  return selectedChain;
}

async function _selectGame(selectedChain: CasinoChain): Promise<CasinoGame> {
  const casinoGames = await betSwirlClient.getCasinoGames(
    selectedChain.id,
    false
  );
  const selectedGame = await select({
    message: "Select a game",
    loop: false,
    choices: casinoGames.map((g) => ({
      name: g.label,
      value: g,
      disabled:
        g.paused ||
        [CASINO_GAME_TYPE.KENO, CASINO_GAME_TYPE.ROULETTE].includes(g.game),
    })),
  });
  return selectedGame;
}

async function _selectToken(selectedGame: CasinoGame): Promise<CasinoToken> {
  const tokens = await betSwirlClient.getCasinoTokens(
    selectedGame.chainId,
    false
  );
  const selectedToken = await select({
    message: "Select a token",
    loop: false,
    choices: tokens.map((g) => ({
      name: g.symbol,
      value: g,
      disabled: g.paused,
    })),
  });
  return selectedToken;
}

async function _getTokenInfo(
  token: CasinoToken,
  casinoGame: CasinoGame
): Promise<{
  gameToken: CasinoGameToken;
  userTokenBalance: bigint;
  userGasBalance: bigint;
}> {
  const tokenInfo = await betSwirlClient.getCasinoGameToken(
    token,
    casinoGame.game
  );
  const userGasBalanceData = await getBalance(betSwirlClient.wagmiConfig, {
    address: process.env.PUBLIC_ADDRESS as Hex,
    chainId: tokenInfo.chainId,
  });
  let userTokenBalance = 0n;
  if (token.address == zeroAddress) {
    userTokenBalance = userGasBalanceData.value;
  } else {
    userTokenBalance = (
      await getBalance(betSwirlClient.wagmiConfig, {
        address: process.env.PUBLIC_ADDRESS as Hex,
        token: token.address,
        chainId: tokenInfo.chainId,
      })
    ).value;
  }

  console.log(
    chalk.blue(
      `House edge: ${
        tokenInfo.affiliateHouseEdgePercent
      }%\nYour gas balance: ${formatUnits(
        userGasBalanceData.value,
        userGasBalanceData.decimals
      )} ${userGasBalanceData.symbol}\nYour token balance: ${formatUnits(
        userTokenBalance,
        tokenInfo.decimals
      )} ${tokenInfo.symbol}`
    )
  );

  return {
    gameToken: tokenInfo,
    userTokenBalance,
    userGasBalance: userGasBalanceData.value,
  };
}

async function _selectInput(
  gameToken: CasinoGameToken
): Promise<CoinTossChoiceInput | DiceChoiceInput> {
  let input;
  switch (gameToken.game) {
    case CASINO_GAME_TYPE.COINTOSS:
      input = await select({
        message: "Select a face",
        loop: false,
        choices: CoinToss.getChoiceInputs(gameToken.affiliateHouseEdge).map(
          (i) => ({
            name: `${i.label} (x${i.formattedNetMultiplier}) - ${i.winChancePercent}% chance to win`,
            value: i,
          })
        ),
      });
      break;
    default:
      input = await select({
        message: "Select a number",
        loop: false,
        choices: Dice.getChoiceInputs(gameToken.affiliateHouseEdge).map(
          (i) => ({
            name: `${i.label} (x${i.formattedNetMultiplier}) - ${i.winChancePercent}% chance to win`,
            value: i,
          })
        ),
      });
      break;
  }

  return input;
}

async function _getBetRequirements(
  choiceInput: ChoiceInput,
  gameToken: CasinoGameToken
) {
  const betRequirements = await betSwirlClient.getBetRequirements(
    gameToken,
    choiceInput.multiplier,
    choiceInput.game
  );
  return betRequirements;
}

async function _selectBetCount(betRequirements: BetRequirements) {
  const betCount = await input({
    message: `Enter a bet count between 1 and ${betRequirements.maxBetCount}`,
    default: "1",
    validate: (input) => {
      const roundedNumber = Math.round(Number(input));
      if (
        roundedNumber < 1 ||
        Number(betRequirements.maxBetCount) < roundedNumber
      ) {
        return `Bet count must be between 1 and ${betRequirements.maxBetCount}`;
      }
      return true;
    },
    transformer: (input) => {
      return Math.round(Number(input)).toString();
    },
  });
  return Number(betCount);
}

async function showPreviousBets() {
  console.log("Not yet implemented");
}

async function main() {
  try {
    console.log("🎲 Welcome to BetSwirl Node example! 🎲\n");
    await showMenu();
  } catch (error) {
    console.error("An error occured:", error);
    process.exit(1);
  }
}

main();
