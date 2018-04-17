const express =require('express');
const ReactSSR = require('react-dom/server');
const serverOutput = require('../dist/server.output').default;
//因为server.output.js默认导出App，而commonjs2规范的require导入的是server.output的整个部分，并不是它的默认导出，所以需要在后面加上.default

const app = express();

app.get('*', function(req, res) {
    const appString = ReactSSR.renderToString(serverOutput);
    res.send(appString);
})

app.listen(3333, function() {
    console.log('server is listening on 3333')
})