import { PrivyClientConfig } from "@privy-io/react-auth";
import { mainnet, polygon, bsc } from "viem/chains";

export const privyConfig: PrivyClientConfig = {
  loginMethods: ["telegram", "wallet", "email"],
  defaultChain: mainnet,
  supportedChains: [mainnet, polygon, bsc],
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  },
  appearance: {
    theme: "dark",
    accentColor: "#3B82F6",
    logo: "/logo.svg",
    landingHeader: "PolyCrypto",
    loginMessage: "Predict the Market. Own the Outcome.",
  },
};
