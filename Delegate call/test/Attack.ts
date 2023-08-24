import { expect } from "chai";
import hre from "hardhat";

describe("delegatecall Attack", () => {
  it("Should change the owner of the Good Contract", async () => {
    const helperContract = await hre.ethers.deployContract("Helper", []);
    await helperContract.waitForDeployment();

    const goodContract = await hre.ethers.deployContract("Good", [
      helperContract.target,
    ]);
    await goodContract.waitForDeployment();

    const attackContract = await hre.ethers.deployContract("Attack", [
      goodContract.target,
    ]);
    await attackContract.waitForDeployment();

    const tx = await attackContract.attack();
    await tx.wait();

    expect(await goodContract.owner()).to.equal(attackContract.target);
  });
});
