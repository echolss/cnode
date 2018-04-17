const express =require('express');
const ReactSSR = require('react-dom/server');
const fs = require('fs');
const path = require('path');  //在使用到路径时，一般引入path，保证绝对路径，避免出错
const serverOutput = require('../dist/server.output').default;
//因为server.output.js默认导出App，而commonjs2规范的require导入的是server.output的整个部分，并不是它的默认导出，所以需要在后面加上.default

const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8'); //同步读取文件
//指定以utf8的格式读进来，将之变成String

const app = express();

app.use('/public', express.static(path.join(__dirname, '../dist')));
//给静态文件指定对应的请求返回

app.get('*', function(req, res) {
    const appString = ReactSSR.renderToString(serverOutput);
    res.send(template.replace('<app></app>', appString));  //替换<app></app>
})

app.listen(3333, function() {
    console.log('server is listening on 3333')
})