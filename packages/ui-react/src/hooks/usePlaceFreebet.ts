import {
  CASINO_GAME_TYPE,
  CoinTossEncodedInput,
  DiceEncodedInput,
  getPlaceFreebetFunctionData,
  KenoEncodedInput,
  RouletteEncodedInput,
  SignedFreebet,
  WeightedGameEncodedInput,
} from "@betswirl/sdk-core"
import { useCallback, useEffect, useState } from "react"
import { encodeAbiParameters, parseAbiParameters } from "viem"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useChain } from "../context/chainContext"
import { createLogger } from "../lib/logger"
import { BetStatus, GameChoice, GameDefinition, TokenWithImage } from "../types/types"
import { useEstimateVRFFees } from "./useEstimateVRFFees"

export interface IUsePlaceFreebetReturn<T extends GameChoice = GameChoice> {
  placeFreebet: (choice: T) => Promise<void>
  freebetStatus: BetStatus
  resetFreebetState: () => void
  vrfFees: bigint
  formattedVrfFees: number
  gasPrice: bigint
}

const logger = createLogger("usePlaceBet")

export function usePlaceFreebet<T extends GameChoice>(
  game: CASINO_GAME_TYPE | undefined,
  token: TokenWithImage,
  freebet: SignedFreebet | null,
  gameDefinition?: GameDefinition<T>,
): IUsePlaceFreebetReturn<T> {
  const { appChainId } = useChain()
  const wagerWriteHook = useWriteContract()
  const [internalError, setInternalError] = useState<string | null>(null)

  const wagerWaitingHook = useWaitForTransactionReceipt({
    hash: wagerWriteHook.data,
    chainId: appChainId,
  })

  const {
    vrfFees,
    wagmiHook: estimateVrfFeesWagmiHook,
    formattedVrfFees,
    gasPrice,
  } = useEstimateVRFFees({
    game: freebet ? game : undefined,
    token,
    betCount: 1,
  })

  let freebetStatus: BetStatus = null

  if (internalError) freebetStatus = "internal-error"
  else if (wagerWriteHook.error) freebetStatus = "error"
  else if (wagerWaitingHook.error) freebetStatus = "waiting-error"
  else if (wagerWriteHook.isPending) freebetStatus = "pending"
  else if (wagerWaitingHook.isLoading) freebetStatus = "loading"
  else if (wagerWriteHook.data) freebetStatus = "rolling"
  else if (wagerWaitingHook.isSuccess) freebetStatus = "success"

  useEffect(() => {
    if (wagerWriteHook.data) {
      console.log("Tx hash: ", wagerWriteHook.data)
    }
  }, [wagerWriteHook.data])

  const resetFreebetState = useCallback(() => {
    wagerWriteHook.reset()
    setInternalError(null)
  }, [wagerWriteHook.reset])

  const placeFreebet = useCallback(
    async (choice: T) => {
      if (!gameDefinition || !game || !freebet) {
        logger.error("placeFreebet: Game definition is not loaded yet")
        setInternalError("Game configuration is not loaded")
        return
      }

      resetFreebetState()

      const encodedInput = gameDefinition.encodeInput(choice.choice)
      const gameEncodedAbiParametersInput = convertToAbiParameters(game, encodedInput)
      console.log("gameEncodedAbiParametersInput: ", gameEncodedAbiParametersInput)

      if (!gameEncodedAbiParametersInput) {
        logger.error("placeFreebet: Failed to convert input to abi parameters")
        setInternalError("Failed to convert input to abi parameters")
        return
      }

      const betParams = {
        game,
        gameEncodedAbiParametersInput,
        freebet,
      }

      await estimateVrfFeesWagmiHook.refetch()

      logger.debug("placeBet: VRF cost refetched: ", formattedVrfFees)

      const placeFreebetTxData = getPlaceFreebetFunctionData(betParams, appChainId)

      const wagerWriteParams = {
        abi: placeFreebetTxData.data.abi,
        address: placeFreebetTxData.data.to,
        functionName: placeFreebetTxData.data.functionName,
        args: placeFreebetTxData.data.args,
        value: placeFreebetTxData.extraData.getValue(vrfFees),
        gasPrice,
        chainId: appChainId,
      }
      console.log("WAGER_WRITE_PARAMS: ", wagerWriteParams)

      wagerWriteHook.writeContract(wagerWriteParams)
    },
    [
      game,
      freebet,
      gameDefinition,
      appChainId,
      vrfFees,
      gasPrice,
      wagerWriteHook.writeContract,
      estimateVrfFeesWagmiHook.refetch,
    ],
  )

  return {
    placeFreebet,
    freebetStatus,
    resetFreebetState,
    vrfFees,
    formattedVrfFees,
    gasPrice,
  }
}

function convertToAbiParameters(game: CASINO_GAME_TYPE, encodedInput: number | boolean) {
  switch (game) {
    case CASINO_GAME_TYPE.COINTOSS:
      return encodeAbiParameters(parseAbiParameters("bool"), [encodedInput as CoinTossEncodedInput])
    case CASINO_GAME_TYPE.DICE:
      return encodeAbiParameters(parseAbiParameters("uint8"), [encodedInput as DiceEncodedInput])
    case CASINO_GAME_TYPE.ROULETTE:
      return encodeAbiParameters(parseAbiParameters("uint40"), [
        encodedInput as RouletteEncodedInput,
      ])
    case CASINO_GAME_TYPE.KENO:
      return encodeAbiParameters(parseAbiParameters("uint40"), [encodedInput as KenoEncodedInput])
    case CASINO_GAME_TYPE.WHEEL:
      return encodeAbiParameters(parseAbiParameters("uint40"), [
        encodedInput as WeightedGameEncodedInput,
      ])
    default:
      return
  }
}
