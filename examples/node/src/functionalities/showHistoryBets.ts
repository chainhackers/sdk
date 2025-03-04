import {
  Bet_OrderBy,
  BetSwirlError,
  bigIntFormatter,
  casinoChains,
  formatTxnUrl,
  labelCasinoGameByType,
  OrderDirection,
  type CasinoBet,
  type CasinoChain,
} from "@betswirl/sdk-core";
import {
  BetSwirlWagmiClient,
  initBetSwirlWagmiClient
} from "@betswirl/wagmi-provider";
import {
  checkEnvVariables,
  getWagmiConfigFromCasinoChain,
} from "../../utils";
import chalk from "chalk";
import { select } from "@inquirer/prompts";
import type { Hex } from "viem/_types/types/misc";
import { InMemoryCache } from "@apollo/client/core/index.js";

let betSwirlWagmiClient: BetSwirlWagmiClient;

export async function startShowHistoryBetsProcess() {
  try {
    // 0. Check if env variables are set
    checkEnvVariables();
    // 1. Select chain
    const selectedChain = await _selectChain();

    // 2. Fetch the last 10 bets placed by the connected user
    const bets = await _getLastBets(10, selectedChain);

    // 3. Show the bets

    await _showBets(bets);
  } catch (error) {
    if (error instanceof BetSwirlError) {
      console.error(
        chalk.red(
          `[${error.code}] BetSwirl error occured while showing bets history: ${error.message
          } ${JSON.stringify(error.context, bigIntFormatter)}`
        )
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
  betSwirlWagmiClient = initBetSwirlWagmiClient(wagmiConfig, {
    chainId: selectedChain.id,
    affiliate: process.env.AFFILIATE_ADDRESS as Hex,
    subgraphClient: {
      graphqlKey: process.env.GRAPHQL_KEY as string,
      cache: new InMemoryCache(),
    },
  });
  return selectedChain;
}

async function _getLastBets(
  count: number,
  casinoChain: CasinoChain
): Promise<CasinoBet[]> {
  const { bets, error } = await betSwirlWagmiClient.fetchBets(
    casinoChain.id,
    {
      bettor: betSwirlWagmiClient.betSwirlWallet.getAccount()!.address,
    },
    1,
    count,
    { key: Bet_OrderBy.BetTimestamp, order: OrderDirection.Desc }
  );

  if (error) throw error;
  return bets;
}

function _showBets(bets: CasinoBet[]) {
  // User has placed bets
  if (bets.length) {
    console.log(`==== Your last ${bets.length} bets ====\n`);
    for (const bet of bets) {
      _showBet(bet);
    }
  }
  // User has never placed any bets
  else {
    console.log(
      chalk.yellow("You have never placed any bets with this account")
    );
  }
}

function _showBet(bet: CasinoBet) {
  // Id
  console.log(chalk.bold(`=== ID ${bet.id.toString()} ===`));
  // Common place bet info
  // TODO replace "Input" and "Rolled" by the game input/output labels
  const placeBetInfo = `Game: ${labelCasinoGameByType[bet.game]}\nInput: ${bet.decodedInput
    }\nBet amount: ${bet.formattedBetAmount} ${bet.token.symbol}\nBet count: ${bet.betCount
    }\n${bet.betCount > 1
      ? `Total bet amount ${bet.formattedTotalBetAmount} ${bet.token.symbol}\n`
      : ""
    }Bet date: ${bet.betDate.toLocaleString()}\nBet txn: ${formatTxnUrl(
      bet.betTxnHash,
      bet.chainId
    )}\n`;
  // Pending state
  if (!bet.isResolved) {
    console.log("Status:", chalk.yellow(`Pending`));
    console.log(placeBetInfo);
  } else {
    // Refunded state
    if (bet.isRefunded) {
      console.log("Status:", chalk.gray(`Refunded`));
      console.log(placeBetInfo);
    } else {
      const benefitInfo = `${bet.formattedBenefit} ${bet.token.symbol}`;
      const rollBetInfo = `Payout: ${bet.formattedPayout} ${bet.token.symbol
        }\nMultiplier: ${bet.payoutMultiplier}x\nResult: ${bet.isWin ? chalk.green("+" + benefitInfo) : chalk.red(benefitInfo)
        }\nRolled: ${bet.decodedRolled
        }\nRoll date: ${bet.rollDate?.toLocaleString()}\nRoll txn: ${formatTxnUrl(
          bet.rollTxnHash!,
          bet.chainId
        )}\n${bet.isStopGainTriggered || bet.isStopLossTriggered
          ? chalk.yellow(
            `\n=> Only ${bet.rollBetCount}/${bet.betCount
            } have been rolled because stop ${bet.isStopGainTriggered ? "gain" : "loss"
            } has been triggered`
          )
          : ""
        }`;
      // Won state
      if (bet.isWin) {
        console.log("Status:", chalk.green(`Won`));
        console.log(placeBetInfo);
        console.log(rollBetInfo);
      }
      // Lost state
      else {
        console.log("Status:", chalk.red(`Lost`));
        console.log(placeBetInfo);
        console.log(rollBetInfo);
      }
    }
  }
}
