// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IERC5192} from "./interfaces/IERC5192.sol";

contract ParticipationBadge is ERC721URIStorage, EIP712, AccessControl, Pausable, IERC5192 {
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    bytes32 private constant PARTICIPATION_TYPEHASH = keccak256(
        "Participation(address participant,bytes32 projectId,bytes32 snapshotHash,uint256 snapshotVersion,string snapshotURI,uint256 memberNumber,string tokenURI,uint256 nonce,uint256 deadline)"
    );

    error ZeroAddress();
    error ProjectInactive(bytes32 projectId);
    error NonceAlreadyUsed(address participant, uint256 nonce);
    error SignatureExpired(uint256 deadline);
    error InvalidSigner(address recovered, address expected);
    error AlreadyParticipated(bytes32 projectId, address participant);
    error UnexpectedMemberNumber(uint256 expected, uint256 provided);
    error Soulbound();

    event ProjectStatusChanged(bytes32 indexed projectId, bool active);
    event ParticipationRecorded(
        address indexed participant,
        bytes32 indexed projectId,
        uint256 indexed tokenId,
        uint256 memberNumber,
        bytes32 snapshotHash,
        uint256 snapshotVersion,
        string snapshotURI,
        string tokenURI,
        uint256 joinedAt
    );

    struct Participation {
        bytes32 projectId;
        uint256 memberNumber;
        bytes32 snapshotHash;
        uint256 snapshotVersion;
        string snapshotURI;
        uint256 joinedAt;
    }

    mapping(bytes32 projectId => bool active) public projectActive;
    mapping(bytes32 projectId => uint256 count) public projectMemberCount;
    mapping(bytes32 projectId => mapping(address participant => bool joined)) public hasParticipated;
    mapping(address participant => mapping(uint256 nonce => bool used)) public usedNonces;
    mapping(uint256 tokenId => Participation record) public participations;

    uint256 private _nextTokenId = 1;

    constructor(address initialAdmin, address initialRelayer)
        ERC721("EGOG Participation Badge", "EGOG")
        EIP712("EGOG Participation", "1")
    {
        if (initialAdmin == address(0) || initialRelayer == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(RELAYER_ROLE, initialRelayer);
    }

    function setProjectActive(bytes32 projectId, bool active) external onlyRole(DEFAULT_ADMIN_ROLE) {
        projectActive[projectId] = active;
        emit ProjectStatusChanged(projectId, active);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function joinBySig(
        address participant,
        bytes32 projectId,
        bytes32 snapshotHash,
        uint256 snapshotVersion,
        string calldata snapshotURI,
        uint256 memberNumber,
        string calldata badgeTokenURI,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external onlyRole(RELAYER_ROLE) whenNotPaused {
        if (participant == address(0)) revert ZeroAddress();
        if (!projectActive[projectId]) revert ProjectInactive(projectId);
        if (usedNonces[participant][nonce]) revert NonceAlreadyUsed(participant, nonce);
        if (block.timestamp > deadline) revert SignatureExpired(deadline);
        if (hasParticipated[projectId][participant]) {
            revert AlreadyParticipated(projectId, participant);
        }

        bytes32 structHash = keccak256(
            abi.encode(
                PARTICIPATION_TYPEHASH,
                participant,
                projectId,
                snapshotHash,
                snapshotVersion,
                keccak256(bytes(snapshotURI)),
                memberNumber,
                keccak256(bytes(badgeTokenURI)),
                nonce,
                deadline
            )
        );
        address recovered = ECDSA.recover(_hashTypedDataV4(structHash), signature);
        if (recovered != participant) revert InvalidSigner(recovered, participant);

        uint256 expectedMemberNumber = projectMemberCount[projectId] + 1;
        if (memberNumber != expectedMemberNumber) {
            revert UnexpectedMemberNumber(expectedMemberNumber, memberNumber);
        }

        usedNonces[participant][nonce] = true;
        hasParticipated[projectId][participant] = true;
        projectMemberCount[projectId] = memberNumber;

        uint256 tokenId = _nextTokenId++;
        participations[tokenId] = Participation({
            projectId: projectId,
            memberNumber: memberNumber,
            snapshotHash: snapshotHash,
            snapshotVersion: snapshotVersion,
            snapshotURI: snapshotURI,
            joinedAt: block.timestamp
        });

        _safeMint(participant, tokenId);
        _setTokenURI(tokenId, badgeTokenURI);
        emit Locked(tokenId);
        emit ParticipationRecorded(
            participant,
            projectId,
            tokenId,
            memberNumber,
            snapshotHash,
            snapshotVersion,
            snapshotURI,
            badgeTokenURI,
            block.timestamp
        );
    }

    function locked(uint256 tokenId) external view returns (bool) {
        _requireOwned(tokenId);
        return true;
    }

    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert Soulbound();
    }

    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert Soulbound();
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address from)
    {
        from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert Soulbound();
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC5192).interfaceId || super.supportsInterface(interfaceId);
    }
}
