/**
 * module src: deeplinking/main.js
 * 入口文件
**/
define('app/main', [
        'deeplinking/cj',
        'deeplinking/fb'
    ], function(
        CJ,
        FB
    ){
    //加载完语言包之后再执行其他逻辑
    var pagetype = CJ.getUrlParam('pagetype')||'';
    if(pagetype==='cj'){
        //提示下载APP
        CJ.init();
    }
    if(pagetype==='fb'){
        //提示下载APP
        FB.init();
    }
});
