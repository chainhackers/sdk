import {
  CasinoChainId,
  GenericCasinoBetParams,
  getPlaceBetFunctionData,
  getPlaceFreebetFunctionData,
} from "@betswirl/sdk-core"
import { createLogger } from "../lib/logger"
import { GameChoice } from "../types/types"
import {
  BetTransactionParameters,
  BetStrategyParams,
  FreebetStrategyConfig,
  IBetStrategy,
  PaidBetStrategyConfig,
} from "../types/betStrategy"

const logger = createLogger("BetStrategies")

/**
 * Strategy for paid bets using user's tokens
 */
export class PaidBetStrategy<T extends GameChoice = GameChoice> implements IBetStrategy<T> {
  constructor(private config: PaidBetStrategyConfig) {}

  async prepare(params: BetStrategyParams<T>): Promise<BetTransactionParameters> {
    const { betAmount, choice, vrfFees, gasPrice, chainId, gameDefinition, game } = params
    const { token, affiliate, connectedAddress, chainId: configChainId } = this.config

    logger.debug("PaidBetStrategy: Preparing transaction", {
      betAmount: betAmount.toString(),
      tokenAddress: token.address,
      game,
    })

    const encodedInput = gameDefinition.encodeInput(choice.choice)

    const betParams: GenericCasinoBetParams = {
      game,
      gameEncodedInput: encodedInput,
      betAmount,
      tokenAddress: token.address,
    }

    const placeBetTxData = getPlaceBetFunctionData(
      { ...betParams, receiver: connectedAddress, affiliate },
      configChainId as CasinoChainId,
    )

    return {
      abi: placeBetTxData.data.abi,
      address: placeBetTxData.data.to,
      functionName: placeBetTxData.data.functionName,
      args: placeBetTxData.data.args,
      value: placeBetTxData.extraData.getValue(vrfFees),
      gasPrice,
      chainId,
    }
  }
}

/**
 * Strategy for freebet bets using signed freebets
 */
export class FreebetStrategy<T extends GameChoice = GameChoice> implements IBetStrategy<T> {
  constructor(private config: FreebetStrategyConfig) {}

  async prepare(params: BetStrategyParams<T>): Promise<BetTransactionParameters> {
    const { choice, vrfFees, gasPrice, chainId, gameDefinition, game } = params
    const { freebet, chainId: configChainId } = this.config

    logger.debug("FreebetStrategy: Preparing transaction", {
      freebetId: freebet.id,
      game,
    })

    const gameEncodedAbiParametersInput = gameDefinition.encodeAbiParametersInput(choice.choice)

    const betParams = {
      game,
      gameEncodedAbiParametersInput,
      freebet,
    }

    const placeFreebetTxData = getPlaceFreebetFunctionData(betParams, configChainId as CasinoChainId)

    return {
      abi: placeFreebetTxData.data.abi,
      address: placeFreebetTxData.data.to,
      functionName: placeFreebetTxData.data.functionName,
      args: placeFreebetTxData.data.args,
      value: placeFreebetTxData.extraData.getValue(vrfFees),
      gasPrice,
      chainId,
    }
  }
}

/**
 * Factory function to create a paid bet strategy
 */
export function createPaidBetStrategy<T extends GameChoice = GameChoice>(
  config: PaidBetStrategyConfig,
): IBetStrategy<T> {
  return new PaidBetStrategy<T>(config)
}

/**
 * Factory function to create a freebet strategy
 */
export function createFreebetStrategy<T extends GameChoice = GameChoice>(
  config: FreebetStrategyConfig,
): IBetStrategy<T> {
  return new FreebetStrategy<T>(config)
}
