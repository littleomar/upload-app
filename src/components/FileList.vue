<template>
    <div class="file-wrapper">
      <el-table
        :data="this.fileList.message"
        border
        style="width: 100%"
        class="table"
      >
        <el-table-column
          fixed
          prop="filename"
          label="文件名"
          width="570">
        </el-table-column>
        <el-table-column
          prop="time"
          label="上传日期"
          width="260">
        </el-table-column>
        <el-table-column
          prop="realname"
          label="用户"
          width="140"
        >
          <template slot-scope="scope">
            <router-link :to="{name:'UserInfo',params: {email:scope.row.email}}" style="text-decoration: none;color: #31BBAC">{{scope.row.realname}}</router-link>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="180"
        >
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="downloadFile(scope.row)">下载</el-button>
            <el-button size="mini" type="danger" @click="deleteFile(scope.row)" v-if="scope.row.delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="page-dispatch"
        layout="prev, pager, next"
        :current-page.sync="currentPage"
        page-size.sync="10"
        @current-change="changePage"
        :total="this.fileList.totalFile">
      </el-pagination>
    </div>
</template>

<script>
  import axios from 'axios'
  export default {
    name: "FileList",
    data() {
      return {
        currentPage: 1
      }
    },
    methods: {
      downloadFile(item) {
        window.open(`http://47.95.215.162/api/file/download?id=${item.id}`)
      },
      async deleteFile(item) {
        this.$confirm('您确定删除此文件吗？','提示',{
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          showClose: false,
          center: true
        }).then(async ()=>{
          let res = (await axios.get(`http://47.95.215.162/api/file/delete?id=${item.id}`,{withCredentials:true})).data;
          if (!res) return new Error('服务器错误');
          if (res.code === 1) return new Error('无权限');
          if (res.code === 2) return new Error('文件不存在');
          this.$message({
            type: 'success',
            message: '文件已成功删除!'
          });

          this.$emit('change-page',this.currentPage);

        }).catch((err)=>{
          this.$message({
            type: 'info',
            message: err
          });
        })
      },
      changePage() {
        this.$emit('change-page',this.currentPage);
      }
    },
    props: ['fileList'],
    mounted() {
    }
  }
</script>

<style lang="scss" scoped>
.file-wrapper{
  width: 1160px;
  margin-top: 50px;
  margin-bottom: 50px;
  .page-dispatch{
    margin-top: 10px;
    text-align: center;
  }
}
</style>
