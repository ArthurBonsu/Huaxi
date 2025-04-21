pragma solidity ^0.8.0;

interface ITokenBTC {
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Functions
    function buyTokens(uint256 numberOfTokens) external payable;
    function tokenPrice() external view returns (uint256);
    function tokensSold() external view returns (uint256);
}