import "@nomiclabs/hardhat-waffle"; // Hardhat

// Hardhat plugins
import "hardhat-gas-reporter"; // Gas stats
import "hardhat-abi-exporter"; // ABI exports
import "@nomiclabs/hardhat-solhint"; // Solhint

// Setup env
import * as dotenv from "dotenv";
dotenv.config();

// Fetch environment variables
const ENDPOINT: string = process.env.ENDPOINT ?? "";
const PRIVATE_KEY: string = process.env.PRIVATE_KEY ?? "";

// Export Hardhat params
export default {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      forking: {
        url: ENDPOINT,
        blockNumber: 2026449,
      },
    },
    rinkeby: {
      url: ENDPOINT,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : undefined
    },
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 20,
  },
  abiExporter: {
    path: "./abi",
    clear: true,
  },
};
