import {
  type ApproveResult,
  type BetRequirements,
  BetSwirlError,
  CASINO_GAME_TYPE,
  type CasinoChain,
  type CasinoGame,
  type CasinoGameToken,
  type CasinoPlacedBet,
  type CasinoToken,
  type ChoiceInput,
  CoinToss,
  type CoinTossChoiceInput,
  type CoinTossPlacedBet,
  Dice,
  type DiceChoiceInput,
  type DicePlacedBet,
  FORMAT_TYPE,
  GAS_PRICE_TYPE,
  Keno,
  type KenoChoiceInput,
  type KenoPlacedBet,
  Roulette,
  type RouletteChoiceInput,
  type RoulettePlacedBet,
  bigIntFormatter,
  casinoChains,
  chainById,
  formatRawAmount,
  formatTxnUrl,
  getBetSwirlBetUrl,
  labelCasinoGameByType,
} from "@betswirl/sdk-core";
import { WagmiBetSwirlClient, initWagmiBetSwirlClient } from "@betswirl/wagmi-provider";
import { checkbox, input, select } from "@inquirer/prompts";
import { getBalance } from "@wagmi/core";
import chalk from "chalk";
import { type Hash, type Hex, type TransactionReceipt, parseUnits, zeroAddress } from "viem";
import { checkEnvVariables, getWagmiConfigFromCasinoChain } from "../../utils";
let wagmiBetSwirlClient: WagmiBetSwirlClient;

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
    await _waitRoll(placedBet);
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

async function _selectChain(): Promise<CasinoChain> {
  const selectedChain = await select({
    message: "Select a chain on which to bet",
    loop: false,
    choices: casinoChains.map((c) => ({ name: c.viemChain.name, value: c })),
  });
  const wagmiConfig = getWagmiConfigFromCasinoChain(selectedChain);
  wagmiBetSwirlClient = initWagmiBetSwirlClient(wagmiConfig, {
    chainId: selectedChain.id,
    affiliate: process.env.AFFILIATE_ADDRESS as Hex,
    gasPriceType: GAS_PRICE_TYPE.FAST,
  });
  return selectedChain;
}

async function _selectGame(selectedChain: CasinoChain): Promise<CasinoGame> {
  const casinoGames = await wagmiBetSwirlClient.getCasinoGames(false, selectedChain.id);
  const selectedGame = await select({
    message: "Select a game",
    loop: false,
    choices: casinoGames.map((g) => ({
      name: g.label,
      value: g,
      disabled: g.paused,
    })),
  });
  return selectedGame;
}

async function _selectToken(selectedGame: CasinoGame): Promise<CasinoToken> {
  const tokens = await wagmiBetSwirlClient.getCasinoTokens(false, selectedGame.chainId);
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
  casinoGame: CasinoGame,
): Promise<{
  gameToken: CasinoGameToken;
  userTokenBalance: bigint;
  userGasBalance: bigint;
}> {
  const userAddress = wagmiBetSwirlClient.betSwirlWallet.getAccount()!.address;
  const tokenInfo = await wagmiBetSwirlClient.getCasinoGameToken(token, casinoGame.game);
  const userGasBalanceData = await getBalance(wagmiBetSwirlClient.wagmiConfig, {
    address: userAddress,
    chainId: tokenInfo.chainId,
  });
  let userTokenBalance = 0n;
  if (token.address === zeroAddress) {
    userTokenBalance = userGasBalanceData.value;
  } else {
    userTokenBalance = (
      await getBalance(wagmiBetSwirlClient.wagmiConfig, {
        address: userAddress,
        token: token.address,
        chainId: tokenInfo.chainId,
      })
    ).value;
  }

  console.log(
    chalk.blue(
      `House edge: ${tokenInfo.affiliateHouseEdgePercent}%\nYour gas balance: ${formatRawAmount(
        userGasBalanceData.value,
        userGasBalanceData.decimals,
        FORMAT_TYPE.PRECISE,
      )} ${userGasBalanceData.symbol}\nYour token balance: ${formatRawAmount(
        userTokenBalance,
        tokenInfo.decimals,
        FORMAT_TYPE.PRECISE,
      )} ${tokenInfo.symbol}`,
    ),
  );

  return {
    gameToken: tokenInfo,
    userTokenBalance,
    userGasBalance: userGasBalanceData.value,
  };
}

async function _selectInput(
  gameToken: CasinoGameToken,
): Promise<CoinTossChoiceInput | DiceChoiceInput | RouletteChoiceInput | KenoChoiceInput> {
  let input: CoinTossChoiceInput | DiceChoiceInput | RouletteChoiceInput | KenoChoiceInput;

  /*const wheelConfig = await wagmiBetSwirlClient.getWeighedGameConfiguration(0, gameToken.chainId);
  console.log("test wheel config", wheelConfig); */
  switch (gameToken.game) {
    case CASINO_GAME_TYPE.DICE:
      input = await select({
        message: "Select a number",
        loop: false,
        choices: Dice.getChoiceInputs(gameToken.affiliateHouseEdge).map((i) => ({
          name: `${i.label} (x${i.formattedNetMultiplier}) - ${i.winChancePercent}% chance to win`,
          value: i,
        })),
      });
      break;
    case CASINO_GAME_TYPE.COINTOSS:
      input = await select({
        message: "Select a face",
        loop: false,
        choices: CoinToss.getChoiceInputs(gameToken.affiliateHouseEdge).map((i) => ({
          name: `${i.label} (x${i.formattedNetMultiplier}) - ${i.winChancePercent}% chance to win`,
          value: i,
        })),
      });
      break;
    case CASINO_GAME_TYPE.ROULETTE: {
      const inputChoices = await checkbox({
        message: "Select a number or a bundle of numbers (space bar to select)",
        loop: false,
        required: true,
        choices: Roulette.getChoiceInputs(gameToken.affiliateHouseEdge).map((i) => ({
          name: `${i.label} (x${i.formattedNetMultiplier}) - ${i.winChancePercent}% chance to win`,
          value: i,
        })),
      });
      // Combine all the choices into one
      input = Roulette.combineChoiceInputs(inputChoices, gameToken.affiliateHouseEdge);
      if (inputChoices.length > 1) {
        console.log(
          chalk.blue(
            `Selected numbers: ${input.label}\nMultiplier: ${input.formattedNetMultiplier}x\nChance to win: ${input.winChancePercent}%`,
          ),
        );
      }
      break;
    }
    // Keno
    default: {
      // Get Keno config for the selected token
      const kenoConfig = await wagmiBetSwirlClient.getKenoConfiguration(
        gameToken,
        gameToken.chainId,
      );
      input = await select({
        message: "Select some balls",
        loop: false,
        choices: Keno.getChoiceInputs(kenoConfig, gameToken.affiliateHouseEdge).map((i) => ({
          name: `${i.label} (${i.winChancePercent
            .map(
              (chance, index) =>
                `${i.formattedNetMultiplier?.[index]}x - ${chance.toFixed(2)}% to win ${index !== i.winChancePercent.length - 1 ? "|" : ""}`,
            )
            .join("\n")})`,
          value: i,
        })),
      });
    }
  }
  return input;
}

async function _getBetRequirements(choiceInput: ChoiceInput, gameToken: CasinoGameToken) {
  const betRequirements = await wagmiBetSwirlClient.getBetRequirements(
    gameToken,
    choiceInput.multiplier,
    choiceInput.game,
  );
  return betRequirements;
}

async function _selectBetCount(betRequirements: BetRequirements) {
  const betCount = await input({
    message: `Enter a bet count between 1 and ${betRequirements.maxBetCount}`,
    default: "1",
    validate: (input) => {
      const roundedNumber = Math.round(Number(input));
      if (roundedNumber < 1 || Number(betRequirements.maxBetCount) < roundedNumber) {
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

async function _selectBetAmount(
  betRequirements: BetRequirements,
  casinoGameToken: CasinoGameToken,
  betCount: number,
  userTokenBalance: bigint,
  userGasBalance: bigint,
) {
  const chainlinkVrfCostEstimation = await wagmiBetSwirlClient.getChainlinkVrfCost(
    casinoGameToken.game,
    casinoGameToken.address,
    betCount,
    undefined, // We let the SDK manage the gas price itself
    undefined, // We already define the gas price type in the client options
    casinoGameToken.chainId,
  );
  const userAddress = wagmiBetSwirlClient.betSwirlWallet.getAccount()!.address;
  const chain = chainById[casinoGameToken.chainId];
  const gasDecimals = chain.nativeCurrency.decimals;
  const gasSymbol = chain.nativeCurrency.symbol;
  // TODO Add simulate gas fee (function does not yet exist in sdk)
  const gasBalanceRemainingAfterFees = userGasBalance - chainlinkVrfCostEstimation;
  // User needs to have at least 1 gwei for each betCount after substracting gas fees. For production apps, it's better to keep a buffer because VRF and gas fee can change.
  if (gasBalanceRemainingAfterFees < BigInt(betCount)) {
    throw Error(
      `You don't have enough gas to pay VRF and gas fees, please send at least ${formatRawAmount(
        BigInt(betCount) - gasBalanceRemainingAfterFees,
        gasDecimals,
        FORMAT_TYPE.FULL_PRECISE,
      )} ${gasSymbol} to ${userAddress}`,
    );
  }
  // If token is gas balance, substract the fees
  const availableTokenBalance =
    casinoGameToken.address === zeroAddress ? gasBalanceRemainingAfterFees : userTokenBalance;
  // Take into consideration the max bet amount for the balance user but also max bet amount of the bet
  const maxAmountPerBetFormatted = Math.min(
    Number(
      formatRawAmount(
        availableTokenBalance / BigInt(betCount),
        casinoGameToken.decimals,
        FORMAT_TYPE.FULL_PRECISE,
      ),
    ),
    Number(
      formatRawAmount(
        betRequirements.maxBetAmount,
        casinoGameToken.decimals,
        FORMAT_TYPE.FULL_PRECISE,
      ),
    ),
  );
  // User needs to have at least 1 gwei of token for each betCount.
  if (maxAmountPerBetFormatted <= 0) {
    throw Error(
      `You don't have enough token to place the bet, please send at least ${formatRawAmount(
        BigInt(betCount) - availableTokenBalance,
        casinoGameToken.decimals,
        FORMAT_TYPE.FULL_PRECISE,
      )} ${casinoGameToken.symbol} to ${userAddress}`,
    );
  }
  console.log(
    chalk.blue(
      `VRF cost estimation: ${formatRawAmount(
        chainlinkVrfCostEstimation,
        gasDecimals,
        FORMAT_TYPE.PRECISE,
      )} ${gasSymbol} \nYour token balance: ${formatRawAmount(
        userTokenBalance,
        casinoGameToken.decimals,
        FORMAT_TYPE.PRECISE,
      )} ${casinoGameToken.symbol}\nYour gas balance: ${formatRawAmount(
        userGasBalance,
        gasDecimals,
        FORMAT_TYPE.PRECISE,
      )} ${gasSymbol}\nBet count: ${betCount}`,
    ),
  );
  const betAmountFormatted = await input({
    message: `Enter a bet amount up to ${maxAmountPerBetFormatted} ${casinoGameToken.symbol}`,
    validate: (_input) => {
      const input = Number(_input);
      if (input <= 0 || input > maxAmountPerBetFormatted) {
        return "Not valid amount";
      }
      return true;
    },
  });
  return parseUnits(betAmountFormatted, casinoGameToken.decimals);
}

async function _placeBet(
  casinoGameToken: CasinoGameToken,
  inputChoice: DiceChoiceInput | CoinTossChoiceInput | RouletteChoiceInput | KenoChoiceInput,
  betCount: number,
  betAmount: bigint,
): Promise<CoinTossPlacedBet | DicePlacedBet | RoulettePlacedBet | KenoPlacedBet> {
  const commonParams = {
    betCount,
    betAmount,
    token: casinoGameToken,
  };
  const callbacks = {
    onApprovePending: (_tx: Hash, _result: ApproveResult) => {
      console.log(chalk.blue(`⌛ ${casinoGameToken.symbol} is approving...`));
    },
    onApproved: (receipt: TransactionReceipt, _result: ApproveResult) => {
      console.log(
        chalk.green(
          `✅ ${casinoGameToken.symbol} has been approved successfully!\nApproval txn: ${formatTxnUrl(
            receipt.transactionHash,
            casinoGameToken.chainId,
          )}`,
        ),
      );
    },
    onBetPlacedPending: (_tx: Hash) => {
      console.log(chalk.blue("⌛ Waiting the bet to be placed..."));
    },
  };
  let placedBetData: {
    receipt: TransactionReceipt;
    placedBet: CoinTossPlacedBet | DicePlacedBet | RoulettePlacedBet | KenoPlacedBet;
  };
  if (inputChoice.game === CASINO_GAME_TYPE.DICE) {
    const diceCap = (inputChoice as DiceChoiceInput).value;
    placedBetData = await wagmiBetSwirlClient.playDice(
      { ...commonParams, cap: diceCap },
      undefined,
      callbacks,
      casinoGameToken.chainId,
    );
  } else if (inputChoice.game === CASINO_GAME_TYPE.COINTOSS) {
    const coinTossFace = (inputChoice as CoinTossChoiceInput).value;
    placedBetData = await wagmiBetSwirlClient.playCoinToss(
      { ...commonParams, face: coinTossFace },
      undefined,
      callbacks,
      casinoGameToken.chainId,
    );
  } else if (inputChoice.game === CASINO_GAME_TYPE.ROULETTE) {
    const rouletteNumbers = (inputChoice as RouletteChoiceInput).value;
    placedBetData = await wagmiBetSwirlClient.playRoulette(
      { ...commonParams, numbers: rouletteNumbers },
      undefined,
      callbacks,
      casinoGameToken.chainId,
    );
  } else {
    const kenoChoice = inputChoice as KenoChoiceInput;
    placedBetData = await wagmiBetSwirlClient.playKeno(
      { ...commonParams, balls: kenoChoice.value, kenoConfig: kenoChoice.config },
      undefined,
      callbacks,
      casinoGameToken.chainId,
    );
  }
  console.log(
    chalk.green(
      `✅ Your ${
        labelCasinoGameByType[casinoGameToken.game]
      } bet has been placed successfully!\n Place bet txn: ${formatTxnUrl(
        placedBetData.receipt.transactionHash,
        casinoGameToken.chainId,
      )}`,
    ),
  );
  return placedBetData.placedBet;
}

async function _waitRoll(placedBet: CasinoPlacedBet) {
  console.log(chalk.blue("⌛ Waiting the bet to be rolled..."));
  const rolledBetData = await wagmiBetSwirlClient.waitRolledBet(placedBet, {
    timeout: 300000, //5min
    pollingInterval: process.env.RPC_URL ? 500 : 2500,
    formatType: FORMAT_TYPE.FULL_PRECISE,
  });

  const rolledBet = rolledBetData.rolledBet;
  const chain = chainById[rolledBet.chainId];
  const commonMessage = chalk.blue(
    `Payout: ${rolledBet.formattedPayout} ${
      rolledBet.token.symbol
    }\nTotal bet amount: ${rolledBet.formattedRollTotalBetAmount} ${rolledBet.token.symbol}\nBet count: ${rolledBet.rollBetCount}\nCharged VRF cost: ${formatRawAmount(
      rolledBet.chargedVRFCost,
      chain.nativeCurrency.decimals,
      FORMAT_TYPE.PRECISE,
    )} ${chain.nativeCurrency.symbol}\nRolled: ${JSON.stringify(
      rolledBet.decodedRolled,
    )}\nRoll txn: ${formatTxnUrl(rolledBet.rollTxnHash, rolledBet.chainId)}\nBetSwirl url: ${getBetSwirlBetUrl(rolledBet.id, rolledBet.game, rolledBet.chainId)}`,
  );
  // Win
  if (rolledBetData.rolledBet.isWin) {
    console.log(
      chalk.green(
        `🥳 Congrats you won ${rolledBet.formattedBenefit} ${rolledBet.token.symbol} (x${rolledBet.formattedPayoutMultiplier})\n`,
        commonMessage,
      ),
    );
  }
  // Loss
  else {
    console.log(
      chalk.red(
        `😔 Arf, you lost ${rolledBet.formattedBenefit} ${rolledBet.token.symbol} (x${rolledBet.formattedPayoutMultiplier})\n`,
        commonMessage,
      ),
    );
  }
}
