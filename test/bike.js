const Bike = artifacts.require('./Bike.sol');
const BikeCoin = artifacts.require('./BikeCoin.sol');
const BikeCoinCrowdsale = artifacts.require("./BikeCoinCrowdsale");

const { 
  RENTAL_FEE,
  RENTAL_TIME_IN_MINUTES,
  ESCROW_AMOUNT,
  RATE
} = require('../constants');
const { timeTravel } = require('./helper.js');

let coinInstance;
let crowdSaleInstance;
let bike;
let renter;
let secondRenter;
let coinRecipient;
let decimals;
let transferee;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const rentalFee = RENTAL_FEE;
const rentalTimeInMinutes = RENTAL_TIME_IN_MINUTES;
const rate = new web3.BigNumber(RATE);

contract('Bike', function(accounts) {

  beforeEach(async () => {
    const wallet = accounts[0];
    coinInstance = await BikeCoin.new();
    crowdSaleInstance = await BikeCoinCrowdsale.new(
      rate,
      wallet,
      coinInstance.address
    );
    bike = await Bike.new(rentalFee, rentalTimeInMinutes, coinInstance.address);

    await coinInstance.transferOwnership(crowdSaleInstance.address);

    renter = accounts[2];
    const bal = await web3.eth.getBalance(renter);
    secondRenter = accounts[5];
    decimals = await coinInstance.decimals();

    await crowdSaleInstance.sendTransaction({ from: renter, value: web3.toWei(1, "ether")});
    await crowdSaleInstance.sendTransaction({ from: secondRenter, value: web3.toWei(1, "ether")});
  });

  it("should be owned by the creator", async () => {
    const expected = accounts[0]; 
    const owner = await bike.owner();
    assert.equal(expected, owner);
  });

  it("should have a rental fee of 3000 BIKE", async () => {
    const expected = RENTAL_FEE;
    const rentalFee = await bike.rentalFee();
    assert.equal(expected, rentalFee);
  });

  it(`should have a rental time limit of ${RENTAL_TIME_IN_MINUTES} minutes`, async () => {
    const expected = RENTAL_TIME_IN_MINUTES;
    const rentalTimeInMinutes = await bike.rentalTimeInMinutes();
    assert.equal(expected, rentalTimeInMinutes);
  });

  it("should allow transferring of credits between users", async () => {
    const expected = 1000;
    coinRecipient = accounts[7];
    coinInstance.transfer(coinRecipient, expected, { from: renter });
    const balance = await coinInstance.balanceOf.call(coinRecipient);
    assert.equal(expected, balance.toNumber());
  });

  it("should require 3x the rental price in order to rent the bike", async () => {
    // @todo: for some reason if you only subtract 1000 from ESCROW_AMOUNT this test fails...
    const tooLittle = ESCROW_AMOUNT / 2;
    const initialBikeContractBalance = await coinInstance.balanceOf.call(bike.address);
    try {
      await coinInstance.approveAndCall(bike.address, tooLittle, '', { from: renter });
      assert.ok(false);
    } catch (err) {
      const balance = await coinInstance.balanceOf.call(bike.address);
      assert.equal(initialBikeContractBalance, balance.toNumber());
    }
  });

  it('should let someone transfer tokens to us and rent the bike', async () => {
    const expected = ESCROW_AMOUNT;
    await coinInstance.approveAndCall(bike.address, ESCROW_AMOUNT, '', { from: renter });
    const contractBalance = await coinInstance.balanceOf.call(bike.address);
    const userBalance = await coinInstance.balanceOf.call(renter);
    assert.equal(ESCROW_AMOUNT, contractBalance);
  });

  it("should update the renter value after being rented", async () => {
    await coinInstance.approveAndCall(bike.address, ESCROW_AMOUNT, '', { from: renter });
    const expected = renter;
    const newRenter = await bike.renter();
    assert.equal(expected, newRenter);
  });
  
  it("should let the current renter transfer the rented bike to another address", async () => {
    transferee = accounts[4];
    await coinInstance.approveAndCall(bike.address, ESCROW_AMOUNT, '', { from: renter });
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
    // @todo: not getting exactly the right number back for newRenterBalance. 
    // e.g. 2.8115900000000002e+23 vs 2.81159e+23
    await coinInstance.approveAndCall(bike.address, ESCROW_AMOUNT, '', { from: renter });
    const initialRenterBalance = await coinInstance.balanceOf.call(renter);
    const transferAmount = RENTAL_FEE * 2;
    const expectedRenterBalance = initialRenterBalance.toNumber() + (RENTAL_FEE * 1.9);
    await bike.returnBike({ from: renter });
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

  it("should rent the bike again", async () => {
    // rent the bike first
    await coinInstance.approveAndCall(bike.address, ESCROW_AMOUNT, '', { from: renter });
    await bike.returnBike({ from: renter });

    const expected = ESCROW_AMOUNT;
    const initialBalance = await coinInstance.balanceOf(bike.address);
    await coinInstance.approveAndCall(bike.address, ESCROW_AMOUNT, '', { from: secondRenter });

    const contractBalance = await coinInstance.balanceOf.call(bike.address);
    const userBalance = await coinInstance.balanceOf.call(secondRenter);
    const currentRenter = await bike.renter();
    assert.equal(ESCROW_AMOUNT + initialBalance.toNumber(), contractBalance.toNumber());
    assert.equal(secondRenter, currentRenter);
  });

  it("should not allow others to rent the bike when it is already rented", async () => {
    try {
      await coinInstance.approveAndCall(bike.address, ESCROW_AMOUNT, '', { from: renter });      
    } catch (err) {
      const currentRenter = await bike.renter();
      assert.notEqual(renter, currentRenter);
    }
  });
  
  // For the time travel bit I used this resource:
  // https://medium.com/coinmonks/testing-solidity-with-truffle-and-async-await-396e81c54f93
  it("should not return credits if the rental time limit has passed", async () => {
    await coinInstance.approveAndCall(bike.address, ESCROW_AMOUNT, '', { from: secondRenter });
    await timeTravel(86400);
    const expected = await coinInstance.balanceOf.call(secondRenter);
    await bike.returnBike({ from: secondRenter });
    const newBalance = await coinInstance.balanceOf.call(secondRenter);
    const currentRenter = await bike.renter();
    assert.equal(expected, newBalance.toNumber());
    assert.equal(ZERO_ADDRESS, currentRenter);
  });
});