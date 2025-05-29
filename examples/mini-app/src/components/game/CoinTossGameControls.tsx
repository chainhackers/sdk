import { COINTOSS_FACE } from "@betswirl/sdk-core"
import { Button } from "../ui/button"
import coinHeadsIcon from "../../assets/game/coin-heads.svg"
import coinTailsIcon from "../../assets/game/coin-tails.svg"

interface CoinTossGameControlsProps {
  selectedSide: COINTOSS_FACE
  onCoinClick: () => void
  multiplier: number
  isDisabled: boolean
}

export function CoinTossGameControls({
  selectedSide,
  onCoinClick,
  multiplier,
  isDisabled,
}: CoinTossGameControlsProps) {
  const currentCoinIcon =
    selectedSide === COINTOSS_FACE.HEADS ? coinHeadsIcon : coinTailsIcon

  return (
    <>
      <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white">
        {multiplier.toFixed(2)} x
      </div>
      <Button
        variant="coinButton"
        size="coin"
        onClick={onCoinClick}
        disabled={isDisabled}
        aria-label={`Select ${selectedSide === COINTOSS_FACE.HEADS ? "Tails" : "Heads"} side`}
        className="absolute top-[62px] left-1/2 transform -translate-x-1/2 mt-2"
      >
        <img
          src={currentCoinIcon}
          alt={selectedSide === COINTOSS_FACE.HEADS ? "Heads" : "Tails"}
          className="h-full w-auto pointer-events-none"
        />
      </Button>
    </>
  )
}
