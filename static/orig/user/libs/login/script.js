function addFormLogin(){
  $('#login-form').submit(function(){
    var identity=$('#username').val(),password=$('#password').val()
    $.ajax({
      url:dataUrl.login,
      type:'post',
      data:{identity:identity,password:password},
      dataType:'json',
      xhrFields:{withCredentials:true},
      success:function(d){
        if(0==d.info.error){
          location.href=linkUrl.user;
        }else{
          alert(d.info.message);
        }
      },
      error:function(e){
        alert('error');
      }
    });
    return false;
  });
}
function loginInit(){
  addFormLogin();
}
$(document).ready(function(){
  loginInit();
});