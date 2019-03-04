

module.exports = {
  dbs: 'mongodb://127.0.0.1:27017/upload',
  domain: 'http://127.0.0.1:8080',
  smtp: {
    get host() {
      return 'smtp.qq.com'
    },
    get user() {
      return '862677916@qq.com'
    },
    get pass() {
      return 'fgkiffrimznebeee'
    },
    get email() {
      return '767745133@qq.com'
    }
  }
}
