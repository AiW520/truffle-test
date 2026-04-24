// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * TimeLock - 有漏洞的时间锁合约
 * 漏洞：使用 Solidity 0.7.x 版本（无内置溢出检查），整数运算可能溢出
 * 
 * 注意：本合约使用 0.8.11 版本，但由于使用 unchecked 模拟漏洞
 */
contract TimeLock {
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
     * 增加锁定时间 - 有漏洞！
     * 问题：如果 _secondsToIncrease 足够大，会导致整数溢出
     * 例如：lockTime = 0xffffffff... + 1 = 0
     */
    function increaseLockTime(uint256 _secondsToIncrease) public {
        // 使用 unchecked 模拟 Solidity < 0.8 的溢出行为
        unchecked {
            lockTime[msg.sender] += _secondsToIncrease;
        }
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
