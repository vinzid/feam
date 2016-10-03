var express = require('express');
var router = express.Router();
var requestData = require('../func/requestData')
router.get('/:type', function(req, res, next) {
  req.data.variable.rendered=0;
  switch(req.params.type){
    case 'list':
      req.data.variable.page = 'goods_list';
      req.data.constant.linkUrl={view:req.data.constant.URL.BASE+'goods/view/?id=',edit:req.data.constant.URL.BASE+'goods/edit/?id='};
      req.data.constant.dataUrl={del:req.data.constant.URL.DATA+'goods/del/?id='}
      req.data.constant.dataUrl.render=req.data.constant.URL.DATA+'goods/list/'+('undefined'!=typeof req.query.seo?('?seo='+req.query.seo):'');
      req.app.set('views','./static/dest/goods/views');
      req.res.render(req.params.type+(req.compress?'.min.hbs':''),req.data);  
      break;
    case 'view':
      req.data.constant.dataUrl = {render: req.data.constant.URL.DATA+'user/logined/'};
      req.app.set('views','./static/dest/goods/views');
      var url = req.data.constant.URL.DATA+'goods/'+req.params.type;
      if('undefined'!=typeof req.query.id){
        url += '?id='+req.query.id;
      }
      requestData(req, res, url);
      break;
    case 'edit':
      req.data.variable.page = 'goods_edit';
      if('undefined'==typeof req.query.id){
        next();
      }
      req.data.variable.title = '商品编辑';
      req.data.variable.type = 'edit';
      req.data.constant.dataUrl={render:req.data.constant.URL.DATA+'goods/edit/?'+('undefined'!=typeof req.query.relate?('relate='+req.query.relate+'&'):'')+'id='+req.query.id,edit:req.data.constant.URL.DATA+'goods/edit/?id='+req.query.id}
      req.app.set('views','./static/dest/goods/views');
      req.res.render(req.params.type+(req.compress?'.min.hbs':''),req.data);
      break;
    case 'add':
      req.data.variable.page = 'goods_add';
      req.data.variable.title = '商品添加';
      req.data.variable.type = 'add';
      req.data.constant.dataUrl={render:req.data.constant.URL.DATA+'goods/add/',add:req.data.constant.URL.DATA+'goods/add/'}
      req.app.set('views','./static/dest/goods/views');
      req.res.render(req.params.type+(req.compress?'.min.hbs':''),req.data);
      break;
    default:
      next();
  }
});
require('../updater')('./func/requestData.js', __filename);
require('../updater')(__filename);
module.exports = router;
