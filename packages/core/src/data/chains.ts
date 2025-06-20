import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  type Chain,
  gnosis,
  mainnet,
  polygon,
  polygonAmoy,
  sepolia,
} from "viem/chains";
import type { Token } from "../interfaces";

export type ChainId = keyof typeof chainById;

export const chainByKey = {
  polygon,
  polygonAmoy,
  avalanche,
  avalancheFuji,
  arbitrum,
  arbitrumSepolia,
  bsc,
  bscTestnet,
  mainnet,
  sepolia,
  base,
  baseSepolia,
  gnosis,
} as const;

export const chains = Object.values(chainByKey) as unknown as readonly [Chain, ...Chain[]];

export const chainById = {
  [polygon.id]: polygon,
  [polygonAmoy.id]: polygonAmoy,
  [avalanche.id]: avalanche,
  [avalancheFuji.id]: avalancheFuji,
  [arbitrum.id]: arbitrum,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [bsc.id]: bsc,
  [bscTestnet.id]: bscTestnet,
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
  [base.id]: base,
  [baseSepolia.id]: baseSepolia,
  [gnosis.id]: gnosis,
} as const;

export const slugById = {
  [polygon.id as number]: "polygon",
  [polygonAmoy.id as number]: "amoy",
  [avalanche.id as number]: "avalanche",
  [avalancheFuji.id as number]: "fuji",
  [arbitrum.id as number]: "arbitrum",
  [arbitrumSepolia.id as number]: "arbitrum-sepolia",
  [bsc.id as number]: "bnb-chain",
  [bscTestnet.id as number]: "bnb-chain-testnet",
  [mainnet.id as number]: "ethereum",
  [sepolia.id as number]: "sepolia",
  [base.id as number]: "base",
  [baseSepolia.id as number]: "base-sepolia",
  [gnosis.id as number]: "gnosis",
} as const;

export const wrappedGasTokenById: Record<number, Token["address"]> = {
  [polygon.id]: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  [polygonAmoy.id]: "0x52eF3d68BaB452a294342DC3e5f464d7f610f72E",
  [avalanche.id]: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
  [avalancheFuji.id]: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
  [arbitrum.id]: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  [arbitrumSepolia.id]: "0x187De399100aA962F209Aa78621F5138ACA6111f",
  [bsc.id]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  [bscTestnet.id]: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  [mainnet.id]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  [sepolia.id]: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  [base.id]: "0x4200000000000000000000000000000000000006",
  [baseSepolia.id]: "0x4200000000000000000000000000000000000006",
  [gnosis.id]: "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
};
