import Vue from 'vue'
import Router from 'vue-router'
import Index from '../components/Index'
import User from '../components/user/User'
import Login from '../components/user/Login'
import Register from '../components/user/Register'
import MyInfo from '../components/user/MyInfo'
import UserInfo from '../components/user/UserInfo'
import ModifyPass from '../components/user/ModifyPass'
import Cancel from '../components/utils/Cancel'
import UserList from '../components/admin/UserList'
import UserDetail from '../components/admin/UserDetail'
import NotFound from '../components/404'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/user',
      name: 'User',
      redirect: '/user/login',
      component: User,
      children: [
        {
          path: '/user/login',
          name: 'Login',
          component: Login
        },
        {
          path: '/user/register',
          name: 'Register',
          component: Register
        }
      ]
    },
    {
      path: '/user/info',
      name: 'MyInfo',
      component: MyInfo
    },
    {
      path: '/user/info/:email',
      name: 'UserInfo',
      component: UserInfo
    },
    {
      path: '/user/modifypass',
      name: 'ModifyPass',
      component: ModifyPass
    },
    {
      path: '/utils/cancel',
      name: 'Cancel',
      component: Cancel
    },
    {
      path: '/admin/userlist',
      name: 'UserList',
      component: UserList
    },
    {
      path: '/admin/userdetail/:email',
      name: 'UserDetail',
      component: UserDetail
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ]
})
