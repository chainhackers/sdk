import { GameVariant, VariantConfigMap } from "./types"

export const VARIANT_CONFIG: VariantConfigMap = {
  default: {
    card: {
      height: "",
    },
    gameArea: {
      height: "h-[160px]",
      rounded: "rounded-[16px]",
      contentClass: "flex flex-col gap-4",
    },
  },
  roulette: {
    card: {
      height: "h-[546px]",
    },
    gameArea: {
      height: "h-[194px]",
      rounded: "",
      contentClass: "flex flex-col gap-4 -mx-3",
    },
  },
} as const

export function getVariantConfig(variant: GameVariant) {
  return VARIANT_CONFIG[variant]
}
