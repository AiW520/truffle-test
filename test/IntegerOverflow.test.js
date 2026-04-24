/**
 * 整数溢出测试
 */

const TimeLock = artifacts.require("TimeLock");
const TimeLockAttack = artifacts.require("TimeLockAttack");
const FixedTimeLock = artifacts.require("FixedTimeLock");

/**
 * 测试：整数溢出漏洞演示
 */
contract("IntegerOverflow - Vulnerability Demo", function (accounts) {
    let timeLock;
    let attack;
    
    const attacker = accounts[1];
    
    beforeEach(async function () {
        timeLock = await TimeLock.new();
        attack = await TimeLockAttack.new(timeLock.address);
    });
    
    it("演示：整数溢出攻击应该能绕过时间锁", async function () {
        // 攻击者存款 1 ETH 到攻击合约，然后攻击
        const depositAmount = web3.utils.toWei("1", "ether");
        
        console.log("=== 攻击前 ===");
        const attackBalanceBefore = await attack.getBalance();
        console.log("攻击合约余额:", web3.utils.fromWei(attackBalanceBefore.toString(), "ether"), "ETH");
        
        // 攻击
        await attack.attack({ from: attacker, value: depositAmount });
        
        console.log("=== 攻击后 ===");
        const attackBalanceAfter = await attack.getBalance();
        console.log("攻击合约余额:", web3.utils.fromWei(attackBalanceAfter.toString(), "ether"), "ETH");
        
        // 验证：攻击后攻击合约的余额应该是 1 ETH（成功取回了存款）
        assert.equal(attackBalanceAfter.toString(), depositAmount, "Attacker should have successfully withdrawn all ETH");
    });
});

/**
 * 测试：整数溢出防御演示
 */
contract("IntegerOverflow - Defense Demo", function (accounts) {
    let fixedTimeLock;
    let attack;
    
    const attacker = accounts[1];
    
    beforeEach(async function () {
        fixedTimeLock = await FixedTimeLock.new();
        attack = await TimeLockAttack.new(fixedTimeLock.address);
    });
    
    it("防御：FixedTimeLock 应该阻止整数溢出攻击", async function () {
        // 攻击者存款 1 ETH 到攻击合约，然后尝试攻击
        const depositAmount = web3.utils.toWei("1", "ether");
        
        console.log("=== 攻击前 ===");
        const timeLockBalanceBefore = await web3.eth.getBalance(fixedTimeLock.address);
        console.log("FixedTimeLock 余额:", web3.utils.fromWei(timeLockBalanceBefore.toString(), "ether"), "ETH");
        
        // 尝试攻击 - 应该失败，因为 Solidity 0.8+ 会自动检查溢出
        let attackFailed = false;
        try {
            await attack.attack({ from: attacker, value: depositAmount });
        } catch (error) {
            attackFailed = true;
            console.log("攻击被阻止（溢出检查生效）");
        }
        
        // 验证攻击是否失败
        assert.isTrue(attackFailed, "Attack should have been prevented by overflow check");
        
        console.log("=== 攻击后 ===");
        const timeLockBalanceAfter = await web3.eth.getBalance(fixedTimeLock.address);
        console.log("FixedTimeLock 余额:", web3.utils.fromWei(timeLockBalanceAfter.toString(), "ether"), "ETH");
        
        // 攻击失败，FixedTimeLock 余额应该是 0（存款被回滚）
        assert.equal(timeLockBalanceAfter.toString(), "0", "Contract should have 0 ETH after failed attack");
    });
    
    it("正常存款和取款应该正常工作", async function () {
        const depositor = accounts[2];
        const depositAmount = web3.utils.toWei("1", "ether");
        
        // 存款
        await fixedTimeLock.deposit({ from: depositor, value: depositAmount });
        
        // 验证存款成功
        const timeLockBalance = await web3.eth.getBalance(fixedTimeLock.address);
        assert.equal(timeLockBalance.toString(), depositAmount, "Deposit should be successful");
        
        // 尝试立即取款（应该失败，因为时间锁还没到期）
        try {
            await fixedTimeLock.withdraw({ from: depositor });
            assert.fail("Should have reverted due to time lock");
        } catch (error) {
            assert(error.message.includes("revert"), "Should revert due to time lock");
        }
    });
});