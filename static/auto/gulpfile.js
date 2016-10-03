var gulp = require('gulp');
var include = require('gulp-include');
var htmlParser = require('./gulp-html-parser.js');
var less = require('gulp-less');
var minifyCss = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var changed = require('gulp-changed');
var htmlmin = require('gulp-htmlmin');
var rename = require('gulp-rename');
var hasher = require('gulp-hasher');
var spritesmith = require('gulp.spritesmith');
var util = require('util');
var merge = require('merge-stream');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var htmllint = require('gulp-htmllint');
var csslint = require('gulp-csslint');
var gutil = require('gulp-util');
var through = require('through2');
var Q = require('q');
var lintspaces = require('gulp-lintspaces');
var resouceMap = require('./gulp-resouce-map');
var concatLibs = require('./gulp-concat-libs');
var cssImgHash = require('./gulp-css-img-hash');
var fs = require('fs');
var runSequence = require('run-sequence');
var del = require('del');
var path = require('path');
var watch = require('gulp-watch');
var bower = require('bower');
var srcPath = {
  css: ['../orig/**/*.less','!../orig/**/import/*.less'],
  cssImport: '../orig/**/import/*.less',
  js: '../orig/**/*.js',
  tpl: '../orig/**/views/*.json',
  html: '../orig/**/*.html',
  sprite: '../orig/**/img/**/ico-*.png',
  img: ['!../orig/**/img/**/ico-*.png','../orig/**/img/**/*.png','../orig/**/img/**/*.jpg','../orig/**/img/**/*.ico'],
  font: ['../orig/**/fonts/**/*.eot','../orig/**/fonts/**/*.ttf','../orig/**/fonts/**/*.svg','../orig/**/fonts/**/*.woff','../orig/**/fonts/**/*.woff2'],
  bowerJson: './bower.json'
}
var destPath = {
  bowerJson: '../dest/bower.json',
  bower: '../dest/bower_components'
}
var invokePath = {
  cors: '../orig/common/res/js/base.js'
}
process.on('uncaughtException', function(err){
  console.log(err.toString());
});
function errorProcess(err){
  console.log(err.toString());
  this.emit('end');
}
function lintReporter(linter, file, line, col, code, message, type){
  var colors = {
    error: 'red',
    warning: 'magenta'
  };
  gutil.log(gutil.colors.cyan('['+linter+'] ') + gutil.colors.white(path.relative(path.resolve('../orig'), file) + ('undefined' != typeof line && 'undefined' != typeof col ? ' [' + line + ',' + col + ']' : '') + ': ') + gutil.colors[colors[type]](type.charAt(0).toUpperCase() + type.slice(1) + gutil.colors.yellow(' (' + code + ') ') + message));
}
gulp.task('css', function(){
  var source=gulp.src(srcPath.css)
    .pipe(changed('../dest',{extension:'.css'}));
  return cssProcess(source);
});
gulp.task('cssAll', function(){
  var source=gulp.src(srcPath.css);
  return cssProcess(source);
});
function checkDir(path, level, deferred){
  var deferred = deferred || Q.defer();
  var pathSplit = path.replace(/\\/g, '/').split('/');
  var pathSplitLength = pathSplit.length;
  var pathJoin = [];
  for(var i = 0; i <= level; i++){
    pathJoin.push(pathSplit[i]);
  }
  pathJoin = pathJoin.join('/');
  fs.stat(pathJoin, function(err, stats){
    if(err){
      fs.mkdir(pathJoin, checkDirRecur);
    }else{
      checkDirRecur();
    }
    function checkDirRecur(err){
      if(err){
        deferred.reject(new Error(err));
      }else{
        if(level < pathSplitLength - 2){
          checkDir(path, level+1, deferred);
        }else{
          deferred.resolve();
        }
      }
    }
  });
  return deferred.promise;
}
function deleteFile(path, level){
  var pathSplit = path.replace(/\\/g, '/').split('/');
  var pathSplitLength = pathSplit.length;
  var pathJoin = [];
  for(var x = 0; x < pathSplitLength - level; x++){
    pathJoin.push(pathSplit[x]);
  }
  pathJoin = pathJoin.join('/');
  fs.stat(pathJoin, function(err, stats){
    if(!err){
      if(stats.isFile()){
        deleteFileRecur()
      }else if(stats.isDirectory()){
        fs.readdir(pathJoin, function(err, files){
          if(files.length < 1){
            deleteFileRecur();
          }
        })
        toDelete = true;
      }
    }
    function deleteFileRecur(){
      del(pathJoin, {force:true}).then(function(){
        if(level < pathSplitLength-2){
          deleteFile(path, level+1);
        }
      });
    } 
  });
}
function lintspacesReporter() {
  return through.obj(function(file, enc, cb) {
    var porperty = Object.getOwnPropertyNames(file.lintspaces);
    if(porperty.length > 0){
      porperty.forEach(function(key){
        var issues = file.lintspaces[key][0];
        lintReporter('lintspaces', file.path, issues.line, 0, issues.code, issues.message, 'error');
      });
      cb();
    }else{
      cb(null, file);
    }
  });
}
function csslintReporter(){
  return through.obj(function(file, enc, cb) {
    var filePath = path.relative(path.resolve('../orig'), file.path);
    var tempFile = '../temp/' + filePath;
    if(file.csslint.success){
      deleteFile(tempFile, 0);
      cb(null, file);
    }else{
      var error = false;
      file.csslint.results.forEach(function (issue) {
        if('error' == issue.error.type){
          error = true;
        }
        lintReporter('csslint', issue.file, issue.error.line, issue.error.col, issue.error.rule.id, issue.error.message, issue.error.type);
      });
      if(!error){
        deleteFile(tempFile, 0);
        cb(null, file);
      }else{
        checkDir(tempFile, 1).then(function(){
          fs.writeFile(tempFile, file.contents);
        }, function(err){
          console.log(err.toString());
        });
        cb();
      }
    }
  });
}
function cssProcess(source){
  return source
    .pipe(lintspaces({
      indentation: 'spaces',
      spaces: 2
    }))
    .pipe(lintspacesReporter())
    .pipe(less())
    .on('error',errorProcess)
    .pipe(csslint('.csslintrc'))
    .pipe(csslintReporter())
    .on('error',errorProcess)
    .pipe(cssImgHash())
    .pipe(gulp.dest('../dest'))
    .pipe(browserSync.stream())
    .pipe(hasher())
    .pipe(resouceMap(hasher.hashes,'css'))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest('../dest'))
}
gulp.task('js', function(){
  var source=gulp.src(srcPath.js)
    .pipe(changed('../dest'));
  return jsProcess(source);
});
gulp.task('jsAll', function(){
  var source=gulp.src(srcPath.js);
  return jsProcess(source);
});
function jsProcess(source){
  return source
    .pipe(eslint({
      configFile: '.eslintrc'
    }))
    .pipe(eslintReportor())
    .on('error',errorProcess)
    .pipe(gulp.dest('../dest'))
    .pipe(browserSync.stream())
    .pipe(hasher())
    .pipe(resouceMap(hasher.hashes,'js'))
    .pipe(uglify())
    .on('error',errorProcess)
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest('../dest'));
}
function eslintReportor(){
  return through.obj(function(file, enc, cb) {
    var result = file.eslint;
    var type = {
      1: 'warning',
      2: 'error'
    };
    if(result.errorCount > 0 || result.warningCount > 0){
      result.messages.forEach(function (issue) {
        lintReporter('eslint', result.filePath, issue.line, issue.column, issue.ruleId, issue.message, type[issue.severity]);
      });
    }
    if(result.errorCount < 1){
      cb(null, file);
    }else{
      cb();
    }
  });
}
gulp.task('sprite', function () {
  var spriteData = gulp.src(srcPath.sprite)
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.less',
      cssTemplate: 'sprite.hbs',
      padding: 12
    }));
  var imgStream = spriteData.img
    .pipe(gulp.dest('../orig/common/res/img/'));
  var cssStream = spriteData.css
    .pipe(gulp.dest('../orig/common/res/css/'));
  return merge(imgStream, cssStream);
});
function imgPrecess(source){
  return source
  .pipe(hasher())
  .pipe(resouceMap(hasher.hashes,'img'))
  .pipe(gulp.dest('../dest'));
}
gulp.task('img', function () {
  var source = gulp.src(srcPath.img)
  .pipe(changed('../dest'));
  return imgPrecess(source);

});
gulp.task('imgAll', function () {
  var source = gulp.src(srcPath.img);
  return imgPrecess(source);
});
gulp.task('font', function () {
  return gulp.src(srcPath.font)
  .pipe(changed('../dest'))
  .pipe(gulp.dest('../dest'));
});
gulp.task('fontAll', function () {
  return gulp.src(srcPath.font)
  .pipe(gulp.dest('../dest'));
});
gulp.task('tpl', function(){
  var source=gulp.src(srcPath.tpl)
    .pipe(changed('../dest',{extension:'.hbs'}));
  return tplProcess(source);
});
gulp.task('tplAll', function(){
  var source=gulp.src(srcPath.tpl)
  return tplProcess(source);
});
gulp.task('htmlHbs', function(){
  var source=gulp.src(htmlHbs);
  return tplProcess(source);
});
function browserSyncReload(){
  var reload = false;
  return through.obj(function(file, enc, cb){
    if(file){
      var result = file.htmllint;
      if (result && result.success) {
        reload = true;
      }
    }
    cb();
  }, function(cb){
    if(reload){
      browserSync.reload();
    }
    cb();
  });
}
function htmllintReporter() {
  return through.obj(function(file, enc, cb) {
    var result = file.htmllint
    var issues = file.htmllint.issues;
    var filePath = path.relative(path.resolve('../orig'), file.path);
    var tempFile = '../temp/' + filePath;
    if (result.success) {
      deleteFile(tempFile, 0);
      cb(null, file);
    }else{
      issues.forEach(function (issue) {
        lintReporter('htmllint', file.path, issue.line, issue.column, issue.rule, issue.msg, 'error');
      });
      checkDir(tempFile, 1).then(function(){
        fs.writeFile(tempFile, file.contents);
      }, function(err){
        console.log(err.toString());
      });
      cb();
    }
  });
}
function tplProcess(source){
  return source
    .pipe(resouceMap(null,'html'))
    .pipe(concatLibs())
    .pipe(htmlParser(false))
    .pipe(rename({extname:".hbs"}))
    .pipe(htmllint({}, function(){}))
    .on('error',errorProcess)
    .pipe(htmllintReporter())
    .pipe(gulp.dest('../dest'))
    .pipe(htmlParser(true))
    .pipe(htmlmin({
      collapseWhitespace: true,
      processScripts: ['text/x-handlebars-template'],
      removeComments: true,
      customAttrAssign: [/\\?\{\{.*\}\}/],
      customAttrSurround: [ [/\\?\{\{#.+\}\}/, /\\?\{\{\/\S+\}\}/] ]
    }))
    .on('error',errorProcess)
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest('../dest'))
    .pipe(browserSyncReload());
}
gulp.task('bs', function() {
  browserSync.init({
    proxy: "localhost:9029",
    open: false
  });
});
gulp.task('bower', function(){
  bowerProcess(false)
});
gulp.task('bowerAll', function(){
  bowerProcess(true)
});
function bowerProcess(all){
  function bowerInstallUpdate(components, type){
    var hashes = [];
    for(x in components){
      var version = components[x]['pkgMeta']['version']
      var release = components[x]['pkgMeta']['_release'];
      hash = 'undefined' != typeof version ? 'v' + version : release;
      hashes[x] = hash;
      console.log(x + ' has been ' + type + ' ( ' + hash + ' ) ');
      if('js-cookie' == x){
        var itemPath = destPath.bower + '/' + x + '/src';
        gulp.src(itemPath + '/js.cookie.js')
        .pipe(uglify())
        .on('error',errorProcess)
        .pipe(rename(function (path) {
          path.basename += ".min";
        }))
        .pipe(gulp.dest(itemPath));
      } else if('bootstrap' == x){
        var itemPath = destPath.bower + '/' + x + '/dist/css/bootstrap.min.css';
        fs.readFile(itemPath, 'utf8', function(err, data){
          if(!err){
            data = data.replace(/\.\.\/(fonts)/ig, '/bower_components/bootstrap/dist/$1');
            fs.writeFile(itemPath, data);
          }
        });
      }
    }
    resouceMap(hashes, 'bower');
  }
  var bowerOrig = {}, bowerDest = {};
  try{
    bowerOrig = fs.readFileSync(srcPath.bowerJson);
    bowerOrig = JSON.parse(bowerOrig);
  }catch(e){
  }
  if('undefined' == typeof bowerOrig.dependencies){
    console.log('bower.json seems to has problem');
    return;
  }
  try{
    bowerDest = fs.readFileSync(destPath.bowerJson)
    bowerDest = JSON.parse(bowerDest);
  }catch(e){
  }
  var toInstall = [], toUpdate = [], toUninstall = [];
  for(x in bowerOrig.dependencies){
    if(('undefined' == typeof bowerDest.dependencies || 'undefined' == typeof bowerDest.dependencies[x]) && 'jquery-legacy' != x){
      toInstall.push(x);
    }else if(bowerDest.dependencies[x] != bowerOrig.dependencies[x] || all || 'jquery-legacy' == x){
      toUpdate.push(x);
    }
  }
  if('undefined' != typeof bowerDest.dependencies){
    for(x in bowerDest.dependencies){
      if('undefined' == typeof bowerOrig.dependencies[x]){
        toUninstall.push(x);
      }
    }
  }
  gulp.src(srcPath.bowerJson)
  .pipe(gulp.dest('../dest'));
  if(0 == toUninstall.length && 0 == toUpdate.length && 0 == toInstall.length){
    console.log('bower.json do not have dependencies change');
  }
  if(toUninstall.length > 0){
    bower.commands
    .uninstall(toUninstall)
    .on('end', function (uninstalled) {
      for(x in uninstalled){
        delMap('bower', x);
      }
      for(x in uninstalled){
        console.log(x + ' has been uninstalled');
      }
    });
  }
  if(toUpdate.length > 0){
    bower.commands
    .update(toUpdate)
    .on('end', function (updated) {
      bowerInstallUpdate(updated, 'updated')
    });
  }
  if(toInstall.length > 0){
    bower.commands
    .install(toInstall)
    .on('end', function (installed) {
      bowerInstallUpdate(installed, 'installed')
    });
  }
}
function delDest(type, delPath){
  var filePathFromSrc = path.relative(path.resolve('../orig'), delPath);
  var destFilePath = path.resolve('../dest', filePathFromSrc);
  if('css' == type){
    destFilePath = destFilePath.replace('.less','.css')
  }else if('hbs' == type){
    destFilePath = destFilePath.replace('.json','.hbs')
  }
  del.sync(destFilePath,{force:true});
  gutil.log(gutil.colors.white(path.relative(path.resolve('../dest'), destFilePath)) + gutil.colors.yellow(' Deleted'));
  if(-1 != ['css','js','hbs','img'].indexOf(type)){
    if('img' != type){
      del.sync(destFilePath.replace('.'+type,'.min.'+type),{force:true});
    }
    delMap(type, 'hbs' == type ? filePathFromSrc : path.relative(path.resolve('../dest'), destFilePath));
  }
  var destParent = destFilePath.substring(0, destFilePath.lastIndexOf('\\'));
  fs.readdir(destParent, function(err, files){
    if(err){
      console.log(err.toString());
      return;
    }
    if(files.length < 1){
      del(destParent, {force:true});
    }
  });
}
function delMap(type, delPath){
  if('hbs' == type){
    var delPathMap = delPath.replace(/\\/g,'/');
    var hashesFile = '../dest/common/map/html.json';
    var hashesWrite = require(hashesFile);
    for(x in hashesWrite){
      if(-1 != hashesWrite[x].indexOf(delPathMap)){
        hashesWrite[x] = hashesWrite[x].filter(function(value){
          return value != delPathMap;
        });
      }
    }
  }else{
    if('html' == type){
      var delPathMap = delPath.replace(/\\/g,'/');
    }else if('bower' == type){
      var delPathMap = delPath;
    }else{
      if('img' != type){
        var delPath = delPath.replace('.' + type,'');
      }
      var delPathMap = delPath.replace(/\/|\.|\\/g,'_');
    }
    var hashesFile = '../dest/common/map/'+type+'.json';
    var hashesWrite = fs.readFileSync(hashesFile);
    try{
      hashesWrite = JSON.parse(hashesWrite);
    }catch(e){
    }
    delete hashesWrite[delPathMap];
  }
  fs.writeFileSync(hashesFile,JSON.stringify(hashesWrite,null,'  '));
}
gulp.task('watch', function(){
  watch(srcPath.css, function(e){
    if('unlink' == e.event){
      delDest('css', e.history[0]);
    }else{
      runSequence('css');
    }
  });
  watch(srcPath.cssImport, function(e){
    runSequence('cssAll');
  });
  watch(srcPath.js, function(e){
    if('unlink' == e.event){
      delDest('js', e.history[0]);
    }else{
      runSequence('js');
    }
  });
  watch(srcPath.img, function(e){
    if('unlink' == e.event){
      delDest('img', e.history[0]);
    }else{
      runSequence('img');
    }
  });
  watch(srcPath.font, function(e){
    if('unlink' == e.event){
      delDest('font', e.history[0]);
    }else{
      runSequence('font');
    }
  });
  watch(srcPath.sprite, function(e){
    runSequence('sprite');
  });
  watch(srcPath.tpl, function(e){
    if('unlink' == e.event){
      delDest('hbs', e.history[0]);
    }else{
      runSequence('tpl');
    }
  });
  watch(srcPath.html, function(e){
    if('unlink' == e.event){
      delMap('html', path.relative(path.resolve('../orig'), e.history[0]));
    }else{
      var ePath = e.history[0];
      var filePath=ePath.substring(ePath.indexOf('orig')+5).replace(/\\/g,'/');
      fs.readFile('../dest/common/map/html.json',function(err,data){
        if(err){
          throw err;
        }
        try{
          var htmlMap=JSON.parse(data);
        }catch(e){
        }
        if('object'==typeof htmlMap&&'undefined'!=typeof htmlMap[filePath]){
          htmlHbs=htmlMap[filePath].map(function(obj){
            return '../orig/**/'+obj;
          });
          runSequence('htmlHbs');
        }
      })
    }
  });
  watch(srcPath.bowerJson, function(e){
    runSequence('bower');
  });
  runSequence('bs');
});
var htmlHbs=[],watcher={};
gulp.task('build',['js','img','sprite','font'], function(){
  runSequence('css','tpl','watch');
});
gulp.task('all',['jsAll','imgAll','sprite','fontAll'], function(){
  runSequence('cssAll','tplAll','watch');
});