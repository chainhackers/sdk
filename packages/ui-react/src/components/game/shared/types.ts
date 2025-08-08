import React from "react"
import { Theme } from "../../../types/types"
import type { FreeBet } from "../BettingPanel"

export interface BaseGameProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: Theme
  customTheme?: {
    "--primary"?: string
    "--play-btn-font"?: string
    "--connect-btn-font"?: string
    "--game-window-overlay"?: string
  } & React.CSSProperties
  backgroundImage?: string
  freeBets?: FreeBet[] // TODO: Remove this prop once freebets are implemented using context
}

export interface GameControlsProps {
  multiplier: number
  isDisabled: boolean
}

export type GameVariant = "default" | "roulette" | "keno" | "wheel"

export interface VariantConfig {
  card: {
    height: string
  }
  gameArea: {
    height: string
    rounded: string
    contentClass: string
  }
}

export type VariantConfigMap = Record<GameVariant, VariantConfig>
