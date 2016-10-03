dataFilter['list'] = function(data){
  if('undefined' != typeof data.config && 'undefined' != typeof data.config.list && 'undefined' != typeof data.list){
    for(x in data.config.list){
      if('ico' == data.config.list[x]['type'] && 'undefined' != typeof data.config.list[x]['option'] && 2 == data.config.list[x]['option'].length && -1 != data.config.list[x]['option'].indexOf(0) && -1 != data.config.list[x]['option'].indexOf(1)){
        for(y in data.list){
          data.list[y][data.config.list[x]['key']] = 1 == data.list[y][data.config.list[x]['key']] ? 'ok' : 'remove';
        }
      }else if('operation' == data.config.list[x]['type']){
        for(y in data.config.list[x]['option']){
          if('link' == data.config.list[x]['option'][y]['type']){
            data.config.list[x]['option'][y]['url'] = linkUrl[data.config.list[x]['option'][y]['key']];
          }
        }
      }
    }
  }
  return data;
};
function addGoodsDel(){
  $('.goods_list').on('click','.to_del',function(){
    if(!confirm('Sure to delete?')){
      return false;
    }
    var obj=$(this),pr=obj.parents('.goods_item'),id=parseInt(pr.attr('goods_id'));
    $.ajax({
      url:dataUrl.del+id,
      type:'post',
      dataType:'json',
      xhrFields:{withCredentials:true},
      success:function(d){
        if(0==d.info.error){
          alert('Deleted');
          pr.remove();
        }else{
          alert(d.info.message);
        }
      },
      error:function(){
        alert('error');
      },      
    });
    return false;
  });
}
function goodsInfoInit(){
  addGoodsDel();
}
$(document).ready(function(){
  goodsInfoInit();
});