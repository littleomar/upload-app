<template>
  <div class="login-wrapper">
    <el-form :model="loginForm" status-icon :rules="rules" ref="loginForm" label-width="80px" class="login-form">
      <el-form-item label="邮箱" prop="email" >
        <el-input type="email" v-model="loginForm.email" autocomplete="off" style="width: 250px"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pass"  style="width: 260px">
        <el-input type="password" v-model="loginForm.pass" autocomplete="off" style="width: 250px" @keyup.native.enter="submit"></el-input>
      </el-form-item>
    </el-form>
    <router-link to="/user/modifypass" style="display: block;text-align: right;margin-right: 20px;margin-bottom: 10px;color: black;font-size: 14px;">忘记密码？</router-link>
    <button class="login" @click.prevent="submit">登&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;录</button>
  </div>
</template>

<script>
  import axios from 'axios'
  export default {
    name: "Login",
    beforeRouteEnter(to,from,next) {
      if (!sessionStorage.getItem('user')){
        next()
      } else {
        if (from.path) {
          next(from.path)
        } else {
          next('/')
        }
      }
    },
    data (){
      let validateEmail = async (rule, value, callback) => {
        if (!value) return callback(new Error('请输入邮箱地址'));
        let re = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
        if (!re.test(value)) {
          return callback(new Error('邮箱格式不正确'));
        }
        let emailRes = (await axios.get(`http://47.95.215.162/api/user/verify?email=${this.loginForm.email}`)).data;
        if (emailRes.code === 0) return callback(new Error('该邮箱不存在'));
        if (emailRes.code === 1) return callback(new Error('该邮箱未通过审核'));
        return callback();
      };
      let validatePass = async (rule, value, callback) => {
        if (!value) {
          return callback(new Error('密码不能为空'));
        }
        let re = /^[\w_-]{6,16}$/;
        if (value.length <6 || value.length>16 ) {
          return callback(new Error('密码长度为6-16位'));
        }
        if (!re.test(value)) {
          return callback(new Error('密码格式不正确，只能包含数字，字母，\'_\'和\'-\''));
        }
        return callback();
      };
      return {
        url: '/',
        loginForm: {
          email: '',
          pass: ''
        },
        rules: {
          email: [
            { validator: validateEmail, trigger: 'blur' }
          ],
          pass: [
            { validator: validatePass, trigger: 'blur' }
          ]
        }
      }
    },
    beforeMount() {
      if ( this.$route.query.url ) {
        this.url = this.$route.query.url
      }
    },
    methods: {
      async submit() {
        this.$refs['loginForm'].validate(async valid=>{
          if (valid) {
            let res = (await axios({
              method: 'post',
              url: 'http://47.95.215.162/api/user/login',
              withCredentials: true,
              data: {
                email: this.loginForm.email,
                password: this.loginForm.pass
              }
            })).data;
            if (res.code === 0) {
              this.$confirm(`<span style="font-size: 32px">登陆成功~~~</span>`, '提示', {
                confirmButtonText: '确定',
                showCancelButton: false,
                showClose: false,
                center: true,
                dangerouslyUseHTMLString: true
              }).then(()=>{
                sessionStorage.setItem('user',JSON.stringify(res.userInfo));
                this.$router.push(this.url)
              })
            } else if( res.code === 1) {
              this.$alert(`<strong class="error-tips" style="font-size: 36px;color: red;">Oops!</strong><br/><span style="margin-top: 20px;display: block">用户名或密码错误</span>`,  {
                title: '提示',
                center: true,
                dangerouslyUseHTMLString: true
              });
            }
          } else {
            this.$alert(`<strong class="error-tips" style="font-size: 36px;color: red;">Oops!</strong><br/><span style="margin-top: 20px;display: block">服务器错误</span>`,  {
              title: '提示',
              center: true,
              dangerouslyUseHTMLString: true
            });
          }
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  .login-wrapper{
    margin-top: 20px;
    .notice{
      margin-left: 80px;
      height: 20px;
      line-height: 20px;
      font-size: 12px;
      color: #f56c6c;
      margin-bottom: 5px;
    }
    .login{
      display: block;
      width: 200px;
      height: 40px;
      border: none;
      outline: none;
      margin: 0 auto;
      background-color: #6fcaff;
      border-radius: 10px;
      font-size: 16px;
      color: #fff;
      cursor: pointer;
      margin-bottom: 20px;
    }
  }
</style>
