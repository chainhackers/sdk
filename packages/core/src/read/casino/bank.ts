import { casinoChainById, maxHarcodedBetCountByType } from "../../data/casino";

import { type Config as WagmiConfig } from "@wagmi/core";
import { bankAbi } from "../../abis/v2/casino/bank";
import { zeroAddress } from "viem";
import { readContract } from "@wagmi/core";
import type { CasinoToken, BetRequirements, Token } from "../../interfaces";
import type { CASINO_GAME_TYPE, CasinoChainId } from "../../data/casino";
import { TransactionError } from "../../errors/types";

import { ERROR_CODES } from "../../errors/codes";
import { getCasinoChainId } from "../../utils/chains";

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
        balanceRiskPercent: rawToken.token.balanceRisk / 100,
        bankrollProvider: rawToken.token.bankrollProvider,
        chainId: casinoChainId,
        houseEdgeSplit: {
          bank: rawToken.token.houseEdgeSplitAndAllocation.bank,
          bankPercent: rawToken.token.houseEdgeSplitAndAllocation.bank / 100,
          dividend: rawToken.token.houseEdgeSplitAndAllocation.dividend,
          dividendPercent:
            rawToken.token.houseEdgeSplitAndAllocation.dividend / 100,
          affiliate: rawToken.token.houseEdgeSplitAndAllocation.affiliate,
          affiliatePercent:
            rawToken.token.houseEdgeSplitAndAllocation.affiliate / 100,
          treasury: rawToken.token.houseEdgeSplitAndAllocation.treasury,
          treasuryPercent:
            rawToken.token.houseEdgeSplitAndAllocation.treasury / 100,
          team: rawToken.token.houseEdgeSplitAndAllocation.team,
          teamPercent: rawToken.token.houseEdgeSplitAndAllocation.team / 100,
        },
      }))
      .filter((token) => !onlyActive || !token.paused);
  } catch (error) {
    throw new TransactionError(
      "Error getting tokens",
      ERROR_CODES.BANK.GET_TOKENS_ERROR,
      {
        chainId,
        cause: error,
      }
    );
  }
}

export async function getBetRequirements(
  wagmiConfig: WagmiConfig,
  token: Token,
  multiplier: number, // gross BP_VALUE
  game: CASINO_GAME_TYPE,
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
      maxBetCount: Math.min(
        Number(rawBetRequirements[2]),
        maxHarcodedBetCountByType[game]
      ),
    };
  } catch (error) {
    throw new TransactionError(
      "Error getting bet requirements",
      ERROR_CODES.BANK.GET_BET_REQUIREMENTS_ERROR,
      {
        chainId,
        cause: error,
      }
    );
  }
}
