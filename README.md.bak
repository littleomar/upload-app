# upload-app

> Lightweight Web sites that provide file upload and download

## 项目环境部署
本项目依赖node.js
后端服务依赖MongoDB以及Redis数据库，需要对其安装

- NodeJs的安装及配置
   - node.js官网地址[点击](https://nodejs.org/zh-cn/)下载，参考[博客](https://www.cnblogs.com/liuqiyun/p/8133904.html)
- MongoDb的安装及配置
   - MongoDb官网地址[点击](https://www.mongodb.com/download-center/community)下载
   - 安装后服务自动开启
- Redis的安装及配置
   - Redis下载地址[点击](https://github.com/MicrosoftArchive/redis/releases)下载，选择msi安装包，安装时须勾选添加到环境变量选项，安装完成后请启动服务。
   - 测试redis服务是否启动，添加环境变量之后,#在cmd中输入 `redis-cli.exe` 进行连接测试
   
- 需要Nginx反向代理支持
   - 安装配置 [参考](https://blog.csdn.net/h610443955/article/details/81096506)
   - 反向代理配置 
   ```bash
     #在Nginx安装目录中找到conf/nginx.conf配置文件并打开 
     
     #在http{ ... } 中引入配置文件（注意分号不能少）
     include ./conf.d/*.conf;
     
     #在 ./conf 目录下创建反向代理配置文件 
     #新建文件夹 conf.d  (与上文对应)
     #在 ./conf.d 文件夹下创建  server_3000.conf  输入以下内容
 
     upstream upload {
         server 127.0.0.1:3000;
     }
     
     server {
         listen 80;
         server_name 您的域名;
     
         location / {
             proxy_set_header Host  $http_host;
             proxy_set_header X-Real-IP  $remote_addr;  
             proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
             proxy_set_header X-Nginx-proxy true;
             proxy_pass http://hello;
             proxy_redirect off;
         }
     }
     
     #代理端口为3000可以按照需求更改
     ```

## 下载项目
可以到[Github](https://github.com/littleomar/upload-app)下载压缩包或者通过git clone项目 
`git clone git@github.com:littleomar/upload-app.git`
项目下载完成之后：
   ```bash
       #启动命令行工具 切换到项目目录
       cd ./upload-app
       
       #安装环境依赖包，运行
       npm install
       
       #修改配置文件  打开 ./build/webpack.base.conf.js
       
       new webpack.DefinePlugin({
             'process.env.API_BASE': '"http://127.0.0.1"'    //这里网址修改为本站域名
           })
       
       #对目标文件进行编译
       npm run build
       
       #本项目需要pm2项目部署工具，需要在全局进行安装，执行
       npm install -g pm2
       
       #将静态文件部署到cdn（可选）
       ...
       
       #对下文smtp配置信息修改之后再启动
       
       #用pm2进行部署（需修改smtp配置文件）
       pm2 start process.yml
       
   ```
## 项目源码目录

- `/server` 目录  后台服务目录
   - `./dbs`连接数据库的配置文件
   - `./dbs/config.js` 需要对配置进行更改以便完成smtp邮箱服务
   ```bash
   module.exports = {
     dbs: 'mongodb://127.0.0.1:27017/upload',
     domain: 'http://127.0.0.1:8080',       //此处网址改为本站域名
     smtp: {
       get host() {
         //smtp邮箱服务商host 例如腾讯邮箱
         // return 'smtp.qq.com'   
         return '*******'
       },
       get user() {
         return '******@qq.com'             //开通smtp服务的用于发送验证码服务邮箱
       },
       get pass() {
         return '************'              //开通smtp邮箱的秘钥  请填写
       },
       get email() {
         return '******@qq.com'             //管理员邮箱，用于新用户注册时发送提醒邮件的接受地址
       }
     }
   }
   
   ```
   - `./interface` 前端请求数据的后台接口配置文件
- `/src` 目录 前端页面展示目录
- `/upload` 目录 文件上传目录

## 功能介绍
- 注册
   - 注册需要真实姓名和用户邮箱，填写后自动发送验证码给用户并且提交注册申请之后，自动发送提醒邮件给管理员，以便管理员能够及时审核。
- 登录
   - 新注册的用户需等待管理员审核之后方可登录本站，当管理员审核通过之后系统会自动发送邮件通知用户注册成功。
- 网站首页
   - 首页将展示所有用户上传的所有文件，供用户进行下载和删除，点击用户名字可进入用户信息页面，能够看到该用户上传的所有文件，如果是管理员可对用户进行信息修改操作。
- 删除功能
   - 普通用户仅能删除自己所上传的文件，管理员则可以删除所有文件
   
   
## 数据库
- `files` 数据表
   - name|email|filename|type|realname|time
     :---:|:---:|:---:|:---:|:---:|:---:
     用户上传的<br />文件名|用户邮箱|服务器上所存储<br />上传文件的名字|文件类型|用户真实姓名|文件上传时间
- `users` 数据表
   - email|status|password|realname|role|
     :---:|:---:|:---:|:---:|:---:
     用户邮箱|用户当前状态<br>是否通过审核或者拉黑<br>0:待审核<br>1：已通过<br>2：黑名单|用户密码|用户真实姓名|用户权限<br>0:管理员<br>1:普通用户
