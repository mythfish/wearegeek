var express = require('express');
var webot = require('weixin-robot');

var log = require('debug')('wearegeek:log');
var verbose = require('debug')('wearegeek:verbose');

// 启动服务
var app = express();

// 实际使用时，这里填写你在微信公共平台后台填写的 token
var wx_igeek_token = process.env.WX_IGEEK_TOKEN || '2Je41FU13MceTK2rvk19irx1fHvRXihi';
var wx_wearegeek_token = process.env.WX_WEAREGEEK_TOKEN || 'b1l200616cU09tggtkfAl0x9H8s8YSo6';

// remove this test code in production environment
try {
  // for submodulized repository only
  webot = require('../');
} catch (e) {}

// app.use(express.query());
app.use(express.cookieParser());
// 为了使用 waitRule 功能，需要增加 session 支持
// 你应该将此处的 store 换为某种永久存储。请参考 http://expressjs.com/2x/guide.html#session-support
// if(process.env.VCAP_SERVICES){
//     var env = JSON.parse(process.env.VCAP_SERVICES);
//     var mongo = env['mongodb-2.8'][0]['credentials'];
// }
// else{
//     var mongo = {
//     "hostname":"localhost",
//     "port":27017,
//     "username":"",
//     "password":"",
//     "name":"",
//     "db":"db"
//     }
// }
// var generate_mongo_url = function(obj){
//     obj.hostname = (obj.hostname || 'localhost');
//     obj.port = (obj.port || 27017);
//     obj.db = (obj.db || 'test');
//     if(obj.username && obj.password){
//         return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
//     }
//     else{
//         return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
//     }
// }
// var mongourl = generate_mongo_url(mongo);

app.use(express.session({ secret: 'abced111', store: new express.session.MemoryStore() }));

// 启动机器人, 接管 web 服务请求
webot.watch(app, { token: wx_igeek_token, path: '/igeek' });

// 载入路由规则
require('./rules')(webot);

// 若省略 path 参数，会监听到根目录
// webot.watch(app, { token: wx_token });

// 建立多个实例，并监听到不同 path ，
// 后面指定的 path 不可为前面实例的子目录
var webot2 = new webot.Webot();

webot2.set('hello', 'hi.');

webot2.watch(app, { token: wx_wearegeek_token, path: '/wearegeek' });

if(process.env.VCAP_SERVICES){
  // Listen port 80 on appforg server
  app.listen(80);
} else {
  // 在环境变量提供的 $PORT 或 3000 端口监听
  var port = process.env.PORT || 3000;
  app.listen(port, function(){
    log("Listening on %s", port);
  });

  // 微信接口地址只允许服务放在 80 端口
  // 所以需要做一层 proxy
  app.enable('trust proxy');
}

if(!process.env.DEBUG){
  console.log("set env variable `DEBUG=wearegeek:*` to display debug info.");
}
