/**
 * module src: directFlowToApp/main.js
 * 入口文件
 **/
define('app/main', [
    'common/langLoader',
    'app/directFlowToApp'
], function(
    langLoader,
    directFlowToApp

){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){

       directFlowToApp.init();

        (function() {
            try{
                var $el = $('body');
                $el.on('click', '.site', function() {
                    ga&&ga('send', 'event', 'middle-page', 'direct-download');
                });
                $el.on('click', '.google', function() {
                    ga&&ga('send', 'event', 'middle-page', 'googleplay');
                });
                $el.on('click', '.ios', function() {
                    ga&&ga('send', 'event', 'middle-page', 'itune');
                });
            } catch (e) {
                console.log('GA：analytics.js: ' + e.message);
            }
        }());
    });
});
