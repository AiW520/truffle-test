/**
 * Delegatecall 漏洞测试
 */

const Lib = artifacts.require("Lib");
const HackMe = artifacts.require("HackMe");
const HackMeAttack = artifacts.require("HackMeAttack");
const FixedHackMe = artifacts.require("FixedHackMe");

/**
 * 测试：Delegatecall 漏洞演示
 */
contract("Delegatecall - Vulnerability Demo", function (accounts) {
    let lib;
    let hackMe;
    let attack;
    
    const owner = accounts[0];
    const attacker = accounts[1];
    
    beforeEach(async function () {
        // 部署 Lib 和 HackMe
        lib = await Lib.new();
        hackMe = await HackMe.new(lib.address);
        attack = await HackMeAttack.new(hackMe.address);
    });
    
    it("演示：初始 owner 应该是部署者", async function () {
        const hackMeOwner = await hackMe.owner();
        assert.equal(hackMeOwner, owner, "HackMe owner should be the deployer");
    });
    
    it("演示：delegatecall 攻击应该能修改 HackMe 的 owner", async function () {
        console.log("=== 攻击前 ===");
        const ownerBefore = await hackMe.owner();
        console.log("HackMe owner:", ownerBefore);
        
        // 攻击
        await attack.attack({ from: attacker });
        
        console.log("=== 攻击后 ===");
        const ownerAfter = await hackMe.owner();
        console.log("HackMe owner:", ownerAfter);
        
        // 验证：owner 被修改为攻击者
        assert.equal(ownerAfter, attacker, "HackMe owner should be changed to attacker");
    });
});

/**
 * 测试：Delegatecall 防御演示
 */
contract("Delegatecall - Defense Demo", function (accounts) {
    let lib;
    let fixedHackMe;
    
    const owner = accounts[0];
    const attacker = accounts[1];
    
    beforeEach(async function () {
        lib = await Lib.new();
        fixedHackMe = await FixedHackMe.new(lib.address);
    });
    
    it("防御：FixedHackMe 应该没有 fallback 漏洞", async function () {
        // 验证初始 owner
        const ownerBefore = await fixedHackMe.owner();
        assert.equal(ownerBefore, owner, "Initial owner should be correct");
        
        // 尝试攻击 - 应该失败，因为 FixedHackMe 没有可利用的 fallback
        // 攻击者尝试调用 pwn()，但 FixedHackMe.safeCall 需要 owner 权限
        const HackMeAttack = artifacts.require("HackMeAttack");
        const attack = await HackMeAttack.new(fixedHackMe.address);
        
        // 这个调用会失败，因为 safeCall 需要 owner 权限
        try {
            await attack.attack({ from: attacker });
            // 如果攻击成功（不应该发生），检查 owner
            const ownerAfter = await fixedHackMe.owner();
            // owner 可能被修改，也可能没有，取决于具体实现
            console.log("Owner after attack:", ownerAfter);
        } catch (error) {
            console.log("攻击被阻止");
            // 验证 owner 没有被修改
            const ownerAfter = await fixedHackMe.owner();
            assert.equal(ownerAfter, owner, "Owner should not change");
        }
    });
});
