const EtherStore = artifacts.require("EtherStore");
const Attack = artifacts.require("Attack");

contract("Vulnerable EtherStore Test", function (accounts) {
    it("should demonstrate reentrancy attack", async function () {
        const etherStore = await EtherStore.new();
        const attack = await Attack.new(etherStore.address);
        
        // 用户存款
        await etherStore.deposit({ from: accounts[0], value: web3.utils.toWei("1", "ether") });
        await etherStore.deposit({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
        
        // 攻击者攻击
        await attack.attack({ from: accounts[2], value: web3.utils.toWei("1", "ether") });
        
        // 验证攻击成功
        const balanceAfter = await etherStore.getBalance();
        assert.equal(balanceAfter.toString(), "0", "Bank should be empty");
    });
});