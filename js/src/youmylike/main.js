/**
 * module src: youmylike/main.js
 * 入口文件
**/
define('app/main', [
        'common/langLoader',
        'app/youmylike'
    ], function(
        langLoader,
        Youmylike
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //you my like
        new Youmylike();
    });
});