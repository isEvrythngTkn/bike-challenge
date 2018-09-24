pragma solidity ^0.4.24;

import '../node_modules/openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import './TokenRecipient.sol';

contract BikeCoin is MintableToken {
  string public name = "Bike Coin";
  string public symbol = "BIKE";
  uint8 public decimals = 19;

  function approveAndCall(address _spender, uint256 _value, bytes _extraData) public returns (bool success) {
    TokenRecipient spender = TokenRecipient(_spender);
    if (approve(_spender, _value)) {
      spender.receiveApproval(msg.sender, _value, this, _extraData);
      return true;
    }
  }
}
