// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * EtherStore - 有漏洞的银行合约
 * 漏洞：先转账后扣余额，导致重入攻击
 */
contract EtherStore {
    mapping(address => uint256) public balances;

    /**
     * 存款：将 ETH 存入合约
     */
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    /**
     * 取款 - 有漏洞！
     * 问题：先转账（call），后扣余额
     * 这会导致攻击者可以在 fallback() 中递归调用取款
     */
    function withdraw() public {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Insufficient balance");
        
        // 问题1：使用 low-level call 转账
        // 问题2：扣余额的代码在转账之后
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");
        
        // 这里修改状态太晚了！
        balances[msg.sender] = 0;
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
