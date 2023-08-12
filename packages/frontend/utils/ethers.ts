import { ethers } from "ethers"; // Ethers
import { PawnBankABI } from "@utils/abi/PawnBank"; // Pawn Bank ABI
import { NFTABI } from "@utils/abi/NFTABI"; // Pawn Bank ABI

// Constant: Pawn Bank deployed address
export const PAWN_BANK_ADDRESS: string =
  process.env.PAWN_BANK_ADDRESS ?? "0x5ff72172fBa7d68a2A702f05ccF965aD4cdFd561";

export const NFT_ADDRESS: string = process.env.NFT_ADDRESS ?? "default";

export const NFTRPC = null;

// export const NFTRPC = new ethers.Contract(
//   NFT_ADDRESS,
//   NFTABI,
//   new ethers.providers.JsonRpcProvider(
//     `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_RPC}`,
//     5
//   )
// )

// Export PawnBank contract w/ RPC
export const PawnBankRPC = new ethers.Contract(
  PAWN_BANK_ADDRESS,
  PawnBankABI,
  new ethers.providers.JsonRpcProvider(
    `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_RPC}`,
    5
  )
);

/**
 * Converts BigNumber Ether value to number
 * @param {ethers.BigNumber} num bignumber ether value
 * @returns {number} formatted ether as number
 */
export function parseEther(num: ethers.BigNumber): number {
  return Number(ethers.utils.formatEther(num.toString()));
}
