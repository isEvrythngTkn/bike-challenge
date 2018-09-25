const HDWalletProvider = require("truffle-hdwallet-provider");
// storing mnemonic in here because it is only for demo purposes.
const mnemonic = "pattern warm innocent lumber ugly gap farm behave gossip thought already budget";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/5e1f58ca62fb483cb12de916d30fd8e7")
      },
      network_id: 3
    }
  }
};
