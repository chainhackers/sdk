import { type Address, encodeFunctionData } from "viem";
import { leaderboardAbi } from "../../abis/v2/leaderboard/leaderboard";
import { type CasinoChainId, type ChainId, casinoChainById } from "../../data";
import { ERROR_CODES } from "../../errors";
import { ChainError, TransactionError } from "../../errors/types";
import type { BetSwirlFunctionData } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import { getCasinoChainId } from "../../utils";

export type RawClaimableAmount = bigint;

export async function getClaimableAmount(
  wallet: BetSwirlWallet,
  leaderboardOnChainId: number | bigint,
  playerAddress: Address,
  chainId: ChainId,
): Promise<bigint> {
  const casinoChainId = getCasinoChainId(wallet, chainId);

  try {
    const functionData = getClaimableAmountFunctionData(
      playerAddress,
      leaderboardOnChainId,
      casinoChainId,
    );
    const rawClaimableAmount = await wallet.readContract<typeof functionData, RawClaimableAmount>(
      functionData,
    );

    return rawClaimableAmount;
  } catch (error) {
    throw new TransactionError(
      "Error getting claimable amount",
      ERROR_CODES.LEADERBOARD.GET_CLAIMABLE_AMOUNT_ERROR,
      {
        chainId: casinoChainId,
        cause: error,
      },
    );
  }
}

export function getClaimableAmountFunctionData(
  playerAddress: Address,
  leaderboardOnChainId: number | bigint,
  casinoChainId: CasinoChainId,
): BetSwirlFunctionData<typeof leaderboardAbi, "claimable", readonly [bigint, Address]> {
  const casinoChain = casinoChainById[casinoChainId];
  const leaderboardAddress = casinoChain.contracts.leaderboard;
  if (!leaderboardAddress) {
    throw new ChainError(
      `Chain ID ${casinoChainId} is not compatible with leaderboard`,
      ERROR_CODES.LEADERBOARD.UNSUPPORTED_CHAIN,
      {
        chainId: casinoChainId,
      },
    );
  }

  const abi = leaderboardAbi;
  const functionName = "claimable" as const;
  const args = [BigInt(leaderboardOnChainId), playerAddress] as const;
  return {
    data: { to: leaderboardAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}
