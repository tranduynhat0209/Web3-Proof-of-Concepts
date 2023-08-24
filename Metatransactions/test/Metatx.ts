import { expect } from "chai";
import { getBytes, parseEther } from "ethers";
import { ethers } from "hardhat";

describe("MetaTokenTransfer", function () {
  it("Should let user transfer tokens through a relayer", async function () {
    // Deploy the contracts
    const RandomTokenFactory = await ethers.getContractFactory("RandomToken");
    const randomTokenContract = await RandomTokenFactory.deploy();
    await randomTokenContract.waitForDeployment();

    const MetaTokenSenderFactory = await ethers.getContractFactory(
      "TokenSender"
    );
    const tokenSenderContract = await MetaTokenSenderFactory.deploy();
    await tokenSenderContract.waitForDeployment();

    const [_, userAddress, relayerAddress, recipientAddress] =
      await ethers.getSigners();

    const tenThousandTokensWithDecimals = parseEther("10000");
    const userTokenContractInstance = randomTokenContract.connect(userAddress);
    const mintTxn = await userTokenContractInstance.freeMint(
      tenThousandTokensWithDecimals
    );
    await mintTxn.wait();

    const approveTxn = await userTokenContractInstance.approve(
      tokenSenderContract.target,
      BigInt(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
    );
    await approveTxn.wait();

    let nonce = 1;
    const transferAmountOfTokens = parseEther("10");

    const messageHash = await tokenSenderContract.getHash(
      userAddress.address,
      transferAmountOfTokens,
      recipientAddress.address,
      randomTokenContract.target,
      nonce
    );
    const signature = await userAddress.signMessage(getBytes(messageHash));

    const relayerSenderContractInstance =
      tokenSenderContract.connect(relayerAddress);
    const metaTx = await relayerSenderContractInstance.transfer(
      userAddress.address,
      transferAmountOfTokens,
      recipientAddress.address,
      randomTokenContract.target,
      nonce,
      signature
    );
    await metaTx.wait();

    let userBalance = await randomTokenContract.balanceOf(userAddress.address);
    let recipientBalance = await randomTokenContract.balanceOf(
      recipientAddress.address
    );
    expect(userBalance).to.equal(parseEther("9990"));
    expect(recipientBalance).to.equal(parseEther("10"));

    nonce++;

    const messageHash2 = await tokenSenderContract.getHash(
      userAddress.address,
      transferAmountOfTokens,
      recipientAddress.address,
      randomTokenContract.target,
      nonce
    );
    const signature2 = await userAddress.signMessage(getBytes(messageHash2));
    // Have the relayer execute the transaction on behalf of the user
    const metaTxn2 = await relayerSenderContractInstance.transfer(
      userAddress.address,
      transferAmountOfTokens,
      recipientAddress.address,
      randomTokenContract.target,
      nonce,
      signature2
    );
    await metaTxn2.wait();

    // Check the user's balance decreased, and recipient got 10 tokens
    userBalance = await randomTokenContract.balanceOf(userAddress.address);
    recipientBalance = await randomTokenContract.balanceOf(
      recipientAddress.address
    );

    expect(userBalance).to.eq(parseEther("9980"));
    expect(recipientBalance).to.eq(parseEther("20"));

    expect(
      relayerSenderContractInstance.transfer(
        userAddress.address,
        transferAmountOfTokens,
        recipientAddress.address,
        randomTokenContract.target,
        nonce,
        signature2
      )
    ).to.be.revertedWith("Already executed!");
  }).timeout(100000);
});
