/**
 * module src: home/openAppCoupons.js
 * 新人注册送大礼包，wap首页唤起app入口
 **/
define('app/recommend/openAppCoupons', ['common/config', 'lib/backbone', 'common/appopen' ], function(CONFIG, Backbone, Appopen){
    //view-唤起app中新人注册送大礼包模块
    var openAppCouponsView = Backbone.View.extend({
       //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-newPacks': 'openAppCoupons'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.Appopen = this.options.Appopen;
            this.iosParams = this.options.iosParams;
            this.androidParams = this.options.androidParams;
            this.client = this.options.client;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //唤起app
                Appopen: Appopen,
                //通过唤起APP上对应的注册用大礼包页面
                iosParams: {
                     //通用参数
                    'des': 'webview',
                    'founction':'buyer-coupon',                    
					//需要打开app的页面地址                    
					'webUrl': 'http://m.dhgate.com/newpacks/newpacks.html'
                },
                androidParams: {
                    'des': 'buyerCoupon',
                    //需要打开app的页面地址
                    'webUrl': 'http://m.dhgate.com/newpacks/newpacks.html'
                },
                //设备
                client: CONFIG.isAndroid?"android":"ios"
            };
            $.extend(true, this.options, options||{});
        },
        //打开app bind coupons页面
        //用户已下载过app打开相应页面
        //未下载用户则跳转到对应下载链接
        openAppCoupons: function(evt) {
            if(this.client === 'android'){
                //唤起android首页功能
                this.Appopen.init({'schemeUrl':'DHgate.Buyer://virtual?params='+JSON.stringify(this.androidParams)});
            } else {
                //唤起ios功能
                this.Appopen.init({'schemeUrl':'DHgate.Buyer://virtual?params='+JSON.stringify(this.iosParams)});
            }

        }
    });
    return openAppCouponsView;
});
