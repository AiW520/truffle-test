# truffle-test
智能合约五大漏洞，truffle测试集合test，【Truffle + solidity】智能合约安全漏洞实战：从零到一的 Truffle 全流程
=======
# 智能合约安全漏洞 Truffle 实战

> 本项目包含完整的、可直接运行的智能合约安全漏洞代码和测试

## 环境要求

| 工具 | 版本要求 | 安装命令 |
|------|----------|----------|
| Node.js | >= 16.x | [官网下载](https://nodejs.org/) |
| npm | >= 8.x | 随 Node.js 自动安装 |
| Truffle | >= 5.5.x | `npm install -g truffle` |
| Ganache | GUI 或 CLI | [官网下载](https://trufflesuite.com/ganache/) |

### 验证环境

```bash
# 检查 Node.js 版本
node -v
# 输出应该是 v16.x.x 或更高

# 检查 npm 版本
npm -v
# 输出应该是 8.x.x 或更高

# 检查 Truffle 版本
truffle version
# 应该显示 Truffle v5.x.x
```

## 快速开始

### 1. 安装依赖

```bash
cd smart-contract-security
npm install
```

### 2. 启动 Ganache

**方式一：使用 Ganache GUI**
1. 下载并打开 [Ganache](https://trufflesuite.com/ganache/)
2. 点击 "New Workspace"
3. 选择 "Quickstart"
4. 确保端口是 7545

**方式二：使用 Ganache CLI**

```bash
npm install -g ganache-cli
ganache-cli
```

### 3. 编译合约

```bash
truffle compile
```

预期输出：
```
Compiling your contracts...
===========================
✓ Compiling .\contracts\EtherStore.sol
✓ Compiling .\contracts\Attack.sol
✓ Compiling .\contracts\FixedEtherStore.sol
...
✓ Compilation successful
```

### 4. 部署合约

```bash
truffle migrate
```

### 5. 运行测试

```bash
truffle test
```

预期输出：
```
Contract: ReEntrancy - Vulnerability Demo
    ✓ 演示：正常存款和取款应该正常工作
    ✓ 演示：重入攻击 - 应该能够掏空合约

Contract: ReEntrancy - Defense Demo
    ✓ 防御：FixedEtherStore 应该阻止重入攻击
...
```

## 项目结构

```
smart-contract-security/
├── contracts/                    # Solidity 合约目录
│   ├── Migrations.sol            # Truffle 迁移合约
│   ├── EtherStore.sol            # 重入攻击 - 漏洞合约
│   ├── Attack.sol                # 重入攻击 - 攻击合约
│   ├── FixedEtherStore.sol       # 重入攻击 - 防御合约
│   ├── TimeLock.sol              # 整数溢出 - 漏洞合约
│   ├── TimeLockAttack.sol        # 整数溢出 - 攻击合约
│   ├── FixedTimeLock.sol         # 整数溢出 - 防御合约
│   ├── Lib.sol                   # Delegatecall - 库合约
│   ├── HackMe.sol                # Delegatecall - 漏洞合约
│   ├── HackMeAttack.sol          # Delegatecall - 攻击合约
│   ├── FixedHackMe.sol           # Delegatecall - 防御合约
│   ├── Wallet.sol                # tx.origin - 漏洞合约
│   ├── WalletAttack.sol          # tx.origin - 攻击合约
│   ├── FixedWallet.sol           # tx.origin - 防御合约
│   ├── KingOfEther.sol           # DoS 攻击 - 漏洞合约
│   ├── KingOfEtherAttack.sol     # DoS 攻击 - 攻击合约
│   └── FixedKingOfEther.sol      # DoS 攻击 - 防御合约
├── migrations/                   # 部署脚本目录
│   ├── 1_initial_migration.js    # Truffle 迁移
│   └── 2_deploy_contracts.js    # 部署所有合约
├── test/                         # 测试脚本目录
│   ├── ReEntrancy.test.js        # 重入攻击测试
│   ├── IntegerOverflow.test.js   # 整数溢出测试
│   ├── Delegatecall.test.js      # Delegatecall 测试
│   ├── TxOrigin.test.js          # tx.origin 测试
│   └── DoS.test.js               # DoS 攻击测试
├── build/                        # 编译输出目录（Truffle 自动生成）
├── truffle-config.js             # Truffle 配置
├── package.json                  # npm 配置
└── README.md                     # 本文件
```

## 包含的漏洞类型

| 漏洞类型 | 漏洞合约 | 攻击合约 | 防御合约 |
|----------|----------|----------|----------|
| 重入攻击 | EtherStore | Attack | FixedEtherStore |
| 整数溢出 | TimeLock | TimeLockAttack | FixedTimeLock |
| Delegatecall | HackMe | HackMeAttack | FixedHackMe |
| tx.origin | Wallet | WalletAttack | FixedWallet |
| DoS 攻击 | KingOfEther | KingOfEtherAttack | FixedKingOfEther |

## 常见问题

### Q: truffle compile 报错

**A:** 确保：
1. Node.js 版本 >= 16.x
2. 已安装所有依赖：`npm install`
3.Ganache 正在运行

### Q: truffle migrate 报错 "Could not connect to your Ethereum client"

**A:** 确保 Ganache 正在运行，且端口配置正确（默认 7545）

### Q: 测试失败

**A:** 确保 Ganache 正在运行，且每个测试都是独立运行的

### Q: 合约编译失败 "ParserError"

**A:** 检查：
1. Solidity 语法是否正确
2. 编译器版本是否匹配（truffle-config.js 中的 version）
3. 导入路径是否正确（使用 `./ContractName.sol`）

## 学习路径

1. **Day 1**: 阅读本文档，理解每个漏洞的原理
2. **Day 2**: 运行 `truffle test`，观察攻击和防御的结果
3. **Day 3**: 修改代码，尝试不同的攻击方式
4. **Day 4**: 编写自己的测试，验证新的防御方法
5. **Day 5+**: 挑战 CTF（Ethernaut, Damn Vulnerable DeFi）

## 参考资源

- [Solidity 官方文档](https://docs.soliditylang.org/)
- [Truffle 官方文档](https://trufflesuite.com/docs/truffle/)
- [OpenZeppelin 安全最佳实践](https://docs.openzeppelin.com/contracts/4.x/)
- [智能合约安全检查清单](https://consensys.github.io/smart-contract-best-practices/)

## 许可证

MIT
