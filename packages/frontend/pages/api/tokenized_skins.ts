import { parseEther, NFTRPC } from "@utils/ethers"; // RPC
import { TokenizedSkin } from "@utils/types";

// Types
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Collects data about all loans
 * @returns {Promise<LoanWithMetadata[]>}
 */
async function collectAllNFTs(address: String): Promise<TokenizedSkin[]> {
    const balance = await NFTRPC.balanceOf(address);
    const tokenized_skin_nfts = [];

    for (let i = 0; i < balance.toNumber(); i++) {
      const tokenId = await NFTRPC.tokenOfOwnerByIndex(address, i);

      const nft: TokenizedSkin = {
        tokenId: tokenId.toNumber(),
      };

      tokenized_skin_nfts.push(nft);
    }

    return tokenized_skin_nfts;
}

// Return loan data
const tokenized_skins = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.body;
  res.send(await collectAllNFTs(address));
};

export default tokenized_skins;