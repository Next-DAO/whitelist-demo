const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("WhitelistMerkleProof", function () {
  let contract;
  let tree;
  let owner;
  let wallets;

  beforeEach("setup contract for each test", async function () {
    wallets = await ethers.getSigners();
    // remove the owner wallet from whitelist
    owner = wallets.shift();

    // build Merkle Tree with whitelist addresses as leaves
    const leaves = wallets.map((w) => keccak256(w.address));
    tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();

    const factory = await ethers.getContractFactory("WhitelistMerkleProof");
    contract = await factory.deploy(root);
    await contract.deployed();
  });

  it("should allow minting for whitelisted wallets", async function () {
    // verify initial mint status
    expect(await contract.n()).to.equal(0);

    for (const [index, wallet] of wallets.entries()) {
      const proof = tree.getHexProof(keccak256(wallet.address));

      // use whitelist wallet to sent the tx
      const tx = await contract.connect(wallet).preMint(proof);
      await tx.wait();

      // verify new mint status
      expect(await contract.n()).to.equal(index + 1);
    }
  });

  it("should raise an error if the caller wallet was not whitelisted", async function () {
    // use the owner wallet which is not whitelisted
    const wallet = owner;

    const proof = tree.getHexProof(keccak256(wallet.address));

    await expect(contract.connect(wallet).preMint(proof)).to.be.revertedWith(
      "Invalid proof."
    );
  });
});
