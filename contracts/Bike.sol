pragma solidity ^0.4.18;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract Bike is Ownable {
  address public renter;
  uint public rentalFee;
  uint public rentalTimeInMinutes;

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

  // temporary
  function rent() public {
    renter = msg.sender;
    emit Rent(msg.sender);
  }

  function transferBike(address newRenter) public isRenter {
    renter = newRenter;
  }
}
