// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * FixedHackMe - 修复后的合约
 * 
 * 防御方法：
 * 1. 避免使用 delegatecall
 * 2. 使用普通的 call 或直接调用库函数
 */
contract FixedHackMe {
    address public owner;
    address public lib;
    
    /**
     * 构造函数
     */
    constructor(address _libAddress) {
        owner = msg.sender;
        lib = _libAddress;
    }
    
    /**
     * 安全的方式：使用普通的 call
     * 但仍然需要谨慎，因为 call 会改变 msg.sender
     */
    function safeCall(address _target, bytes memory _data) public returns (bool, bytes memory) {
        require(msg.sender == owner, "Only owner can call");
        // 使用普通的 call 而不是 delegatecall
        (bool success, bytes memory returnData) = _target.call(_data);
        return (success, returnData);
    }
    
    /**
     * 更安全的方式：完全不使用 delegatecall
     * 改为直接实现需要的功能
     */
    
    /**
     * receive 函数 - 接收 ETH
     */
    receive() external payable {}
}
