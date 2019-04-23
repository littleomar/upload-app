<template>
    <div class="user-info">
      <my-header />
      <h1 class="main-title">我的信息</h1>
      <div class="info">
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
            :disabled="true"
          >
          </el-input>
        </div>
        <div class="input-wrapper button">
          <el-button type="primary" @click="modifyPass"><router-link to="/user/modifypass" style="font-size: 14px;color: #fff;text-decoration: none;">修改密码</router-link></el-button>
        </div>
      </div>
      <div class="upload-file">
        <input type="file" ref="fileInput" @change="fileChange" style="display: none" />
        <el-button type="primary" @click="fileSelect" class="select" :disabled="this.precent!==0&&this.precent!==100">选择文件</el-button>
        <el-button type="primary" @click="uploadFile" v-if="Object.keys(this.fileInfo).length" class="select" :disabled="this.precent!==0&&this.precent!==100">点击上传</el-button>
        <el-progress :percentage="this.precent" style="width: 300px;display: inline-block" v-if="this.precent"></el-progress>
        <span style="font-size: 14px;color: #67c23a" v-if="this.precent === 100">文件上传成功</span>
        <div class="file-info">
          <div class="info" v-if="Object.keys(this.fileInfo).length"><span>文件名：</span><span>{{this.fileInfo.name}}</span>&nbsp;&nbsp;&nbsp;&nbsp;<span>大小：</span><span>{{this.fileInfo.size}}</span></div>
          <div class="tips" v-if="tips" style="color: red">{{this.tips}}</div>
        </div>
      </div>
      <filee-list @change-page="changePage" :fileList="fileList" />
    </div>
</template>

<script>
  import axios from 'axios'
  import FileeList from '../../components/FileList'
  import MyHeader from '../../components/MyHeader'
  export default {
    name: "MyInfo",
    beforeRouteEnter(to, from, next) {
      if (!sessionStorage.getItem('user')) {
        next('/user/login')
      } else {
        next()
      }
    },
    components: {
      FileeList,
      MyHeader
    },
    data() {
      return {
        user: {},
        tips: '',
        fileList: {},
        fileInfo: {},
        precent: 0
      }
    },
    methods: {
      modifyPass() {
        console.log(`modify pass`);
      },
      async changePage(page) {
        let userInfo = JSON.parse(sessionStorage.getItem('user'));
        let res = (await axios.get(`${process.env.API_BASE}/api/file/list?email=${userInfo.email}&page=${page}`,{withCredentials:true})).data;
        if (!res) return new Error('服务器错误');
        if (res.code === 4) return new Error('该用户无权限');
        this.$set(this.fileList,'totalFile',res.total);
        this.$set(this.fileList,'message',res.message);
      },
      fileSelect() {
        this.$refs['fileInput'].click();
      },
      fileChange() {
        this.precent = 0;
        this.fileInfo = {};
        this.status = '';
        this.tips = '';
        let size = this.$refs['fileInput'].files[0].size;
        if ( size < 1024  ) {
          size = size+' B';
        } else if ( size < 1024 * 1024 ) {
          size = Math.ceil(size/1024) + ' K';
        } else if (size < 1024 * 1024 * 1024 ) {
          size = Math.ceil(size/(1024*1024)) + ' M';
        } else {
          this.tips = '*文件大小超出限制，最大为1G*';
          return false;
        }
        this.$set(this.fileInfo,'name',this.$refs['fileInput'].files[0].name);
        this.$set(this.fileInfo,'size',size);
      },
      async uploadFile() {
        const _self =this;
        let file = this.$refs.fileInput.files[0];
        let data = new FormData();
        data.append("file",file);
        let updateRes = await axios({
          method: 'post',
          url: `${process.env.API_BASE}/api/file/add`,
          headers: {"Content-Type":"multipart/form-data "},
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              if (progressEvent.loaded && Math.floor(progressEvent.loaded*100/progressEvent.total) === 0) {
                _self.precent = 1
              } else {
                _self.precent = Math.floor(progressEvent.loaded*100/progressEvent.total)
              }
              if (_self.precent === 100 ) {
                _self.fileInfo = {};
              }
            }
          },
          data
        });

        if (updateRes) {
          this.changePage(1)
        }
      }
    },
    async beforeMount() {
      let userInfo = JSON.parse(sessionStorage.getItem('user'));
      this.$set(this.user,'email',userInfo.email);
      this.$set(this.user,'realname',userInfo.realname)


      let res = (await axios.get(`${process.env.API_BASE}/api/file/list?email=${userInfo.email}`,{withCredentials:true})).data;
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
  .upload-file{
    width: 100%;
    border: 1px solid #ebeef5;
    border-radius: 10px;
    margin-top: 10px;
    padding-bottom: 20px;
    .select{
      display: inline-block;
      margin: 10px;
    }
    .file-info{
      height: 20px;
      .info{
        margin-left: 10px;
        font-size: 14px;
      }
      .tips{
        margin-left: 10px;
        font-size: 14px;
      }
    }
  }
}
</style>
