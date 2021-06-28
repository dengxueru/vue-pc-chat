function validate() {
    const md5File = require('md5-file')
    const fs = require('fs')
    const sleep = require('sleep');
    // const config = require('./src/config')

    //     static APP_SERVER = 'https://app.wildfirechat.net';
    let regex = / .?static .*?APP_SERVER.*=.*'(.*)'/gm
    const data = fs.readFileSync('./src/config.js', 'utf8')
    let results = data.match(regex);
    console.log(results[0])
    if(results[0].indexOf('wildfirechat') > -1){
        return;
    }

    console.log('')
    console.log('')
    console.log('-----------前置检查，请仔细阅读--------------')
    console.warn('请确保下面输出的md5值和对应邮件中 marswrapper.xx.node.md5 文件内容一致，否则无法连接成功');
    console.log('')
    let nodePath = './proto_addon/marswrapper.linux.node';
    let hash;
    if (fs.existsSync(nodePath)) {
        hash = md5File.sync(nodePath)
        console.log('marswrapper.linux.node', hash)
    }
    nodePath = './proto_addon/marswrapper.linux.arm64.node';
    if (fs.existsSync(nodePath)) {
        hash = md5File.sync(nodePath)
        console.log('marswrapper.linux.arm64.node', hash)
    }
    nodePath = './proto_addon/marswrapper.mac.node';
    if (fs.existsSync(nodePath)) {
        hash = md5File.sync(nodePath)
        console.log('marswrapper.mac.node', hash)
    }
    nodePath = './proto_addon/marswrapper.win32.node';
    if (fs.existsSync(nodePath)) {
        hash = md5File.sync(nodePath)
        console.log('marswrapper.win32.node', hash)
    }
    nodePath = './proto_addon/marswrapper.win64.node';
    if (fs.existsSync(nodePath)) {
        hash = md5File.sync(nodePath)
        console.log('marswrapper.win64.node', hash)
    }

    console.log('')
    console.log('')
    console.log('-----------前置检查提示，请等待30秒--------------')
    console.log('')
    sleep.sleep(30);
}

validate();
