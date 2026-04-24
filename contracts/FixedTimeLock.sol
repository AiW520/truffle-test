// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * FixedTimeLock - 修复后的时间锁合约
 * 
 * 防御方法：
 * 1. 使用 Solidity 0.8+ 内置溢出检查（自动 revert）
 * 2. 或者使用 SafeMath 库进行安全的数学运算
 */
contract FixedTimeLock {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lockTime;

    /**
     * 存款并锁定 1 周
     */
    function deposit() external payable {
        balances[msg.sender] += msg.value;
        lockTime[msg.sender] = block.timestamp + 1 weeks;
    }

    /**
     * 增加锁定时间 - 已修复
     * Solidity 0.8+ 会自动检查溢出，如果溢出会自动 revert
     * 不需要额外使用 SafeMath
     */
    function increaseLockTime(uint256 _secondsToIncrease) public {
        // Solidity 0.8+ 自动检查：如果会溢出，transaction 会被 revert
        lockTime[msg.sender] += _secondsToIncrease;
    }

    /**
     * 提款 - 需要通过时间锁检查
     */
    function withdraw() public {
        require(balances[msg.sender] > 0, "Insufficient funds");
        require(block.timestamp > lockTime[msg.sender], "Lock time not expired");
        
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    /**
     * 查看锁定时间
     */
    function getLockTime(address _account) public view returns (uint256) {
        return lockTime[_account];
    }
}
