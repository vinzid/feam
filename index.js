var index = function(req, res){
  process.setMaxListeners(0);
  if('undefined'==typeof process.env.NODE_ENV){
    process.env.NODE_ENV='development';
  }
  process.on('uncaughtException', function(err){
    if('production'!=process.env.NODE_ENV){
      res.end(err.stack);
    }
  });
  var express = require('express');
  var app = express();
  var bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({extended: false}));
  req.app=app;
  req.data = {};
  req.data.constant=require('./data/constant.js')(req, res);
  req.data.hash=require('./data/hash.js');
  req.data.variable={rendered:0};
  var handlebars = require('express-handlebars');
  var hbs = handlebars.create({
    helpers: {
      equal: function(lvalue, rvalue, options) {
        if( lvalue!=rvalue ) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      HBSnotEqual: function(lvalue, rvalue, options) {
        if( lvalue==rvalue ) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      not: function(value, options) {
        if( 'undefined' != typeof value ) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      HBSinArray: function(lvalue, rvalue, options) {
        try{
          rvalue = JSON.parse(rvalue);
        }catch(e){
        }
        if('undefined' != typeof rvalue && rvalue && -1 != rvalue.indexOf(lvalue) ) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      }
    }
  });
  app.engine('hbs', hbs.engine);
  app.set('view engine', 'hbs');
  app.use(express.static(__dirname+'/static/dest'));
  app.use(function(req,res,next){
    if('development'==process.env.NODE_ENV){
      if('undefined'!=typeof req.query&&'undefined'!=typeof req.query.compress){
        req.compress=true;
      }else{
        req.compress=false;
      }
    }else{
      if('undefined'!=typeof req.query&&'undefined'!=typeof req.query.uncompress){
        req.compress=false;
      }else{
        req.compress=true;
      }
    }
    next();
  });
  app.use('/user', require('./route/user'));
  app.use('/goods', require('./route/goods'));
  app.use('/proxy', require('./route/proxy'));
  app.use('/', require('./route/static'));
  return app(req, res);
}
require('./updater')(__filename);
module.exports = index;