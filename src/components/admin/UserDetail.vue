<template>
    <div class="main">
      <my-header />
      <header class="header"><h1>用户信息</h1></header>
      <div class="user-info">
        <div class="input-wrapper" style="margin-left: 0">
          <p class="title">邮箱：</p>
          <el-input
            v-model="user.email"
            style="width: 220px"
            :disabled="true"
          >
          </el-input>
        </div>
        <div class="input-wrapper">
          <p class="title">姓名：</p>
          <el-input
            v-model="user.realname"
            style="width: 220px"
          >
          </el-input>
        </div>
        <div class="input-wrapper">
          <p class="title">权限：</p>
          <el-select v-model="user.role">
            <el-option
              v-for="item in role"
              :key="item.value"
              :disabled="item.value===1&&user.role===0"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="input-wrapper">
          <p class="title">审核状态：</p>
          <el-select v-model="user.status" :disabled="user.role === 0">
            <el-option
              v-for="item in status"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="input-wrapper button">
          <el-button type="primary" @click="modifyUser">确认修改</el-button>
        </div>
        <div class="input-wrapper button">
          <el-button type="primary" @click="removeUser" :disabled="user.role===0">删除用户</el-button>
        </div>
      </div>
      <file-list @change-page="changePage" :file-list="this.fileList" />
    </div>
</template>

<script>
  import axios from 'axios'
  import MyHeader from '../../components/MyHeader'
  import FileList from '../../components/FileList'
  export default {
    name: "UserDetail",
    async beforeRouteEnter(to,from,next) {
      let user = JSON.parse(sessionStorage.getItem('user'));

      if (user) {
        if (user.role === 0) {
          next( async vm => {
            let res = (await axios.get(`http://47.95.215.162/api/user/query?email=${vm.$route.params.email}`,{withCredentials:true})).data;
            if (res.code === 0) {
              vm.$message.error('该用户不存在');
              vm.$router.push('/')
            }
          })
        } else {
          next(vm=>{
            vm.$message({
              message: '您没有权限',
              type: 'warning'
            });
            vm.$router.push('/')
          })
        }
      } else {
        next(vm=>{
          vm.$message({
            message: '请先登录...',
            type: 'warning'
          });
          vm.$router.push({name:'Login',query: {url:to.path}})
        })
      }

    },
    components: {
      FileList,
      MyHeader
    },
    methods: {
      async modifyUser() {
        if (!this.user.realname) {
          this.$message({
            type: 'info',
            message: '姓名不能为空!'
          });
          return false;
        }
        let queryRes = (await axios.get(`http://47.95.215.162/api/user/verify?realname=${this.user.realname}&email=${this.user.email}`)).data;
        if (!queryRes) {
          this.$message({
            type: 'error',
            message: '服务器错误'
          });
          return false;
        }
        if (queryRes.code === 1) {
          this.$message({
            type: 'error',
            message: '该姓名已被注册'
          });
          return false;
        }
        if (this.oldUser.realname === this.user.realname && this.oldUser.status === this.user.status && this.oldUser.role === this.user.role) {
          this.$message({
            type: 'info',
            message: '未作任何修改!'
          });
          return false;
        }
        this.$confirm('确定修改此用户信息?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          let modifyRes = (await axios('http://47.95.215.162/api/user/admin/modify',{
            method: 'post',
            withCredentials: true,
            data: {
              email: this.user.email,
              realname: this.user.realname,
              status: this.user.status,
              role: this.user.role
            }
          })).data;
          if (modifyRes.code === 0) {
            this.$message({
              type: 'success',
              message: '修改成功!'
            });
            this.changePage(1)
          } else {
            this.$message({
              type: 'error',
              message: '修改失败!'
            });
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消修改'
          });
        });
      },
      removeUser() {
        this.$confirm('您确定要删除此用户吗？删除用户后连同该用户上传的文件也一并删除且将无法找回, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          let removeRes = (await axios.get(`http://47.95.215.162/api/user/admin/removeUser?email=${this.user.email}`)).data;
          if (!removeRes) {
            this.$message({
              type: 'error',
              message: '服务器错误!'
            });
            return false;
          }
          if (removeRes.code !== 0) {
            this.$message({
              type: 'error',
              message: '删除失败!'
            });
            return false;
          }
          this.$message({
            type: 'success',
            message: '删除成功!正在跳转到用户信息页 ······'
          });
          this.$router.push('/admin/userlist')
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      async changePage(page) {
        let res = (await axios.get(`http://47.95.215.162/api/file/list?email=${this.$route.params.email}&page=${page}`,{withCredentials:true})).data;
        if (!res) return new Error('服务器错误');
        if (res.code === 4) return new Error('该用户无权限');
        this.$set(this.fileList,'totalFile',res.total);
        this.$set(this.fileList,'message',res.message);
      }
    },
    data() {
      return {
        oldUser: {},
        user: {},
        fileList: {},
        role: [
          {
            value: 0,
            label: '管理员'
          },
          {
            value: 1,
            label: '普通用户'
          }
        ],
        status: [
          {
            value: 0,
            label: '待审核'
          },
          {
            value: 1,
            label: '已通过'
          },
          {
            value: 2,
            label: '不通过'
          }
        ]
      }
    },
    async beforeMount() {
      let res = (await axios.get(`http://47.95.215.162/api/admin/userDetail?email=${this.$route.params.email}`,{withCredentials:true})).data;
      if (!res) return new Error('服务器错误');
      if (res.code === 1) return new Error('用户不存在');
      if (res.code !== 0) return new Error(res.message);
      this.user = res.userInfo;

      this.oldUser = {...this.user};

      let fileRes = (await axios.get(`http://47.95.215.162/api/file/list?email=${this.$route.params.email}`,{withCredentials:true})).data;
      if (!fileRes) return new Error('服务器错误');
      if (fileRes.code === 4) return new Error('该用户无权限');
      this.$set(this.fileList,'totalFile',fileRes.total);
      this.$set(this.fileList,'message',fileRes.message);



    }
  }
</script>

<style lang="scss" scoped>
  .main {
    width: 1160px;
    margin: 0 auto;
    .header {
      height: 100px;
      line-height: 100px;
      h1 {
        font-size: 42px;
      }
    }
    .user-info{
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
