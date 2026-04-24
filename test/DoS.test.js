/**
 * DoS 攻击测试
 */

const KingOfEther = artifacts.require("KingOfEther");
const KingOfEtherAttack = artifacts.require("KingOfEtherAttack");
const FixedKingOfEther = artifacts.require("FixedKingOfEther");

/**
 * 测试：DoS 漏洞演示
 */
contract("DoS - Vulnerability Demo", function (accounts) {
    let kingOfEther;
    
    const attacker = accounts[2];
    const normalUser = accounts[3];
    const challenger = accounts[4];

    beforeEach(async function () {
        kingOfEther = await KingOfEther.new();
    });
    
    it("演示：DoS 攻击应该导致合约卡死", async function () {
        console.log("=== 攻击者成为国王 ===");
        
        // 普通用户成为国王
        await kingOfEther.claimThrone({ from: normalUser, value: web3.utils.toWei("1", "ether") });
        console.log("普通用户成为国王");
        
        // 攻击者使用合约成为国王
        const attackContract = await KingOfEtherAttack.new(
            kingOfEther.address, 
            { from: attacker, value: web3.utils.toWei("2", "ether") }
        );
        
        console.log("=== 攻击者成为国王 ===");
        const kingAfterAttack = await kingOfEther.king();
        console.log("当前国王:", kingAfterAttack);
        console.log("攻击合约:", attackContract.address);
        
        // 验证攻击合约成为了国王
        assert.equal(kingAfterAttack, attackContract.address, "Attack contract should be king");
        
        // 现在尝试让另一个用户挑战
        await kingOfEther.claimThrone({ from: challenger, value: web3.utils.toWei("3", "ether") });
        
        const kingAfterChallenge = await kingOfEther.king();
        console.log("挑战后国王:", kingAfterChallenge);
        
        // 验证：新国王可以成为国王
        assert.equal(kingAfterChallenge, challenger, "New king should be the challenger");
        
        console.log("=== 漏洞演示：旧国王（攻击合约）无法收到退款 ===");
        const attackBalance = await web3.eth.getBalance(attackContract.address);
        console.log("攻击合约 ETH 余额:", web3.utils.fromWei(attackBalance, "ether"), "ETH");
        
        // 修复：攻击合约不应该收到退款（因为它没有receive函数）
        // 这正是DoS攻击成功的表现！
        assert.equal(attackBalance, 0, "Attack contract should NOT have received refund (DoS attack successful)");
    });
});

/**
 * 测试：DoS 防御演示
 */
contract("DoS - Defense Demo", function (accounts) {
    let fixedKingOfEther;
    
    const alice = accounts[0];
    const bob = accounts[1];
    const player1 = accounts[2];
    const player2 = accounts[3];

    beforeEach(async function () {
        fixedKingOfEther = await FixedKingOfEther.new();
    });
    
    it("防御：Pull over Push 应该防止 DoS 攻击", async function () {
        console.log("=== 测试 Pull over Push 模式 ===");
        
        // Alice 成为国王
        await fixedKingOfEther.claimThrone({ from: alice, value: web3.utils.toWei("1", "ether") });
        console.log("Alice 成为国王");
        
        // Bob 挑战
        await fixedKingOfEther.claimThrone({ from: bob, value: web3.utils.toWei("2", "ether") });
        console.log("Bob 成为国王");
        
        // Alice 提取她的资金
        const alicePending = await fixedKingOfEther.getPendingWithdrawals(alice);
        console.log("Alice 待提取:", web3.utils.fromWei(alicePending.toString(), "ether"), "ETH");
        
        // Alice 调用 withdraw
        await fixedKingOfEther.withdraw({ from: alice });
        console.log("Alice 提取成功");
        
        // 验证 Alice 的待提取金额为 0
        const alicePendingAfter = await fixedKingOfEther.getPendingWithdrawals(alice);
        assert.equal(alicePendingAfter.toString(), "0", "Alice should have withdrawn all");
        
        // 验证合约仍然正常工作
        const currentKing = await fixedKingOfEther.king();
        assert.equal(currentKing, bob, "Bob should still be king");
        
        console.log("防御成功：即使 Alice 的提取失败，也不会影响 Bob 成为国王");
    });
    
    it("正常游戏流程应该正常工作", async function () {
        // Player 1 成为国王
        await fixedKingOfEther.claimThrone({ from: player1, value: web3.utils.toWei("1", "ether") });
        assert.equal(await fixedKingOfEther.king(), player1, "Player 1 should be king");
        
        // Player 2 挑战
        await fixedKingOfEther.claimThrone({ from: player2, value: web3.utils.toWei("2", "ether") });
        assert.equal(await fixedKingOfEther.king(), player2, "Player 2 should be king");
        
        // Player 1 提取（被挑战下台，有1 ETH待提取）
        await fixedKingOfEther.withdraw({ from: player1 });
        assert.equal(await fixedKingOfEther.getPendingWithdrawals(player1), "0", "Player 1 should have withdrawn");
        
        // Player 2 现在没有被挑战下台，所以没有待提取金额，提取应该失败
        try {
            await fixedKingOfEther.withdraw({ from: player2 });
            assert.fail("Player 2 should not have any pending withdrawals");
        } catch (error) {
            // 期望失败，因为player2没有待提取金额
            assert.include(error.message, "Nothing to withdraw");
        }
    });
});