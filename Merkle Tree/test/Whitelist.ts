import { expect } from "chai";
import { ethers } from "hardhat";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

function encodeLeaf(address: string, spots: number) {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint256"],
    [address, spots]
  );
}

describe("Merkle Trees", function () {
  it("Should be able to verify if address is in the whitelist or not", async function () {
    const testAddresses = await ethers.getSigners();
    const list = [
      encodeLeaf(testAddresses[0].address, 2),
      encodeLeaf(testAddresses[1].address, 2),
      encodeLeaf(testAddresses[2].address, 2),
      encodeLeaf(testAddresses[3].address, 2),
      encodeLeaf(testAddresses[4].address, 2),
      encodeLeaf(testAddresses[5].address, 2),
    ];

    const merkleTree = new MerkleTree(list, keccak256, {
      hashLeaves: true,
      sortPairs: true,
      sortLeaves: true,
    });

    const root = merkleTree.getHexRoot();
    const whitelist = await ethers.getContractFactory("Whitelist");
    const Whitelist = await whitelist.deploy(root);
    await Whitelist.waitForDeployment();
    for (let i = 0; i < list.length; i++) {
      const leaf = keccak256(list[i]);
      const proof = merkleTree.getHexProof(leaf);
      const connectedWhitelist = Whitelist.connect(testAddresses[i]);
      const verified = await connectedWhitelist.checkInWhitelist(proof, 2);
      expect(verified).to.be.true;
    }

    const verifiedInvalid = await Whitelist.checkInWhitelist([], 2);
    expect(verifiedInvalid).to.be.false;
  });
});
