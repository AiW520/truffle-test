// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * FixedWallet - 修复后的钱包合约
 * 
 * 防御方法：
 * 使用 msg.sender 代替 tx.origin
 * 
 * 原因：
 * msg.sender 是直接调用者，可以是 EOAs 或合约
 * tx.origin 是原始发起者，总是外部账户
 * 
 * 但如果确实需要区分EOAs和合约，可以使用：
 * - tx.origin == msg.sender（确认是直接调用，没有中间合约）
 */
contract FixedWallet {
    address public owner;
    
    constructor() payable {
        owner = msg.sender;
    }
    
    /**
     * transfer - 转账（已修复）
     * 
     * 防御：使用 msg.sender 代替 tx.origin
     */
    function transfer(address payable _to, uint256 _amount) public {
        // 防御：使用 msg.sender
        require(msg.sender == owner, "Not owner");
        
        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }
    
    /**
     * 如果确实需要验证是 EOA（外部账户）而非合约，可以：
     */
    function transferOnlyEOA(address payable _to, uint256 _amount) public {
        // 检查调用者是否是合约
        require(msg.sender == tx.origin, "Only external accounts allowed");
        require(msg.sender == owner, "Not owner");
        
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
