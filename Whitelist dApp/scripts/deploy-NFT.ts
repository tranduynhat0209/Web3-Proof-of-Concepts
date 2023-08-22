import hre from "hardhat";

const whitelistAddress = "0x6F7C7609Cd4019aB5B88F4a31DaEB3Eff4056c39";
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const nftContract = await hre.ethers.deployContract(
    "CryptoDevs",
    [whitelistAddress],
    {
      gasLimit: 30000000,
    }
  );

  await nftContract.waitForDeployment();

  console.log("NFT contract address: ", nftContract.target);

  await sleep(30 * 1000);

  await hre.run("verify:verify", {
    address: nftContract.target,
    constructorArguments: [whitelistAddress],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
