// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * FixedKingOfEther - 修复后的"以太坊之王"合约
 */
contract FixedKingOfEther {
    address public king;
    uint256 public balance;
    mapping(address => uint256) public pendingWithdrawals;
    
    function claimThrone() external payable {
        require(msg.value > balance, "Need to pay more to become king");
        
        // 修复：先记录旧国王的退款
        if (king != address(0)) {
            pendingWithdrawals[king] = balance;  // 使用 = 而不是 +=
        }
        
        // 然后更新国王和余额
        king = msg.sender;
        balance = msg.value;
    }
    
    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        
        // 先清零，防止重入攻击
        pendingWithdrawals[msg.sender] = 0;
        
        // 后转账
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to send Ether");
    }
    
    function getPendingWithdrawals(address _account) public view returns (uint256) {
        return pendingWithdrawals[_account];
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}