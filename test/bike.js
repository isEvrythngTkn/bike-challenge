const Bike = artifacts.require('./Bike.sol');
const BikeCoin = artifacts.require('./BikeCoin.sol');
const BikeCoinCrowdsale = artifacts.require("./BikeCoinCrowdsale");

const { 
  RENTAL_FEE,
  RENTAL_TIME_IN_MINUTES 
} = require('../constants');

//const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('Bike', function(accounts) {
  it("should be owned by the creator", async () => {
    const expected = accounts[0]; 
    const bike = await Bike.deployed();
    const owner = await bike.owner();
    assert.equal(expected, owner);
  });

  it("should have a rental fee of 3000 BIKE", async () => {
    const expected = RENTAL_FEE;
    const bike = await Bike.deployed();
    const rentalFee = await bike.rentalFee();
    assert.equal(expected, rentalFee);
  });

  it(`should have a rental time limit of ${RENTAL_TIME_IN_MINUTES} minutes`, async () => {
    const expected = RENTAL_TIME_IN_MINUTES;
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

  it('should let the renter transfer tokens to us', async () => {
    // get the coins
    const crowdSaleInstance = await BikeCoinCrowdsale.deployed();
    const coinInstance = await BikeCoin.deployed();
    const bike = await Bike.deployed();

    const renter = accounts[2];
    const decimals = await coinInstance.decimals();
    await crowdSaleInstance.sendTransaction({ from: renter, value: web3.toWei(1, "ether")});

    // spend them coins
    const expected = RENTAL_FEE;
    await coinInstance.approveAndCall(bike.address, RENTAL_FEE, 'extra', { from: renter });

    const contractBalance = await coinInstance.balanceOf.call(bike.address);
    const balance = await bike.payers.call(renter);
    assert.equal(RENTAL_FEE, balance.toNumber());
    assert.equal(RENTAL_FEE, contractBalance);
  });

  // it should not allow others to rent the bike when it is already rented

  // it should require 3x the rental price in order to rent the bike

  // it should put the deposit in escrow

  // it should return the deposit if returned within the time limit

  // it should allow credits to be transferred between accounts

  // it should burn or withhold the escrowed credits if the time limit is surpassed
});


















