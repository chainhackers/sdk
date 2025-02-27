import { readContract, type Config as WagmiConfig } from "@wagmi/core";
import { encodeFunctionData, type Address } from "viem";
import {
  CASINO_GAME_TYPE,
  casinoChainById,
  type CasinoChainId,
} from "../../data/casino";
import { getCasinoChainId } from "../../utils";
import type { Token } from "../../interfaces";
import { ERROR_CODES, TransactionError } from "../../errors";
import { ChainError } from "../../errors";
import { kenoAbi } from "../../abis";

/**
 * Raw token info data returned by the smart contract
 * [0] - biggestNumber: The biggest selectable number
 * [1] - maxNumbersPlayed: Maximum selectable numbers
 * [2] - gainsTable: The gain multipliers (gain multiplier = gains[numbers played][numbers matched]) (BP)
 */
export type RawKenoConfiguration = [
  bigint,
  bigint,
  readonly (readonly bigint[])[]
];

export interface KenoConfiguration {
  token: Token;
  chainId: CasinoChainId;
  biggestSelectableBall: number;
  maxSelectableBalls: number;
  mutliplierTable: number[][]; // BP
}

export async function getKenoConfiguration(
  wagmiConfig: WagmiConfig,
  token: Token,
  chainId?: CasinoChainId
): Promise<KenoConfiguration> {
  const casinoChainId = getCasinoChainId(wagmiConfig, chainId);

  try {
    const { data } = getKenoConfigurationFunctionData(
      token.address,
      casinoChainId
    );
    const rawConfiguration: Readonly<RawKenoConfiguration> = await readContract(
      wagmiConfig,
      {
        abi: data.abi,
        address: data.to,
        chainId: chainId,
        functionName: data.functionName,
        args: data.args,
      }
    );

    return {
      token,
      chainId: casinoChainId,
      biggestSelectableBall: Number(rawConfiguration[0]),
      maxSelectableBalls: Number(rawConfiguration[1]),
      mutliplierTable: rawConfiguration[2].map((row) =>
        row.map((multiplier) => Number(multiplier))
      ),
    };
  } catch (error) {
    throw new TransactionError(
      "Error getting tokens",
      ERROR_CODES.GAME.GET_KENO_CONFIGURATION_ERROR,
      {
        chainId,
        token,
        cause: error,
      }
    );
  }
}

export function getKenoConfigurationFunctionData(
  tokenAddress: Address,
  casinoChainId: CasinoChainId
) {
  const casinoChain = casinoChainById[casinoChainId];

  const gameAddress =
    casinoChain.contracts.games[CASINO_GAME_TYPE.KENO]?.address;
  if (!gameAddress) {
    throw new ChainError(
      `Game ${CASINO_GAME_TYPE.KENO} not found for chain ${casinoChainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME
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
