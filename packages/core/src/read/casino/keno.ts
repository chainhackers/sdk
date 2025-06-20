import { type Address, encodeFunctionData, type Hex, type TransactionReceipt } from "viem";
import { kenoAbi } from "../../abis";
import type { KenoPlacedBet } from "../../actions/casino/keno";
import { CASINO_GAME_TYPE, type CasinoChainId, casinoChainById } from "../../data/casino";
import { Keno, type KenoBall } from "../../entities/casino/keno";
import { ChainError, ERROR_CODES, TransactionError } from "../../errors";
import type { BetSwirlFunctionData, Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import { getCasinoChainId } from "../../utils";
import type { CasinoRolledBet, CasinoWaitRollOptions } from "./game";

export interface KenoRolledBet extends Omit<CasinoRolledBet, "decodedRoll"> {
  rolled: KenoBall[][];
}

export async function waitKenoRolledBet(
  wallet: BetSwirlWallet,
  placedBet: KenoPlacedBet,
  options?: CasinoWaitRollOptions,
): Promise<{
  rolledBet: KenoRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitKenoRolledBet(wallet, placedBet, options);
  return {
    rolledBet: {
      ...rolledBet,
      rolled: rolledBet.encodedRolled.map(Keno.decodeRolled),
    },
    receipt,
  };
}

/**
 * Raw Keno configuration data returned by the smart contract
 * [0] - biggestNumber: The biggest selectable number
 * [1] - maxNumbersPlayed: Maximum selectable numbers
 * [2] - gainsTable: The gain multipliers (gain multiplier = gains[numbers played][numbers matched]) (BP)
 */
export type RawKenoConfiguration = [bigint, bigint, readonly (readonly bigint[])[]];

export function parseRawKenoConfiguration(
  rawConfiguration: RawKenoConfiguration,
  token: Token,
  casinoChainId: CasinoChainId,
): KenoConfiguration {
  return {
    token,
    chainId: casinoChainId,
    biggestSelectableBall: Number(rawConfiguration[0]),
    maxSelectableBalls: Number(rawConfiguration[1]),
    mutliplierTable: [
      [0],
      ...rawConfiguration[2].map((row) => row.map((multiplier) => Number(multiplier))),
    ],
  };
}

export interface KenoConfiguration {
  token: Token;
  chainId: CasinoChainId;
  biggestSelectableBall: number;
  maxSelectableBalls: number;
  mutliplierTable: number[][]; // BP
}

export async function getKenoConfiguration(
  wallet: BetSwirlWallet,
  token: Token,
): Promise<KenoConfiguration> {
  const casinoChainId = getCasinoChainId(wallet);

  try {
    const functionData = getKenoConfigurationFunctionData(token.address, casinoChainId);
    const rawConfiguration = await wallet.readContract<typeof functionData, RawKenoConfiguration>(
      functionData,
    );

    return parseRawKenoConfiguration(rawConfiguration, token, casinoChainId);
  } catch (error) {
    throw new TransactionError(
      "Error getting keno configuration",
      ERROR_CODES.GAME.GET_KENO_CONFIGURATION_ERROR,
      {
        chainId: casinoChainId,
        token,
        cause: error,
      },
    );
  }
}

export function getKenoConfigurationFunctionData(
  tokenAddress: Address,
  casinoChainId: CasinoChainId,
): BetSwirlFunctionData<typeof kenoAbi, "gains", readonly [Hex]> {
  const casinoChain = casinoChainById[casinoChainId];

  const gameAddress = casinoChain.contracts.games[CASINO_GAME_TYPE.KENO]?.address;
  if (!gameAddress) {
    throw new ChainError(
      `Game ${CASINO_GAME_TYPE.KENO} not found for chain ${casinoChainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
    );
  }

  const abi = kenoAbi;
  const functionName = "gains" as const;
  const args = [tokenAddress] as const;
  return {
    data: { to: gameAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}
