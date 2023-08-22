import hre from "hardhat";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const whitelistContract = await hre.ethers.deployContract("Whitelist", [10]);

  await whitelistContract.waitForDeployment();

  console.log("Whitelist Contract Address: ", whitelistContract.target);

  await sleep(30 * 1000);

  await hre.run("verify:verify", {
    address: whitelistContract.target,
    constructorArguments: [10],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
