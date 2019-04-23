<template>
  <section class="container">

    <div class="main">
      <my-header />
      <header class="header"><h1>用户信息</h1></header>
      <div class="form-wrapper">
        <el-table
          :data="this.list"
          border
          style="width: 100%"
          class="table"
        >
          <el-table-column
            fixed
            prop="realname"
            label="姓名"
            width="270">
          </el-table-column>
          <el-table-column
            prop="email"
            label="邮箱"
            width="300">
          </el-table-column>
          <el-table-column
            label="审核状态"
            width="220"
          >
            <template slot-scope="scope">
              <span class="status" :class="{default:scope.row.status.code===1,
              allowed:scope.row.status.code===0,
              'not-allowed':scope.row.status.code===2}">{{scope.row.status.msg}}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="权限"
            width="220"
          >
            <template slot-scope="scope">
              <span>{{scope.row.role.msg}}</span>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope" class="operate">
              <el-button type="primary" size="small" @click="seeDetail(scope.row.email)"><router-link :to="{name:'UserDetail',params:{email:scope.row.email}}" style="text-decoration: none;color: #fff">查看详情</router-link></el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="page-dispatch"
          layout="prev, pager, next"
          :current-page.sync="currentPage"
          page-size.sync="10"
          @current-change="changePage"
          :total="this.total">
        </el-pagination>
      </div>
    </div>
  </section>
</template>

<script>
  import axios from 'axios'
  import MyHeader from '../../components/MyHeader'


  export default {
    name: 'UserList',
    components: {
      MyHeader
    },
    beforeRouteEnter(to,from,next) {
      let user = JSON.parse(sessionStorage.getItem('user'))
      if (user.role === 0) {
        next()
      } else {
        next('/')
      }
    },
    data() {
      return {
        fileName: '',
        list: [],
        userInfo: {},
        total: 0,
        currentPage: 1
      }
    },
    async beforeMount() {
      let res = (await axios.get(`${process.env.API_BASE}/api/admin/allUser`,{withCredentials:true})).data;
      if (!res) return new Error('服务器错误');
      if (res.code === 5) return new Error('用户无权限');
      if (res.code !== 0) return new Error(res.message);
      this.list = res.userInfo;
      this.total = res.total

    },
    methods: {
      async seeDetail(email) {
        window.location.href = `/admin/userdetail/${email}`
      },
      changePage() {
        console.log(this.currentPage)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .container{
    .main{
      width: 1160px;
      margin: 0 auto;
      .header{
        height: 100px;
        line-height: 100px;
        h1{
          font-size: 42px;
        }
      }
      .form-wrapper{
        width: 100%;
        margin-top: 50px;
        border: 1px solid #d8dfea;
        border-radius: 5px;
        padding: 30px;
        .table{
          margin-top: 50px;
          span.status{
            &.default{
              color: green;
            }
            &.await{
              color: black;
            }
            &.not-allowed{
              color: red;
            }
          }
        }
        .page-dispatch{
          margin-top: 10px;
          text-align: center;
        }
      }
    }
  }
</style>
