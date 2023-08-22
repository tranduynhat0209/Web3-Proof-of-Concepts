// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Whitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    uint256 public constant PRICE = 0.01 ether;

    uint256 public constant maxTokenIds = 20;

    Whitelist whitelist;

    uint256 public reservedTokens;
    uint256 public reservedTokensClaimed = 0;

    constructor(address _whitelistAddress) ERC721("CryptoDevs", "DEV") {
        whitelist = Whitelist(_whitelistAddress);
        reservedTokens = whitelist.maxWhitelistedAddresses();
    }

    function mint() external payable {
        require(
            totalSupply() + reservedTokens - reservedTokensClaimed <
                maxTokenIds,
            "Max supply is exceeded"
        );

        if (whitelist.whitelistedAddresses(msg.sender)) {
            require(balanceOf(msg.sender) == 0, "Already owned");
            reservedTokensClaimed++;
        } else {
            require(msg.value >= PRICE, "Not enough ether to pay");
        }
        uint256 tokenId = totalSupply();
        _safeMint(msg.sender, tokenId);
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "failed to transfer ether");
    }
}
