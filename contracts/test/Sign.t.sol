// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";

import {ECDSA} from "@openzeppelin/utils/cryptography/ECDSA.sol";

import {BridgeTogether} from "@src/BridgeTogether.sol";
import {SignatureVerification} from "@src/lib/SignatureVerification.sol";

contract SignTests is Test {
    using SignatureVerification for bytes;
    using ECDSA for bytes32;

    bytes32 constant DOMAIN_SEPARATOR =
        0x11df825b631eb4ce2970412c2bcf7c6bccde7b5175998b3694270df8d6914dbb;
    bytes32 constant _BRIDGE_TYPEHASH =
        0xfd80ad1a6630eba3a9bab280f8b794a5cbf25e14a0bf3c19081fc9f8ce02b903;
    bytes32 constant _BRIDGE_DETAILS_TYPEHASH =
        0x8c66e5899a3cb1abed89845f601e41800a836f9be0d2a22131bffcd717f6f600;

    function setUp() external {}

    function testSignCheck() external {
        BridgeTogether.SignData memory signData = BridgeTogether.SignData({
            bridge: BridgeTogether.Bridge({
                details: BridgeTogether.BridgeDetails({
                    amount: 5000000000000000000
                }),
                user: 0xb06a64615842CbA9b3Bdb7e6F726F3a5BD20daC2
            }),
            signature: hex"e232cfd15b200fbf1d1f8de20b55bd1d45a05ab0e42e1e1f26118665906077295aa725da7cc81c4ed6317f0b90241024d957a976376762491c0496d2ec9143f41c"
        });

        bytes32 temp = hash(signData.bridge);
        console.logBytes32(temp);
        bytes32 hashedTypedData = hashTypedData(temp);
        console.logBytes32(hashedTypedData);

        signData.signature.verify(hashedTypedData, signData.bridge.user);
    }

    function testXReceive() external {
        uint256 _amount = 4975000000000000000;
        bytes
            memory _callData = hex"0000000000000000000000000000000000000000000000004563918244f400000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000004563918244f40000000000000000000000000000b06a64615842cba9b3bdb7e6f726f3a5bd20dac2000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000419693573466449f360f9f2e2a0c56f829b8d803fac28b55de33b501d7228fadf7476d01bebb8582f74e635ab892e468a1e10e7354baa21265d7d8c869446bea861b00000000000000000000000000000000000000000000000000000000000000";

        (
            uint256 totalAllocation,
            BridgeTogether.SignData[] memory signDatas
        ) = abi.decode(_callData, (uint256, BridgeTogether.SignData[]));

        console.log("array length", signDatas.length);

        for (uint256 i; i < signDatas.length; ++i) {
            address user = signDatas[i].bridge.user;
            uint256 userAllocation = signDatas[i].bridge.details.amount;

            uint256 amountToTransfer = (_amount * userAllocation) /
                totalAllocation;

            console.log("_amount", _amount);
            console.log("user", user);
            console.log("userAllocation", userAllocation);
            console.log("amountToTransfer", amountToTransfer);
        }
    }

    function hashTypedData(bytes32 dataHash) public view returns (bytes32) {
        bytes memory encoded = abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            dataHash
        );
        console.logBytes(encoded);
        return keccak256(encoded);
    }

    function hash(BridgeTogether.Bridge memory bridge_)
        public
        pure
        returns (bytes32)
    {
        bytes32 detailsHash = _hashBridgeDetails(bridge_.details);
        return
            keccak256(abi.encode(_BRIDGE_TYPEHASH, detailsHash, bridge_.user));
    }

    function _hashBridgeDetails(BridgeTogether.BridgeDetails memory details)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(_BRIDGE_DETAILS_TYPEHASH, details));
    }
}
