/**
 * module src: newUserCoupons/main.js
 * 入口文件
 **/
define('app/main', [
    'common/config',
    'common/langLoader',
    'app/newUserCouponState',
    'app/updateForNew'
], function(
    CONFIG,
    langLoader,
    newUserCouponState,
    updateForNew
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

        //如果走原生app则初始化领取大礼包的页面
        // 走外部浏览器即低版本的时候初始化提示下载新版本的页面
        if(ifNativeApp() === true){
            new newUserCouponState();
        } else {
            new updateForNew();
        }

        //判断是否是native app
        function ifNativeApp(){
            var ua = navigator.userAgent;
            //Android
            if (/(A|a)ndroid(N|n)ative/i.test(ua)) {
                return true;

            //iphone
            } else if (/i(P|p)hone(N|n)ative/i.test(ua)) {
                return true;

            //neither
            } else {
                return false;
            }
        };

        //_d1_click：analytics.js
        (function(){
            try{
                var $el = $('body');
                $el.on('click', '.j-bindCoupon', function(){
                    _d1_click&&_d1_click('newexcoupon','claimcoupon')
                });
            } catch(e) {
                console.log('GA_d1_click：analytics.js: ' + e.message);
            }
        }());

    });
});


