pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './Token.sol';

contract Bike is Ownable {
  address public renter;
  address public payee;
  uint public rentalFee;
  uint public rentalTimeInMinutes;
  mapping (address => uint256) public payers;
  bool public isRented;
  address public tokenContract;
  uint public rentalExpiryTime;

  event Rent(address renter); // time too
  event Returned(address renter, uint rentalExpiryTime, uint currentTime, uint amount);

  // events
  // need to check if the bike's time limit has expired
  // modifier to only rent if its not already renter (isAvailable)

  modifier isRenter() {
    require(msg.sender == renter, "Sender is not the current renter");
    _;
  }

  modifier bikeIsRented() {
    require(isRented);
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
    payers[_from] += _value;
    _rent(_from);
  }

  function _rent(address _renter) internal {
    // require that the bike is available to be rented
    renter = _renter;
    payee = _renter;
    isRented = true;
    rentalExpiryTime = now + rentalTimeInMinutes * 60;
    emit Rent(msg.sender);
  }

  function returnBike() public isRenter bikeIsRented {
    // if time has elapsed, don't refund their escrow
    Token t = Token(tokenContract);
    uint256 amount = rentalFee * 2;
    require(t.transfer(payee, amount));
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


















