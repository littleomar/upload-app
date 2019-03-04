const Path = require('path');
const Router = require('koa-router');
const User = require('../dbs/models/users');
const Redis = require('koa-redis');
const Email = require('../dbs/config');
const nodeMailer = require('nodemailer');

const store = new Redis().client;


const router = new Router({prefix: '/api/admin'});

router.all('*',async (ctx,next) => {
  if (ctx.isAuthenticated()) {
    const { email, realname, role } = ctx.session.passport.user;
    if (role !== 0) {
      ctx.body = {
        code: 5,
        message: '该用户无权限'
      };
      return false;
    } else {
      await next()
    }
  } else {
    ctx.body = {
      code: 1,
      message: '用户未登录'
    }
  }
});

router.get('/allUser',async ctx => {
  let { page } = ctx.request.query;
  let pageLen = 10;
  page = page ? page : 1;
  let total = (await User.find({})).length;
  let allUser = await User.find({}).limit(pageLen).skip((page-1)*pageLen);
  if (allUser) {
    ctx.body = {
      code: 0,
      message: '获取用户数据成功',
      total,
      userInfo: allUser.map(item=>{
        let status = {};
        let role = {};
        if ( item.status === 0 ) {
          status = {
            code: item.status,
            msg: '待审核'
          }
        } else if (item.status === 1) {
          status = {
            code: item.status,
            msg: '已通过'
          }
        } else if (item.status === 2) {
          status = {
            code: item.status,
            msg: '未通过'
          }
        }
        if (item.role === 0) {
          role = {
            code: item.role,
            msg: '管理员'
          }
        } else if (item.role === 1) {
          role = {
            code: item.role,
            msg: '普通用户'
          }
        }
        return {
          id: item._id,
          email: item.email,
          realname: item.realname,
          status,
          role
        }
      })
    }
  }
});

router.get('/userDetail',async ctx => {
  let email = ctx.request.query.email;
  let userRes = await User.findOne({email});
  if (!userRes) {
    ctx.body = {
      code: 1,
      message: '用户不存在'
    };
    return false;
  }
  ctx.body = {
    code: 0,
    message: '用户信息获取成功',
    userInfo: userRes
  }
});




module.exports = router;
