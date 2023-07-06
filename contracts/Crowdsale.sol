// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
    Token public token;
    uint256 public price;

    event Buy(uint256 amount, address buyer);

    constructor(Token _token, uint256 _price) {
        token = _token;
        price = _price;
    }

    function buyTokens(uint256 _amount) public payable {
        require(msg.value == (_amount / 1e18) * price);
        //address of current smart contract address(this)
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount), "Failed to transfer");

        emit Buy(_amount, msg.sender);
    }
}
