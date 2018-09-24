pragma solidity ^0.4.24;

interface Token { 
  function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
  function transfer(address to, uint tokens) external returns (bool success);
}