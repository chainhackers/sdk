import { type Config as WagmiConfig, call } from "@wagmi/core";
import { abi as gameAbi } from "../abis/v2/casino/game.ts";

import { encodeFunctionData, type Hex } from "viem";
import { TransactionError } from "../errors/types.ts";
import { ERROR_CODES } from "../errors/codes.ts";

export async function getChainlinkVrfCost(
  wagmiConfig: WagmiConfig,
  gameAddress: Hex,
  tokenAddress: Hex,
  betCount: number,
  chainId?: number,
  gasPrice?: bigint
): Promise<bigint> {
  try {
    const { data: vrfCost } = await call(wagmiConfig, {
      to: gameAddress,
      data: generateGetChainlinkVrfCostFunctionData(tokenAddress, betCount),
      chainId,
      gasPrice,
    });

    if (!vrfCost) {
      console.warn(
        `[getChainlinkVrfCost] vrfCost is 0 for tokenAddress: ${tokenAddress}, betCount: ${betCount}, gameAddress: ${gameAddress}, chainId: ${chainId}`
      );
      return 0n;
    }
    return BigInt(vrfCost || 0n);
  } catch (error) {
    throw new TransactionError(
      `An error occured while getting the chainlink vrf cost: ${error}`,
      {
        errorCode: ERROR_CODES.READ.CHAINLINK_VRF_COST_ERROR,
        gameAddress,
        tokenAddress,
        betCount,
        chainId,
        gasPrice,
      }
    );
  }
}

export function generateGetChainlinkVrfCostFunctionData(
  tokenAddress: Hex,
  betCount: number
) {
  return encodeFunctionData({
    abi: gameAbi,
    functionName: "getChainlinkVRFCost",
    args: [tokenAddress, betCount],
  });
}
