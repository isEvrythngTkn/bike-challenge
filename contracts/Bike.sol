pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './Token.sol';

contract Bike is Ownable {
  uint public rentalFee;
  uint public rentalTimeInMinutes;
  address public tokenContract;
  address public renter;
  address public payee;
  bool public isRented;
  uint public rentalExpiryTime;

  event Rented(address renter); // time too
  event Returned(address renter, uint rentalExpiryTime, uint currentTime, uint amount);

  // need to check if the bike's time limit has expired

  modifier isRenter() {
    require(msg.sender == renter, "Sender is not the current renter");
    _;
  }

  modifier bikeIsRented() {
    require(isRented);
    _;
  }

  modifier bikeIsAvailable() {
    require(!isRented);
    _;
  }

  constructor(uint _rentalFee, uint _rentalTimeInMinutes, address _tokenContract) {
    rentalFee = _rentalFee;
    rentalTimeInMinutes = _rentalTimeInMinutes;
    tokenContract = _tokenContract;
  }

  function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public {
    Token t = Token(_token);
    require(_value == (rentalFee * 3));
    require(t.transferFrom(_from,  this, _value));
    _rent(_from);
  }

  function _rent(address _renter) internal bikeIsAvailable {
    // require that the bike is available to be rented
    renter = _renter;
    payee = _renter;
    isRented = true;
    rentalExpiryTime = now + rentalTimeInMinutes * 60;
    emit Rented(msg.sender);
  }

  function returnBike() public isRenter bikeIsRented {
    // if time has elapsed, don't refund their escrow
    Token t = Token(tokenContract);
    uint256 amount = rentalFee * 2;
    if (now <= rentalExpiryTime) {
      require(t.transfer(payee, amount));  
    }
    emit Returned(renter, rentalExpiryTime, now, amount);
    renter = address(0);
    isRented = false;
    payee = address(0);
    rentalExpiryTime = 0;
  }

  function transferBike(address newRenter) public isRenter bikeIsRented {
    // require that the bike rental time has not elapsed
    renter = newRenter;
  }
}


















