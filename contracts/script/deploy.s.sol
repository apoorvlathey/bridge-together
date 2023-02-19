// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

import {Script} from "forge-std/Script.sol";

import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";

import {BridgeTogether} from "@src/BridgeTogether.sol";
import {IConnext} from "@src/connext/IConnext.sol";

contract Deploy is Script {
    // =========== GOERLI ===============
    address goerli_connext = 0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649;
    address goerli_test = 0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1;
    BridgeTogether goerliBridge =
        BridgeTogether(0xf0a3d51006ab104cA0807f5C0c1d75CE20eE12c8);
    uint256 goerliForkId;

    // =========== MUMBAI ===============
    address mumbai_connext = 0x2334937846Ab2A3FCE747b32587e1A1A2f6EEC5a;
    address mumbai_test = 0xeDb95D8037f769B72AAab41deeC92903A98C9E16;
    BridgeTogether mumbaiBridge =
        BridgeTogether(0x224D07d7C545034d697074DAb089d997b7B8b7ac);
    uint256 mumbaiForkId;

    function run() external {
        _goerliDeploy();
        _mumbaiDeploy();
        _setTargetAddresses();
    }

    function _goerliDeploy() internal {
        goerliForkId = vm.createSelectFork(vm.rpcUrl("goerli"));
        vm.startBroadcast();

        goerliBridge = new BridgeTogether(
            IERC20(goerli_test),
            IConnext(goerli_connext)
        );

        vm.stopBroadcast();
    }

    function _mumbaiDeploy() internal {
        mumbaiForkId = vm.createSelectFork(vm.rpcUrl("mumbai"));
        vm.startBroadcast();

        mumbaiBridge = new BridgeTogether(
            IERC20(mumbai_test),
            IConnext(goerli_connext)
        );

        vm.stopBroadcast();
    }

    function _setTargetAddresses() internal {
        vm.selectFork(goerliForkId);
        vm.startBroadcast();
        goerliBridge.setTargetBridgeTogether(mumbaiBridge);
        vm.stopBroadcast();

        vm.selectFork(mumbaiForkId);
        vm.startBroadcast();
        mumbaiBridge.setTargetBridgeTogether(goerliBridge);
        vm.stopBroadcast();
    }
}
