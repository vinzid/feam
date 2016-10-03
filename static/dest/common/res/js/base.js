$.ajaxPrefilter(function(options){
  if(corsProxy && options.crossDomain){
    options.url = '/proxy/index/?url=' + encodeURIComponent(options.url);
    options.crossDomain = false;
  }
});
function getRenderData(){
  if('undefined'!=typeof rendered&&0==rendered){
    $.ajax({
      url:dataUrl.render,
      type:'get',
      dataType:'json',
      xhrFields:{withCredentials:true},
      success:function(d){
        if(0==d.info.error){
          if('undefined'!=typeof d.box){
            $.each(d.box, function(i,v){
              if('undefined'!=typeof v.show && 1 == v.show){
                $('#'+i+'_box').removeClass('h');
              }
            });
          }
          render(d.data);
        }else{
          alert(d.info.message);
        }
      },
      error:function(e){
        alert('error');
      }
    });
  }
}
function render(data){
  data = filter(data);
  $('.jstpl').each(function(index,element){
    var obj=$(this),tpl=obj.attr('tpl'),template;
    if('undefined'!=typeof tpls[tpl]){
      template=tpls[tpl];
    }else{
      template=Handlebars.compile($(this).html());
      tpls[tpl]=template;
    }
    $('#'+tpl).html(template(data)).addClass('rendered');
  });
  $.each(renderSuccess,function(i,v){
    v();
  });
}
function filter(data){
  for(x in dataFilter){
    if('function'==typeof dataFilter[x]){
      data=dataFilter[x](data);
    }
  }
  return data;
}
function showLazy(context){
  context.find('img.lazy:visible').each(function(){
    var obj=$(this),data=obj.attr('data');
    if(obj.hasClass('auto')){
      obj.on('load',function(){
        var h=obj.height(),pr=obj.parent(),prh=pr.height();
        if(h>prh){
          obj.css('margin-top',(prh-h)/2+'px');
        }else if(h<prh){
          obj.addClass('height-fix');
          var w=obj.width(),prw=pr.width();
          obj.css('margin-left',(prw-w)/2+'px');
        }
      });
    }
    if('undefined'!=typeof data&&''!=$.trim(data)&&('/'==data.substr(0,1)||'http'==data.substr(0,4))){
      obj.attr('src',data);
    }
    obj.removeClass('lazy').removeClass('auto');
  });
}
function init(){
  getRenderData();
}
Handlebars.registerHelper('object', function(obj,key) {
  return 'object'==typeof obj ? obj[key] : '';
});
Handlebars.registerHelper('equal', function(lvalue, rvalue, options) {
  if( lvalue!=rvalue ) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});
var tpls={},corsProxy=!(window.XMLHttpRequest&&'withCredentials' in new XMLHttpRequest()),renderSuccess={},dataFilter={};
renderSuccess['base'] = function(){
  showLazy($('body'));
};
$(document).ready(function(){
  init();
});