import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.QUICKNODE_RPC_URL,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
};

export default config;
