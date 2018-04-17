const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: path.join(__dirname, '../client/app.js')
    },
    output: {
        filename: '[name].[hash].js',
        path: path.join(__dirname, '../dist'),
        publicPath: '/public'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader'
            }
        ],
        plugins: [
            new HTMLPlugin()
        ]
    }
}