import { expect, assert } from "chai";
import hre, { ethers } from "hardhat";

import { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } from "./config";

describe("Flash Loans", function () {
  it("Should take a flash loan and be able to return it", async function () {
    const FlashLoan = await hre.ethers.getContractFactory("FlashLoanExample");

    const flashLoan = await FlashLoan.deploy(POOL_ADDRESS_PROVIDER);
    await flashLoan.waitForDeployment();

    const token = await hre.ethers.getContractAt("IERC20", DAI);

    const BALANCE_AMOUNT_DAI = hre.ethers.parseEther("2000");

    const signer = await ethers.getImpersonatedSigner(DAI_WHALE);

    // @ts-ignore
    await token.connect(signer).transfer(flashLoan.target, BALANCE_AMOUNT_DAI);

    const txn = await flashLoan.createFlashLoan(DAI, 10000);
    await txn.wait();

    const remainingBalance = await token.balanceOf(flashLoan.target);

    expect(remainingBalance).to.lessThan(BALANCE_AMOUNT_DAI);
  });
});
