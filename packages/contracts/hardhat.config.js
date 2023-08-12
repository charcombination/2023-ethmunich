require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "zkEVM_testnet",
  networks: {
    zkEVM_testnet: {
        url: `${process.env.ENDPOINT}`,
        accounts: [process.env.PRIVATE_KEY]
    },
},

};