// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract WhitelistSignature is ERC721, Ownable {
  using ECDSA for bytes32;

  string private _prefix;
  uint256 public n;

  constructor(string memory prefix) ERC721("WHITELIST", "WHITE") {
    _prefix = prefix;
  }

  function _hash(address _address) internal view returns (bytes32) {
    return keccak256(abi.encodePacked(_prefix, address(this), _address));
  }

  function _verify(bytes32 hash, bytes memory signature)
    internal
    view
    returns (bool)
  {
    return (_recover(hash, signature) == owner());
  }

  function _recover(bytes32 hash, bytes memory signature)
    internal
    pure
    returns (address)
  {
    return hash.toEthSignedMessageHash().recover(signature);
  }

  function preMint(bytes32 hash, bytes memory signature) public {
    require(_hash(msg.sender) == hash, "Invalid hash.");
    require(_verify(hash, signature), "Invalid signature.");

    // pretending to mint a NFT, just for demo
    n += 1;
  }
}
