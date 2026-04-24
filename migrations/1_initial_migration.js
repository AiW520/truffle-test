/**
 * Truffle 迁移脚本
 * 用于部署 Migrations 合约（Truffle 框架必需）
 */
const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
