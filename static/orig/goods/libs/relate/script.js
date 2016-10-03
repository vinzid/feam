function addGoodsSeo(){
  $('#goods_relate').on('submit',function(){
    var obj=$(this),data=obj.serialize();
    $.ajax({
      url:dataUrl.edit,
      type:'post',
      data:data,
      dataType:'json',
      xhrFields:{withCredentials:true},
      success:function(d){
        if(0==d.info.error){
          alert('Relate Edited');
          if('undefined'!=typeof d.data&&!$.isEmptyObject(d.data)){
            render(d.data);
          }
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
function goodsSeoInit(){
  addGoodsSeo();
}
$(document).ready(function(){
  goodsSeoInit();
});