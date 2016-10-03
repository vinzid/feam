var constant=function(req, res){
  var data={}
  data.URL = {
    BASE:'http://'+req.headers.host+'/',
    DATA:'http://'+req.headers.host.replace('9029','9030').replace('fe','be')+'/',
    RESOURCE:'http://'+req.headers.host,
  };
  return data;
}
require('../updater')(__filename);
module.exports = constant;