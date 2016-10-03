var through = require('through2');
var fs = require('fs');
const PLUGIN_NAME = 'gulp-html-parser';
function hmtlParser(toMin){
  var stream = through.obj(function(file, enc, cb) {
    var filePath=file.path.replace(file.base,'').replace(/\\/g,'/');
    function imgProcess(v, type){
      var tempUrl=v.replace(reg[type],'$1');
      if(tempUrl.match(/\\\{\{/)){
        return;
      }else if(tempUrl.match(/\{\{[\S]*\}\}/)){
        tempUrl = tempUrl.replace('{{', '{{HBShash ');
      }else{
        tempUrl=tempUrl.replace(/^\//, '');
        tempUrl=tempUrl.substring(0,-1!=tempUrl.indexOf('?')?tempUrl.indexOf('?'):tempUrl.length);
        var hashUrl=tempUrl.replace(/\/|\.|-/g,'_');
        tempUrl = '{{constant.URL.RESOURCE}}/' + tempUrl + '?{{hash.img.' + hashUrl+ '}}';
      }
      var tag = v.replace(new RegExp('(' + attr[type] + '=")([^"]*)', 'i'), '$1'+tempUrl);
      contents = contents.replace(v, tag);
    }
    if('/'==filePath.substr(0,1)){
      filePath=filePath.substring(1);
    }
    filePath=filePath.substring(0,filePath.lastIndexOf('/'));
    file.contents = Buffer.concat([file.contents]);
    var contents=file.contents.toString();
    var styles = contents.match(/<link(.*)rel="stylesheet"([^>]*)\/?>\r?\n?/gim);
    if(styles){
      var stylesUrl = '{{constant.URL.RESOURCE}}/??';
      var stylesTag='';
      for(x in styles){
        contents = contents.replace(styles[x],'');
        var tempUrl=styles[x].match(/href="([^"]*)/i)[0].replace('href="','').replace('{{constant.URL.RESOURCE}}/','');
        if('/'==tempUrl.substr(0,1)){
          tempUrl=tempUrl.substring(1);
        }
        tempUrl=tempUrl.substring(0,-1!=tempUrl.indexOf('?')?tempUrl.indexOf('?'):tempUrl.length);
        var hashUrl=tempUrl.replace('.css','').replace(/\/|\./g,'_');
        var hashKey = 'css', minUrl = tempUrl;
        if(-1 != tempUrl.indexOf('bower_components')){
          hashKey = 'bower';
          var hashUrl = tempUrl.match(/bower_components\/([^\/]*)/i)[1];
        }else{
          minUrl = tempUrl.replace('.css','.min.css');
        }
        if(toMin){
          stylesUrl+=minUrl+'?{{hash.'+hashKey+'.'+hashUrl+'}},';
        }else{
          stylesTag+=styles[x].replace(/href="\/?/igm,'href="{{constant.URL.RESOURCE}}/').replace('.css','.css?{{hash.'+hashKey+'.'+hashUrl+'}}');
        }
      }
      if(toMin){
        stylesTag='<link rel="stylesheet" type="text/css" href="'+stylesUrl.substr(0,stylesUrl.length-1)+'" />';
      }
      contents = contents.replace('</head>',stylesTag+'</head>');
    }
    var scriptsReg = /<script[^>]*>[^<]*<\/script>\r?\n?/gim;
    var scripts = contents.match(scriptsReg);
    contents = contents.replace(scriptsReg,'');
    if(scripts){
      if(!toMin){
        var orderPreg=/order="(\d+)/i;
        var order = 10000;
        scripts = scripts.map(function(v){
          if(!v.match(orderPreg)){
            v = v.replace('<script', '<script set-order="' + order + '"');
            order++;
          }
          return v;
        });
        scripts.sort(function(a,b){
          return orderPreg.exec(a)[1]-orderPreg.exec(b)[1];
        });
        scripts = scripts.map(function(v){
          v = v.replace(/\sset\-order\="(\d+)"/i, '');
          return v;
        });
      }
      var scriptsUrl = '{{constant.URL.RESOURCE}}/??';
      var scriptsInline = '';
      var scriptsTag = '';
      for( x in scripts){
        if(!scripts[x][scripts[x].length-1].match(/\r|\n/)){
          scripts[x]+='\r\n';
        }
        var matches=scripts[x].match(/src="([^"]*)/i);
        if(matches){
          var tempUrl = matches[0].replace('src="','').replace('{{constant.URL.RESOURCE}}/','');
          if('http'==matches[1].substr(0,4)){
            scriptsTag+=scripts[x];
          }else{
            if('/'==tempUrl.substr(0,1)){
              tempUrl=tempUrl.substring(1);
            }
            tempUrl=tempUrl.substring(0,-1!=tempUrl.indexOf('?')?tempUrl.indexOf('?'):tempUrl.length);
            var hashUrl=tempUrl.replace('.js','').replace(/\/|\./g,'_');
            var hashKey = 'js', minUrl = tempUrl;
            if(-1 != tempUrl.indexOf('bower_components')){
              hashKey = 'bower';
              var hashUrl = tempUrl.match(/bower_components\/([^\/]*)/i)[1];
            }else{
              minUrl = tempUrl.replace('.js','.min.js');
            }
            if(toMin){
              scriptsUrl+=minUrl+'?{{hash.'+hashKey+'.'+hashUrl+'}},';
            }else{
              scriptsTag+=scripts[x].replace(/src="\/?/igm,'src="{{constant.URL.RESOURCE}}/').replace('.js','.js?{{hash.'+hashKey+'.'+hashUrl+'}}');
            }
          }
        }else{
          if(toMin){
            scriptsInline+=scripts[x].replace(/(\r?\n|\r)/igm,'');
          }else{
            scriptsInline+=scripts[x];
          }
        }
      }
      if(toMin){
        scriptsTag+='<script src="'+scriptsUrl.substr(0,scriptsUrl.length-1)+'"></script>';
      }
      contents = contents.replace('</body>',scriptsInline+scriptsTag+'</body>');
    }
    if(!toMin){
      var reg = {};
      var attr = {
        img: 'src',
        imgData: 'data',
        ico: 'href'
      }
      reg.img = /<img[^>]*src="([^"]*)"[^>]*>/gim;
      var imgs = contents.match(reg.img);
      if(imgs){
        imgs.forEach(function(v, i){
          imgProcess(v, 'img');
        });
      }
      reg.imgData = /<img[^>]*data="([^"]*)"[^>]*>/gim;
      var imgDatas = contents.match(reg.imgData);
      if(imgDatas){
        imgDatas.forEach(function(v, i){
          imgProcess(v, 'imgData');
        });
      }
      reg.ico = /<link[^>]*href="([^"]*.ico)"[^>]*>/gim;
      var icos = contents.match(reg.ico);
      if(icos){
        icos.forEach(function(v, i){
          imgProcess(v, 'ico');
        });
      }
    }
    file.contents = new Buffer(contents);
    this.push(file);
    cb();
  });
  return stream;
}
module.exports = hmtlParser;