var fs=require('fs');
function updater(path,parent){
  fs.unwatchFile(require.resolve(path));
  if('undefined'!=typeof parent){
    fs.unwatchFile(require.resolve(parent));
  }
  fs.watchFile(require.resolve(path), function(){
    clean(require.resolve(path));
    var index=require(path);
    if('undefined'!=typeof parent){
      clean(require.resolve(parent));
      var index=require(parent);
    }
  });
}
function clean(path){
  var module = require.cache[path];
  if (module.parent){
    module.parent.children.splice(module.parent.children.indexOf(module), 1);
  }
  require.cache[path] = null;
}
updater(__filename);
module.exports=updater;
