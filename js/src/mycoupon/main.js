/**
 * module src: paySucc/main.js
 * 入口文件
**/
define('app/main', [
        'common/config',
        'common/langLoader',
        'app/getCouponList',
        'mydhgate/ifLogIn',
        'app/openMyCouponApp',
        'app/searchCouponNum',
        'app/addCoupon',
        'app/gotoTop'
    ], function(
        CONFIG,
        langLoader,
        getCouponList,
        ifLogIn,
        OpenMyCouponApp,
        SearchCouponNum,
        AddCoupon,
        GotoTop

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
        //先判断是否登录
        ifLogIn.get(function(loginFlag){
            //获取coupon列表
            new getCouponList({
                //登录状态
                loginFlag: loginFlag
            });
            //唤起app中mycoupon页面模块
            new OpenMyCouponApp();
            //查询用户过期和使用过的coupon的数量
            SearchCouponNum.init({
                //登录状态
                loginFlag: loginFlag
            });
            //添加coupon
            new AddCoupon();
            //返回顶部
            new GotoTop();
       });
    });
});
