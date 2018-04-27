const path = require('path')
const baseConfig = require('./webpack.base')
const webpackMerge = require('webpack-merge')

module.exports = webpackMerge(baseConfig, {
  target: 'node', // 代表打包出来的内容的执行环境
  entry: {
    app: path.join(__dirname, '../client/server.entry.js')
  },
  output: {
    filename: 'server.output.js',
    libraryTarget: 'commonjs2' // 使用模块的方案，AMD,CMD....
  }
})
