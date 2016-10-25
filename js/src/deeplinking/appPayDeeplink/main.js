/**
 * module src: deeplinking/main.js
 * 入口文件
**/
define('app/main', [
        'appPayDeeplink/appPayDeeplink'
    ], function(
        appPayDeeplink
    ){

    //提示下载APP
    appPayDeeplink.init();
});
