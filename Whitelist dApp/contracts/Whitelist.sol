// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Whitelist{
    uint8 public maxWhitelistedAddresses;

    mapping(address => bool) public whitelistedAddresses;

    uint8 public numAddressesWhitelisted;

    constructor(uint8 _maxWhitelistedAddresses){
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    function addressToWhitelist() public{
        require(!whitelistedAddresses[msg.sender], "Sender has already been released");

        require(numAddressesWhitelisted < maxWhitelistedAddresses, "Maximum number of whitelisted addresses reached");

        whitelistedAddresses[msg.sender] = true;
        numAddressesWhitelisted++;
    }
}