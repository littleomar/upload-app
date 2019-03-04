<template>
  <div class="modifypass-wrapper">
    <div class="index"><h1><router-link to="/">首页</router-link></h1></div>
    <el-form :model="register" status-icon :rules="rules" ref="register" label-width="80px" class="form">
      <el-form-item label="邮箱" prop="email">
        <el-input type="email" v-model="register.email" autocomplete="off" style="width: 250px"></el-input>
      </el-form-item>
      <button class="send" @click="sendEmail" :class="{disable:this.button.status}">{{this.button.buttonTips}}</button>
      <el-form-item label="验证码" prop="code">
        <el-input v-model="register.code"  style="width: 250px"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pass">
        <el-input type="password" v-model="register.pass" autocomplete="off" style="width: 250px"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input type="password" v-model="register.checkPass" autocomplete="off"  style="width: 250px"></el-input>
      </el-form-item>
      <button class="submit" @click.prevent="submitForm">提&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;交</button>
    </el-form>
  </div>
</template>

<script>
  import axios from 'axios'
  export default {
    name: "Register",
    data() {
      let validatePass = (rule, value, callback) => {
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
      let validateCheckPass = (rule, value, callback) => {
        if (value !== this.register.pass) {
          return callback(new Error('两次密码输入不一致'));
        }
        return callback();
      };


      let validateEmail = async (rule, value, callback) => {
        if (!value) {
          return callback(new Error('邮箱不能为空'));
        }
        let re = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
        if (!re.test(value)) {
          return callback(new Error('邮箱格式不正确'));
        }
        let emailRes = (await axios.get(`http://127.0.0.1:3000/api/user/verify?email=${this.register.email}`)).data;
        if (emailRes.code === 0) {
          return callback(new Error('该邮箱不存在'));
        }
        return callback();
      };


      let validateCode = async (rule, value, callback) => {
        if (!value) {
          return callback(new Error('验证码不能为空'));
        }
        let codeRes = (await axios.get(`http://127.0.0.1:3000/api/user/verify?code=${this.register.code}&email=${this.register.email}`)).data;
        if (codeRes.code === 1) {
          return callback(new Error('验证码有误'));
        } else if (codeRes.code === 0 ) {
          return callback();
        }
      };
      return {
        register: {
          email: '',
          pass: '',
          checkPass: '',
          code: ''
        },
        button: {
          status: 0,
          buttonTips: '发送邮箱验证码'
        },
        rules: {
          pass: [
            { validator: validatePass, trigger: 'blur' }
          ],
          checkPass: [
            { validator: validateCheckPass, trigger: 'blur' }
          ],
          email: [
            { validator: validateEmail, trigger: 'blur' }
          ],
          code: [
            { validator: validateCode, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      sendEmail(e) {
        e.preventDefault();
        if (this.button.status === 1) {
          return false;
        }
        this.$refs['register'].validateField('email',async valid => {
          if (valid) {
            return false;
          } else {
            const _self = this;
            _self.button.status = 1;
            let codeRes = (await axios.get(`http://127.0.0.1:3000/api/user/code?email=${_self.register.email}`)).data;
            if (codeRes.code === 1) {
              return false;
            }
            let time = 60;
            _self.timer = setInterval(()=>{
              time--;
              _self.button.buttonTips = `再次获取(${time})`;
              if ( time<=1 ) {
                _self.button.status = 0;
                clearInterval(_self.timer);
                _self.button.buttonTips = `发送邮箱验证码`;
              }
            },1000);
          }
        })
      },
      async submitForm (){
        let validateRes = await this.$refs['register'].validate();
        if ( !validateRes ) return false;
        let registerRes = (await axios.post(
          `http://127.0.0.1:3000/api/user/modifypass`,
          {
            email: this.register.email,
            password: this.register.pass,
            code: this.register.code
          })).data;
        if (registerRes.code === 0) {

          if (sessionStorage.getItem('user')) {
            let res = (await axios.get(`http://127.0.0.1:3000/api/user/exit`,{withCredentials:true})).data;
            if (!res) return new Error('服务器错误');
            if (res.code !== 0) return new Error('退出失败');
            sessionStorage.removeItem('user');
          }

          this.$router.push('/user/login')



          this.$message({
            message: '密码修改成功',
            type: 'success'
          })
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .modifypass-wrapper{
    margin-left: 150px;
    margin-top: 10px;
    width: 300px;
    .index{
      height: 40px;
      line-height: 40px;
      margin-bottom: 50px;
      a{
        text-decoration: none;
        color: black;
        font-size: 24px;
        font-weight: 700;
      }
    }
    .form{
      .send{
        font-size: 12px;
        display: block;
        margin-left: 80px;
        margin-top: -3px;
        margin-bottom: 10px;
        border: none;
        outline: none;
        border-radius: 5px;
        cursor: pointer;
        background-color: #eee;
        &.disable{
          cursor: not-allowed;
          background-color: #cecece;
        }
      }
      .cancel{
        width: 100%;
        font-size: 12px;
        text-align: right;
        padding-right: 20px;
        margin-top: -3px;
        margin-bottom: 5px;
      }
      .submit{
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
  }
</style>
