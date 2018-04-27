# 从零搭建webpack+react项目
本文将记录如何从零开始搭建一个webpack+react的项目，在开始之前请确保你安装了node.js。友情链接：[node.js 安装包地址](https://nodejs.org/en/)
## npm init
初始化项目，创建一个package.json。
## npm install webpack --save
安装webpack
## npm install react --save
安装react
## 在根目录下创建一个命名为build的文件夹
在build文件夹下，我们会放一些我们的配置文件、一些webpack的config文件、以及其他的我们在工程里面需要用到的脚本文件。
## 在根目录下创建一个命名为client的文件夹
这个文件夹下放前端应用的文件
## 在client目录下新建一个命名为app.js的js文件
app.js作为应用的入口
## 在client目录下新建一个命名为App.jsx的jsx文件
声明整个应用的页面上的内容
## 在bulid目录下新建一个命名为webpack.config.js的js文件
先配置好入口和出口文件

```
const path = require('path')

module.exports = {
    entry: {
        app: path.join(__dirname, '../client/app.js')
    },
    output: {
        filename: '[name].[hash].js',
        path: path.join(__dirname, '../dist'),
        publicPath: '/public'
    }
}
```
## 在package.json的"scripts"代码里，添加一行命令：

```
"build": "webpack --config build/webpack.config.js"
```
使webpack按照webpack.config.js进行打包
## 在app.js里随便添加一行代码

```
alert('123');
```
## 运行npm run build命令
你就会发现生成了dist文件夹，dist文件下有一个app.[hash值].js文件，这个文件的最后部分可以看到 alert('123');
## npm install react-dom --save
安装react-dom
## 写一个简单的App组件
在App.jsx添加如下代码：

```
import React from 'react';

export default class App extends React.Component {
    render() {
        return (
            <h1>Hello, echo</h1>
        );
    }
}
```
## 渲染App组件
在app.js添加如下代码：

```
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';

ReactDOM.render(
    <App/>,
    document.body
);
```
## 安装babel-loader并配置
实际上，上述jsx代码需要为它配置loader转译。
- npm install babel-loader --save-dev
- npm install babel-core --save-dev
- 在webpack.config.js的module.exports的对象里添加如下代码：

```
module: {
    rules: [
        {
            test: /\.(js|jsx)$/,
            loader: 'babel-loader'
        }
    ]
}
```
## 配置jsx环境
在上述配置好babel-loader之后运行npm run build发现会报错，其中的jsx代码并不能被编译，因为babel默认运行es6代码。

解决办法是在根目录下创建一个名为 *.babelrc* 的文件，加上如下代码：

```
{
    "presets": [
        ["es2015", {"loose": true}],
        "react"
    ]
}
```
还需要为其配置里安装所需要的插件：

*npm install babel-preset-es2015 babel-preset-es2015-loose babel-preset-react --save-dev*

此时，再执行npm run build就发现可以成功编译了。
## 在浏览器中显示
- 首先，需要安装html-webpack-plugin，npm install html-webpack-plugin --save-dev
- 其次在webpack.config.js中引入此插件：

```
const HTMLPlugin = require('html-webpack-plugin');
```
- 在module对象下面添加如下代码：

```
plugins: [
    new HTMLPlugin()
]
```
此时，再运行npm run build，会发现，dist目录除了生成js文件外还生成了一个index.html文件。将这个html用浏览器打开，发现报错了，说app.xxx.js文件没有找到，是因为没有做路径映射。

解决方法是，修改webpack.config.js的publicPath：

```
publicPath: ''
```
为保证js文件也要被正确编译，将webpack.config.js的rules的代码修改为：

```
rules: [
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
```
这里的exclude表示编译时不需要编译哪些文件。

此时，删掉dist目录，再运行npm run build，将index.html用浏览器打开，会发现页面可以显示：Hello,echo 了。
## 配置服务端打包
1. 在client目录下新建一个名为server.entry.js的文件，为服务端的入口文件，加上代码为：

```
import React from 'react';
import App from './App.jsx';

export default <App/>
```
2. 在build目录下，新建一个名为webpack.config.server.js的文件，用来作为webpack打包服务端代码的配置文件，加上代码为：

```
const path = require('path');

module.exports = {
    target: 'node', //代表打包出来的内容的执行环境
    entry: {
        app: path.join(__dirname, '../client/server.entry.js')
    },
    output: {
        filename: 'server.output.js',
        path: path.join(__dirname, '../dist'),
        publicPath: '',
        libraryTarget: 'commonjs2' //使用模块的方案，AMD,CMD....
    },
    module: {
        rules: [
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
```
3. 为区别，将webpack.config.js重命名为webpack.config.client.js
4. 安装rimraf，npm install rimraf --save-dev，rimraf是以包的形式包装rm -rf命令，用来删除文件和文件夹的，不管文件夹是否为空，都可删除。
5. 重新配置npm run build的命令，修改package.json的"scripts"的代码为：

```
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build:client": "webpack --config build/webpack.config.client.js",
    "build:server": "webpack --config build/webpack.config.server.js",
    "clear": "rimraf dist",
    "build": "npm run clear && npm run build:client && npm run build:server"
  },
```
这样，npm run build的命令执行的内容是：先删除dist文件夹，然后打包客户端文件，最后打包服务端文件。

你可以试着运行npm run build，看看效果。
## 建立服务端渲染
1. 在根目录下新建一个名为server的文件夹，用来放置服务端的代码。
2. 安装express，原来作为服务端的框架，npm install express --save
3. 在server目录下新建一个名为server.js的js文件，加上代码为：

```
const express =require('express');
const ReactSSR = require('react-dom/server');
const serverOutput = require('../dist/server.output').default;
//因为server.output.js默认导出App，
//而commonjs2规范的require导入的是server.output的整个部分，
//并不是它的默认导出，所以需要在后面加上.default

const app = express();

app.get('*', function(req, res) {
    const appString = ReactSSR.renderToString(serverOutput);
    res.send(appString);
})

app.listen(3333, function() {
    console.log('server is listening on 3333')
})
```
4. 在package.json配置npm start的命令：

```
"start": "node server/server.js"
```
使其启动是的服务端。

此时，运行npm start， 用浏览器打开[http://localhost:3333/](http://localhost:3333/)，就可以看到：Hello,echo 了。
## 完善服务端渲染
在http://localhost:3333/这个页面，可以看到服务端返回内容的是<h1 data-reactroot="">Hello, echo</h1>，而实际中我们并不会返回如此简单的代码，而且这个页面并没有引用客户端的js。

因此，我们需要把服务端渲染的内容插到dist下的index.html，然后将整个html的内容返回到浏览器端，这样才算是走通服务端渲染的整个流程。具体做法是：
1. 在client文件夹下新建一个名为template.html的html模板文件，加上代码：

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>cnode..</title>
  </head>
  <body>
      <div id="root"><app></app></div>
      <!-- <app></app>这部分内容是在服务端渲染时将它替换掉,客户端渲染也需要替换 -->
  </body>
</html>
```
2. 这时，App组件也不需要挂载在body了，修改app.js的render代码为：

```
ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
```
3. 在webpack.config.client.js里使用上述template.html。将plugins的代码改为：

```
plugins: [
    new HTMLPlugin({
        template: path.join(__dirname, '../client/template.html')
    })
]
```
这样的话dist目录下打包生成的html，会以template.html作为模板，并插入生成的js。
3. 在server端读取打包生成的html，将server.js的代码更改为：

```
const express =require('express');
const ReactSSR = require('react-dom/server');
const fs = require('fs');
const path = require('path');  //在使用到路径时，一般引入path，保证绝对路径，避免出错
const serverOutput = require('../dist/server.output').default;
//因为server.output.js默认导出App，
//而commonjs2规范的require导入的是server.output的整个部分，
//并不是它的默认导出，所以需要在后面加上.default

const app = express();

const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
//同步读取文件
//指定以utf8的格式读进来，将之变成String

app.get('*', function(req, res) {
    const appString = ReactSSR.renderToString(serverOutput);
    res.send(template.replace('<app></app>', appString));  //替换<app></app>
})

app.listen(3333, function() {
    console.log('server is listening on 3333')
})
```
4. 在http://localhost:3333/这个页面我们发现js请求返回的也是html，然而这是错误的，这时我们需要给server.js加上一行代码：

```
app.use('/public', express.static(path.join(__dirname, '../dist')));
//给静态文件指定对应的请求返回
```
然后，将webpack.config.client.js和webpack.config.server.js的publicPath改回：

```
publicPath: '/public',
```
这样可以方便服务端区分返回的静态内容和要渲染的内容，只要是/public开头的就全部返回静态文件。

此时，重新npm run build和npm start，发现返回的js是正确的了。

除此之外，发现浏览器报了一个warning，意思是用ReactDOM的hydrate方法替代render方法，
因为React 期望在服务器和客户端之间渲染的内容是相同的，因此修改app.js的render代码为：

```
ReactDOM.hydrate(
    <App/>,
    document.getElementById('root')
);
```
## 配置自动编译和自动启动server
每次我们更改代码都需要重新去编译和启动服务，非常繁琐。可以使用webpack提供的webpack dev server和Hot module replacement，Hot module
replacement可以免去改动之后需要刷新浏览器的动作。
### 1、配置webpack dev server
- 安装webpack dev server，npm install webpack-dev-server --save-dev
- 安装cross-env，npm install cross-env --save-dev。cross-env是运行跨平台设置和使用环境变量的脚本。
- 在package.json配置webpack dev server命令：

```
"dev:client": "cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.client.js",
```
- 更改webpack.config.client.js的代码为：

```
const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';//判断是否是开发环境

const config = {
    entry: {
        app: path.join(__dirname, '../client/app.js')
    },
    output: {
        filename: '[name].[hash].js',
        path: path.join(__dirname, '../dist'),
        publicPath: '/public/'
    },
    module: {
        rules: [
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
    },
    plugins: [
        new HTMLPlugin({
            template: path.join(__dirname, '../client/template.html')
        })
    ]
}

if (isDev) {
    config.devServer = {
      host: '0.0.0.0',  //指定使用一个 host。默认是 localhost。如果你希望服务器外部可访问，指定如左
      port: '8888',    //指定要监听请求的端口号
      contentBase: path.join(__dirname, '../dist'),
      //contentBase告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要。
      //默认情况下，将使用当前工作目录作为提供内容的目录，但是你可以修改为其他目录：
      hot: true,  //启用 webpack 的模块热替换特性(Hot module replacement)
      overlay: {  //在编译器错误或警告时，在浏览器中显示显示其信息。
        errors: true  //只显示编译错误
      }
    }
  }

  module.exports = config
```
此时运行npm run dev:client，发现服务成功启动。用浏览器访问[http://localhost:8888/](http://localhost:8888)，发现js文件是404。解决方法是在webpack.config.client.js的config.devServer的代码加上一项：

```
publicPath: '/public/',   //用于确定应该从哪里提供 js，并且此选项优先。
historyApiFallback: {      //任意的 404 响应都可能需要被替代为 index.html
   index: '/public/index.html'
}
```
重新运行npm run dev:client，发现js仍然是404，原来是因为原先我们有一个dist目录，所以我们先把dist目录删掉，再运行npm run dev:client，发现js可以了，但是页面却没有显示。原因是我们开启了hot module但是我们并没有安装它，先讲开启热加载注释掉：

```
//hot: true,  //启用 webpack 的模块热替换特性(Hot module replacement)
```
为了规范，把我们的template.html的

```
<app></app>
```
替换为：

```
<!-- app -->
```
随之，server.js也改为：

```
res.send(template.replace('<!-- app -->', appString));  //替换<!-- app -->
```
这时，再重新运行npm run
dev:client，发现页面显示了：Hello,echo。但浏览器报了一个warning：

```
Warning: Expected server HTML to contain a matching <div> in <div>.
```
这是因为react16.1加了一个提醒，在没有提供服务端渲染的情况下，使用hydrate会有这个warning，因为hydrate是用在有服务端渲染的情况。而后面我们会用到服务端渲染，所以暂时先忽略这个warning。
### 2、配置Hot module replacement
- 安装react-hot-loader，npm install react-hot-loader --save-dev
- 配置react-hot-loader，在.babelrc的对象里新加一项：

```
"plugins": [
    "react-hot-loader/babel"
 ]
```
- 给app.js加上一段代码：

```
//当需要热更新的代码出现时，就去把整个App重新加载一遍
if(module.hot) {
    module.hot.accept('./App.jsx', () => {
        const NextApp = require('./App.jsx').default    //因为用的require，所以后面加.default
        ReactDOM.hydrade(
            <NextApp/>,
            document.getElementById('root')
        )
    })
}
```
此时，将app.js的Hello, echo改成Hello, World保存，发现页面并没有自动更新。接下来，还需做一些事情。
- 在webpack.config.client.js中：
1. 引入webpack：

```
const webpack = require('webpack');
```

2. 开启热加载：

```
hot: true,  //启用 webpack 的模块热替换特性(Hot module replacement)
```

3. 在config.entry的下面加上一项：

```
config.plugins.push(new webpack.HotModuleReplacementPlugin())  //react-hot-loader需要与webpack这个插件结合使用
```
4. 在config.entry的上面加上一项：

```
config.entry = {
    app: [
        'react-hot-loader/patch',
        path.join(__dirname, '../client/app.js')
    ]
}
```
- 将app.js的代码修改为：

```
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App.jsx';

const root = document.getElementById('root');
//创建一个render方法
const render = Component => {
    ReactDOM.hydrate(
        <AppContainer>
            <Component/>
        </AppContainer>,
        root
    )
};

//当需要热更新的代码出现时，就去把整个App重新加载一遍
if(module.hot) {
    module.hot.accept('./App.jsx', () => {
        const NextApp = require('./App.jsx').default;    //因为用的require，所以后面加.default
        render(NextApp);
    })
}

render(App)
```
此时，重新运行npm run dev:client，然后刷新下页面开始测试：

将app.js的Hello,echo改为Hello,World，保存。发现页面并没有刷新的动作，但是内容已经自动更新成Hello,World了。这就是react-hot-loader的奇效。

其实，你应该注意到webpack.config.client.js的output里的publicPath前面都是'/public'，在这次我们将之变成了'/public/'。如果我们还是'/public'呢？

改回'/public'，重新运行npm run dev:client，然后刷新下页面开始测试：

将app.js的Hello,echo改为Hello,World，保存。发现页面又有了刷新的动作，react-hot-loader的失效了。

勾上谷歌浏览器的Network的Preserve log,将Hello,World改回Hello,echo，保存。

观察Network，发现有一个xxx.hot-update.json是404，原来，它的url地址是 http://localhost:8888/publicxxx.hot-update.json ，很明显，public后面应该有一个'/'。

所以，一定要记得把webpack.config.client.js的output里的publicPath的值写成'/public/'。
## 开发时的服务端渲染
因为在开发环境中我们使用的是热替换，没有dist目录，而服务端需要用到客户端的js。所以，服务端的也需要区分是否是开发环境。
- npm install memory-fs --save-dev
- npm install http-proxy-middleware --save-dev
- 将server.js的代码修改为：

```
const express =require('express');
const ReactSSR = require('react-dom/server');
const fs = require('fs');
const path = require('path');  //在使用到路径时，一般引入path，保证绝对路径，避免出错

const isDev = process.env.NODE_ENV === 'development';

const app = express();

if(!isDev) {
    const serverOutput = require('../dist/server.output').default;
    //因为server.output.js默认导出App，而commonjs2规范的require导入的是server.output的整个部分，并不是它的默认导出，所以需要在后面加上.default
    const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8'); //同步读取文件
    //指定以utf8的格式读进来，将之变成String
    app.use('/public', express.static(path.join(__dirname, '../dist')));
    //给静态文件指定对应的请求返回
    app.get('*', function(req, res) {
        const appString = ReactSSR.renderToString(serverOutput);
        res.send(template.replace('<!-- app -->', appString));  //替换<!-- app -->
    })
} else {
    const devStatic = require('./util/dev-static');
    devStatic(app);
}

app.listen(3333, function() {
    console.log('server is listening on 3333')
})
```
- 在server文件夹下新建一个util文件夹，然后在util文件夹下新建一个dev-static.js，代码为：

```
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
```
- 将package.json的命令：

```
"start": "node server/server.js"
```
修改为：

```
"dev:server": "cross-env NODE_ENV=development node server/server.js"
```
现在，先启动npm run dev:client，然后启动npm run dev:server，发现http://localhost:3333/也可以看到Hello,echo了。并且，这个页面还能热更新。
## 使用eslint和editorconfig规范代码
eslint是随着ECMAScript版本一直更新的Js lint工具。eslint可以配合git，在git commit代码的时候，使用git hook调用eslint进行代码规范验证，不规范的代码无法提交到仓库。

不同编辑器对文本的格式会有一定的区别，可能会拉取别人的代码就会报很多错误，因此我们需要使用editorconfig。
- 安装eslint相关：npm install babel-eslint eslint-config-airbnb eslint-config-standard eslint-loader eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-node eslint-plugin-promise eslint-plugin-react eslint-plugin-standard --save-dev
- 在项目根目录下新建一个名为.eslintrc的文件，内容为：
```
{
    "extends": "standard"
}
```
上面表示的意思是继承标准js代码的规则。standard和airbnb都是别人创造的标准。
- 在client目录下新建一个名为.eslintrc的文件，内容为：

```
{
    "parser": "babel-eslint",
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "extends": "airbnb",
    "rules": {
        "react/jsx-filename-extension": [0]
    }
}
```
我们可以自己在rules里制定规则，比如这里我们允许js文件里写jsx代码。（值为[0]意思为不检测；值为[1]意思为提醒为warning；值为[2]意思为提醒为error）。"parser"是指定eslint用哪种工具去解析js代码。"env"告诉环境，browser代表浏览器环境，因为有可能会用到node的变量，所以node为true。EsLint通过parserOptions，允许指定校验的ecmascript的版本，及ecmascript的一些特性，"ecmaVersion"定义js的版本，"sourceType"定义为"module"是因为我们是以模块的方式去写代码。
- 给webpack.config.client.js和webpack.config.server.js的rules下都加上一项：

```
{
    enforce: 'pre',
    test: /.(js|jsx)$/,
    loader: 'eslint-loader',
    exclude: [
        path.resolve(__dirname, '../node_modules')
    ]
}
```
enforce: 'pre'的意思是在执行真正的代码编译之前，先去执行eslint-loader检测代码，一旦检测报错，编译过程也就不进行下去。

此时，运行npm run dev:client，发现eslint给我们报了很多错，很多Expected linebreaks to be 'LF' but found 'CRLF'，这是因为不同的操作系统下，甚至是不同编辑器，不同工具处理过的文件可能都会导致换行符的改变。
- 在项目根目录下新建一个名为.editorconfig的文件，加上代码：

```
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```
root = true代表是项目根目录。[*]代表所有文件都用同样的规则。indent_style是使用Tab的样式。end_of_line统一行尾符。insert_final_newline代表写代码之后保存，如果末尾没有一行是空行，文件会在末尾自动生成一个空行。trim_trailing_whitespace表示，也许你在写一行代码结束后留了几个空格再换行，它就会帮你把这些多余的空格去掉。

为了使这个文件生效，如果你使用的编辑器是vscode，那么你需要安装一个名为EditorConfig for VS Code的插件，将那些需要规范的（你之前已经已经保存了）的文件的代码做一个简单的操作，例如：随意打一个空格，然后删除这个空格，保存。随之.editorconfig的规范在已经保存了文件里也生效了。
- 根据提示规范自己的代码，对于需要禁用eslint的地方可以在代码后面加上：
```
//eslint-disable-line
```
*注：将项目变成git项目，可以直接执行git init命令。*
- npm install husky --save-dev
- 在package.json添加两个命令：
```
"lint": "eslint --ext .js --ext .jsx client/",
"precommit": "npm run lint"
```
试着留一个eslint检测的错误，git commit代码，发现代码不能提交，改正错误，就能提交了。
## 优化客户端与服务端的webpack.config.js
- 在build目录下新建一个名为webpack.base.js的文件，此文件用来提取他们的公共代码：

```
const path = require('path')

module.exports = {
  output: {
    path: path.join(__dirname, '../dist'),
    publicPath: '/public/'
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

```
- npm install webpack-merge --save-dev，webpack-merge是webpack的一款用来merge代码的插件。
- 将webpack.config.client.js的代码更改为：

```
const path = require('path')
const webpack = require('webpack')
const HTMLPlugin = require('html-webpack-plugin')
const baseConfig = require('./webpack.base')
const webpackMerge = require('webpack-merge')

const isDev = process.env.NODE_ENV === 'development'

const config = webpackMerge(baseConfig, {
  entry: {
    app: path.join(__dirname, '../client/app.js')
  },
  output: {
    filename: '[name].[hash].js'
  },
  plugins: [
    new HTMLPlugin({
      template: path.join(__dirname, '../client/template.html')
    })
  ]
})

if (isDev) {
  config.entry = {
    app: [
      'react-hot-loader/patch',
      path.join(__dirname, '../client/app.js')
    ]
  }
  config.devServer = {
    host: '0.0.0.0',
    port: '8888',
    contentBase: path.join(__dirname, '../dist'),
    hot: true,
    overlay: {
      errors: true
    },
    publicPath: '/public/',
    historyApiFallback: {
      index: '/public/index.html'
    }
  }
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = config

```
- 将webpack.config.server.js的代码更改为：

```
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

```
## 修正favicon.ico
先运行npm run dev:client，再运行npm run dev:server，发现http://localhost:3333/的favicon.ico返回的还是html，这肯定是不对的。解决办法是：
1. npm install serve-favicon --save
2. 准备一个favicon.ico文件到项目根目录下
3. 在server.js里引用并指定路径：

```
const favicon = require('serve-favicon')

app.use(favicon(path.join(__dirname, '../favicon.ico')))
```
此时，先运行npm run dev:client，再运行npm run dev:server，发现http://localhost:3333/的favicon.ico可以看见啦。
## 配置nodemon，免服务重启
每次做一次改变都要重启npm run dev:client，再运行npm run dev:server，非常繁琐。而nodemon可以解决这个问题
1. 首先npm install nodemon --save-dev
2. 在根目录下创建一个名为nodemon.json的文件，其内容为：

```
{
  "restartable": "rs",
  "ignore": [
    ".git",
    "node_modules/**/node_modules",
    ".eslintrc",
    "client",
    "build"
  ],
  "env": {
    "NODE_ENV": "development"
  },
  "verbose": true,
  "ext": "js"
}

```
"restartable": "rs"代表nodemon要使用配置文件，如果没有这一项，这个配置文件不会生效。"ignore"代表不会去监听那些文件的改变，node_modules/**/node_modules意思是node_modules下所有文件包括node_modules下的node_modules。"env"代表环境。"verbose": true代表输出信息要详细。"ext"代表监听哪种类型的文件。
