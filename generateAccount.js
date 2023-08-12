const { Wallet } = require("ethers");

// Create a new random account
const wallet = Wallet.createRandom();

console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
