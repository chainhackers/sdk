import type { Address, Hash } from "viem";
import { encodeFunctionData } from "viem";
import { leaderboardAbi } from "../../abis/v2/leaderboard/leaderboard";
import {
  type CasinoChainId,
  LEADERBOARD_TYPE,
  type Leaderboard,
  casinoChainById,
} from "../../data";
import { ERROR_CODES } from "../../errors/codes";
import { TransactionError } from "../../errors/types";
import type { BetSwirlFunctionData, Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import { getClaimableAmount } from "../../read";

export interface LeaderboardClaimRewardsResult {
  claimedAmount: bigint;
  token: Token;
  receiver: Address;
}

export async function claimLeaderboardRewards(
  wallet: BetSwirlWallet,
  leaderboard: Leaderboard,
  receiver: Address,
  pollingInterval?: number,
  onClaimPending?: (tx: Hash, result: LeaderboardClaimRewardsResult) => void | Promise<void>,
) {
  try {
    const playerAddress = wallet.getAccount()?.address;
    if (!playerAddress) {
      throw new TransactionError("Account missing", ERROR_CODES.WALLET.ACCOUNT_MISSING);
    }
    const claimableAmount = await getClaimableAmount(
      wallet,
      leaderboard.onChainId,
      playerAddress,
      leaderboard.chainId,
    );
    if (claimableAmount <= 0n) {
      throw new TransactionError(
        "No claimable amount",
        ERROR_CODES.LEADERBOARD.NO_CLAIMABLE_AMOUNT,
        {
          leaderboardId: leaderboard.id,
          leaderboardOnChainId: leaderboard.onChainId,
          playerAddress,
          chainId: leaderboard.chainId,
          receiver,
        },
      );
    }

    const functionData = getClaimRewardsLeaderboardFunctionData(leaderboard, receiver);
    const tx = await wallet.writeContract(functionData);
    const result: LeaderboardClaimRewardsResult = {
      claimedAmount: claimableAmount,
      token: leaderboard.token,
      receiver,
    };
    await onClaimPending?.(tx, result);
    const casinoChain =
      leaderboard.type === LEADERBOARD_TYPE.CASINO
        ? casinoChainById[leaderboard.chainId as CasinoChainId]
        : undefined;
    const effectivePollingInterval = pollingInterval || casinoChain?.options.pollingInterval;
    const receipt = await wallet.waitTransaction(tx, effectivePollingInterval);
    return { receipt, result };
  } catch (error) {
    throw new TransactionError(
      `Error claiming rewards from leaderboard #${leaderboard.id} on chain ${leaderboard.chainId}`,
      ERROR_CODES.TRANSACTION.TOKEN_APPROVAL_ERROR,
      {
        leaderboardId: leaderboard.id,
        leaderboardOnChainId: leaderboard.onChainId,
        chainId: leaderboard.chainId,
        receiver,
      },
    );
  }
}

export function getClaimRewardsLeaderboardFunctionData(
  leaderboard: Leaderboard,
  receiver: Address,
): BetSwirlFunctionData<typeof leaderboardAbi, "claimTokens", readonly [bigint, Address]> {
  const abi = leaderboardAbi;
  const functionName = "claimTokens" as const;
  const args = [BigInt(leaderboard.onChainId), receiver] as const;
  return {
    data: { to: leaderboard.leaderboardAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}
