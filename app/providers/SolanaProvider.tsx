"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletAdapter } from "@solana/wallet-adapter-base";

export const SolanaProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const network =
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) ||
    WalletAdapterNetwork.Devnet;

  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network);
  const wallets = useMemo<WalletAdapter[]>(() => {
    const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID; // ← sin "!"
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const base: WalletAdapter[] = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ];

    // Solo añadimos WalletConnect si hay projectId
    if (wcProjectId) {
      base.push(
        new WalletConnectWalletAdapter({
          // Asegura que solo use valores válidos
          network:
            network === WalletAdapterNetwork.Mainnet ||
            network === WalletAdapterNetwork.Devnet
              ? network
              : WalletAdapterNetwork.Devnet,
          options: {
            relayUrl: "wss://relay.walletconnect.com",
            projectId: wcProjectId,
            metadata: {
              name: "TradingToken Mint",
              description: "Compra de NFT con split de pago",
              url: appUrl,
              icons: ["https://avatars.githubusercontent.com/u/35608259?s=200"],
            },
          },
        })
      );
    }

    return base;
  }, [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
