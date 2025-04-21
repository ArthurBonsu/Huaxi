// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library TransactionTypes {
    struct SpeculativeTx {
        bytes32 id;
        address sender;
        address receiver;
        uint256 anticipatedTime;
        bytes32 dataHash;
        bool isAssetTransfer;
        uint256 interpolationTime;
        bytes rbfParams;
        mapping(bytes32 => bool) validationProofs;
    }

    struct ConfirmableTx {
        bytes32 id;
        address sender;
        address receiver;
        uint256 confirmationTime;
        bytes32 dataHash;
        bool isAssetTransfer;
        bytes32 speculativeTxId;
        mapping(bytes32 => bool) zkProofs;
    }

    struct Channel {
        bytes32 id;
        address sourceBridge;
        address targetBridge;
        uint256 creationTime;
        bool isActive;
        uint256 confidenceThreshold;
    }
}
