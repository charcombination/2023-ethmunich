// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Metadata.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721Enumerable, Ownable, ERC721Metadata {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;

  // Structure to keep track of burn requests
  struct BurnRequest {
    bool isRequested;
    string tradeLink;
    uint256 mintedAt;
  }

  // Mapping from token ID to BurnRequest
  mapping(uint256 => BurnRequest) private _burnRequests;

  event BurnRequestCreated(address indexed owner, uint256 indexed tokenId, string tradeLink);
  event BurnRequestExecuted(uint256 indexed tokenId);

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function mint(address to, string memory _tokenURI) external onlyOwner {
    _tokenIdCounter.increment();
    uint256 newTokenId = _tokenIdCounter.current();
    _safeMint(to, newTokenId);

    // Set token URI for the newly minted token
    _setTokenURI(newTokenId, _tokenURI);

    // Mark the minting time
    _burnRequests[newTokenId].mintedAt = block.timestamp;
  }

  function requestBurn(uint256 tokenId, string memory tradeLink) external {
    require(ownerOf(tokenId) == msg.sender, "Only the owner can request burn");
    require(!_burnRequests[tokenId].isRequested, "Burn request already exists");
    require(
      block.timestamp >= _burnRequests[tokenId].mintedAt + 7 days,
      "Cannot request burn before 7 days of minting"
    );

    _burnRequests[tokenId].isRequested = true;
    _burnRequests[tokenId].tradeLink = tradeLink;

    // Notify the contract owner using the Push Protocol. This is an abstract call,
    // replace `notifyOwner` with actual implementation.
    notifyOwner(msg.sender, tokenId, tradeLink);

    emit BurnRequestCreated(msg.sender, tokenId, tradeLink);
  }

  function executeBurn(uint256 tokenId) external onlyOwner {
    require(_burnRequests[tokenId].isRequested, "No burn request for this token");

    _burn(tokenId);

    emit BurnRequestExecuted(tokenId);
  }

  function _burn(uint256 tokenId) internal override {
    super._burn(tokenId);

    // Remove the burn request after burning
    delete _burnRequests[tokenId];
  }
}
