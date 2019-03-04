<template>
  <div class="cancel-wrapper">
    <h3 class="title">请输入您的邮箱：</h3>

    <div class="input-wrapper">
      <el-form :model="emailForm" status-icon :rules="rules" ref="emailForm" class="email-form">
        <el-form-item prop="email">
          <el-input type="email" v-model="emailForm.email" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click.prevent="cancel">撤销申请</el-button>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  export default {
    name: "Cancel",
    data() {
      let validateEmail = async (rule, value, callback) => {
        if (!value) return callback(new Error('邮箱不能为空'));
        let re = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
        if (!re.test(value)) return callback(new Error('请输入正确的邮箱地址'));
        let emailRes = (await axios.get(`${process.env.API_BASE}/api/user/query?email=${this.emailForm.email}`)).data;
        if (emailRes.code === 0) return callback(new Error('该用户不存在'));
        if (emailRes.code === 2) return callback(new Error('该用户已通过审核'));
        return callback();
      };
      return {
        email: '',
        emailForm: {
          email: ''
        },
        rules: {
          email: [
            { validator: validateEmail, trigger: 'blur' }
          ],
        }
      }
    },
    methods: {
      async cancel() {
        let validate = await this.$refs['emailForm'].validate();
        if ( !validate ) return false;
        let res = (await axios.get(`${process.env.API_BASE}/api/user/cancel?email=${this.emailForm.email}`)).data;
        if (res.code !== 0) return false;
      }
    }
  }
</script>

<style lang="scss" scoped>
  .cancel-wrapper{
    margin-left: 150px;
    margin-top: 100px;
    .input-wrapper{
      margin-top: 20px;
      .email-form{
        width: 260px;
        display: inline-block;
      }
    }
  }
</style>
