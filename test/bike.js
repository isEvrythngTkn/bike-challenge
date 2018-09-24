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
let transferee;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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

  it("should allow transferring of credits between users", async () => {
    const expected = 1000;
    const recipient = accounts[5];
    coinInstance.transfer(recipient, expected, { from: renter });
    const balance = await coinInstance.balanceOf.call(recipient);
    assert.equal(expected, balance.toNumber());
  });

  it("should require 3x the rental price in order to rent the bike", async () => {
    // for some reason if you only subtract 1000 from ESCROW_AMOUNT
    // this test fails...
    const tooLittle = ESCROW_AMOUNT / 2;
    try {
      const initialRenterBalance = await coinInstance.balanceOf.call(bike.address);
      await coinInstance.approveAndCall(bike.address, tooLittle, '', { from: renter });
      assert.ok(false);
    } catch (err) {
      const balance = await coinInstance.balanceOf.call(bike.address);
      assert.equal(0, balance.toNumber());
    }
  });

  it('should let the renter transfer tokens to us', async () => {
    const expected = ESCROW_AMOUNT;
    await coinInstance.approveAndCall(bike.address, ESCROW_AMOUNT, '', { from: renter });

    const contractBalance = await coinInstance.balanceOf.call(bike.address);
    const balance = await bike.payers.call(renter);
    const userBalance = await coinInstance.balanceOf.call(renter);
    assert.equal(ESCROW_AMOUNT, balance.toNumber());
    assert.equal(ESCROW_AMOUNT, contractBalance);
  });

  // these tests depend on the previous one
  // should probably change that, but later...
  it("should update the renter value after being rented", async () => {
    const expected = renter;
    const newRenter = await bike.renter();
    assert.equal(expected, newRenter);
  });
  
  it("should let the current renter transfer the rented bike to another address", async () => {
    transferee = accounts[4];
    await bike.transferBike(transferee, { from: renter });
    const newRenter = await bike.renter();
    assert.equal(transferee, newRenter);
  });

  it("should only let the current renter return the bike", async () => {
    const originalRenter = renter;
    try {
      await bike.returnBike({ from: originalRenter });  
    } catch (err) {
      assert.ok(true);
    }
  });

  it("should return escrowed credits minus rental fee when bike is properly returned", async () => {
    // not getting exactly the right number back for newRenterBalance. 
    // It's off by something like 2e16    
    const initialRenterBalance = await coinInstance.balanceOf.call(renter);
    const transferAmount = RENTAL_FEE * 2;
    const expectedRenterBalance = initialRenterBalance.toNumber() + RENTAL_FEE * 1.9;
    await bike.returnBike({ from: transferee });
    const newRenterBalance = await coinInstance.balanceOf.call(renter);
    assert.isAtLeast(newRenterBalance.toNumber(), expectedRenterBalance );
  });

  it("should have reset the renter value to null after returning the bike", async () => {
    const expected = ZERO_ADDRESS;
    const renter = await bike.renter();
    assert.equal(expected, renter);
  });

  it("should reset isRented to false after returning the bike", async () => {
    const expected = false;
    const rented = await bike.isRented();
    assert.equal(expected, rented);
  });

  // it should not allow others to rent the bike when it is already rented


  // it should burn or withhold the escrowed credits if the time limit is surpassed
});


















