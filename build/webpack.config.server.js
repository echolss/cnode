const path = require('path')

module.exports = {
  target: 'node', // 代表打包出来的内容的执行环境
  entry: {
    app: path.join(__dirname, '../client/server.entry.js')
  },
  output: {
    filename: 'server.output.js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/public',
    libraryTarget: 'commonjs2' // 使用模块的方案，AMD,CMD....
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude: [
          path.resolve(__dirname, '../node_modules')
        ]
      },
      {
        test: /.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [
          path.join(__dirname, '../node_modules')
        ]
      }
    ]
  }
}
