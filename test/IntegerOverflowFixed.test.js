const FixedTimeLock = artifacts.require("FixedTimeLock");
const TimeLockAttack = artifacts.require("TimeLockAttack");

contract("IntegerOverflow Fixed Test", function (accounts) {
    it("should prevent overflow attack", async function () {
        const fixedTimeLock = await FixedTimeLock.new();
        const attack = await TimeLockAttack.new(fixedTimeLock.address);
        
        // 攻击者尝试攻击 - 应该失败
        let attackFailed = false;
        try {
            await attack.attack({ 
                from: accounts[1], 
                value: web3.utils.toWei("1", "ether") 
            });
        } catch (error) {
            attackFailed = true;
        }
        
        // 验证攻击失败
        assert.isTrue(attackFailed, "Attack should be prevented");
        
        // 验证合约余额为0（存款被回滚）
        const contractBalance = await web3.eth.getBalance(fixedTimeLock.address);
        assert.equal(contractBalance.toString(), "0", "Deposit should be reverted");
    });
    
    it("normal deposit should work", async function () {
        const fixedTimeLock = await FixedTimeLock.new();
        
        // 正常存款
        await fixedTimeLock.deposit({ 
            from: accounts[0], 
            value: web3.utils.toWei("1", "ether") 
        });
        
        // 验证存款成功
        const contractBalance = await web3.eth.getBalance(fixedTimeLock.address);
        assert.equal(
            contractBalance.toString(), 
            web3.utils.toWei("1", "ether"), 
            "Normal deposit should work"
        );
    });
});