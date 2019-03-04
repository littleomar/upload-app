const Koa = require('koa')
const cors = require('koa2-cors')



const koaBody = require('koa-body');
const mongoose = require('mongoose');
const dbConfig = require('./dbs/config');
const files = require('./interface/files');
const users = require('./interface/users');
const admin = require('./interface/admin');
const passport = require('./interface/utils/passport');
const Redis = require('koa-redis');
const session = require('koa-generic-session');
const path = require('path')
const server = require('koa-static')


const app = new Koa();


app.use(cors({
  origin: 'http://127.0.0.1:8080',
  credentials: true
}));

app.use(server(path.resolve(__dirname,'../dist')))

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 2000*1024*1024    // 设置上传文件大小最大限制，默认2M
  }
}));

mongoose.connect(dbConfig.dbs,{
  useNewUrlParser: true
});
app.keys = ['upapp','keys'];


app.use(session({key:'upapp',prefix: 'up:uid',store: new Redis()}));

app.use(passport.initialize());
app.use(passport.session());

app.use(files.routes()).use(files.allowedMethods());
app.use(users.routes()).use(users.allowedMethods());
app.use(admin.routes()).use(admin.allowedMethods());




const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || 3000

app.listen(PORT, HOST, () => {
  console.log(`server is listening on ${HOST}:${PORT}`)
})
