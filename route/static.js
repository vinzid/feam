var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next){
  var fs=require('fs');
  var url=req.url;
  var sep = url.indexOf('??');
  if(-1!==url.indexOf('.css')){
    res.set('Content-Type', 'text/css');
  }else{
    res.set('Content-Type', 'application/javascript');
  }
  if(-1!==sep){
    var items = url.substr(sep+2).split(',');
    var contents='';
    items.forEach(function(v,i){
      contents+=fs.readFileSync('static/dest/'+v.substring((0==v.indexOf('/')?1:0),-1!=v.indexOf('?')?v.indexOf('?'):v.length));
    });
    res.send(contents);
  }else{
    res.set('Content-Type', 'text/html');
    res.send(fs.readFileSync('./index.htm'));
  }
});
require('../updater')(__filename);
module.exports=router;