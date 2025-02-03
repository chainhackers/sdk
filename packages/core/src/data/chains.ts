import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  gnosis,
  mainnet,
  polygon,
  polygonAmoy,
  sepolia,
  type Chain,
} from "viem/chains";

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

export const chains = Object.values(chainByKey) as unknown as readonly [
  Chain,
  ...Chain[]
];

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
