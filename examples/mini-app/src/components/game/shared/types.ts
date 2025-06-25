import React from "react"

export interface BaseGameProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark" | "system"
  customTheme?: {
    "--primary"?: string
    "--play-btn-font"?: string
    "--game-window-overlay"?: string
  } & React.CSSProperties
  backgroundImage?: string
}

export interface GameControlsProps {
  multiplier: number
  isDisabled: boolean
}

export type GameVariant = "default" | "roulette"

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
