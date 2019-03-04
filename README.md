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
     
     #删除
     server{
     ...
     }
     
     #替代为
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
       
       #对目标文件进行编译
       npm run build
       
       #将打包编译后生成的./dist目录下的文件 copy到服务器网页根目录中，根据以上的配置为
       c:\wwwroot\html
       
       #手动启动服务
       node ./server/index.js
       
       
       
       
       #以下可选
       #本项目需要pm2项目部署工具，需要在全局进行安装，执行
       npm install -g pm2
       
       #将静态文件部署到cdn（可选）
       ...
       
       #用pm2进行部署
       ...
       
   ```
## 项目源码目录

- `/server` 目录  后台服务目录
   - `./dbs`连接数据库的配置文件
   - `./dbs/config.js` 需要对配置进行更改以便完成smtp邮箱服务
   ```bash
   module.exports = {
     dbs: 'mongodb://127.0.0.1:27017/upload',
     domain: 'http://127.0.0.1:8080',
     smtp: {
       get host() {
         //smtp邮箱服务商host 例如腾讯邮箱
         // return 'smtp.qq.com'   
         return '*******'
       },
       get user() {
         return '******@qq.com' //开通smtp服务的用于发送验证码服务邮箱
       },
       get pass() {
         return '************'    //开通smtp邮箱的秘钥  请填写
       },
       get email() {
         return '******@qq.com'   //管理员邮箱，用于新用户注册时发送提醒邮件的接受地址
       }
     }
   }
   
   ```
   - `./interface` 前端请求数据的后台接口配置文件
- `/src` 目录 前端页面展示目录
- `/upload` 目录 文件上传目录
