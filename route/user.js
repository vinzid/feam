var express = require('express');
var router = express.Router();
router.get('/:type', function(req, res, next) {
  req.data.constant.dataUrl={render:req.data.constant.URL.DATA+'user/'+req.params.type};
  switch(req.params.type){
    case 'login':
      req.data.constant.dataUrl.login=req.data.constant.URL.DATA+'user/check_login';
      req.data.constant.linkUrl={user:req.data.constant.URL.BASE+'user/index'}
      req.data.variable.rendered=1;
      break;
    case 'index':
      break;
  }
  req.app.set('views','./static/dest/user/views');
  res.render(req.params.type+(req.compress?'.min.hbs':''),req.data);
});
require('../updater')(__filename);
module.exports = router;
