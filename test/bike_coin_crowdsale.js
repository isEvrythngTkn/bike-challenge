const BikeCoinCrowdsale = artifacts.require("./BikeCoinCrowdsale");
const BikeCoin = artifacts.require("./BikeCoin");

contract('BikeCoinCrowdsale', function(accounts) {
  it("should own the BikeCoin token contract", async () => {
    const crowdSaleInstance = await BikeCoinCrowdsale.deployed();
    const coinInstance = await BikeCoin.deployed();
    const expected = crowdSaleInstance.address;
    const owner = await coinInstance.owner();
    assert.equal(expected, owner);
  });

  it("should give 31415.9 for 1 ETH", async () => {
    const crowdSaleInstance = await BikeCoinCrowdsale.deployed();
    const coinInstance = await BikeCoin.deployed();

    const amount = 1;
    const purchaser = accounts[4];
    const decimals = await coinInstance.decimals();

    await crowdSaleInstance.sendTransaction({ from: purchaser, value: web3.toWei(1, "ether")});
    const balanceInTknBits = await coinInstance.balanceOf(purchaser);
    const balanceInBikeCoin = balanceInTknBits/ Math.pow(10, decimals);
    assert.equal(balanceInBikeCoin, 31415.9, 'The sender didn\'t receive the tokens at the correct rate');
  });
});
