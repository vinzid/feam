# FEAM
Front End Architecture Model (Using Node.js)  
前端架构模型（使用Node.js）

FEAM is a architecture model which separate front end from back end totally with automation building.  
FEAM 是与后端完全分离的支持自动化构建的独立前端架构模型。

## Feature 特性

1. Use Node.js for the server side of front end to process the url route, output the handlebars template, then use ajax to fetch backend data to render page.  
使用 Node.js 作为前端的服务端以处理地址路由，输出 handlebars 模板，然后使用 ajax 获取后端数据渲染页面。

2. Use gulp for automation building, which process the performance task (such as combination and minification),  modularity of components, lint for code, refresh browser automatic, and some more specific workflow.  
使用 gulp 进行自动化构建，处理性能相关任务（例如合并与压缩），组件的模块化，代码的审核，自动刷新浏览器，以及其它一些特定的工作流。

3. Use PHP for back end mock data process, so the final page result can be seen.  
使用 PHP 处理后端模拟数据，以便查看最终页面效果。

4. Add support to fetch data direct via Node.js, so the page that need to consider SEO can output the rendered page.  
可以直接通过 Node.js 层获取后端数据，从而需要考虑 SEO 的页面可以直接输出组装好的页面。

5. Add proxy process which use Node.js as transition of client and back end, so the browser which don't support CORS (such as ie 9 and below) can still use this model.  
Node.js 层可以作为客户端和后端的过渡代理，这样不支持 CORS 标准的浏览器（例如 ie9 及以下）也可以使用此模型。

## Installation 安装

1. Install server dependency 安装服务端依赖
>cd feam  
npm install --no-save

2. Install build dependency 安装构建依赖
>cd feam/static/auto  
npm install --no-save

3. Install bower dependency 安装客户端依赖
>gulp bowerAll

4. Open Gulp watcher 打开gulp监听
>gulp watch

5. Run Node.js Server 运行Node.js服务
>cd feam  
node app

6. Configure mock back end 配置模拟数据后端  
Use any web server (such as Apache or Nginx) with PHP support, listen to 9030 port, while the root directory set to feam/be, and set the single entrance to index.php (if using Apache, the .htaccess in the directory has the job done).  
使用任何支持 PHP 的网页服务器（例如 Apache 或 Nginx ），监听 9030 端口，根目录设置为 feam/be，单一入口设置为 index.php（如果使用的是 Apache，可以直接利用该目录下的 .htaccess）

7. Access site 访问站点
> localhost:9029

## Directory structure 目录结构

    /  root  根目录  root directory
    .gitignore  git忽略文件  git ignore file
    app.js  程序入口  app entrance
    index.js  通用处理  common process
    package.json  站点信息  web info
    README.md  说明文档  readme file
    updater.js  模块更新程序  module update program
    .eslintrc  eslint 配置文件  eslint configure file
    .eslintignore  eslint 忽略文件  eslint ignore file
    .gitignore  git 忽略文件  git ignore file

    be/  模拟数据  mock data
      .htaccess  重写文件  rewrite file
      index.php  后端处理  back end process

    data/  静态数据
      constant.js  常量  constant
      hash.js  后缀引用  hash for static file

    node_modules/  第三方模块  third party module

    routes/  路由  server routes

    static/  静态文件夹  static folder
      auto/  自动脚本  gulp workflow process
      dest/  生成文件  static file for distribution
        bower_components/  客户端第三方资源  third party resource of client side
      orig/  原始文件夹  original static folder
        common/  通用资源  common folder
          res/  资源  resource
          libs/  板块  block
        googs/  商品  goods
          lib/  版块  block  
          views/  模板  template
        user/  用户  user
          lib/  版块  block  
          views/  模板  template
      temp/ 临时文件，存放未通过规范审核的文件  temp folder for files which fail to pass linters
