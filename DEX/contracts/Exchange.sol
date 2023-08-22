// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public tokenAddress;

    constructor(address _token) ERC20("ETH-TKN LP Token", "lpETHTKN") {
        require(_token != address(0), "Token address passed is null");
        tokenAddress = _token;
    }

    function getReserve() public view returns (uint256) {
        return ERC20(tokenAddress).balanceOf(address(this));
    }

    function addLiquidity(
        uint256 amountOfToken
    ) public payable returns (uint256) {
        uint256 lpTokensToMint;
        uint256 ethReserve = address(this).balance;
        uint256 tokenReserve = getReserve();

        ERC20 token = ERC20(tokenAddress);

        if (tokenReserve == 0) {
            token.transferFrom(msg.sender, address(this), amountOfToken);

            lpTokensToMint = ethReserve;

            _mint(msg.sender, lpTokensToMint);

            return lpTokensToMint;
        } else {
            uint256 previousEthReserve = ethReserve - msg.value;
            uint256 actualTokenAmount = (tokenReserve * msg.value) /
                previousEthReserve;
            require(
                amountOfToken >= actualTokenAmount,
                "Insufficient amount of tokens provided"
            );
            token.transferFrom(msg.sender, address(this), actualTokenAmount);

            lpTokensToMint = (totalSupply() * msg.value) / previousEthReserve;

            _mint(msg.sender, lpTokensToMint);

            return lpTokensToMint;
        }
    }

    function removeLiquidity(uint256 amountOfLPTokens) public returns(uint256, uint256) {
        require(amountOfLPTokens > 0, "withdrawn amount must be greater than 0");

        uint256 ethReserve = address(this).balance;
        uint256 tokenReserve = getReserve();
        uint256 totalLpSupply = totalSupply();

        uint256 ethToReturn = (amountOfLPTokens * ethReserve) / totalLpSupply;
        uint256 tokenToReturn = (amountOfLPTokens * tokenReserve) / totalLpSupply;

        _burn(msg.sender, amountOfLPTokens);
        payable(msg.sender).transfer(ethToReturn);
        ERC20(tokenAddress).transfer(msg.sender, tokenToReturn);

        return (ethToReturn, tokenToReturn); 

    }

    function getOutputAmountFromSwap(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns(uint256){
        require(inputReserve > 0 && outputReserve > 0, "Reserves are empty");
        uint256 inputAmountWithFee = inputAmount * 99;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    function ethToTokenSwap(uint256 minTokensToReceive) public payable{
        uint256 tokenReserve = getReserve();
        uint256 tokensToReceive = getOutputAmountFromSwap(msg.value, address(this).balance - msg.value, tokenReserve);
        require(tokensToReceive >= minTokensToReceive, "Tokens received are less than minimum tokens expected");

        ERC20(tokenAddress).transfer(msg.sender, tokensToReceive);
    }

        function tokenToEthSwap(uint256 tokenToSwap, uint256 minEthToReceive) public{
        uint256 tokenReserve = getReserve();
        uint256 ethToReceive = getOutputAmountFromSwap(tokenToSwap, tokenReserve, address(this).balance);
        require(ethToReceive >= minEthToReceive, "ETH received are less than minimum ETH expected");

        ERC20(tokenAddress).transferFrom(msg.sender, address(this), tokenToSwap);
        payable(msg.sender).transfer(ethToReceive);
    }
}
