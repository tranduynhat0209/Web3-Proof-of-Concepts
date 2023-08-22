"use client";

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createConfig, WagmiConfig } from "wagmi";
import { chains, publicClient } from "@/config";

const { connectors } = getDefaultWallets({
  appName: "CryptoDevs DAO",
  projectId: "4fcf3f080579a60ed2739f0ed76f4fd2",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Onchain DAO",
//   description: "NFT-powered DAO",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <body className={inter.className}>{children}</body>
        </RainbowKitProvider>
      </WagmiConfig>
    </html>
  );
}
