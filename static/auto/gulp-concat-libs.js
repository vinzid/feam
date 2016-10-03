var through = require('through2');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
const PLUGIN_NAME = 'gulp-concat-libs';
function concatLibs(){
  var stream = through.obj(function(file, enc, cb) {
    var filePath=file.path.replace(/\\/g,'/');
    var filePathShort=file.path.replace(file.base,'').replace(/\\/g,'/');
    if('/'!=filePath.substr(0,1)){
      filePathShort='/'+filePathShort;
    }
    filePath=filePath.substring(0,filePath.lastIndexOf('/')+1);
    filePathShort=filePathShort.substring(0,filePathShort.lastIndexOf('/'));
    file.contents = Buffer.concat([file.contents]);
    var contents=file.contents.toString('utf8'),tempContents='';
    try{
      var libsFile=JSON.parse(contents);
    }catch(e){
      gutil.log(gutil.colors.red('Error: ') + gutil.colors.white(path.relative(path.resolve('../orig'), file.path)) + gutil.colors.red(' is not valid json formatted'));
    }
    if('object'==typeof libsFile){
      var libsFileLength = libsFile.length;
      var error = false;
      libsFile.forEach(function(v,k,a){
        if(error){
          return;
        }
        var tempMatch=v.match(/\.\.\//g);
        var tempPathShort=filePathShort;
        tempMatch.forEach(function(){
          tempPathShort=tempPathShort.substring(0,tempPathShort.lastIndexOf('/'));
        });
        var tempPath=v.replace(/\.\.\//g,'')
        tempPath=tempPath.substring(0,tempPath.lastIndexOf('/')+1);
        try{
          var data=fs.readFileSync(filePath+v,{"encoding":"utf8"});
        }catch(e){
          gutil.log(gutil.colors.red(e.toString()));
          error = true;
          return;
        }
        data=data.replace(/"\.\//g,'"'+tempPathShort+'/'+tempPath);
        data=data.replace(/"(\.\.\/)+/g,function(x){
          var tempMatch2=x.match(/\.\.\//g);
          var tempPath2=tempPathShort+'/'+tempPath.substring(0,tempPath.lastIndexOf('/'));
          tempMatch2.forEach(function(){
            tempPath2=tempPath2.substring(0,tempPath2.lastIndexOf('/'));
          });
          return '"'+tempPath2+'/';
        });
        data=data.trim();
        if(data && k < libsFileLength-1){
          data += '\r\n';
        }
        tempContents+=data;
      });
      if(!error){
        file.contents = new Buffer(tempContents);
        this.push(file);
      }
    }
    cb();
  });
  return stream;
}
module.exports = concatLibs;
