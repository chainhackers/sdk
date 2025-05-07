import type { BetSwirlWallet } from "../../provider";

export enum GAS_PRICE_TYPE {
  NORMAL = "NORMAL",
  FAST = "FAST",
  INSTANT = "INSTANT",
}

export interface RETURN_TYPE_GAS_PRICES {
  [GAS_PRICE_TYPE.NORMAL]: bigint;
  [GAS_PRICE_TYPE.FAST]: bigint;
  [GAS_PRICE_TYPE.INSTANT]: bigint;
}

export async function getGasPrices(
  wallet: BetSwirlWallet,
  chainId?: number,
): Promise<RETURN_TYPE_GAS_PRICES> {
  const gasPrice = await wallet.getPublicClient(chainId).getGasPrice();
  const basePrice = gasPrice ? BigInt(gasPrice) : BigInt(1000000000);

  return {
    [GAS_PRICE_TYPE.NORMAL]: basePrice,
    [GAS_PRICE_TYPE.FAST]: (basePrice * 120n) / 100n, // 20%
    [GAS_PRICE_TYPE.INSTANT]: (basePrice * 150n) / 100n, // 50%
  };
}
