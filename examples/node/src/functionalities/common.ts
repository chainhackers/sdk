import {
  type ApproveResult,
  type BetRequirements,
  CASINO_GAME_TYPE,
  type CasinoChain,
  type CasinoChainId,
  type CasinoGame,
  type CasinoGameToken,
  type CasinoPlacedBet,
  type CasinoRolledBet,
  type CasinoToken,
  type ChoiceInput,
  CoinToss,
  type CoinTossChoiceInput,
  Dice,
  type DiceChoiceInput,
  FORMAT_TYPE,
  GAS_PRICE_TYPE,
  Keno,
  type KenoChoiceInput,
  LEADERBOARD_TYPE,
  type NormalCasinoPlacedBet,
  type NormalGameChoiceInput,
  Roulette,
  type RouletteChoiceInput,
  type SignedFreebet,
  type WEIGHTED_CASINO_GAME_TYPE,
  type WeightedCasinoPlacedBet,
  WeightedGame,
  type WeightedGameChoiceInput,
  type WeightedGameConfiguration,
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
import { getWagmiConfigForAllChains, getWagmiConfigFromCasinoChain } from "../../utils";

let wagmiBetSwirlClient: WagmiBetSwirlClient;

/* Common section */

export async function _selectChain(): Promise<CasinoChain> {
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
    // testMode to true to use the staging API.
    api: {
      testMode: true,
    },
  });
  return selectedChain;
}

export async function _selectGame(selectedChain: CasinoChain): Promise<CasinoGame> {
  const casinoGames = await wagmiBetSwirlClient.getCasinoGames(false, selectedChain.id);
  const selectedGame = await select({
    message: "Select a game",
    loop: false,
    choices: casinoGames
      .map((g) => ({
        name: g.label,
        value: g,
        disabled: g.paused,
      }))
      .filter((g) => g.value.game !== CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME),
  });
  return selectedGame;
}

export async function _getTokenInfo(
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

export async function _selectInput(
  gameToken: CasinoGameToken,
): Promise<NormalGameChoiceInput | WeightedGameChoiceInput> {
  let input: NormalGameChoiceInput | WeightedGameChoiceInput;

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
    case CASINO_GAME_TYPE.KENO: {
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
      break;
    }
    // Wheel & Plinko (Weighted game)
    default: {
      input = await select({
        message: "Select a configuration",
        loop: false,
        // You could bring your own configurations here by passing customConfigurations in getChoiceInputs
        choices: WeightedGame.getChoiceInputs(
          gameToken.chainId,
          gameToken.game,
          gameToken.affiliateHouseEdge,
        ).map((i) => ({
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

export async function _getBetRequirements(choiceInput: ChoiceInput, gameToken: CasinoGameToken) {
  const betRequirements = await wagmiBetSwirlClient.getBetRequirements(
    gameToken,
    choiceInput.multiplier,
    choiceInput.game,
  );
  return betRequirements;
}

export async function _waitRoll(placedBet: NormalCasinoPlacedBet) {
  console.log(chalk.blue("⌛ Waiting the bet to be rolled..."));
  const rolledBetData = await wagmiBetSwirlClient.waitRolledBet(placedBet, {
    timeout: 300000, //5min
    pollingInterval: process.env.RPC_URL ? 500 : 2500,
    formatType: FORMAT_TYPE.FULL_PRECISE,
  });

  const rolledBet = rolledBetData.rolledBet;
  _displayRolledBet(rolledBet);
}

export async function _waitWeightedRoll(
  placedBet: WeightedCasinoPlacedBet,
  weightedGameConfig: WeightedGameConfiguration,
  houseEdge: number,
) {
  console.log(chalk.blue("⌛ Waiting the bet to be rolled..."));
  const rolledBetData = await wagmiBetSwirlClient.waitRolledBet(
    placedBet,
    {
      timeout: 300000, //5min
      pollingInterval: process.env.RPC_URL ? 500 : 2500,
      formatType: FORMAT_TYPE.FULL_PRECISE,
    },
    weightedGameConfig,
    houseEdge,
  );

  const rolledBet = rolledBetData.rolledBet;
  _displayRolledBet(rolledBet);
}

function _displayRolledBet(rolledBet: CasinoRolledBet) {
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
  if (rolledBet.isWin) {
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

export async function _refreshLeaderboardsWithBet(betId: string | bigint, chainId: CasinoChainId) {
  console.log(chalk.blue(`Refreshing leaderboards with bet #${betId}...`));
  const isSuccess = await wagmiBetSwirlClient.refreshLeaderboardsWithBets(
    [String(betId)],
    chainId,
    LEADERBOARD_TYPE.CASINO,
  );
  if (isSuccess) {
    console.log(chalk.green(`Leaderboards refreshed with bet #${betId} successfully!`));
  } else {
    console.log(chalk.red(`Failed to refresh leaderboards with bet #${betId}`));
  }
}

/* Bet section */
export async function _selectToken(selectedGame: CasinoGame): Promise<CasinoToken> {
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

export async function _selectBetCount(betRequirements: BetRequirements) {
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

export async function _selectBetAmount(
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

export async function _placeBet(
  casinoGameToken: CasinoGameToken,
  inputChoice: NormalGameChoiceInput | WeightedGameChoiceInput,
  betCount: number,
  betAmount: bigint,
): Promise<CasinoPlacedBet> {
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
    placedBet: CasinoPlacedBet;
    weightedGameConfig?: WeightedGameConfiguration;
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
  } else if (inputChoice.game === CASINO_GAME_TYPE.KENO) {
    const kenoChoice = inputChoice as KenoChoiceInput;
    placedBetData = await wagmiBetSwirlClient.playKeno(
      { ...commonParams, balls: kenoChoice.value, kenoConfig: kenoChoice.config },
      undefined,
      callbacks,
      casinoGameToken.chainId,
    );
  }
  // Wheel & Plinko (Weighted game)
  else {
    const weightedGameChoice = inputChoice as WeightedGameChoiceInput;
    placedBetData = await wagmiBetSwirlClient.playWeightedGame(
      {
        ...commonParams,
        weightedGameConfig: weightedGameChoice.config,
        game: weightedGameChoice.game as WEIGHTED_CASINO_GAME_TYPE,
      },
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

/* Freebet section */

export async function _selectFreebet(): Promise<SignedFreebet | null> {
  // Init Wagmi client
  const wagmiConfig = getWagmiConfigForAllChains();
  wagmiBetSwirlClient = initWagmiBetSwirlClient(wagmiConfig, {
    affiliate: process.env.AFFILIATE_ADDRESS as Hex,
    gasPriceType: GAS_PRICE_TYPE.FAST,
    // testMode to true to use the staging API.
    api: {
      testMode: true,
    },
  });

  // Fetch available freebets for the connected wallet
  const freebets = await wagmiBetSwirlClient.fetchFreebets(
    wagmiBetSwirlClient.betSwirlWallet.getAccount()!.address,
    process.env.AFFILIATE_ADDRESS ? [process.env.AFFILIATE_ADDRESS as Hex] : undefined,
    true,
  );
  if (freebets.length === 0) {
    return null;
  }
  const freebetIndex = await select({
    message: "Select a freebet",
    loop: false,
    choices: freebets.map((f, index) => ({
      name: `Freebet #${f.id} - ${f.campaign.label} - ${chainById[f.chainId].name} - ${f.formattedAmount} ${f.token.symbol}`,
      value: index,
    })),
  });
  return freebets[freebetIndex]!;
}

export const _fetchCasinoTokens = async (onlyActive: boolean, chainId: CasinoChainId) => {
  const tokens = await wagmiBetSwirlClient.getCasinoTokens(onlyActive, chainId);
  return tokens;
};

export async function _checkFreebetAndBalances(
  freebet: SignedFreebet,
  betRequirements: BetRequirements,
  casinoGameToken: CasinoGameToken,
  userTokenBalance: bigint,
  userGasBalance: bigint,
) {
  const chainlinkVrfCostEstimation = await wagmiBetSwirlClient.getChainlinkVrfCost(
    casinoGameToken.game,
    casinoGameToken.address,
    1, // We hardcode 1 here because a freebet is always 1 bet (multi betting not allowed)
    undefined, // We let the SDK manage the gas price itself
    undefined, // We already define the gas price type in the client options
    casinoGameToken.chainId,
  );
  const userAddress = wagmiBetSwirlClient.betSwirlWallet.getAccount()!.address;
  const chain = chainById[casinoGameToken.chainId];
  const gasDecimals = chain.nativeCurrency.decimals;
  const gasSymbol = chain.nativeCurrency.symbol;

  // Check if the freebet amount does not exceed the game max bet amount
  if (freebet.amount > betRequirements.maxBetAmount) {
    throw Error(
      `The freebet amount (${freebet.formattedAmount} ${casinoGameToken.symbol}) exceeds the game max bet amount (${betRequirements.maxBetAmount} ${casinoGameToken.symbol}). Please select another freebet.`,
    );
  }

  // TODO Add simulate gas fee (function does not yet exist in sdk)
  const gasBalanceRemainingAfterFees = userGasBalance - chainlinkVrfCostEstimation;
  // User needs to have at least 1 gwei for each betCount after substracting gas fees. For production apps, it's better to keep a buffer because VRF and gas fee can change.
  if (gasBalanceRemainingAfterFees < 1n) {
    throw Error(
      `You don't have enough gas to pay VRF and gas fees, please send at least ${formatRawAmount(
        BigInt(1n) - gasBalanceRemainingAfterFees,
        gasDecimals,
        FORMAT_TYPE.FULL_PRECISE,
      )} ${gasSymbol} to ${userAddress} to cover fees (we suggest to send more to cover the txn gas fee)`,
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
      )} ${gasSymbol}`,
    ),
  );
}

export async function _placeFreebet(
  freebet: SignedFreebet,
  casinoGameToken: CasinoGameToken,
  inputChoice: NormalGameChoiceInput | WeightedGameChoiceInput,
): Promise<CasinoPlacedBet> {
  const commonParams = {
    freebet,
  };
  const callbacks = {
    onBetPlacedPending: (_tx: Hash) => {
      console.log(chalk.blue("⌛ Waiting the freebet to be placed..."));
    },
  };
  let placedBetData: {
    receipt: TransactionReceipt;
    placedFreebet: CasinoPlacedBet;
    weightedGameConfig?: WeightedGameConfiguration;
  };
  if (inputChoice.game === CASINO_GAME_TYPE.DICE) {
    const diceCap = (inputChoice as DiceChoiceInput).value;
    placedBetData = await wagmiBetSwirlClient.playFreebetDice(
      { ...commonParams, cap: diceCap },
      undefined,
      callbacks,
    );
  } else if (inputChoice.game === CASINO_GAME_TYPE.COINTOSS) {
    const coinTossFace = (inputChoice as CoinTossChoiceInput).value;
    placedBetData = await wagmiBetSwirlClient.playFreebetCoinToss(
      { ...commonParams, face: coinTossFace },
      undefined,
      callbacks,
    );
  } else if (inputChoice.game === CASINO_GAME_TYPE.ROULETTE) {
    const rouletteNumbers = (inputChoice as RouletteChoiceInput).value;
    placedBetData = await wagmiBetSwirlClient.playFreebetRoulette(
      { ...commonParams, numbers: rouletteNumbers },
      undefined,
      callbacks,
    );
  } else if (inputChoice.game === CASINO_GAME_TYPE.KENO) {
    const kenoChoice = inputChoice as KenoChoiceInput;
    placedBetData = await wagmiBetSwirlClient.playFreebetKeno(
      { ...commonParams, balls: kenoChoice.value, kenoConfig: kenoChoice.config },
      undefined,
      callbacks,
    );
  }
  // Wheel & Plinko (Weighted game)
  else {
    const weightedGameChoice = inputChoice as WeightedGameChoiceInput;
    placedBetData = await wagmiBetSwirlClient.playFreebetWeightedGame(
      {
        ...commonParams,
        weightedGameConfig: weightedGameChoice.config,
        game: weightedGameChoice.game as WEIGHTED_CASINO_GAME_TYPE,
      },
      undefined,
      callbacks,
    );
  }
  console.log(
    chalk.green(
      `✅ Your ${
        labelCasinoGameByType[casinoGameToken.game]
      } freeebet has been placed successfully!\n Place bet txn: ${formatTxnUrl(
        placedBetData.receipt.transactionHash,
        casinoGameToken.chainId,
      )}`,
    ),
  );
  return placedBetData.placedFreebet;
}
