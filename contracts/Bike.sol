pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './Token.sol';

contract Bike is Ownable {
  address public renter;
  uint public rentalFee;
  uint public rentalTimeInMinutes;
  mapping (address => uint256) public payers;

  event Rent(address renter); // time too

  // events
  // rented
  // returned
  // transferedCredits

  // need to check if the bike's time limit has expired
  // modifier to only rent if its not already renter (isAvailable)

  modifier isRenter() {
    require(msg.sender == renter, "Sender is not the current renter");
    _;
  }

  constructor(uint _rentalFee, uint _rentalTimeInMinutes) {
    rentalFee = _rentalFee;
    rentalTimeInMinutes = _rentalTimeInMinutes;
  }

  function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public {
    Token t = Token(_token);
    require(t.transferFrom(_from,  this, _value));
    payers[_from] += _value;
    // rent them the bike
  }

  // temporary
  function rent() public {
    renter = msg.sender;
    emit Rent(msg.sender);
  }

  function transferBike(address newRenter) public isRenter {
    renter = newRenter;
  }
}