

module.exports = {
  dbs: 'mongodb://127.0.0.1:27017/upload',
  domain: 'http://127.0.0.1:8080',
  smtp: {
    get host() {
      return '*********@****'
    },
    get user() {
      return '*********@****'
    },
    get pass() {
      return '*************'
    },
    get email() {
      return '*********@****'
    }
  }
}
