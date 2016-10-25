/**
 * module src: newUserCoupons/main.js
 * 入口文件
 **/
define('app/main', [
    'common/config',
    'common/langLoader',
    'app/shareLandingPage'
], function(
    CONFIG,
    langLoader,
    shareLandingPage
){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){

        //分享新人大礼包活动落地页
        shareLandingPage.init();
    });
});


