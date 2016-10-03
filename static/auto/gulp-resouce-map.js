var through = require('through2');
var fs = require('fs');
var crypto = require('crypto');
const PLUGIN_NAME = 'gulp-resouce-map';
function resouceMap(hashes,type){
  function precessMap(file, enc, cb) {
    var mapDir='../dest/common/map/';
    var hashesFile=mapDir+type+'.json';
    var hashesWrite={};
    if('bower' == type){
      for(x in hashes){
        hashesWrite[x] = hashes[x];
      }
    }else{
      var filePath=file.path.replace(file.base,'').replace(/\\/g,'/');
      var filePathFormat=filePath.replace(/^\//,'').replace('.'+type,'').replace(/\/|\.|-/g,'_');
      if(type.match(/css|js|img/)){
        hashesWrite[filePathFormat]=hashes[file.path].substr(0,6);
      }else{
        var contents=file.contents.toString();
        try{
          var libsFile=JSON.parse(contents);
        }catch(e){
        }
        if('object'==typeof libsFile){
          libsFile.forEach(function(v,k,a){
            var pathSplit=filePath.split('/');
            pathSplit.pop();
            var pathSplitLength=pathSplit.length;
            var pathMatch=v.match(/\.\.\//g);
            v=v.replace(/\.\.\//g,'');
            if(pathMatch){
              var pathMatchLength=pathMatch.length;
              for(var i=pathSplitLength-pathMatchLength;i>0;i--){
                v=pathSplit[pathSplitLength-i-1]+'/'+v;
              }
            }
            hashesWrite[v]=[filePath];
          });
        }
      }
    }
    fs.stat(mapDir,function(err, stats){
      if(err){
        fs.mkdir(mapDir);
      }
      fs.stat(hashesFile,function(err, stats){
        if(err){
          fs.writeFile(hashesFile,JSON.stringify(hashesWrite,null,'  '));
        }else{
          var data=fs.readFileSync(hashesFile);
          try{
            var hashesRead=JSON.parse(data);
          }catch(e){
          }
          var hashesTemp={},keyTemp=[];
          if('object'==typeof hashesRead){
            if('html' == type){
              for(x in hashesRead){
                keyTemp.push(x);
              }
              for(x in hashesWrite){
                if('undefined'==typeof keyTemp[x]){
                  keyTemp.push(x);
                }
              }
              keyTemp.sort();
              keyTemp.forEach(function(v,k,a){
                if('undefined'==typeof hashesWrite[v]){
                  var index = hashesRead[v].indexOf(filePath);
                  if(-1 != index){
                    hashesRead[v].splice(index, 1);
                  }
                  hashesTemp[v]=hashesRead[v];
                }else if('undefined'==typeof hashesRead[v]){
                  hashesTemp[v]=hashesWrite[v];
                }else{
                  hashesTemp[v]=hashesRead[v];
                  if(-1==hashesTemp[v].indexOf(hashesWrite[v][0])){
                    hashesTemp[v].push(hashesWrite[v][0]);
                  }
                  hashesTemp[v].sort();
                }
              });
            }else{
              for(x in hashesRead){
                keyTemp.push(x);
              }
              for(y in hashesWrite){
                keyTemp.push(y);
              }
              keyTemp.sort();
              keyTemp.forEach(function(v,k){
                hashesTemp[v]='undefined'!=typeof hashesWrite[v]?hashesWrite[v]:hashesRead[v];
              });
            }
            hashesWrite=hashesTemp;
          }
          fs.writeFileSync(hashesFile,JSON.stringify(hashesWrite,null,'  '));
        }
      });
    });
    if('bower' != type){
      cb(null, file);
    }
  }
  if('bower' == type){
    return precessMap();
  }else{
    return through.obj(precessMap);
  }
}
module.exports = resouceMap;
