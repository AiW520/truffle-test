/**
 * Truffle 迁移脚本
 * 用于部署智能合约安全漏洞相关的所有合约
 */

// 引入合约
const Migrations = artifacts.require("Migrations");
const EtherStore = artifacts.require("EtherStore");
const Attack = artifacts.require("Attack");
const FixedEtherStore = artifacts.require("FixedEtherStore");
const TimeLock = artifacts.require("TimeLock");
const TimeLockAttack = artifacts.require("TimeLockAttack");
const FixedTimeLock = artifacts.require("FixedTimeLock");
const Lib = artifacts.require("Lib");
const HackMe = artifacts.require("HackMe");
const HackMeAttack = artifacts.require("HackMeAttack");
const FixedHackMe = artifacts.require("FixedHackMe");
const Wallet = artifacts.require("Wallet");
const WalletAttack = artifacts.require("WalletAttack");
const FixedWallet = artifacts.require("FixedWallet");
const KingOfEther = artifacts.require("KingOfEther");
const KingOfEtherAttack = artifacts.require("KingOfEtherAttack");
const FixedKingOfEther = artifacts.require("FixedKingOfEther");

/**
 * 部署脚本
 */
module.exports = async function (deployer, network, accounts) {
    console.log("========================================");
    console.log("开始部署智能合约安全漏洞演示合约");
    console.log("========================================");
    
    // 1. 重入攻击相关合约
    console.log("\n--- 部署重入攻击相关合约 ---");
    await deployer.deploy(EtherStore);
    console.log("EtherStore 部署成功:", EtherStore.address);
    
    await deployer.deploy(Attack, EtherStore.address);
    console.log("Attack 部署成功:", Attack.address);
    
    await deployer.deploy(FixedEtherStore);
    console.log("FixedEtherStore 部署成功:", FixedEtherStore.address);
    
    // 2. 整数溢出相关合约
    console.log("\n--- 部署整数溢出相关合约 ---");
    await deployer.deploy(TimeLock);
    console.log("TimeLock 部署成功:", TimeLock.address);
    
    await deployer.deploy(TimeLockAttack, TimeLock.address);
    console.log("TimeLockAttack 部署成功:", TimeLockAttack.address);
    
    await deployer.deploy(FixedTimeLock);
    console.log("FixedTimeLock 部署成功:", FixedTimeLock.address);
    
    // 3. Delegatecall 相关合约
    console.log("\n--- 部署 Delegatecall 相关合约 ---");
    await deployer.deploy(Lib);
    console.log("Lib 部署成功:", Lib.address);
    
    await deployer.deploy(HackMe, Lib.address);
    console.log("HackMe 部署成功:", HackMe.address);
    
    await deployer.deploy(HackMeAttack, HackMe.address);
    console.log("HackMeAttack 部署成功:", HackMeAttack.address);
    
    await deployer.deploy(FixedHackMe, Lib.address);
    console.log("FixedHackMe 部署成功:", FixedHackMe.address);
    
    // 4. tx.origin 相关合约
    console.log("\n--- 部署 tx.origin 相关合约 ---");
    await deployer.deploy(Wallet);
    console.log("Wallet 部署成功:", Wallet.address);
    
    await deployer.deploy(WalletAttack, Wallet.address);
    console.log("WalletAttack 部署成功:", WalletAttack.address);
    
    await deployer.deploy(FixedWallet);
    console.log("FixedWallet 部署成功:", FixedWallet.address);
    
    // 5. DoS 相关合约
    console.log("\n--- 部署 DoS 相关合约 ---");
    const kingOfEther = await deployer.deploy(KingOfEther);
    console.log("KingOfEther 部署成功:", kingOfEther.address);
    
    // 需要先成为国王才能部署攻击合约，所以需要支付更多的 ETH
    // KingOfEther 初始国王价格是 1 ETH，我们需要支付 2 ETH 来成为国王
    await deployer.deploy(
        KingOfEtherAttack, 
        kingOfEther.address, 
        { value: web3.utils.toWei("2", "ether") }
    );
    console.log("KingOfEtherAttack 部署成功:", KingOfEtherAttack.address);
    
    await deployer.deploy(FixedKingOfEther);
    console.log("FixedKingOfEther 部署成功:", FixedKingOfEther.address);
    
    console.log("\n========================================");
    console.log("所有合约部署完成！");
    console.log("========================================");
    console.log("\n运行测试：");
    console.log("  truffle test");
    console.log("\n查看部署的合约：");
    console.log("  truffle console");
    console.log("  > EtherStore.address");
};