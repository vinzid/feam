requestData = function(req, res, url, proxy){
  var request = require('request');
  var jar = request.jar();
  var postData = {};
  if(proxy && 'undefined' != typeof req.headers.cookie){
    var cookie = request.cookie(req.headers.cookie);
    jar.setCookie(cookie, url);
  }
  request({
    uri: url,
    method: req.method,
    jar: jar,
    form: req.body
  }, function(error, response, body) {
    if (!error && 200 == response.statusCode) {
      if(proxy){
        for(x in response.headers){
          res.setHeader(x, response.headers[x]);
        }
        req.res.end(body);
      }else{
        try{
          result = JSON.parse(body);
          if(0==result.info.error){
            for(x in result.data){
              req.data[x]=result.data[x];
            }
          }
        }catch(e){
        }
        req.res.render(req.params.type+(req.compress?'.min.hbs':''),req.data);
      }
    }
  });
}
module.exports = requestData;