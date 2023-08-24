import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
require("dotenv").config({ path: ".env" });

async function main() {
  const fakeNFT = await ethers.getContractFactory("FakeNFT");
  const FakeNFT = await fakeNFT.deploy();
  await FakeNFT.deployed();

  console.log("Address of Fake NFT Contract: ", FakeNFT.address);

  const provider = new ethers.providers.WebSocketProvider(
    process.env.QUICKNODE_WS_URL,
    "sepolia"
  );

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    signer,
    "https://relay-sepolia.flashbots.net",
    "sepolia"
  );

  provider.on("block", async (blocknumber: number) => {
    console.log("Block Number: ", blocknumber);

    const bundleResponse = await flashbotsProvider.sendBundle(
      [
        {
          transaction: {
            chainId: 11155111,
            type: 2,
            value: ethers.utils.parseEther("0.01"),
            to: FakeNFT.address,
            data: FakeNFT.interface.getSighash("mint()"),
            maxFeePerGas: BigNumber.from(10).pow(9).mul(3),
            maxPriorityFeePerGas: BigNumber.from(10).pow(9).mul(2),
          },
          signer: signer,
        },
      ],
      blocknumber + 1
    );

    if ("error" in bundleResponse) {
      console.log(bundleResponse.error.message);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
