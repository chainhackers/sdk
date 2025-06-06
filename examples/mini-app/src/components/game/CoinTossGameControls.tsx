import { COINTOSS_FACE } from "@betswirl/sdk-core"
import coinHeadsIcon from "../../assets/game/coin-heads.svg"
import coinTailsIcon from "../../assets/game/coin-tails.svg"
import { Button } from "../ui/button"
import { GameMultiplierDisplay } from "./shared/GameMultiplierDisplay"
import { GameControlsProps } from "./shared/types"

interface CoinTossGameControlsProps extends GameControlsProps {
  selectedSide: COINTOSS_FACE
  onCoinClick: () => void
}

export function CoinTossGameControls({
  selectedSide,
  onCoinClick,
  multiplier,
  isDisabled,
}: CoinTossGameControlsProps) {
  const currentCoinIcon = selectedSide === COINTOSS_FACE.HEADS ? coinHeadsIcon : coinTailsIcon

  return (
    <>
      <GameMultiplierDisplay multiplier={multiplier} />
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
