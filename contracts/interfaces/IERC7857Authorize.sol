// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC7857Authorize {
    event UsageAuthorized(uint256 indexed tokenId, address indexed user);
    event UsageRevoked(uint256 indexed tokenId, address indexed user);

    function authorizeUsage(uint256 tokenId, address user) external;
    function revokeAuthorization(uint256 tokenId, address user) external;
    function isAuthorizedUser(uint256 tokenId, address user) external view returns (bool);
    function authorizedUsersOf(uint256 tokenId) external view returns (address[] memory);
    function authorizedTokensOf(address user) external view returns (uint256[] memory);
}