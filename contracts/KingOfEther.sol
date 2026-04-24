// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * KingOfEther - 有漏洞的"以太坊之王"合约
 * 漏洞：向旧国王转账时，没有处理转账失败的情况
 * 
 * 攻击原理：
 * 攻击者成为国王后，如果他是合约且没有 receive() 函数
 * 那么当新的挑战者想要成为国王时，向旧国王（攻击合约）转账会失败
 * 导致整个合约卡死，无法继续游戏
 */
contract KingOfEther {
    address public king;
    uint256 public balance;
    
    /**
     * claimThrone - 挑战王位
     * 
     * 漏洞：向旧国王转账时，没有检查转账是否成功
     * 如果旧国王是合约且不能接收 ETH，整个合约会卡死
     */
    function claimThrone() external payable {
        require(msg.value > balance, "Need to pay more to become king");
        
        // 漏洞点：向旧国王转账，但没有检查是否成功
        // 如果旧国王是合约且没有 receive() 函数，这里会失败
        (bool sent, ) = king.call{value: balance}("");
        // 注意：这里没有 require(sent)！转账失败不会 revert
        
        balance = msg.value;
        king = msg.sender;
    }
    
    /**
     * 查看合约余额
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
