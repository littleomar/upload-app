<template>
    <div class="main">
      <my-header/>
      <h1 class="title">Header</h1>
      <file-list :fileList="fileList" @change-page="changePage" />
    </div>
</template>

<script>
  import axios from 'axios'
  import MyHeader from './MyHeader'
  import FileList from './FileList'
  export default {
    name: "Index",
    components: {
      MyHeader,
      FileList
    },
    beforeRouteEnter(to,from,next) {
      if (sessionStorage.getItem('user')) {
        next()
      } else {
        next('/user/login')
      }
    },
    data() {
      return {
        fileList: {},
        user: {}
      }
    },
    methods: {
      async changePage(page) {
        let res = (await axios.get(`http://47.95.215.162/api/file/list?page=${page}`,{withCredentials:true})).data;
        if (!res) return new Error('服务器错误');
        if (res.code === 4) return new Error('该用户无权限');
        this.$set(this.fileList,'totalFile',res.total);
        this.$set(this.fileList,'message',res.message);
      }
    },
    async beforeMount() {
      let res = (await axios.get('http://47.95.215.162/api/file/list',{withCredentials:true})).data;
      if (!res) return new Error('服务器错误');
      if (res.code === 4) return new Error('该用户无权限');
      this.$set(this.fileList,'totalFile',res.total);
      this.$set(this.fileList,'message',res.message);
    }
  }
</script>

<style lang="scss" scoped>
.main{
  width: 1160px;
  margin: 0 auto;
  .title{
    font-size: 48px;
    height: 100px;
    line-height: 100px;
  }
}
</style>
