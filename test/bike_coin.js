const BikeCoin = artifacts.require("./BikeCoin");

let bikeCoin;

contract('Bike Coin', function(accounts) {
  before(async () => {
    bikeCoin = await BikeCoin.deployed();
  });

  it("should have a symbol of BIKE", async () => {
    const expected = "BIKE"; 
    const symbol = await bikeCoin.symbol();
    assert.equal(expected, symbol);
  });

  it("should have 19 decimals", async () => {
    const expected = 19; 
    const decimals = await bikeCoin.decimals();
    assert.equal(expected, decimals);
  });

  it("should have 'Bike Coin' for a name", async () => {
    const expected = "Bike Coin"; 
    const name = await bikeCoin.name();
    assert.equal(expected, name);
  });  
});
