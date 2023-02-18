// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/token/ERC20/utils/SafeERC20.sol";
import {IConnext} from "./connext/IConnext.sol";
import {IXReceiver} from "./connext/IXReceiver.sol";

contract BridgeTogether is IXReceiver {
    using SafeERC20 for IERC20;

    IERC20 public token;
    uint256 public constant keeperFeesBPS = 50; // 0.5%

    // The connext contract on the origin domain
    IConnext public immutable connext;
    BridgeTogether public bridgeTogetherTarget; // on the target chain

    address public owner;

    constructor(IERC20 token_, IConnext connext_) {
        token = token_;
        connext = connext_;

        owner = msg.sender;
    }

    function setTargetBridgeTogether(BridgeTogether bridgeTogetherTarget_)
        external
    {
        require(msg.sender == owner, "Not owner");

        bridgeTogetherTarget = bridgeTogetherTarget_;
    }

    function bridge(bytes32[] calldata signatures, uint32 destination)
        external
    {
        uint256 totalAllocation;

        for (uint256 i; i < signatures.length; ++i) {
            // TODO: prevent signature replay attack
            // TODO: signature must contain tokenAddress, chainId (if required)
            (address user, uint256 amount) = _decodeSignature(signatures[i]);
            token.safeTransferFrom(user, address(this), amount);

            totalAllocation += amount;
        }
        uint256 keeperFees = (totalAllocation * keeperFeesBPS) / 10_000;
        token.safeTransfer(msg.sender, keeperFees);

        uint256 amountToBridge = totalAllocation - keeperFees;
        _bridge(amountToBridge, signatures, totalAllocation, destination);
    }

    function xReceive(
        bytes32 _transferId,
        uint256 _amount,
        address _asset,
        address _originSender,
        uint32 _origin,
        bytes memory _callData
    ) external returns (bytes memory) {
        (uint256 totalAllocation, bytes32[] memory signatures) = abi.decode(
            _callData,
            (uint256, bytes32[])
        );

        for (uint256 i; i < signatures.length; ++i) {
            (address user, uint256 userAllocation) = _decodeSignature(
                signatures[i]
            );

            token.safeTransfer(
                user,
                (_amount * userAllocation) / totalAllocation
            );
        }
    }

    function _decodeSignature(bytes32 signature)
        internal
        returns (address user, uint256 amount)
    {
        user = address(0);
        amount = 1 ether;
    }

    function _bridge(
        uint256 amountToBridge,
        bytes32[] memory signatures,
        uint256 totalAllocation,
        uint32 destination
    ) internal {
        token.safeApprove(address(connext), amountToBridge);
        connext.xcall{value: 0}({
            _destination: destination,
            _to: address(bridgeTogetherTarget),
            _asset: address(token),
            _delegate: msg.sender, // TODO: this gives keeper extra undesirable powers
            _amount: amountToBridge,
            _slippage: 30,
            _callData: abi.encode(totalAllocation, signatures)
        });
    }
}
