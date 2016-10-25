/**
 * module src: getCoupon/main.js
 * 入口文件
**/
define('app/main', [
        'common/config',
        'common/langLoader',
        'app/getCouponList'
    ], function(
        CONFIG,
        langLoader,
        GetCouponList
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //初始化页面loading样式
        (function(){
            var loadingLang = $('.j-loading-lang'),
                loadingLayerWarp = $('.j-loading-layer-warp');

            loadingLang.html('Please wait.').removeClass('dhm-hide');
            loadingLayerWarp.css({'margin-top': -parseInt(loadingLayerWarp.outerHeight()*1/2)});
        }());

        //初始化页面data-error-tip国际化内容
        (function(){
            $('#errorSure').html('OK');
        }());
        
        //获取coupon列表
        new GetCouponList();
    });
});
