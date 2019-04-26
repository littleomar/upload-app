

const Path = require('path');
const Router = require('koa-router');
const File = require('../dbs/models/files');
const fs = require('fs')
const send = require('koa-send')



const router = new Router({prefix: '/api/file'});


Date.prototype.Format = function (fmt) { //author: meizz
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};

router.get('/download', async ctx => {
  let _id = ctx.request.query.id;
  let file = await File.findOne({_id});

  ctx.attachment(file.filename);

  await send(ctx,`/upload/${file.name}`)
});

router.all('*',async (ctx,next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.body = {
      code: 4,
      message: '请登录后再查看'
    }
  }
});

router.get('/list',async ctx => {
  let { page,email } = ctx.request.query;
  let where = email ? {email}: {};
  page = page ? page : 1;
  let pageSize = 10;
  let message = [];
  let total = (await File.find(where)).length;
  let list = await File.find(where).sort({'time':-1}).limit(pageSize).skip((page-1)*pageSize);
  list.map(item=>{
    message.push({
      filename: item.filename,
      type: item.type,
      time: new Date(parseInt(item.time)).Format("yyyy-MM-dd hh:mm:ss"),
      id: item._id,
      email: item.email,
      realname: item.realname,
      delete: ctx.session.passport.user.role === 0 || item.email === ctx.session.passport.user.email
    })
  });

  ctx.body = {
    code: 0,
    total,
    message
  }
});

router.post('/add',async ctx => {
  const {name,type,path,size} = ctx.request.files['file'];
  if (size >= 1100*1024*1024) {
    ctx.body = {
      code: 1,
      message: '文件大小超出限制'
    };
    return false;
  }
  let fileName = Math.random().toString(16).slice(2,10);

  await fs.renameSync(path,Path.resolve(__dirname,`../../upload/${fileName}_${name}`));

  let saveRes = await File.create({name:fileName+'_'+name,
    filename:name,
    type,
    time:new Date().getTime(),
    realname: ctx.session.passport.user.realname,
    email: ctx.session.passport.user.email,
  });

  if (saveRes) {
    ctx.body = {
      code: 0,
      message: '文件上传成功'
    };
  } else {
    ctx.body = {
      code: 1,
      message: '文件上传失败'
    };
  }
});

router.get('/delete',async ctx => {
  let _id = ctx.request.query.id;
  let file = await File.findOne({_id});
  if (!file) {
    ctx.body = {
      code: 2,
      message: '文件不存在'
    }
  }
  if (!(ctx.session.passport.user.role === 0 || file.email === ctx.session.passport.user.email)) {
    ctx.body = {
      code: 1,
      message: '无权限'
    }
  }
  await fs.unlinkSync(Path.resolve(__dirname,`../../upload/${file.name}`));
  await File.deleteOne({_id});
  ctx.body = {
    code: 0,
    message: '删除成功'
  }

});

router.get('/download', async ctx => {
  let _id = ctx.request.query.id;
  let file = await File.findOne({_id});

  ctx.attachment(file.filename);

  await send(ctx,Path.resolve(__dirname,`../../upload/${file.name}`))
});





module.exports = router;

