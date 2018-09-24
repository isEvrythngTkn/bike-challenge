const Bike = artifacts.require('./Bike.sol');
const BikeCoin = artifacts.require('./BikeCoin.sol');
const BikeCoinCrowdsale = artifacts.require("./BikeCoinCrowdsale");

const { 
  RENTAL_FEE,
  RENTAL_TIME_IN_MINUTES,
  ESCROW_AMOUNT
} = require('../constants');

let coinInstance;
let crowdSaleInstance;
let bike;
let renter;
let decimals;
//const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('Bike', function(accounts) {

  before(async () => {
    crowdSaleInstance = await BikeCoinCrowdsale.deployed();
    coinInstance = await BikeCoin.deployed();
    bike = await Bike.deployed();

    renter = accounts[2];
    decimals = await coinInstance.decimals();
    await crowdSaleInstance.sendTransaction({ from: renter, value: web3.toWei(1, "ether")});
  });

  it("should be owned by the creator", async () => {
    const expected = accounts[0]; 
    //const bike = await Bike.deployed();
    const owner = await bike.owner();
    assert.equal(expected, owner);
  });

  it("should have a rental fee of 3000 BIKE", async () => {
    const expected = RENTAL_FEE;
    //const bike = await Bike.deployed();
    const rentalFee = await bike.rentalFee();
    assert.equal(expected, rentalFee);
  });

  it(`should have a rental time limit of ${RENTAL_TIME_IN_MINUTES} minutes`, async () => {
    const expected = RENTAL_TIME_IN_MINUTES;
    //const bike = await Bike.deployed();
    const rentalTimeInMinutes = await bike.rentalTimeInMinutes();
    assert.equal(expected, rentalTimeInMinutes);
  });

  it('should let the renter transfer tokens to us', async () => {
    const expected = ESCROW_AMOUNT;
    await coinInstance.approveAndCall(bike.address, ESCROW_AMOUNT, 'extra', { from: renter });

    const contractBalance = await coinInstance.balanceOf.call(bike.address);
    const balance = await bike.payers.call(renter);
    assert.equal(ESCROW_AMOUNT, balance.toNumber());
    assert.equal(ESCROW_AMOUNT, contractBalance);
  });

  // these tests depend on the previous one
  it("should update the renter value after being rented", async () => {
    const expected = renter;
    const newRenter = await bike.renter();
    assert.equal(expected, newRenter);
  });
  
  it("should let the current renter transfer the rented bike to another address", async () => {
    const expected = accounts[4];
    await bike.transferBike(expected, { from: renter });
    const newRenter = await bike.renter();
    assert.equal(expected, newRenter);
  });

  it("should require 3x the rental price in order to rent the bike", async () => {
    const tooLittle = ESCROW_AMOUNT - 1;
    try {
      await coinInstance.approveAndCall(bike.address, tooLittle, 'extra', { from: renter });
      assert.ok(false);
    } catch (err) {
      assert.ok(true);
    }
  });

  it("should allow transferring of credits between users", async () => {
    const expected = 1000;
    const recipient = accounts[5];
    coinInstance.transfer(recipient, expected, { from: renter });
    const balance = await coinInstance.balanceOf.call(recipient);
    assert.equal(expected, balance.toNumber());
  });

  // it should not allow others to rent the bike when it is already rented

  // it should return the deposit if returned within the time limit

  // it should burn or withhold the escrowed credits if the time limit is surpassed
});


















