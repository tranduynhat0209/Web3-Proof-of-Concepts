import { expect } from "chai";
import hre from "hardhat";

describe("Attack", () => {
  it("Should empty the balance of the Good contract", async () => {
    const goodContract = await hre.ethers.deployContract("GoodContract", []);
    await goodContract.waitForDeployment();

    const badContract = await hre.ethers.deployContract("BadContract", [
      goodContract.target,
    ]);

    const [_, innocentUser, attacker] = await hre.ethers.getSigners();

    const firstDeposit = hre.ethers.parseEther("10");

    const goodTxn = await goodContract
      .connect(innocentUser)
      .addBalance({ value: firstDeposit });

    await goodTxn.wait();

    let goodContractBalance = await hre.ethers.provider.getBalance(
      goodContract.target
    );

    expect(goodContractBalance).to.equal(firstDeposit);

    const attackTxn = await badContract
      .connect(attacker)
      .attack({ value: hre.ethers.parseEther("1") });

    await attackTxn.wait();

    goodContractBalance = await hre.ethers.provider.getBalance(
      goodContract.target
    );

    expect(goodContractBalance).to.equal(BigInt("0"));

    const badContractBalance = await hre.ethers.provider.getBalance(
      badContract.target
    );

    expect(badContractBalance).to.equal(hre.ethers.parseEther("11"));
  });
});
