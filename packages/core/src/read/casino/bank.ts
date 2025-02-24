import { casinoChainById, maxHarcodedBetCountByType } from "../../data/casino";

import { type Config as WagmiConfig } from "@wagmi/core";
import { bankAbi } from "../../abis/v2/casino/bank";
import { encodeFunctionData, zeroAddress, type Hex } from "viem";
import { readContract } from "@wagmi/core";
import type { CasinoToken, BetRequirements, Token } from "../../interfaces";
import type { CASINO_GAME_TYPE, CasinoChainId } from "../../data/casino";
import { TransactionError } from "../../errors/types";

import { ERROR_CODES } from "../../errors/codes";
import { getCasinoChainId } from "../../utils/chains";

export type RawCasinoToken = {
  decimals: number;
  tokenAddress: `0x${string}`;
  name: string;
  symbol: string;
  token: {
    allowed: boolean;
    paused: boolean;
    balanceRisk: number;
    bankrollProvider: `0x${string}`;
    pendingBankrollProvider: `0x${string}`;
    houseEdgeSplitAndAllocation: {
      bank: number;
      dividend: number;
      affiliate: number;
      treasury: number;
      team: number;
      dividendAmount: bigint;
      affiliateAmount: bigint;
      treasuryAmount: bigint;
      teamAmount: bigint;
    };
  };
};

export async function getCasinoTokens(
  wagmiConfig: WagmiConfig,
  chainId?: CasinoChainId,
  onlyActive = false
): Promise<CasinoToken[]> {
  const casinoChainId = getCasinoChainId(wagmiConfig, chainId);
  try {
    const casinoChain = casinoChainById[casinoChainId];
    const { data } = getCasinoTokensFunctionData(casinoChainId);
    const rawTokens: Readonly<RawCasinoToken[]> = await readContract(
      wagmiConfig,
      {
        abi: data.abi,
        address: data.to,
        chainId: chainId,
        functionName: data.functionName,
        args: data.args,
      }
    );

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

export function getCasinoTokensFunctionData(casinoChainId: CasinoChainId) {
  const casinoChain = casinoChainById[casinoChainId];

  const abi = bankAbi;
  const functionName = "getTokens" as const;
  const args = [] as const;
  return {
    data: { to: casinoChain.contracts.bank, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}

/**
 * Raw bet requirements data returned by the smart contract
 * [0] - isAllowed: Indicates if the token is allowed for betting
 * [1] - maxBetAmount: Maximum amount allowed per bet
 * [2] - maxBetCount: Maximum number of simultaneous bets allowed
 */
export type RawBetRequirements = [boolean, bigint, bigint];

export async function getBetRequirements(
  wagmiConfig: WagmiConfig,
  token: Token,
  multiplier: number, // gross BP_VALUE
  game: CASINO_GAME_TYPE,
  chainId?: CasinoChainId
): Promise<BetRequirements> {
  const casinoChainId = getCasinoChainId(wagmiConfig, chainId);
  try {
    const { data } = getBetRequirementsFunctionData(
      token.address,
      multiplier,
      casinoChainId
    );
    const rawBetRequirements: Readonly<RawBetRequirements> = await readContract(
      wagmiConfig,
      {
        abi: data.abi,
        address: data.to,
        chainId,
        functionName: data.functionName,
        args: data.args,
      }
    );

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
// multiplier = gross BP_VALUE
export function getBetRequirementsFunctionData(
  tokenAddress: Hex,
  multiplier: number,
  casinoChainId: CasinoChainId
) {
  const casinoChain = casinoChainById[casinoChainId];

  const abi = bankAbi;
  const functionName = "getBetRequirements" as const;
  const args = [tokenAddress, BigInt(multiplier)] as const;
  return {
    data: { to: casinoChain.contracts.bank, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}
