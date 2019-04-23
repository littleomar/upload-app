# Upload-app
> Lightweight Web sites that provide file upload and download
### 项目功能
> 1. 用户分为管理员（账号：123456@qq.com 密码：123456 ）与普通用户，普通用户注册时，系统会自动发邮件通知管理员（管理员邮箱：767745133@qq.com ，需通过管理员审核之后普通影虎方可登录使用本系统。
> 2. 每个用户都拥有下载权限，但是只能删除本人所上传的文件（管理员可删除所有用户文件），文件上传大小不可超过1G。

### 系统特性
> 1. 前端项目采用目前主流框架Vue进行开发，UI方面瞎用ElementUi，一切代码由js生成，无服务端渲染效果。
> 2. 前端框架主要用到Vuejs、Axios、Vue-Router、ElementUI等
> 3. 后台用nodejs进项开发，涉及用户的登录注册，处理用户上传的文件。
> 4. 在用户登录方面结合前端的session与cookie对用户状态进行控制，方便前端路由的跳转判断，后台用koa-passport对用户身份进行验证。
> 5. 客户端与服务端所监听端口不同涉及到浏览器的同源策略，在后台需用到koa2-cors解决跨域问题。
> 6. 发布上线，前端直接用nginx监听80端口，后台服务则采用nginx进行反向代理

项目地址  [>>Click me<<](http://upload.ccimm.top) (管理员密码👆)
