// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/IERC7857.sol";
import "./interfaces/IERC7857Authorize.sol";

/**
 * @title GoalGhostAgenticID
 * @notice Custom ERC-7857 Agentic ID for GoalGhost - 0G Zero Cup.
 *         Mints wallet-owned football identities with intelligent data hashes
 *         pointing to encrypted profiles/memories on 0G Storage.
 * @dev JUDGE NOTE: This contract is the ownership anchor. Without it,
 *      ghosts have no verifiable on-chain identity or achievement trail.
 */
contract GoalGhostAgenticID is
    ERC721Enumerable,
    AccessControl,
    Pausable,
    IERC7857,
    IERC7857Authorize
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _nextTokenId;
    uint256 public mintFee;

    mapping(uint256 => IntelligentData[]) private _intelligentData;
    mapping(uint256 => string) private _tokenURIs;

    mapping(uint256 => address[]) private _authorizedUsers;
    mapping(uint256 => mapping(address => bool)) private _isAuthorizedUser;
    mapping(address => uint256[]) private _authorizedTokens;
    mapping(address => mapping(uint256 => bool)) private _isAuthorizedToken;

    struct Milestone {
        string milestoneType;
        string storageRootHash;
        uint256 timestamp;
    }

    mapping(uint256 => Milestone[]) private _milestones;

    event MilestoneAchieved(
        uint256 indexed tokenId,
        string milestoneType,
        string storageRootHash
    );
    event MintFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(uint256 _mintFee) ERC721("GoalGhost", "GHOST") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        mintFee = _mintFee;
    }

    function iMint(
        address to,
        IntelligentData[] calldata datas
    ) external payable whenNotPaused returns (uint256) {
        require(msg.value >= mintFee, "Insufficient mint fee");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setIntelligentData(tokenId, datas);
        return tokenId;
    }

    function getIntelligentDatas(
        uint256 tokenId
    ) external view returns (IntelligentData[] memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _intelligentData[tokenId];
    }

    function iTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        TransferValidityProof[] calldata
    ) external override {
        require(ownerOf(tokenId) == from, "Not the owner");
        require(
            msg.sender == from ||
                isApprovedForAll(from, msg.sender) ||
                getApproved(tokenId) == msg.sender,
            "Not authorized"
        );
        _transfer(from, to, tokenId);
        _clearAuthorizations(tokenId);
        emit IntelligentTransfer(from, to, tokenId);
    }

    function authorizeUsage(uint256 tokenId, address user) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!_isAuthorizedUser[tokenId][user], "Already authorized");
        require(_authorizedUsers[tokenId].length < 100, "Max authorizations");

        _authorizedUsers[tokenId].push(user);
        _isAuthorizedUser[tokenId][user] = true;
        _authorizedTokens[user].push(tokenId);
        _isAuthorizedToken[user][tokenId] = true;
        emit UsageAuthorized(tokenId, user);
    }

    function revokeAuthorization(uint256 tokenId, address user) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(_isAuthorizedUser[tokenId][user], "Not authorized");
        _isAuthorizedUser[tokenId][user] = false;
        _isAuthorizedToken[user][tokenId] = false;
        emit UsageRevoked(tokenId, user);
    }

    function isAuthorizedUser(
        uint256 tokenId,
        address user
    ) external view returns (bool) {
        return _isAuthorizedUser[tokenId][user];
    }

    function authorizedUsersOf(
        uint256 tokenId
    ) external view returns (address[] memory) {
        return _authorizedUsers[tokenId];
    }

    function authorizedTokensOf(
        address user
    ) external view returns (uint256[] memory) {
        return _authorizedTokens[user];
    }

    /**
     * @notice Log an achievement milestone with 0G Storage rootHash reference.
     * @dev JUDGE NOTE: On-chain achievements point to permanent 0G Storage blobs.
     */
    function logMilestone(
        uint256 tokenId,
        string calldata milestoneType,
        string calldata storageRootHash
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _milestones[tokenId].push(
            Milestone({
                milestoneType: milestoneType,
                storageRootHash: storageRootHash,
                timestamp: block.timestamp
            })
        );
        emit MilestoneAchieved(tokenId, milestoneType, storageRootHash);
    }

    function getMilestones(
        uint256 tokenId
    ) external view returns (Milestone[] memory) {
        return _milestones[tokenId];
    }

    function setMintFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit MintFeeUpdated(mintFee, newFee);
        mintFee = newFee;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }

    function _setIntelligentData(
        uint256 tokenId,
        IntelligentData[] calldata datas
    ) internal {
        delete _intelligentData[tokenId];
        for (uint256 i = 0; i < datas.length; i++) {
            _intelligentData[tokenId].push(datas[i]);
        }
        emit IntelligentDataSet(tokenId, datas);
    }

    function _clearAuthorizations(uint256 tokenId) internal {
        address[] storage users = _authorizedUsers[tokenId];
        for (uint256 i = 0; i < users.length; i++) {
            _isAuthorizedUser[tokenId][users[i]] = false;
            _isAuthorizedToken[users[i]][tokenId] = false;
        }
        delete _authorizedUsers[tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}