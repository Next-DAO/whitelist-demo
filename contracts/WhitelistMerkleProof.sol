// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract WhitelistMerkleProof is ERC721, Ownable {
  bytes32 private _root;
  uint256 public n;

  constructor(bytes32 root) ERC721("WHITELIST", "WHITE") {
    _root = root;
  }

  function preMint(bytes32[] memory proof) public {
    require(
      MerkleProof.verify(proof, _root, keccak256(abi.encodePacked(msg.sender))),
      "Invalid proof."
    );

    // pretending to mint a NFT, just for demo
    n += 1;
  }
}
