/**
 * module src: mycoupon/openMyCouponApp.js
 * 唤起app中mycoupon模块
**/
define('app/openMyCouponApp', ['common/config', 'lib/backbone', 'common/appopen'], function(CONFIG, Backbone, appopen){
    //model-唤起app中mycoupon
    var OpenMyCouponAppModel = Backbone.Model.extend({
        //唤起app中mycoupon属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1
            }
        }
    });

    //view-唤起app中mycoupon页面
    var OpenMyCouponAppView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-gotoapp': 'gotoapp'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.mycouponSchemeUrl = this.options.mycouponSchemeUrl;
            this.model = this.options.model;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //数据模型
                model: new OpenMyCouponAppModel(),
                //mycouponSchemeUrl
                mycouponSchemeUrl: 'DHgate.Buyer://virtual?params={"des":"mycoupons","d1code":"wapMycoupon"}'
            };
            $.extend(true, this.options, options||{});
        },
        //去调用头部公用的唤起功能
        gotoapp:function(){
            appopen.init({schemeUrl:this.mycouponSchemeUrl});
        }
    });

    return OpenMyCouponAppView;
});
