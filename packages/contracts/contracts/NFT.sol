// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721Enumerable, ERC721URIStorage, Ownable {
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

    emit BurnRequestCreated(msg.sender, tokenId, tradeLink);
  }

  function executeBurn(uint256 tokenId) external onlyOwner {
    require(_burnRequests[tokenId].isRequested, "No burn request for this token");

    _burn(tokenId);

    emit BurnRequestExecuted(tokenId);
  }

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);

    // Remove the burn request after burning
    delete _burnRequests[tokenId];
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC721, ERC721Enumerable) returns (bool) {
    // Delegate call to both ERC721 and ERC721Enumerable's supportsInterface
    return super.supportsInterface(interfaceId);
  }

  function tokenURI(
    uint256 tokenId
  ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    // Use the version from ERC721URIStorage
    return super.tokenURI(tokenId);
  }
}
