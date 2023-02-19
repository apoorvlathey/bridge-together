// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/token/ERC20/utils/SafeERC20.sol";

import {SignatureVerification} from "@src/lib/SignatureVerification.sol";
import {IConnext} from "./connext/IConnext.sol";
import {IXReceiver} from "./connext/IXReceiver.sol";

contract BridgeTogether is IXReceiver {
    using SafeERC20 for IERC20;
    using SignatureVerification for bytes;

    IERC20 public token;
    uint256 public keeperFeesBPS = 50; // 0.5%

    // The connext contract on the origin domain
    IConnext public immutable connext;
    BridgeTogether public bridgeTogetherTarget; // on the target chain

    address public owner;

    bytes32 public immutable DOMAIN_SEPARATOR;

    bytes32 public constant _HASHED_NAME = keccak256("BridgeTogether");
    bytes32 public constant _TYPE_HASH =
        keccak256(
            "EIP712Domain(string name,uint256 chainId,address verifyingContract)"
        );

    struct BridgeDetails {
        uint256 amount;
    }

    struct Bridge {
        BridgeDetails details;
        address user;
    }

    bytes32 public constant _BRIDGE_DETAILS_TYPEHASH =
        keccak256("BridgeDetails(uint256 amount)");
    bytes32 public constant _BRIDGE_TYPEHASH =
        keccak256(
            "Bridge(BridgeDetails details,address user)BridgeDetails(uint256 amount)"
        );

    struct SignData {
        Bridge bridge;
        bytes signature;
    }

    error NotOwner();

    constructor(IERC20 token_, IConnext connext_) {
        token = token_;
        connext = connext_;

        owner = msg.sender;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(_TYPE_HASH, _HASHED_NAME, block.chainid, address(this))
        );
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function setTargetBridgeTogether(BridgeTogether bridgeTogetherTarget_)
        external
        onlyOwner
    {
        bridgeTogetherTarget = bridgeTogetherTarget_;
    }

    function setKeeperFeesBPS(uint256 keeperFeesBPS_) external onlyOwner {
        keeperFeesBPS = keeperFeesBPS_;
    }

    function bridge(SignData[] calldata signDatas, uint32 destination)
        external
        payable
    {
        uint256 totalAllocation;

        for (uint256 i; i < signDatas.length; ++i) {
            // TODO: prevent signature replay attack
            // TODO: signature must contain tokenAddress, chainId (if required)
            (address user, uint256 amount) = _decodeSignature(signDatas[i]);
            token.safeTransferFrom(user, address(this), amount);

            totalAllocation += amount;
        }

        // TODO: keeperFees should get distributed on the destination chain
        uint256 keeperFees = (totalAllocation * keeperFeesBPS) / 10_000;
        token.safeTransfer(msg.sender, keeperFees);

        uint256 amountToBridge = totalAllocation - keeperFees;
        _bridge(amountToBridge, signDatas, totalAllocation, destination);
    }

    function xReceive(
        bytes32, /** _transferId */
        uint256 _amount,
        address, /** _asset */
        address, /** _originSender */
        uint32, /** _origin */
        bytes memory _callData
    ) external returns (bytes memory) {
        (uint256 totalAllocation, SignData[] memory signDatas) = abi.decode(
            _callData,
            (uint256, SignData[])
        );

        for (uint256 i; i < signDatas.length; ++i) {
            address user = signDatas[i].bridge.user;
            uint256 userAllocation = signDatas[i].bridge.details.amount;

            token.safeTransfer(
                user,
                (_amount * userAllocation) / totalAllocation
            );
        }
    }

    /// @notice Creates an EIP-712 typed data hash
    function hashTypedData(bytes32 dataHash) public view returns (bytes32) {
        return
            keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, dataHash));
    }

    function hash(Bridge memory bridge_) public pure returns (bytes32) {
        bytes32 detailsHash = _hashBridgeDetails(bridge_.details);
        return
            keccak256(abi.encode(_BRIDGE_TYPEHASH, detailsHash, bridge_.user));
    }

    function _hashBridgeDetails(BridgeDetails memory details)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(_BRIDGE_DETAILS_TYPEHASH, details));
    }

    function _decodeSignature(SignData memory signData)
        internal
        view
        returns (address user, uint256 amount)
    {
        signData.signature.verify(
            hashTypedData(hash(signData.bridge)),
            signData.bridge.user
        );

        user = signData.bridge.user;
        amount = signData.bridge.details.amount;
    }

    function _bridge(
        uint256 amountToBridge,
        SignData[] memory signDatas,
        uint256 totalAllocation,
        uint32 destination
    ) internal {
        token.safeApprove(address(connext), amountToBridge);
        connext.xcall{value: msg.value}({
            _destination: destination,
            _to: address(bridgeTogetherTarget),
            _asset: address(token),
            _delegate: msg.sender, // TODO: this gives keeper extra undesirable powers
            _amount: amountToBridge,
            _slippage: 30,
            _callData: abi.encode(totalAllocation, signDatas)
        });
    }
}
