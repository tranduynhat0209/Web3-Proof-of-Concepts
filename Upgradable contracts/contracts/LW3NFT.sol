// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract LW3NFT is Initializable, ERC721Upgradable, UUPSUpgradable, OwnableUpgradable{
    function initialize() public initializer{
        __ERC721_init("LW3NFT", "LW3NFT");
        __Ownable_init();
        _mint(msg.sender, 1);
    }

    function _authorizeUpgrade(address newImplementation) interal override onlyOwner{}
}

contract LW3NFT2 is LW3NFT {
    function test() public pure returns (string memory) {
        return "upgraded";
    }
}