/**
 * module src: newUserCoupons/shareLandingPage.js
 * 分享新人专享活动落地页
 **/
define('app/shareLandingPage', ['common/config', 'common/appopen'], function(CONFIG,AppOpen){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.down = this.options.down;
            this.clientType = this.options.clientType;
            this.AppOpen = this.options.AppOpen;
            this.iosParams = this.options.iosParams;
            this.androidParams = this.options.androidParams;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //设置配置对象
        setOptions: function(options) {
            this.options = {
                //唤起按钮
                down: '.down',
                //判断手机设备是android还是ios
                clientType: CONFIG.isAndroid?'android':'ios',
                //唤起app
                AppOpen: AppOpen,
                //通过唤起APP上对应的注册用大礼包页面
                iosParams: {
                    //通用参数
                    'des': 'webview',
                    'founction':'buyer-coupon',
                    //需要打开app的页面地址
                    'webUrl': 'http://m.dhgate.com/newpacks/newpacks.html'
                },
                androidParams: {
                    //通用参数
                    'des': 'buyerCoupon',
                    //需要打开app的页面地址
                    'webUrl': 'http://m.dhgate.com/newpacks/newpacks.html'
                }
            };
            $.extend(true,this.options,options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$body = this.$body||$('body');
        },
        //事件初始化
        initEvent: function() {
            this.$body.on('click',this.down, $.proxy(this.goApp,this));
        },
        //用户已下载过app打开领取新人大礼包页面
        //未下载用户则跳转到对应下载链接
        goApp: function() {
            if(this.client === 'android'){
                //唤起android首页功能
                this.AppOpen.init({'schemeUrl':'DHgate.Buyer://virtual?params='+JSON.stringify(this.androidParams)});
            } else {
                //唤起ios功能
                this.AppOpen.init({'schemeUrl':'DHgate.Buyer://virtual?params='+JSON.stringify(this.iosParams)});
            }
        }
    }
});