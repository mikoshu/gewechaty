// 用于根据运行环境选择合适的 SQLite 模块
let sqliteModule;

// 检查是否在 Bun 运行时环境
if (typeof Bun !== 'undefined') {
  sqliteModule = require('bun:sqlite').Database;
} else {
  // 否则视为在 Node.js 环境中运行
  // 获取 Node.js 版本号
  let nodeVersion = process.version.split('.');
  nodeVersion[0] = nodeVersion[0].slice(1); // 移除版本号中的 'v' 前缀
  nodeVersion = nodeVersion.map(item => parseInt(item)); // 将版本号转换为 number[]

  // 检查 Node.js 版本是否大于 22.5.1，
  // 22.5.1 是第一个稳定支持内置 node:sqlite 模块的版本。
  // 由于目前版本 (v23.8.0) 的 node:sqlite 仍处在
  // Stability: 1.1 - Active development 阶段，
  // 官方文档称不建议在生产环境中使用，
  // 所以暂时使用 better-sqlite3 模块，
  // 等待 node:sqlite 模块进入稳定后进行替换。
  // if (
  //   nodeVersion[0] > 22 ||
  //   (nodeVersion[0] === 22 && (
  //     nodeVersion[1] > 5 ||
  //     (nodeVersion[1] === 5 && nodeVersion[2] >= 1)
  //   ))
  // ) {
  //   sqliteModule = require('node:sqlite').DatabaseSync;
  // } else {
    // 如果是较低版本，使用 better-sqlite3 模块
    sqliteModule = require('better-sqlite3');
  // }
}

export default sqliteModule;
