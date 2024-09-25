const path = require('path');
const glob = require('glob');  // 用于获取所有的 JS 文件
module.exports = {
  entry: glob.sync('./src/**/*.js').reduce((entries, file) => {
    // 删除 src/ 部分，只保留 src 下的文件及其相对路径
    const filePath = file.replace('src/', '');
    entries[filePath] = path.resolve(__dirname, file);
    return entries;
  }, {}),
  output: {
    library: 'WechatBot',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),  // 输出到 dist 目录
    filename: '[name]',  // 使用相对路径保留文件结构
  },
  target: 'node',  // 指定目标为 Node.js
  mode: 'development',  // 开发模式
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // 定义别名 @ 对应 ./src 目录
    },
    extensions: ['.js'],  // 支持导入的文件类型
  },
  module: {
    rules: [
      {
        test: /\.js$/,  // 匹配所有 JS 文件
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',  // 使用 Babel 转译
          options: {
            presets: ['@babel/preset-env'],  // 转译为 ES5 或 ES6+ 兼容的语法
          },
        },
      },
    ],
  },
};
