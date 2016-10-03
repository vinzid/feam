<?php
ini_set('display_errors',1);
error_reporting('E_ALL');
session_start();
if(isset($_SERVER['HTTP_ORIGIN'])){
  header('Access-Control-Allow-Origin: '. $_SERVER['HTTP_ORIGIN']);
  header('Access-Control-Allow-Credentials: true');
}
$uri=$_SERVER['REQUEST_URI'];
if(false!==strstr($uri,'?')){
  $path=substr($uri,0,strpos($uri,'?'));
}else{
  $path=$uri;
}
$result = array(
  'info' => array(
    'error' => 0,
    'message' => '',
    /*'sid' => SID,*/
  ),
  'data' => array(
  )
);
$goods_config = array(
  array(
    'key' => 'id',
    'name' => '编号',
    'type' => 'string',
  ),
  array(
    'key' => 'goods_name',
    'name' => '名称',
    'type' => 'text',
  ),
  array(
    'key' => 'price',
    'name' => '价格',
    'type' => 'text',
  ),
  array(
    'key' => 'brand_id',
    'name' => '品牌',
    'type' => 'select',
    'option' => array(
      0 => array(
        'value' => 0,
        'label' => '请选择'
      ),
      1 => array(
        'value' => 1,
        'label' => '品牌一'
      ),
      2 => array(
        'value' => 2,
        'label' => '品牌二',
      ),
      3 => array(
        'value' => 3,
        'label' => '品牌三'
      ),
    )
  ),
  array(
    'key' => 'sex',
    'name' => '人群',
    'type' => 'radio',
    'option' => array(
      1 => array(
        'value' => 1,
        'label' => '男'
      ),
      2 => array(
        'value' => 2,
        'label' => '女',
      ),
      3 => array(
        'value' => 3,
        'label' => '中性'
      ),
    )
  ),
  array(
    'key' => 'color',
    'name' => '颜色',
    'type' => 'checkbox',
    'option' => array(
      1 => array(
        'value' => 1,
        'label' => '白色'
      ),
      2 => array(
        'value' => 2,
        'label' => '黑色',
      ),
      3 => array(
        'value' => 3,
        'label' => '灰色'
      ),
    )
  ),
  array(
    'key' => 'brief',
    'name' => '简介',
    'type' => 'textarea',
  ),
  array(
    'key' => 'title',
    'name' => '标题',
    'type' => 'text',
  ),
  array(
    'key' => 'keywords',
    'name' => '关键字',
    'type' => 'text',
  ),
  array(
    'key' => 'description',
    'name' => '描述',
    'type' => 'text',
  ),
  array(
    'key' => 'detail',
    'name' => '详情',
    'type' => 'editor',
  ),
);
switch($path){
  case '/user/login':
    break;
  case '/user/logined/':
    $result['data'] = array(
      'logined' => $_SESSION['logined'],
    );
    break;
  case '/user/check_login':
    if(intval($_REQUEST['identity'])>0){
      $result['info'] = array(
        'error' => 1,
        'message' => 'login_fail',
      );
    }else{
      $_SESSION['logined']=1;
    }
    break;
  case '/user/index':
    if(1==$_SESSION['logined']){
      $result['data'] = array(
        'user' => array(
          'username' => '会员名',
          'money' => '3000',
        ),
      );
    }else{
      $result['info']['error'] = 1;
      $result['info']['message'] = 'no_login';
    }
    break;
  case '/goods/list/':
    $seo = isset($_REQUEST['seo']) ? intval($_REQUEST['seo']) : 0;
    $result['data']['config'] = array(
      'list' => array(
        array(
          'key' => 'id',
          'name' => '编号',
          'type' => 'string',
        ),
        array(
          'key' => 'goods_name',
          'name' => '名称',
          'type' => 'string',
        ),
        array(
          'key' => 'price',
          'name' => '价格',
          'type' => 'string',
        ),
        array(
          'key' => 'brand_name',
          'name' => '品牌',
          'type' => 'string',
        ),
        array(
          'key' => 'is_show',
          'name' => '显示',
          'type' => 'ico',
          'option' => array(0,1)
        ),
        array(
          'key' => 'operation',
          'name' => '操作',
          'type' => 'operation',
          'option' => array(
            array(
              'key' => 'view',
              'type' => 'link',
              'name' => '查看'
            ),
            array(
              'key' => 'edit',
              'type' => 'link',
              'name' => '编辑'
            ),
            array(
              'key' => 'del',
              'type' => 'ajax',
              'name' => '删除'
            ),
          ),
        ),
      ),
    );
    $result['data']['list'] = array(
      0 => array(
        'id' => 1,
        'goods_name' => '商品名称',
        'price' => '128.00',
        'brand_name' => '品牌一',
        'is_show' => 1,
      ),
      1 => array(
        'id' => 2,
        'goods_name' => '商品名称二',
        'price' => '128.00',
        'brand_name' => '品牌二',
        'is_show' => 0,
      ),
      2 => array(
        'id' => 3,
        'goods_name' => '商品名称三',
        'price' => '128.00',
        'brand_name' => '品牌三',
        'is_show' => 1,
      ),
    );
    if($seo){
      $operation = array_pop($result['data']['config']['list']);
      $result['data']['config']['list'] = array_merge($result['data']['config']['list'], array(
        array(
          'key' => 'title',
          'name' => '标题',
          'type' => 'string',
        ),
        array(
          'key' => 'keywords',
          'name' => '关键字',
          'type' => 'string',
        ),
        array(
          'key' => 'description',
          'name' => '描述',
          'type' => 'string',
        ),
        $operation,
      ));
      array_walk($result['data']['list'], function(&$item, $key){
        $item['title'] = '标题'.($key+1);
        $item['keywords'] = '关键字'.($key+1);
        $item['description'] = '描述'.($key+1);
      });
    }
    break;
  case '/goods/view':
    $id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0;
    $result['data'] = array(
      'goods' => array(
        'id' => $id,
        'goods_name' => '商品名称'.$id,
        'price' => '128.00',
        'brand_id' => 2,
      ),
      'logined' => $_SESSION['logined'],
    );
    break;
  case '/goods/add/':
    if($_POST){
    }else{
      $result['data']['config']['goods'] = $goods_config;
      array_shift($result['data']['config']['goods']);
    }
    break;
  case '/goods/edit/':
    $id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0;
    $relate = isset($_REQUEST['relate']) ? intval($_REQUEST['relate']) : 0;
    if(!$id){
      $result['info'] = array(
        'error' => 1,
        'message' => 'no_goods',
      );
    }else{
      if($_POST){
      }else{
        $result['data']['config']['goods'] = $goods_config;
        $result['data']['goods'] = array(
          'id' => $id,
          'goods_name' => '商品名称'.$id,
          'price' => '128.00',
          'brand_id' => 2,
          'sex' => 2,
          'color' => '2,3',
          'title' => '标题',
          'keywords' => '关键字',
          'description' => '描述',
        );
        if($relate){
          $result['box'] = array(
            'goods_relate' => array(
              'show' => 1,
            ),
          );
        }
      }
    }
    break;
}
echo json_encode($result);
?>