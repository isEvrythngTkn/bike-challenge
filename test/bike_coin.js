const BikeCoin = artifacts.require("./BikeCoin");

contract('Bike Coin', function(accounts) {
  it("should have a symbol of BIKE", async () => {
    const expected = "BIKE"; 
    const bikeCoin = await BikeCoin.deployed();
    const symbol = await bikeCoin.symbol();
    assert.equal(expected, symbol);
  });

  it("should have 19 decimals", async () => {
    const expected = 19; 
    const bikeCoin = await BikeCoin.deployed();
    const decimals = await bikeCoin.decimals();
    assert.equal(expected, decimals);
  });

  it("should have 'Bike Coin' for a name", async () => {
    const expected = "Bike Coin"; 
    const bikeCoin = await BikeCoin.deployed();
    const name = await bikeCoin.name();
    assert.equal(expected, name);
  });  
});
