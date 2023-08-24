import { expect } from "chai";
import hre from "hardhat";

describe("Denial of Service", () => {
  it("After being declared the winner, Attack.sol should not allow anyone else to bid", async () => {
    const goodContract = await hre.ethers.deployContract("Good", []);
    await goodContract.waitForDeployment();

    const attackContract = await hre.ethers.deployContract("Attack", [
      goodContract.target,
    ]);
    await attackContract.waitForDeployment();

    const [_, address1, address2] = await hre.ethers.getSigners();
    // @ts-ignore
    const tx1 = await goodContract.connect(address1).setCurrentAuctionPrice({
      value: hre.ethers.parseEther("1"),
    });
    await tx1.wait();

    const tx2 = await attackContract.attack({
      value: hre.ethers.parseEther("3"),
    });

    await tx2.wait();

    // @ts-ignore
    const txn3 = await goodContract.connect(address2).setCurrentAuctionPrice({
      value: hre.ethers.parseEther("4"),
    });

    await txn3.wait();

    expect(await goodContract.currentWinner()).to.equal(attackContract.target);
  });
});
