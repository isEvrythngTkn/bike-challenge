const BikeCoinCrowdsale = artifacts.require('./BikeCoinCrowdsale.sol');
const BikeCoin = artifacts.require('./BikeCoin.sol');
const Bike = artifacts.require('./Bike.sol');

const { 
  RENTAL_FEE,
  RENTAL_TIME_IN_MINUTES
} = require('../constants');

module.exports = function(deployer, network, accounts) {
  const rentalFee = RENTAL_FEE;
  const rentalTimeInMinutes = RENTAL_TIME_IN_MINUTES;
  const rate = new web3.BigNumber(314159);
  const wallet = accounts[1];

  return deployer
    .then(() => {
      deployer.deploy(Bike, rentalFee, rentalTimeInMinutes);
    })
    .then(() => {
      return deployer.deploy(BikeCoin);
    })
    .then(() => {
      return deployer.deploy(
        BikeCoinCrowdsale,
        rate,
        wallet,
        BikeCoin.address
      );
    })
    .then(() => {
      bikeCoinInstance = BikeCoin.at(BikeCoin.address);
      bikeCoinInstance.transferOwnership(BikeCoinCrowdsale.address);
    });
};