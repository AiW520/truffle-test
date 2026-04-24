// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * FixedEtherStore - 修复后的银行合约
 * 防御方法：Checks-Effects-Interactions 模式
 * 先修改状态（Effects），再进行外部调用（Interactions）
 */
contract FixedEtherStore {
    mapping(address => uint256) public balances;

    /**
     * 存款：将 ETH 存入合约
     */
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    /**
     * 取款 - 已修复
     * 防御核心：先扣余额（Checks + Effects），后转账（Interactions）
     * 这样即使 fallback() 再次被触发，余额已经是 0，会失败
     */
    function withdraw() public {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Insufficient balance");
        
        // 防御点：先扣余额（Effects）
        balances[msg.sender] = 0;
        
        // 后转账（Interactions）：此时即使 fallback() 被触发，余额已经是 0
        // 使用 transfer 或 send 可以限制 gas，防止重入
        payable(msg.sender).transfer(bal);
    }

    /**
     * 查看合约余额
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * 获取用户余额
     */
    function getBalanceOf(address _account) public view returns (uint256) {
        return balances[_account];
    }
}