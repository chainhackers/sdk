import { type TransactionReceipt } from "viem";
import {
  waitRolledBet,
  type CasinoRolledBet,
  type CasinoWaitRollOptions,
} from "./game";
import { type CoinTossPlacedBet } from "../../actions/casino/coinToss";
import { CoinToss, type COINTOSS_FACE } from "../../entities/casino/coinToss";
import type { BetSwirlWallet } from "../../provider";

export interface CoinTossRolledBet extends CasinoRolledBet {
  rolled: COINTOSS_FACE[];
}

export async function waitCoinTossRolledBet(
  wallet: BetSwirlWallet,
  placedBet: CoinTossPlacedBet,
  options?: CasinoWaitRollOptions
): Promise<{
  rolledBet: CoinTossRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitRolledBet(
    wallet,
    placedBet,
    options
  );
  return {
    rolledBet: {
      ...rolledBet,
      rolled: rolledBet.encodedRolled.map(CoinToss.decodeRolled),
    },
    receipt,
  };
}
