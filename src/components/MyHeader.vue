<template>
    <div class="header">
      <div class="header-wrapper">
        <div class="index"><h1><router-link to="/">首页</router-link></h1></div>
        <div class="user-info"><router-link to='/user/info' class="user">{{realname}}</router-link>&nbsp;&nbsp;<router-link v-if="this.role===0" to="/admin/userlist" style="color: #f22e00">查看所有用户</router-link>&nbsp;&nbsp;<el-button class="exit" type="text" @click="exit">退出</el-button></div>
      </div>
    </div>
</template>

<script>
  import axios from 'axios'
  export default {
    name: "MyHeader",
    data() {
      return {
        realname: '',
        email: '',
        role: ''
      }
    },
    beforeMount() {
      this.realname = JSON.parse(sessionStorage.getItem('user')).realname;
      this.email = JSON.parse(sessionStorage.getItem('user')).email;
      this.role = JSON.parse(sessionStorage.getItem('user')).role;
    },
    methods: {
      async exit () {
        this.$confirm('您确定要退出登录本账户吗？','提示',{
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: false,
          center: true
        }).then(async ()=>{
          let res = (await axios.get(`http://47.95.215.162/api/user/exit`,{withCredentials:true})).data;
          if (!res) return new Error('服务器错误');
          if (res.code !== 0) return new Error('退出失败');
          sessionStorage.removeItem('user');
          this.$message({
            type: 'success',
            message: '退出登录成功!'
          });
          this.$router.push('/user/login')
        }).catch((err)=>{
          this.$message({
            type: 'info',
            message: err
          });
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
.header{
  width: 100%;
  height: 40px;
  .header-wrapper{
    width: 1160px;
    display: flex;
    justify-content: space-between;
    .index{
      height: 40px;
      line-height: 40px;
      a{
        text-decoration: none;
        color: black;
        font-size: 24px;
        font-weight: 700;
      }
    }
    .user-info{
      line-height: 40px;
      a{
        font-size: 14px;
        color: #31BBAC;
        text-decoration: none;
      }
    }
  }
}
</style>
