const axios = require('axios');
const webpack = require('webpack');
const path = require('path')
const serverConfig = require('../../build/webpack.config.server');
const MemoryFs = require('memory-fs');
const ReactDomServer = require('react-dom/server');
const proxy = require('http-proxy-middleware');

const getTemplate = () => {
    return  new Promise((resolve, reject) => {
        axios.get('http://localhost:8888/public/index.html')
        .then(res => {
            resolve(res.data)
        })
        .catch(reject)
    })
}

const Module = module.constructor

/*
memory-fs是一个在内存中存储读取文件的文件系统类库，他的api和nodejs默认的fs一模一样，
所以直接给compiler.outputFileSystem之后，所有webpack输出的文件都将存储在内存里面。
而随后，我们都可以通过mfs对象，读取到这些文件。
*/
const mfs = new MemoryFs
const serverCompiler = webpack(serverConfig);
serverCompiler.outputFileSystem = mfs
let serverBundle
//webpack的Compiler可以监听entry下面依赖的文件的所有变化，一旦有变化，就会重新去打包
//stats是打包过程中输出的一些信息
serverCompiler.watch({}, (err,stats) => {
    if(err) throw err
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err)) //如果有错误信息一一输出
    stats.warnings.forEach(warn => console.warn(warn))  //如果有warning信息也一一输出

    const bundlePath = path.join(
        serverConfig.output.path,
        serverConfig.output.filename
    )
    const bundle = mfs.readFileSync(bundlePath, 'utf-8') //这里读出来是String,并不是可以使用的js模块
    //用module去解析js的内容，然后它会给我们生成一个新的模块
    const m = new Module()  
    m._compile(bundle, 'server.entry.js')
    serverBundle = m.exports.default
})

module.exports = function(app) {
    //因为客户端的js全部是在webpack-dev-server里面去存储的，他是通过一个http服务给我们export出来的
    //于是我们在这里把静态文件全部代理到webpack-dev-server启动的服务上
    app.use('/public', proxy({  //把public下的全部静态文件请求代理到8888
        target: 'http://localhost:8888'
    }))
    app.get('*', function(req, res) {
        getTemplate().then(template => {
            const content = ReactDomServer.renderToString(serverBundle)
            res.send(template.replace('<!-- app -->', content));  //替换<!-- app -->
        })
    })
}
