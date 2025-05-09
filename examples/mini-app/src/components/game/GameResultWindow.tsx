import winIcon from "../../assets/game/game-result/win-icon.svg"
import lossIcon from "../../assets/game/game-result/loss-icon.svg"
import winBg from "../../assets/game/game-result/win-bg.jpg"
import lossBg from "../../assets/game/game-result/loss-bg.jpg"
import winBgWebp from "../../assets/game/game-result/win-bg.webp"
import lossBgWebp from "../../assets/game/game-result/loss-bg.webp"
import { useEffect } from "react"

const images = {
  win: {
    bg: {
      webp: winBgWebp,
      jpg: winBg,
    },
    icon: winIcon
  },
  loss: {
    bg: {
      webp: lossBgWebp,
      jpg: lossBg,
    },
    icon: lossIcon,
  }
} as const

interface GameResultWindowProps{
    result?: "win" | "loss" | "pending"
    amount: number
    payout?: number
    currency: string
    className?: string
}

export function GameResultWindow({
  result="pending",
  amount,
  payout = 0,
  currency,
  className
}: GameResultWindowProps) {

  useEffect(() => {
    const preloadImg = (imgSrc: string) => {
      const img = new Image()
      img.src = imgSrc
    }
  
    Object.values(images).forEach(({ bg, icon }) => {
      preloadImg(bg.webp)
      preloadImg(bg.jpg)
      preloadImg(icon)
    })
  }, [])
  
  if (result === "pending") { 
    return null
  }

  return (
    <div className={`w-full h-full flex flex-col items-center py-[12px] px-[42px] absolute left-0 top-0 text-white ${className}`}>
      <picture className={`absolute left-0 top-0 w-full h-full ${result === "win" ? "visible" : "invisible"}`}>
        <source srcSet={images[result].bg.webp} type="image/webp" />
        <img src={images[result].bg.jpg} className="w-full h-full object-cover" alt="win bg" />
      </picture>
      <picture className={`absolute left-0 top-0 w-full h-full ${result === "loss" ? "visible" : "invisible"}`}>
        <source srcSet={images[result].bg.webp} type="image/webp" />
        <img src={images[result].bg.jpg} className="w-full h-full object-cover" alt="loss bg"/>
      </picture>
    
      <div className="flex flex-col items-center gap-[8px] text-center relative">
        <div className="w-[48px] h-[44px] flex items-center justify-center bg-game-result-icon-bg relative rounded-[6px]">
            <img className={`absolute ${result === "win" ? "visible" : "invisible"}`} src={images[result].icon} alt="win icon" />
            <img className={`absolute ${result === "loss" ? "visible" : "invisible"}`} src={images[result].icon} alt="loss icon" />
        </div>
        <p className="text-[16px] leading-[150%] font-bold">
          {result === "win" ? "+" : "-"}
          {amount} 
          <span className="uppercase"> {currency}</span>
        </p>
        <p className="text-[14px] leading-[157%] font-semibold">
          Payout: {payout}
          <span className="uppercase"> {currency}</span></p>
        <p className="text-[12px] leading-[167%] font-medium uppercase">Draw: HEADS</p>
      </div>
    </div>
  )
}
