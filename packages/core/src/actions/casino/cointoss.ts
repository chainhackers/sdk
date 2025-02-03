import { type Config as WagmiConfig } from "@wagmi/core";
import { playGame, type CasinoGameInputs, type CasinoOptions } from "./game.ts";
import { CASINO_GAME_TYPE } from "../../data/casino.ts";

export enum COINTOSS_FACE {
  TAILS = 1,
  HEADS = 0,
}
export interface CoinTossInputs extends CasinoGameInputs {
  face?: COINTOSS_FACE;
}
const defaultFace = COINTOSS_FACE.HEADS;
export async function playCoinToss(
  coinTossInputs: CoinTossInputs,
  wagmiConfig: WagmiConfig,
  betSwirlOptions?: CasinoOptions
) {
  // Simulate tx
  const face = Boolean(coinTossInputs.face || defaultFace);
  // Exécution de la transaction
  const hash = await playGame(
    {
      game: CASINO_GAME_TYPE.COINTOSS,
      encodedInputs: [face],
      ...coinTossInputs,
    },
    wagmiConfig,
    betSwirlOptions
  );
  return hash;
}
