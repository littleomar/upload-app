const Path = require('path');
const Router = require('koa-router');
const User = require('../dbs/models/users');
const Redis = require('koa-redis');
const Email = require('../dbs/config');
const nodeMailer = require('nodemailer');
const Passport = require('./utils/passport');
const File = require('../dbs/models/files');
const fs = require('fs');

const store = new Redis().client;


const router = new Router({prefix: '/api/user'});

let transporter = nodeMailer.createTransport({
  service: 'qq',
  auth: {
    user: Email.smtp.user,
    pass: Email.smtp.pass
  }
});

router.all('/admin', async (ctx,next) => {
  if (!ctx.isAuthenticated()) {
    ctx.body = {
      code: 1,
      message: '请先登录'
    };
    return false;
  } else if ( ctx.session.passport.user.role !== 0 ) {
    ctx.body = {
      code: 2,
      message: '该用户无权限'
    };
    return false;
  }
  await next();
});

router.post('/register',async ctx => {
  const {  realname, password, code, email } =  ctx.request.body;
  if (!(password&&email&&realname&&code)) {
    ctx.body = {
      code: 1,
      message: '用户信息不完整'
    };
    return false;
  }
  if (code === await store.get(email)) {
    let user = await User.findOne({email,realname});
    if ( user ) {
      ctx.body = {
        code: 1,
        message: '该用户已存在'
      }
    }  else {
      let resCreate = await User.create({realname,password,email,status:0,role:1});
      if ( resCreate ) {
        let mailOptions = {
          from: `"注册通知"<${Email.smtp.user}>`,
          to: email,
          subject: '用户注册提醒',
          html: `<!DOCTYPE html>
                    您在文件上传网站有新的用户注册，用户信息为：<br/>
                    email: ${email}<br/>
                    真实姓名：${realname}<br/>
                    <a href="${Email.domain}/admin/userdetail/${email}">点击审核</a>
                </html>`
        };
        await transporter.sendMail( mailOptions, (error,info) => {
          if (error) {
            return console.log(error)
          }
        });
        ctx.body = {
          code: 0,
          message: '注册成功，请等待管理员审核'
        }
      }
    }
  } else {
    ctx.body = {
      code: 1,
      message: '验证码错误'
    }
  }
});

router.get('/cancel', async ctx => {
  let email = ctx.request.query.email;
  if (!email) {
    ctx.body = {
      code: 1,
      message: '请输入邮箱'
    };
    return false;
  }
  let emailRes = await User.findOne({email});
  if (!emailRes) {
    ctx.body = {
      code: 1,
      message: '用户不存在'
    }
  }
  if ( emailRes.status === 1 ) {
    ctx.body = {
      code: 1,
      message: '该用户已注册成功，不得撤销申请'
    }
    return false;
  }
  await User.deleteOne({email});
  ctx.body = {
    code: 0,
    message: '撤销申请成功'
  }
});

router.get('/code', async ctx => {
  let email = ctx.request.query.email;
  if (!email) return false;
  let code = '';

  if (await store.exists(email)) {
    if (await store.ttl(email)>850) {
      ctx.body = {
        code: 1,
        message: '操作过于频繁，请稍后再试！'
      };
      return false;
    } else {
      await store.expire(email,900);
      code = await store.get(email)
    }
  } else {
    code = Math.random().toString(16).slice(2,8).toUpperCase();
    await store.set(email,code);
    await store.expire(email,900);
  }

  let mailOptions = {
    from: `"认证邮件"<${Email.smtp.user}>`,
    to: email,
    subject: 'XX网认证邮件',
    html: `<!DOCTYPE html>
                您在XX网中注册，您的验证码为 <span style="font-size: 32px;color: cornflowerblue">${code}</span> ,验证码15分钟内有效，请勿泄露与他人。
            </html>
    `
  };
  await transporter.sendMail(mailOptions,(error,info)=>{
    if (error) {
      return console.log(error);
    }
  });
  ctx.body = {
    code: 0,
    message: '验证码发送成功，15分钟内有效'
  }
});

router.get('/exit', async ctx => {
  await ctx.logout();
  if (!ctx.isAuthenticated()) {
    ctx.body = {
      code: 0,
      message: '登出成功'
    }
  } else {
    ctx.body = {
      code: 1
    }
  }
});

router.post('/admin/modify',async ctx => {
  let { email, status, role, realname } = ctx.request.body;
  let user = await User.findOne({email});
  if (!user) return false;
  status = parseInt(status);
  role = parseInt(role);
  let oldStatus = user.status;
  let oldRealname = user.realname;
  let dupName = await User.findOne({realname});
  if (dupName&&dupName.email!==email) {
    ctx.body = {
      code: 3,
      message: '姓名重复'
    };
    return false
  }
  let modifyRes = await user.updateOne({
    realname,
    status,
    role
  });


  if (modifyRes.nModified === 1) {
    if (oldRealname !== realname) {
      await File.find({email}).updateMany({realname})
    }
    ctx.body = {
      code: 0,
      message: '修改成功'
    }
  }
  if (oldStatus !==1&&status === 1) {
    let mailOptions = {
      from: `"认证邮件"<${Email.smtp.user}>`,
      to: email,
      subject: 'XX网认证通过邮件',
      html: `<!DOCTYPE html>
                您在XX网中提交的注册申请已经通过管理员审核，请<a href="${Email.domain}">点击</a>登录。
             </html>`
    };
    await transporter.sendMail(mailOptions,(error,info)=>{
      if (error) {
        return console.log(error);
      }
    });
  }

});

router.get('/admin/removeUser', async ctx => {
  let { email } = ctx.request.query;
  if (!email) return false;
  userRes = await User.findOne({email});
  if (userRes.role === 0) {
    ctx.body = {
      code: 1,
      message: '无法删除管理员'
    };
    return false;
  }
  await User.deleteOne({email});


  let fileArray = await File.find({email});
  fileArray.map( async item=>{
    await fs.unlinkSync(Path.resolve(__dirname,`../../upload/${item.name}`));
  });


  await File.remove({email});

  ctx.body = {
    code: 0,
    message: '删除成功'
  }
});

router.get('/query', async ctx => {
  let email = ctx.request.query.email;
  let resEmail = await User.findOne({email});
  if (!resEmail) {
    ctx.body = {
      code: 0,
      message: '您所查询的用户不存在'
    };
    return false;
  }
  if ( resEmail.status === 0 ) {
    ctx.body = {
      code: 1,
      message: '审核中，请您耐心等候'
    };
  } else if ( resEmail.status === 1 ) {
    ctx.body = {
      code: 2,
      message: '审核已通过，请登陆'
    };
  } else if ( resEmail.status === 2 ) {
    ctx.body = {
      code: 3,
      message: '审核不通过，请您重新注册或者联系管理员'
    };
  }
});

router.get('/verify', async ctx => {
  let type = Object.keys(ctx.request.query)[0];
  let { email, realname, code } = ctx.request.query;
  let res = '';
  switch( type ){
    case 'email':
      res = await User.findOne({email});
      if (res) {
        if (res.status === 0) {
          ctx.body = {
            code: 1,
            message: '审核未通过'
          }
        } else {
          ctx.body = {
            code: 2,
            message: '通过审核的邮箱'
          }
        }
      } else {
        ctx.body = {
          code: 0,
          message: '邮箱可用'
        }
      }
      break;
    case 'code':
      res = await store.get(email);
      if (res === code) {
        ctx.body = {
          code: 0,
          message: ''
        }
      } else {
        ctx.body = {
          code: 1,
          message: '验证码错误'
        }
      }
      break;
    case 'realname':
      res = await User.findOne({realname});
      if (res) {
        if (res.email !== email) {
          ctx.body = {
            code: 1,
            message: '该用户已经被注册'
          }
        } else {
          ctx.body = {
            code: 0,
            message: '姓名可用'
          }
        }
      } else {
        ctx.body = {
          code: 0,
          message: '姓名可用'
        }
      }
      break;
  }
});

router.post('/login', async (ctx,next) => {
  ctx.request.body.username = ctx.request.body.email;
  return Passport.authenticate('local',(err,user,info,status)=>{
    if (err) {
      ctx.body = {
        code: 1,
        message: err
      }
    } else {
      if (user) {
        userInfo = {
          email: user.email,
          realname: user.realname,
          role: user.role,
          status: user.status
        };
        ctx.body = {
          code: 0,
          message: '登录成功',
          userInfo,
        };
        ctx.login(userInfo)
      } else {
        ctx.body = {
          code: 1,
          message: info
        }
      }
    }
  })(ctx,next)

});

router.post('/modifypass', async ctx=>{
  const { password, code, email } =  ctx.request.body;
  if (!(password&&email&&code)) {
    ctx.body = {
      code: 1,
      message: '用户信息不完整'
    };
    return false;
  }
  if (code === await store.get(email)) {
    let user = await User.findOne({email});
    if ( !user ) {
      ctx.body = {
        code: 1,
        message: '该用户不存在'
      }
    }  else {
      let resUpdate = await User.findOne({email}).updateOne({password});
      if ( resUpdate ) {
        ctx.body = {
          code: 0,
          message: '密码修改成功'
        }
      }
    }
  } else {
    ctx.body = {
      code: 1,
      message: '验证码错误'
    }
  }
});

router.get('/getUser',async ctx => {
  if (!ctx.isAuthenticated()) {
    ctx.body = {
      code: 2,
      message: '请先登录'
    }
  }
  let { email } = ctx.request.query;
  if (!email) {
    let userRes = ctx.session.passport.user;
    if (!userRes) return false;
    ctx.body = {
      code: 0,
      message: '用户信息获取成功',
      user: {
        realname: userRes.realname,
        email: userRes.email,
        role: userRes.role,
        status: userRes.status
      }
    };
    ctx.body = {
      user: {
        email: `767745133@qq.com`
      }
    };
    return;
  }
  let userRes = await User.findOne({email});
  if (!userRes) return false;
  ctx.body = {
    code: 0,
    message: '用户信息获取成功',
    user: {
      realname: userRes.realname,
      email: userRes.email,
      role: userRes.role,
      status: userRes.status
    }
  }
});

router.get('/isLogin', async ctx => {
  if (!ctx.isAuthenticated()) {
    ctx.body = {
      code: 1,
      message: '未登录'
    };
    return false;
  }
  ctx.body = {
    code: 0,
    message: '已登录'
  };
});






module.exports = router;
