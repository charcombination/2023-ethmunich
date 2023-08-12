// NFTMint.sol
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract GameItem is ERC721 {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _tokenIds;

    // Struct to hold NFT data
    struct NFTData {
        string imageLink;
        string floatValue; // Float value saved as string
        bytes32 hash;
        uint256 initializationDate;
    }

    mapping(uint256 => NFTData) public nftData;

    constructor() public ERC721("GameItem", "ITM") {}

    function awardItem(
        address player,
        string memory tokenURI,
        string memory imageLink,
        bytes32 hash,
        string memory floatValue
    ) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);

        nftData[newItemId] = NFTData({
            imageLink: imageLink,
            floatValue: floatValue,
            hash: hash,
            initializationDate: now // Current timestamp
        });

        return newItemId;
    }

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        _burn(tokenId);
        delete nftData[tokenId];
    }

    function redeem(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        require(now >= nftData[tokenId].initializationDate.add(7 days), "Redemption available after 7 days of initialization only");

        // Implement redeem logic here

        _burn(tokenId);  // Optionally burn the NFT after redemption
        delete nftData[tokenId];
    }
}