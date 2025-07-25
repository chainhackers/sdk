import { ChevronDown, Gift, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { TokenWithImage } from "../../types/types"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { TokenIcon } from "../ui/TokenIcon"

interface FreeBetInputProps {
  token: TokenWithImage
  isDisabled: boolean
  onTokenClick: () => void
  onRemoveFreebet: () => void
}

export function FreeBetInput({
  token,
  isDisabled,
  onTokenClick,
  onRemoveFreebet,
}: FreeBetInputProps) {
  return (
    <div className="w-full">
      <Label htmlFor="betAmount" className="text-sm font-medium -mb-1 text-text-on-surface-variant">
        Bet amount
      </Label>
      <div className="relative mt-4 flex h-12 w-full items-center text-sm">
        {/* Freebet Tag */}
        <div
          className={cn(
            "absolute right-0 bottom-full z-10",
            "flex items-center gap-1.5",
            "rounded-t-lg bg-game-win px-2 py-1",
            "text-xs font-bold text-white",
          )}
        >
          <Gift size={16} />
          <span>Freebet</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemoveFreebet}
            className="ml-1 h-4 w-4 rounded-full p-0 text-white hover:bg-white/20"
          >
            <X size={16} />
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onTokenClick}
          className={cn(
            "absolute left-[12px] top-1/2 -translate-y-1/2 transform z-10",
            "flex items-center text-foreground font-medium gap-1",
            "h-auto w-fit p-0 bg-transparent hover:bg-transparent hover:opacity-80 transition-opacity",
            "border-0 shadow-none outline-none focus:outline-none",
          )}
          disabled={isDisabled}
        >
          <ChevronDown size={22} />
        </Button>
        <Button
          id="betAmount"
          disabled={isDisabled}
          className={cn(
            "flex h-full w-full border-1 border-game-win",
            "rounded-bl-[12px] rounded-br-[12px] rounded-tl-[12px] rounded-tr-none",
            "bg-neutral-background text-foreground font-semibold",
            "px-4 py-2 pl-12",
            "text-base placeholder:text-muted-foreground",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "justify-start",
            "hover:bg-neutral-background-hover",
          )}
        >
          4
        </Button>
        <Button
          variant="ghost"
          onClick={onTokenClick}
          className={cn(
            "absolute right-[12px] top-1/2 -translate-y-1/2 transform",
            "flex items-center text-foreground font-medium gap-1",
            "h-auto w-fit p-0 bg-transparent hover:bg-transparent hover:opacity-80 transition-opacity",
            "border-0 shadow-none outline-none focus:outline-none",
          )}
          disabled={isDisabled}
        >
          <TokenIcon token={token} size={18} />
          <span>{token.symbol}</span>
        </Button>
      </div>
    </div>
  )
}
