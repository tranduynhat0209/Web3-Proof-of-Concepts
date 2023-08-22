import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    bsctest: {
      url: "https://bsc-testnet.publicnode.com/",
      accounts: [process.env.PRIVATE_KEY as string],
    },
    mumbai: {
      url: "https://endpoints.omniatech.io/v1/matic/mumbai/public	",
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY as string,
    },
  },
};

export default config;
