const Bike = artifacts.require('./Bike.sol');

//const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('Bike', function(accounts) {
  it("should be owned by the creator", async () => {
    const expected = accounts[0]; 
    const bike = await Bike.deployed();
    const owner = await bike.owner();
    assert.equal(expected, owner);
  });

  it("should have a rental fee of 3000 BIKE", async () => {
    const expected = 3000;
    const bike = await Bike.deployed();
    const rentalFee = await bike.rentalFee();
    assert.equal(expected, rentalFee);
  });

  it("should have a rental time limit of 360 minutes", async () => {
    const expected = 360;
    const bike = await Bike.deployed();
    const rentalTimeInMinutes = await bike.rentalTimeInMinutes();
    assert.equal(expected, rentalTimeInMinutes);
  });

  it("should update the renter value after being rented", async () => {
    const expected = accounts[0];
    const bike = await Bike.deployed();
    await bike.rent({ from: expected });
    const newRenter = await bike.renter();
    assert.equal(expected, newRenter);
  })
  
  it("should let the current renter transfer the rented bike to another address", async () => {
    const firstRenter = accounts[0];
    const expected = accounts[1];
    const bike = await Bike.deployed();
    await bike.rent({ from: firstRenter });
    await bike.transferBike(expected, { from: firstRenter });
    const newRenter = await bike.renter();
    assert.equal(expected, newRenter);
  });

  // it should not allow others to rent the bike when it is already rented

  // it should require 3x the rental price in order to rent the bike

  // it should put the deposit in escrow

  // it should return the deposit if returned within the time limit

  // it should allow credits to be transferred between accounts

  // it should burn or withhold the escrowed credits if the time limit is surpassed
});
