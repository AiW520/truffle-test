// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * Wallet - 有漏洞的钱包合约
 * 漏洞：使用 tx.origin 做权限判断
 * 
 * tx.origin vs msg.sender：
 * - tx.origin: 最初发起交易的外层账户
 * - msg.sender: 直接调用者（可能是合约）
 */
contract Wallet {
    address public owner;
    
    constructor() payable {
        owner = msg.sender;
    }
    
    /**
     * transfer - 转账
     * 漏洞点：使用 tx.origin 判断所有者
     * 
     * 攻击场景：
     * 1. Alice（钱包所有者）调用 Attack.attack()
     * 2. Attack 合约调用 Wallet.transfer()
     * 3. 此时 msg.sender = Attack，tx.origin = Alice
     * 4. require(tx.origin == owner) 成立（Alice == Alice）
     * 5. 攻击成功：Alice 的钱包被 Attack 转空
     */
    function transfer(address payable _to, uint256 _amount) public {
        // 漏洞：使用 tx.origin 判断权限
        require(tx.origin == owner, "Not owner");
        
        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }
    
    /**
     * 接收 ETH
     */
    receive() external payable {}
    
    /**
     * 查看余额
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
