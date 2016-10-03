function addGoodsInfo(){
  $('#goods_info').on('submit',function(){
    var obj=$(this),data=obj.serialize();
    $.ajax({
      url:dataUrl[type],
      type:'post',
      data:data,
      dataType:'json',
      xhrFields:{withCredentials:true},
      success:function(d){
        if(0==d.info.error){
          alert('Info '+('add'==type?'Added':'Edited'));
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
function goodsInfoInit(){
  addGoodsInfo();
}
$(document).ready(function(){
  goodsInfoInit();
});
CKEDITOR_BASEPATH = '/bower_components/ckeditor/';
renderSuccess['goods_info'] = function(){
  CKEDITOR.config.language = 'zh-cn';
  $('.toCkeditor').each(function(){
    CKEDITOR.replace($(this).attr('id'));
  });
  $('#goods_info').find('.form-group[type!=text][type!=string][value!=""]').each(function(){
    var obj=$(this),value = $(this).attr('value'),type=$(this).attr('type');
    switch(type){
      case 'select':
        obj.find('option[value="'+value+'"]').prop('selected',true);
        break;
      case 'radio':
        obj.find('input[type=radio][value="'+value+'"]').prop('checked',true);
        break;
      case 'checkbox':
        value = value.split(',');
        $.each(value,function(i,v){
          obj.find('input[type=checkbox][value="'+v+'"]').prop('checked',true);
        });
        break;
    }
  });
  if($('#goods_relate_box').is(':visible')){
    $('#goods_info_box .bxt').removeClass('h');
  }
}