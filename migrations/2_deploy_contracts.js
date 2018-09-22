const Bike = artifacts.require('./Bike.sol');

module.exports = function(deployer, network, accounts) {
  const rentalFee = 3000;
  const rentalTimeInMinutes = 360;
  deployer.deploy(Bike, rentalFee, rentalTimeInMinutes);
};