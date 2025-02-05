import { type Config as WagmiConfig } from "@wagmi/core";
import { type TransactionReceipt } from "viem";
import type { CasinoRolledBet, CasinoWaitRollOptions } from "./game.ts";
import {
  decodeCoinTossInput,
  type COINTOSS_FACE,
  type CoinTossPlacedBet,
} from "../../actions/casino/cointoss.ts";

interface CoinTossRolledBet extends CasinoRolledBet {
  rolled: COINTOSS_FACE[];
}

export async function waitRolledBet(
  wagmiConfig: WagmiConfig,
  placedBet: CoinTossPlacedBet,
  options?: CasinoWaitRollOptions
): Promise<{
  rolledBet: CoinTossRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitRolledBet(
    wagmiConfig,
    placedBet,
    options
  );
  return {
    rolledBet: {
      ...rolledBet,
      rolled: rolledBet.encodedRolled.map(decodeCoinTossInput),
    },
    receipt,
  };
}
