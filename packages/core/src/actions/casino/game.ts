import { encodeFunctionData, zeroAddress, type Hex } from "viem";
import {
  CASINO_GAME_TYPE,
  casinoChainById,
  casinoChainByKey,
  MAX_SDK_HOUSE_EGDE,
  type CasinoChainId,
} from "../../data/casino.ts";
import {
  type Config as WagmiConfig,
  writeContract,
  simulateContract,
} from "@wagmi/core";

export interface CasinoGameInputs {
  betAmount: bigint;
  betCount?: number;
  tokenAddress?: Hex;
  stopGain?: bigint;
  stopLoss?: bigint;
  vrfFees?: bigint;
  receiver?: Hex;
  affiliate?: Hex;
}

export const defaultCasinoGameInputs = {
  betCount: 1,
  tokenAddress: zeroAddress,
  stopGain: 0n,
  stopLoss: 0n,
  vrfFees: 0n, // When 0, VRF fees are calculated on the fly
};

export interface CasinoOptions {
  gasPriceType?: string; // TODO replace by enum
  gasPrice?: bigint;
  chainId?: CasinoChainId;
}

export const defaultCasinoOptions = {
  gasPriceType: "todo",
  gasPrice: 0n,
  chainId: casinoChainByKey.avalanche.id,
};

export interface GenericGameInputs extends CasinoGameInputs {
  game: CASINO_GAME_TYPE;
  encodedInputs: any[]; // CasinoGameInputs excluded
}

export async function playGame(
  gameInputs: GenericGameInputs,
  wagmiConfig: WagmiConfig,
  betSwirlOptions?: CasinoOptions
) {
  const chainId = betSwirlOptions?.chainId || defaultCasinoOptions.chainId;
  const casinoChain = casinoChainById[chainId];
  const game = casinoChain.contracts.games[gameInputs.game];

  if (!game) {
    throw Error(
      `${gameInputs.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`
    );
  }
  const accountAddress =
    gameInputs.receiver || wagmiConfig.getClient({ chainId }).account?.address;
  if (!accountAddress) {
    throw Error(
      `No configured account in wagmi config for chain ${casinoChain.viemChain.name} (${chainId})`
    );
  }
  try {
    // TODO approve

    // TODO get VRF fees
    const vrfFees = 1n;
    // Simulate tx
    const receiver = gameInputs.receiver || accountAddress;
    const functionData = generatePlayGameFunctionData(
      { ...gameInputs, receiver },
      chainId
    );
    const { request } = await simulateContract(wagmiConfig, {
      address: game.address,
      value: vrfFees,
      args: functionData.data.args,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      chainId: chainId,
    });

    // Execute tx
    const hash = await writeContract(wagmiConfig, request);
    return hash;
  } catch (error) {
    console.error("An error occured while placing the bet:", error);
    throw error;
  }
}

export function generatePlayGameFunctionData(
  gameInputs: Omit<GenericGameInputs, "receiver" | "vrfFees"> & {
    receiver: Hex;
  },
  chainId: CasinoChainId = defaultCasinoOptions.chainId
) {
  const casinoChain = casinoChainById[chainId];
  const game = casinoChain.contracts.games[gameInputs.game];

  if (!game) {
    throw Error(
      `${gameInputs.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`
    );
  }

  const affiliate = gameInputs.affiliate || casinoChain.defaultAffiliate;
  const tokenAddress =
    gameInputs.tokenAddress || defaultCasinoGameInputs.tokenAddress;
  const betCount = gameInputs.betCount || defaultCasinoGameInputs.betCount;
  const stopGain = gameInputs.stopGain || defaultCasinoGameInputs.stopGain;
  const stopLoss = gameInputs.stopLoss || defaultCasinoGameInputs.stopLoss;

  const data = {
    abi: game.abi,
    functionName: "wager",
    args: [
      ...gameInputs.encodedInputs,
      gameInputs.receiver,
      affiliate,
      {
        token: tokenAddress,
        betAmount: gameInputs.betAmount,
        betCount,
        stopGain,
        stopLoss,
        maxHouseEdge: MAX_SDK_HOUSE_EGDE,
      },
    ],
  };

  return { data, encodedData: encodeFunctionData(data) };
}
