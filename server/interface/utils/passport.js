const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../../dbs/models/users');


passport.use(new LocalStrategy(async ( email, password, done ) => {
  let where = { email };
  let result = await UserModel.findOne( where );
  if (!result) return done(null,false,'用户名不存在');
  if (result.status === 0 ) return done(null,false,'该用户未通过审核');
  if (result.password !== password)  return done(null,false,'用户密码错误');
  return done(null,result)
}));

passport.serializeUser((user,done) => {
  done(null,user)
});
passport.deserializeUser((user,done)=>{
  return done(null,user)
});

module.exports = passport;
