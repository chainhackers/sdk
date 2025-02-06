import { casinoChainById } from "../../data/casino.ts";

import { type Config as WagmiConfig } from "@wagmi/core";
import { abi as bankAbi } from "../../abis/v2/casino/bank.ts";
import { zeroAddress } from "viem";
import { readContract } from "@wagmi/core";
import type { CasinoToken, BetRequirements, Token } from "../../interfaces.ts";
import type { CasinoChainId } from "../../data/casino.ts";
import { TransactionError } from "../../errors/types.ts";

import { ERROR_CODES } from "../../errors/codes.ts";
import { getCasinoChainId } from "../../utils/chains.ts";

export async function getCasinoTokens(
  wagmiConfig: WagmiConfig,
  chainId?: CasinoChainId,
  onlyActive = false
): Promise<CasinoToken[]> {
  const casinoChainId = getCasinoChainId(wagmiConfig, chainId);
  try {
    const casinoChain = casinoChainById[casinoChainId];
    const rawTokens = await readContract(wagmiConfig, {
      abi: bankAbi,
      address: casinoChain.contracts.bank,
      chainId: chainId,
      functionName: "getTokens",
    });

    return rawTokens
      .map((rawToken) => ({
        address: rawToken.tokenAddress,
        symbol:
          rawToken.tokenAddress == zeroAddress
            ? casinoChain.viemChain.nativeCurrency.symbol
            : rawToken.symbol,
        decimals: rawToken.decimals,
        paused: !rawToken.token.allowed || rawToken.token.paused,
        balanceRisk: rawToken.token.balanceRisk,
        bankrollProvider: rawToken.token.bankrollProvider,
        chainId: casinoChainId,
        houseEdgeSplit: {
          bank: rawToken.token.houseEdgeSplitAndAllocation.bank,
          dividend: rawToken.token.houseEdgeSplitAndAllocation.dividend,
          affiliate: rawToken.token.houseEdgeSplitAndAllocation.affiliate,
          treasury: rawToken.token.houseEdgeSplitAndAllocation.treasury,
          team: rawToken.token.houseEdgeSplitAndAllocation.team,
        },
      }))
      .filter((token) => !onlyActive || !token.paused);
  } catch (error) {
    throw new TransactionError("Error getting tokens", {
      errorCode: ERROR_CODES.BANK.GET_TOKENS_ERROR,
      chainId,
      cause: error,
    });
  }
}

export async function getBetRequirements(
  wagmiConfig: WagmiConfig,
  token: Token,
  multiplier: number,
  chainId?: CasinoChainId
): Promise<BetRequirements> {
  const casinoChainId = getCasinoChainId(wagmiConfig, chainId);
  try {
    const casinoChain = casinoChainById[casinoChainId];

    const rawBetRequirements = await readContract(wagmiConfig, {
      abi: bankAbi,
      address: casinoChain.contracts.bank,
      chainId,
      functionName: "getBetRequirements",
      args: [token.address, BigInt(multiplier)],
    });

    return {
      token,
      multiplier,
      chainId: casinoChainId,
      maxBetAmount: rawBetRequirements[1],
      maxBetCount: Number(rawBetRequirements[2]),
    };
  } catch (error) {
    throw new TransactionError("Error getting bet requirements", {
      errorCode: ERROR_CODES.BANK.GET_BET_REQUIREMENTS_ERROR,
      chainId,
      cause: error,
    });
  }
}
