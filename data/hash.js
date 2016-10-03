var hash={},resource=['js', 'css', 'bower', 'img'];
resource.forEach(function(v,i){
  try{
    hash[v]=require('../static/dest/common/map/'+v+'.json',__filename);
  }catch(e){
    hash[v]={};
  }
  try{
    require('../updater')('./static/dest/common/map/'+v+'.json',__filename);
  }catch(e){
  }
});
require('../updater')(__filename);
module.exports = hash;
