/**
 * tx.origin 漏洞测试
 */

const Wallet = artifacts.require("Wallet");
const WalletAttack = artifacts.require("WalletAttack");
const FixedWallet = artifacts.require("FixedWallet");

/**
 * 测试：tx.origin 漏洞演示
 */
contract("TxOrigin - Vulnerability Demo", function (accounts) {
    let wallet;
    let attack;
    
    const owner = accounts[0];
    const attacker = accounts[1];
    
    beforeEach(async function () {
        // 部署钱包并存入 2 ETH
        wallet = await Wallet.new({ value: web3.utils.toWei("2", "ether") });
        // 部署攻击合约
        attack = await WalletAttack.new(wallet.address);
    });
    
    it("演示：tx.origin 漏洞应该能让攻击者掏空钱包", async function () {
        console.log("=== 攻击前 ===");
        const walletBalanceBefore = await wallet.getBalance();
        console.log("钱包余额:", web3.utils.fromWei(walletBalanceBefore.toString(), "ether"), "ETH");
        
        // 关键：owner（也是钱包主人）调用 attack
        // 这模拟了钓鱼攻击：owner 被诱导调用恶意合约
        await attack.attack({ from: owner });
        
        console.log("=== 攻击后 ===");
        const walletBalanceAfter = await wallet.getBalance();
        console.log("钱包余额:", web3.utils.fromWei(walletBalanceAfter.toString(), "ether"), "ETH");
        
        const attackBalance = await attack.getBalance();
        console.log("攻击合约余额:", web3.utils.fromWei(attackBalance.toString(), "ether"), "ETH");
        
        // 验证：钱包被掏空
        assert.equal(walletBalanceAfter.toString(), "0", "Wallet should be empty after attack");
        
        // 验证：攻击合约获得了资金
        assert.equal(attackBalance.toString(), web3.utils.toWei("2", "ether"), "Attack contract should have 2 ETH");
    });
});

/**
 * 测试：tx.origin 防御演示
 */
contract("TxOrigin - Defense Demo", function (accounts) {
    let fixedWallet;
    let attack;
    
    const owner = accounts[0];
    const attacker = accounts[1];
    
    beforeEach(async function () {
        fixedWallet = await FixedWallet.new({ value: web3.utils.toWei("2", "ether") });
        // 注意：攻击合约需要适配 FixedWallet 的接口
        attack = await WalletAttack.new(fixedWallet.address);
    });
    
    it("防御：FixedWallet 应该阻止 tx.origin 攻击", async function () {
        console.log("=== 尝试攻击 ===");
        
        // 获取攻击前的钱包余额
        const walletBalanceBefore = await fixedWallet.getBalance();
        console.log("钱包余额（攻击前）:", web3.utils.fromWei(walletBalanceBefore.toString(), "ether"), "ETH");
        
        // owner 尝试调用 attack（应该失败）
        try {
            await attack.attack({ from: owner });
            console.log("攻击成功（不符合预期）");
            
            // 如果攻击成功，检查余额
            const walletBalanceAfter = await fixedWallet.getBalance();
            const attackBalance = await attack.getBalance();
            console.log("钱包余额（攻击后）:", web3.utils.fromWei(walletBalanceAfter.toString(), "ether"), "ETH");
            console.log("攻击合约余额:", web3.utils.fromWei(attackBalance.toString(), "ether"), "ETH");
            
            // 验证：钱包余额应该没有变化（防御应该生效）
            assert.equal(walletBalanceAfter.toString(), web3.utils.toWei("2", "ether"), "Wallet should still have 2 ETH");
            assert.equal(attackBalance.toString(), "0", "Attack contract should have 0 ETH");
            
        } catch (error) {
            console.log("攻击被阻止（使用了 msg.sender 验证）");
            
            // 验证钱包余额没有变化
            const walletBalanceAfter = await fixedWallet.getBalance();
            assert.equal(walletBalanceAfter.toString(), web3.utils.toWei("2", "ether"), "Wallet should still have 2 ETH after failed attack");
            
            // 验证攻击合约余额为 0
            const attackBalance = await attack.getBalance();
            assert.equal(attackBalance.toString(), "0", "Attack contract should have 0 ETH");
        }
    });
    
    it("正常转账应该正常工作", async function () {
        const recipient = accounts[2];
        
        // 获取转账前的余额
        const recipientBalanceBefore = await web3.eth.getBalance(recipient);
        const walletBalanceBefore = await fixedWallet.getBalance();
        
        // 注意：这里不需要使用 payable，直接传递地址即可
        await fixedWallet.transfer(recipient, web3.utils.toWei("1", "ether"), { from: owner });
        
        // 获取转账后的余额
        const recipientBalanceAfter = await web3.eth.getBalance(recipient);
        const walletBalanceAfter = await fixedWallet.getBalance();
        
        // 验证转账成功
        const recipientBalanceDiff = web3.utils.toBN(recipientBalanceAfter).sub(web3.utils.toBN(recipientBalanceBefore));
        const walletBalanceDiff = web3.utils.toBN(walletBalanceBefore).sub(web3.utils.toBN(walletBalanceAfter));
        
        // 由于 gas 费用，recipient 收到的 ETH 可能略少于 1 ETH
        // 但合约转出的金额应该正好是 1 ETH
        assert.equal(walletBalanceDiff.toString(), web3.utils.toWei("1", "ether"), "Wallet should send exactly 1 ETH");
    });
});