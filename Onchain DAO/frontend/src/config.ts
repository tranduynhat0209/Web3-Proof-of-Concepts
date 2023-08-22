import { createWalletClient, custom } from "viem";
import { configureChains } from "wagmi";
import { bscTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

export const { chains, publicClient } = configureChains(
  [bscTestnet],
  [publicProvider()]
);

export const walletClient = createWalletClient({
  chain: bscTestnet,
  //@ts-ignore
  transport: custom(window.ethereum),
});
