const TimeLock = artifacts.require("TimeLock");
const TimeLockAttack = artifacts.require("TimeLockAttack");

contract("IntegerOverflow Vulnerable Test", function (accounts) {
    it("should bypass timelock with overflow attack", async function () {
        const timeLock = await TimeLock.new();
        const attack = await TimeLockAttack.new(timeLock.address);
        
        // 攻击者尝试攻击
        await attack.attack({ 
            from: accounts[1], 
            value: web3.utils.toWei("1", "ether") 
        });
        
        // 验证攻击成功
        const attackBalance = await attack.getBalance();
        assert.equal(
            attackBalance.toString(), 
            web3.utils.toWei("1", "ether"), 
            "Attack successful - bypassed timelock"
        );
    });
});