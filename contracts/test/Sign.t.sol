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
