module.exports = {
  // 合约编译目录
  contracts_directory: './contracts',
  contracts_build_directory: './build/contracts',
  
  networks: {
    development: {
      host: "127.0.0.1",      // Ganache 本地地址
      port: 8545,             // Ganache GUI 默认端口
      network_id: "*",        // 任意网络 ID
      gas: 6721975,           // Gas 限制
      gasPrice: 2000000000,   // Gas 价格
    },
  },

  compilers: {
    solc: {
      version: "0.8.11",      // 固定编译器版本
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "istanbul"
      }
    }
  },

  // 测试框架配置
  test_directory: './test',
  migrations_directory: './migrations',

  // Mocha 测试配置
  mocha: {
    timeout: 100000
  }
};