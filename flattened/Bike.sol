pragma solidity ^0.4.13;

interface Token { 
  function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
  function transfer(address to, uint tokens) external returns (bool success);
}

contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

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

