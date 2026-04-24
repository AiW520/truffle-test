// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract HackMe {
    // 第一个状态变量owner默认存在存储槽0
    address public owner;
    address public lib;

    constructor(address _libAddress) {
        owner = msg.sender;
        lib = _libAddress;
    }

    fallback() external payable {
        (bool success, ) = lib.delegatecall(msg.data);
        require(success, "Delegatecall failed");
    }

    receive() external payable {}

    // 返回owner所在的存储槽编号，类型修正为uint256
    function getOwnerSlot() public pure returns (uint256) {
        return 0;
    }
}