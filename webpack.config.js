const path = require('path');
// const glob = require('glob');  // 用于获取所有的 JS 文件
module.exports = {
  // entry: glob.sync('./src/**/*.js').reduce((entries, file) => {
  //   // 删除 src/ 部分，只保留 src 下的文件及其相对路径
  //   const filePath = file.replace('src/', '');
  //   entries[filePath] = path.resolve(__dirname, file);
  //   return entries;
  // }, {}),
  entry: './src/index.js',  // 指定你的入口文件
  output: {
    filename: 'index.js',  // 打包后的文件名
    path: path.resolve(__dirname, 'dist'),  // 输出到 dist 目录
    library: 'WechatBot',
    libraryTarget: 'umd',
    // filename: '[name]',  // 使用相对路径保留文件结构
  },
  target: 'node',  // 指定目标为 Node.js
  mode: 'production',  // 开发模式
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // 定义别名 @ 对应 ./src 目录
    },
    extensions: ['.js'],  // 支持导入的文件类型
  },
  // 添加缓存配置
  cache: {
    type: 'filesystem', // 使用文件系统缓存
    buildDependencies: {
      config: [__filename], // 构建依赖
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: "ecmascript"
              },
              target: "es2015"
            }
          }
        }
      }
    ]
  },
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',  // 分割所有的代码，包括动态引入
  //     minSize: 30000, // 当模块超过 30kb 时进行代码分割
  //     maxInitialRequests: 3,  // 最大并行请求数
  //     cacheGroups: {
  //       vendors: {
  //         test: /[\\/]node_modules[\\/]/,  // 分离 node_modules 中的代码
  //         name: 'vendors',
  //         chunks: 'all',
  //       },
  //     },
  //   },
  // },
  externals: {
    'better-sqlite3': 'commonjs better-sqlite3',
    'ds': 'commonjs ds'
  },
  // 添加性能优化配置
  optimization: {
    moduleIds: 'deterministic', // 优化模块 ID
    minimize: true, // 启用压缩
  }
};
