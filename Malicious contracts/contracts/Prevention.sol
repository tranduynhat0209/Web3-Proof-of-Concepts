// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Helper.sol";

contract Prevention {
    Helper helper;

    constructor() payable {
        helper = new Helper();
    }

    function isUserEligible() public view returns (bool) {
        return helper.isUserEligible(msg.sender);
    }

    function addUserToList() public {
        helper.setUserEligible(msg.sender);
    }

    fallback() external {}
}
