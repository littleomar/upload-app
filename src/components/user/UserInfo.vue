<template>
  <div class="user-info">
    <my-header />
    <h1 class="main-title">用户文件</h1>
    <file-list @change-page="changePage" :fileList="fileList" />
  </div>
</template>

<script>
  import axios from 'axios'
  import FileList from '../../components/FileList'
  import MyHeader from '../../components/MyHeader'
  export default {
    name: "UserInfo",
    beforeRouteEnter(to, from, next) {
      if (!sessionStorage.getItem('user')) {
        next(vm=>{
          vm.$message({
            message: '请先登录...',
            type: 'warning'
          });
          vm.$router.push('/user/login')
        })
      } else {
        if (JSON.parse(sessionStorage.getItem('user')).email === to.params.email) {
          next('/user/info')
        } else {
          next()
        }
      }
    },
    components: {
      FileList,
      MyHeader
    },
    data() {
      return {
        fileList: {}
      }
    },
    methods: {
      async changePage(page) {
        let res = (await axios.get(`http://47.95.215.162/api/file/list?email=${this.$route.params.email}&page=${page}`,{withCredentials:true})).data;
        if (!res) return new Error('服务器错误');
        if (res.code === 4) return new Error('该用户无权限');
        this.$set(this.fileList,'totalFile',res.total);
        this.$set(this.fileList,'message',res.message);
      }
    },
    async beforeMount() {
      let res = (await axios.get(`http://47.95.215.162/api/file/list?email=${this.$route.params.email}`,{withCredentials:true})).data;
      if (!res) return new Error('服务器错误');
      if (res.code === 4) return new Error('该用户无权限');
      this.$set(this.fileList,'totalFile',res.total);
      this.$set(this.fileList,'message',res.message);
    }
  }
</script>

<style lang="scss" scoped>
  .user-info{
    width: 1160px;
    margin: 0 auto;
    .main-title{
      font-size: 48px;
      height: 100px;
      line-height: 100px;
    }
    .info{
      display: flex;
      .input-wrapper{
        margin-left: 20px;
        .title{
          margin: 5px 0 5px 3px;
          color: #8492a6;
        }
        &.button{
          margin-top: 25px;
        }
      }
    }
  }
</style>
