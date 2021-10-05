const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WhitelistSignature", function () {
  const prefix = "AIFA Whitelist Verification:";
  const prefixHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(prefix));

  let wallets;
  let contract;

  beforeEach("setup contract for each test", async function () {
    const factory = await ethers.getContractFactory("WhitelistSignature");
    contract = await factory.deploy(prefix);
    await contract.deployed();

    wallets = await ethers.getSigners();
  });

  it("should allow minting for whitelisted wallets", async function () {
    // popup the owner wallet from other whitelist wallets
    const owner = wallets.shift();

    // verify initial mint status
    expect(await contract.n()).to.equal(0);

    for (const [index, wallet] of wallets.entries()) {
      // generate hash based on prefix + contract address + whitelist wallet address
      const hash = ethers.utils.keccak256(
        prefixHex + contract.address.substr(2) + wallet.address.substr(2)
      );

      // sign the hash with owner wallet
      const message = ethers.utils.arrayify(hash);
      const sig = await owner.signMessage(message);

      // use whitelist wallet to sent the tx
      const tx = await contract.connect(wallet).preMint(hash, sig);
      await tx.wait();

      // verify new mint status
      expect(await contract.n()).to.equal(index + 1);
    }
  });

  it("should raise an error if the caller wallet was not whitelisted", async function () {
    // use the second wallet which is not whitelisted
    const wallet = wallets[1];

    // generate hash based on prefix + contract address + non-whitelist wallet address
    const hash = ethers.utils.keccak256(
      prefixHex + contract.address.substr(2) + wallet.address.substr(2)
    );

    // the wallet is not whitelisted, which means the owner wallet won't generate a signature for it.
    // So it can only sign the hash by itself.
    const message = ethers.utils.arrayify(hash);
    const sig = await wallet.signMessage(message);

    await expect(
      contract.connect(wallet).preMint(hash, sig)
    ).to.be.revertedWith("Invalid signature.");
  });
});
