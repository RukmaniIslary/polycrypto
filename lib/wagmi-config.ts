"use client";

import { createConfig, http } from "wagmi";
import { polygon, bsc, mainnet } from "wagmi/chains";
import { walletConnect, metaMask, coinbaseWallet, injected } from "wagmi/connectors";

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "1d67d1569bb2d5334123c1a4f59cf365";

export const wagmiConfig = createConfig({
  chains: [polygon, bsc, mainnet],
  connectors: [
    injected({ shimDisconnect: true }),                         // MetaMask + browser wallets
    metaMask({ dappMetadata: { name: "PolyCrypto" } }),
    coinbaseWallet({ appName: "PolyCrypto" }),
    walletConnect({ projectId: PROJECT_ID, showQrModal: true }), // Trust, Rainbow, etc.
  ],
  transports: {
    [polygon.id]: http(),
    [bsc.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: false,
});

// USDT contract addresses per chain
export const USDT_CONTRACTS: Record<number, `0x${string}`> = {
  [polygon.id]:  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT on Polygon
  [bsc.id]:      "0x55d398326f99059fF775485246999027B3197955", // USDT on BSC
  [mainnet.id]:  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT on Ethereum
};

// Your platform deposit address — receives all USDT
export const PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS as `0x${string}`;

// ERC-20 transfer ABI (minimal)
export const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to",    type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;
