/**
 * module src: loadingApp/main.js
 * 入口文件
**/
define('app/main', [ 
        'common/appopen'
    ], function(
        Appopen
    ){
    //提示下载APP
    Appopen.init();
});
