// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

import {Script} from "forge-std/Script.sol";

import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";

import {BridgeTogether} from "@src/BridgeTogether.sol";
import {IConnext} from "@src/connext/IConnext.sol";

contract Deploy is Script {
    // =========== GOERLI ===============
    address goerli_connext = 0xb35937ce4fFB5f72E90eAD83c10D33097a4F18D2;
    address goerli_dai = 0x75Ab5AB1Eef154C0352Fc31D2428Cef80C7F8B33;
    BridgeTogether goerliBridge =
        BridgeTogether(0x48d076f2ea59EB0797640E65d405496e3B376aF0);

    // =========== MUMBAI ===============
    address mumbai_connext = 0xa2F2ed226d4569C8eC09c175DDEeF4d41Bab4627;
    address mumbai_dai = 0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F;
    BridgeTogether mumbaiBridge =
        BridgeTogether(0x2A6E931d83a2A45a0554C627ea3A39cb1e70fF85);

    function run() external {
        _goerliDeploy();
        _mumbaiDeploy();
        _setTargetAddresses();
    }

    function _goerliDeploy() internal {
        vm.createSelectFork(vm.rpcUrl("goerli"));
        vm.startBroadcast();

        goerliBridge = new BridgeTogether(
            IERC20(goerli_dai),
            IConnext(goerli_connext)
        );

        vm.stopBroadcast();
    }

    function _mumbaiDeploy() internal {
        vm.createSelectFork(vm.rpcUrl("mumbai"));
        vm.startBroadcast();

        mumbaiBridge = new BridgeTogether(
            IERC20(mumbai_dai),
            IConnext(goerli_connext)
        );

        vm.stopBroadcast();
    }

    function _setTargetAddresses() internal {
        vm.createSelectFork(vm.rpcUrl("goerli"));
        vm.startBroadcast();
        goerliBridge.setTargetBridgeTogether(mumbaiBridge);
        vm.stopBroadcast();

        vm.createSelectFork(vm.rpcUrl("mumbai"));
        vm.startBroadcast();
        mumbaiBridge.setTargetBridgeTogether(goerliBridge);
        vm.stopBroadcast();
    }
}
