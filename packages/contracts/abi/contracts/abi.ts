//ABI
export const GameItemABI: any[] = [
    {
        "constant": false,
        "inputs": [
            { "name": "player", "type": "address" },
            { "name": "tokenURI", "type": "string" },
            { "name": "imageLink", "type": "string" },
            { "name": "hash", "type": "bytes32" },
            { "name": "floatValue", "type": "string" }
        ],
        "name": "awardItem",
        "outputs": [{ "name": "", "type": "uint256" }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "tokenId", "type": "uint256" }],
        "name": "burn",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "tokenId", "type": "uint256" }],
        "name": "redeem",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "tokenId", "type": "uint256" }],
        "name": "nftData",
        "outputs": [
            { "name": "imageLink", "type": "string" },
            { "name": "floatValue", "type": "string" },
            { "name": "hash", "type": "bytes32" },
            { "name": "initializationDate", "type": "uint256" }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

export default GameItemABI;
