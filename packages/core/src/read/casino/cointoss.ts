import { type TransactionReceipt } from "viem";
import { type CoinTossPlacedBet } from "../../actions/casino/cointoss";
import { type COINTOSS_FACE, CoinToss } from "../../entities/casino/cointoss";
import type { BetSwirlWallet } from "../../provider";
import { type CasinoRolledBet, type CasinoWaitRollOptions, waitRolledBet } from "./game";

export interface CoinTossRolledBet extends Omit<CasinoRolledBet, "decodedRoll"> {
  rolled: COINTOSS_FACE[];
}

export async function waitCoinTossRolledBet(
  wallet: BetSwirlWallet,
  placedBet: CoinTossPlacedBet,
  options?: CasinoWaitRollOptions,
): Promise<{
  rolledBet: CoinTossRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitRolledBet(wallet, placedBet, options);
  return {
    rolledBet: {
      ...rolledBet,
      rolled: rolledBet.encodedRolled.map(CoinToss.decodeRolled),
    },
    receipt,
  };
}
