/**
 * module src: appdeeplink/main.js
 * 入口文件
**/
define('app/main', [
        'common/langLoader', 
        'appdeeplink/appDeeplink'
    ], function(
        langLoader, 
        appDeeplink
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //提示下载APP
        appDeeplink.init();
    });
});
