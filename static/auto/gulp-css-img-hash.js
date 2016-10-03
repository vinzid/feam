var through = require('through2');
var fs = require('fs');
const PLUGIN_NAME = 'gulp-css-img-hash';
function cssImgHash(){
  var stream = through.obj(function(file, enc, cb) {
    file.contents = Buffer.concat([file.contents]);
    var contents=file.contents.toString();
    var hashes = fs.readFileSync('../dest/common/map/img.json');
    try{
      hashes = JSON.parse(hashes);
    }catch(e){
      hashes = {};
    }
    contents = contents.replace(/url\(([^)]*?)\)/ig, function(match, url){
      var result;
      var hashUrl = url.replace(/^\//, '');
      hashUrl = hashUrl.substring(0,-1!=hashUrl.indexOf('?')?hashUrl.indexOf('?'):hashUrl.length).replace(/\/|\.|-/g,'_');
      if('undefined' != typeof hashes[hashUrl]){
        result = 'url(' + url + '?' + hashes[hashUrl] + ')';
      }else{
        result = match;
      }
      return result;
    })
    file.contents = new Buffer(contents);
    this.push(file);
    cb();
  });
  return stream;
}
module.exports = cssImgHash;