var express = require('express');
var router = express.Router();
var requestData = require('../func/requestData')
router.all('/:type', function(req, res, next) {
  req.data.variable.rendered=0;
  switch(req.params.type){
    case 'index':
      var url = req.query.url;
      requestData(req, res, url, 1);
      break;
    default:
      next();
  }
});
require('../updater')('./func/requestData.js', __filename);
require('../updater')(__filename);
module.exports = router;