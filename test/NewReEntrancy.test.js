const FixedEtherStore = artifacts.require("FixedEtherStore");
const Attack = artifacts.require("Attack");

contract("Fixed EtherStore Test", function (accounts) {
    it("should prevent reentrancy attack", async function () {
        const fixedEtherStore = await FixedEtherStore.new();
        const attack = await Attack.new(fixedEtherStore.address);
        
        // 用户存款
        await fixedEtherStore.deposit({ from: accounts[0], value: web3.utils.toWei("1", "ether") });
        
        // 攻击者尝试攻击
        try {
            await attack.attack({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
            assert.fail("Attack should have failed");
        } catch (error) {
            // 攻击被阻止，符合预期
        }
        
        // 验证防御成功
        const balanceAfter = await fixedEtherStore.getBalance();
        assert.equal(balanceAfter.toString(), web3.utils.toWei("1", "ether"), "Bank should have 1 ETH");
    });
});