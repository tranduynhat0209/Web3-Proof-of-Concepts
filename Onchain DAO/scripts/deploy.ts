import hre from "hardhat";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const nftContract = await hre.ethers.deployContract("CryptoDevsNFT", {
    gasLimit: 30000000,
  });
  await nftContract.waitForDeployment();
  console.log("CryptoDevsNFT deployed to: ", nftContract.target);

  const mockNFTMarketplaceContract = await hre.ethers.deployContract(
    "MockNFTMarketplace",
    { gasLimit: 30000000 }
  );
  await mockNFTMarketplaceContract.waitForDeployment();
  console.log(
    "MockNFTMarketplace deployed to: ",
    mockNFTMarketplaceContract.target
  );

  const amount = hre.ethers.parseEther("0.05");
  const daoContract = await hre.ethers.deployContract(
    "CryptoDevsDAO",
    [mockNFTMarketplaceContract.target, nftContract.target],
    { value: amount }
  );

  await daoContract.waitForDeployment();
  console.log("DAO deployed to: ", daoContract.target);
  await sleep(30 * 1000);

  /*
  await hre.run("verify:verify", {
    address: nftContract.target,
    constructorArguments: [],
  });

  await hre.run("verify:verify", {
    address: mockNFTMarketplaceContract.target,
    constructorArguments: [],
  });

  await hre.run("verify:verify", {
    address: daoContract.target,
    constructorArguments: [
      mockNFTMarketplaceContract.target,
      nftContract.target,
    ],
  });
  */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
