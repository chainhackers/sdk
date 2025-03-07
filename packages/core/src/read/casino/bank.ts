import { casinoChainById, maxGameBetCountByType } from "../../data/casino";

import { type Hex, encodeFunctionData } from "viem";
import { bankAbi } from "../../abis/v2/casino/bank";
import type { CASINO_GAME_TYPE, CasinoChainId } from "../../data/casino";
import { TransactionError } from "../../errors/types";
import type { BetRequirements, BetSwirlFunctionData, CasinoToken, Token } from "../../interfaces";

import { ERROR_CODES } from "../../errors/codes";
import type { BetSwirlWallet } from "../../provider";
import { getCasinoChainId } from "../../utils/chains";
import { rawTokenToToken } from "../../utils/tokens";

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

export function parseRawCasinoToken(
  rawToken: RawCasinoToken,
  casinoChainId: CasinoChainId,
): CasinoToken {
  return {
    ...rawTokenToToken(rawToken, casinoChainId),
    paused: !rawToken.token.allowed || rawToken.token.paused,
    balanceRisk: rawToken.token.balanceRisk,
    balanceRiskPercent: rawToken.token.balanceRisk / 100,
    bankrollProvider: rawToken.token.bankrollProvider,
    chainId: casinoChainId,
    houseEdgeSplit: {
      bank: rawToken.token.houseEdgeSplitAndAllocation.bank,
      bankPercent: rawToken.token.houseEdgeSplitAndAllocation.bank / 100,
      dividend: rawToken.token.houseEdgeSplitAndAllocation.dividend,
      dividendPercent: rawToken.token.houseEdgeSplitAndAllocation.dividend / 100,
      affiliate: rawToken.token.houseEdgeSplitAndAllocation.affiliate,
      affiliatePercent: rawToken.token.houseEdgeSplitAndAllocation.affiliate / 100,
      treasury: rawToken.token.houseEdgeSplitAndAllocation.treasury,
      treasuryPercent: rawToken.token.houseEdgeSplitAndAllocation.treasury / 100,
      team: rawToken.token.houseEdgeSplitAndAllocation.team,
      teamPercent: rawToken.token.houseEdgeSplitAndAllocation.team / 100,
    },
  };
}

export async function getCasinoTokens(
  wallet: BetSwirlWallet,
  onlyActive = false,
): Promise<CasinoToken[]> {
  const casinoChainId = getCasinoChainId(wallet);
  try {
    const functionData = getCasinoTokensFunctionData(casinoChainId);
    const rawTokens = await wallet.readContract<typeof functionData, RawCasinoToken[]>(
      functionData,
    );

    return rawTokens
      .map((rawToken) => parseRawCasinoToken(rawToken, casinoChainId))
      .filter((token) => !onlyActive || !token.paused);
  } catch (error) {
    throw new TransactionError("Error getting tokens", ERROR_CODES.BANK.GET_TOKENS_ERROR, {
      chainId: casinoChainId,
      cause: error,
    });
  }
}

export function getCasinoTokensFunctionData(
  casinoChainId: CasinoChainId,
): BetSwirlFunctionData<typeof bankAbi, "getTokens", readonly []> {
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

export function parseRawBetRequirements(
  rawBetRequirements: RawBetRequirements,
  token: Token,
  multiplier: number,
  game: CASINO_GAME_TYPE,
  casinoChainId: CasinoChainId,
): BetRequirements {
  return {
    token,
    multiplier,
    chainId: casinoChainId,
    maxBetAmount: rawBetRequirements[1],
    maxBetCount: Math.min(Number(rawBetRequirements[2]), maxGameBetCountByType[game]),
    isAllowed: rawBetRequirements[0],
  };
}

export async function getBetRequirements(
  wallet: BetSwirlWallet,
  token: Token,
  multiplier: number, // gross BP_VALUE
  game: CASINO_GAME_TYPE,
): Promise<BetRequirements> {
  const casinoChainId = getCasinoChainId(wallet);
  try {
    const functionData = getBetRequirementsFunctionData(token.address, multiplier, casinoChainId);
    const rawBetRequirements = await wallet.readContract<typeof functionData, RawBetRequirements>(
      functionData,
    );

    return parseRawBetRequirements(rawBetRequirements, token, multiplier, game, casinoChainId);
  } catch (error) {
    throw new TransactionError(
      "Error getting bet requirements",
      ERROR_CODES.BANK.GET_BET_REQUIREMENTS_ERROR,
      {
        chainId: casinoChainId,
        cause: error,
      },
    );
  }
}
// multiplier = gross BP_VALUE
export function getBetRequirementsFunctionData(
  tokenAddress: Hex,
  multiplier: number,
  casinoChainId: CasinoChainId,
): BetSwirlFunctionData<typeof bankAbi, "getBetRequirements", readonly [Hex, bigint]> {
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
