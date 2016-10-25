/**
 * module src: download/main.js
 * 入口文件
**/
define('app/main', [
        'download/download'
    ], function(
        download
    ){
    download.init();
});
