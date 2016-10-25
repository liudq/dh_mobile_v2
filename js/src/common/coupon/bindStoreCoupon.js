/**
 * module src: common/detail/coupon/bindStoreCoupon.js
 * 领取店铺优惠券模块
**/
define('common/coupon/bindStoreCoupon', ['common/config','common/getUserInfo', 'tpl/coupon/getStoreCouponListTpl','checkoutflow/popupTip','checkoutflow/dataErrorLog','tools/getSpecifyUrlParam'], function(CONFIG,getUserInfo,tpl,tip,dataErrorLog,getSpecifyUrlParam){
    //构造函数
    var bindCouponModel = Backbone.Model.extend({
        //领取店铺StoreCoupon
        defaults: function() {
            return {
                //状态码
                code: 200
            };
        },
        /**
         * 初始化入口
         * argument[0|1]:
         * 0: [attributes]
         * 1: [options]
        **/
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: '/mobileApiWeb/coupon-Coupon-bindCouponToBuyer.do',
                    //url: 'bindCoupon.json',
                    data:{
                        version: 3.3,
                        client: 'wap'
                    },
                    type: 'GET',
                    dataType: 'json',
                    async: true,
                    cache: false,
                    //发送到服务器的数据，将自动转换为请求字符串格式
                    //例如：{foo:["bar1", "bar2"]} 转换为 "&foo=bar1&foo=bar2"
                    //在此处显示告诉$.ajax()需要对象序列化，这样就不需要设置
                    //Backbone.emulateJSON = true
                    processData: true
                }
            };
            $.extend(true, this.options, options||{});
        },
        //设置生成模型的url
        urlRoot: function() {
            return CONFIG.wwwURL + this.ajaxOptions.url;
            //return this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            //请求异常的时候“dataErrorLog”会捕获“__params”
            this.__params = $.extend(true, {}, this.ajaxOptions, options||{});
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * /mobileApiWeb/coupon-Coupon-bindCouponToBuyer.do
             * 接口文档地址：http://192.168.76.42:8090/pages/viewpage.action?pageId=1573175
             *
             * 原始数据结构
             * {
             *     "data":{
             *          //是否绑定成功
             *         "isBind":true,
             *     },
             *     "message":"Success",
             *     "serverTime":1454307909079,
             *     "state":"0x0000"
             * }
            */
            var obj = {};
            //领取storeCoupon成功
            if(res.state ==="0x0000"){
                obj.code = 200;
            }//storeCoupon已经领光了
            else if(res.state ==='0x0511'){
                obj.code = 201;
            }//用户已经存在该storeCoupon
            else if(res.state ==='0x0505'){
                obj.code = 202;
            }//反之其他错误信息为-1
            else{
                obj.code = -1;
            }
            return obj;
        }
    });

    //view-领取店铺StoreCoupon
    var bindCouponView =Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-sCoupon-btn': 'bindCoupon'
        },
        //初始化入口
        initialize: function(options){
            //配置对象初始化
            this.setOptions(options);
            this.cStoreCouponSold = this.options.cStoreCouponSold;
            this.cJGetNowCJpopGetNow = this.options.cJGetNowCJpopGetNow;
            this.cJGetNow = this.options.cJGetNow;
            this.cJPopGetNow = this.options.cJPopGetNow;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //初始化获取优惠券storeCoupon己领取按钮样式
                cStoreCouponSold:'store-coupon-sold',
                ////初始化获取优惠券storeCoupon Get Now和storeCoupon弹层Get Now外层包裹容器
                cJGetNowCJpopGetNow:'.j-getNow,.j-popGetNow',
                //获取优惠券GetNow按钮
                cJGetNow: '.j-getNow',
                //获取优惠券弹层GetNow按钮
                cJPopGetNow: '.j-popGetNow',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new bindCouponModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            
            //成功领取
            if (model.get('code') === 200) {
                this.successCallback('Congratrulations! You got this seller\'scoupon!'); 
            //已经被领光了
            } else if (model.get('code') === 201){
                this.doneCallback('Sorry, we\'re currently out of coupons.');
            //已经领取过了
            } else if (model.get('code') === 202){
                this.successCallback('You already got this coupon.');
            //其他异常情况
            } else {
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
                //捕获异常
                try {
                    throw('success(): data is wrong');
                } catch(e) {
                    //异常数据收集
                    this.dataErrorLog.events.trigger('save:dataErrorLog', {
                        message: e,
                        url: this.model.__params.url,
                        params: this.model.__params.data,
                        result: response
                    });
                }
            }
        },
        //拉取数据失败回调
        error: function() {
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，关闭提示】
            tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
            //捕获异常
            try {
                throw('error(): request is wrong');
            } catch(e) {
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
        },
        //$dom对象初始化
        initElement: function() {
            this.$cJGetNow = $(this.cJGetNow);
            this.$cJPopGetNow = $(this.cJPopGetNow);
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //自定义自动绑定店铺storeCoupon
            this.on('bindCouponView:autoBindCoupon', this.autoBindCoupon ,this);
        },
        //自动绑定店铺storeCoupon
        autoBindCoupon: function() {
            var urlCouponCode = getSpecifyUrlParam({name:'couponCode'}),
                $currentTarget = $("dl[data-couponcode='" + urlCouponCode+"']");
            if(urlCouponCode!=='' && $currentTarget.length>0){
                //领取店铺storeCoupon
                this.bindCoupon($currentTarget);
            }
        },
        //领取店铺storeCoupon
        bindCoupon: function(e){
                //当前点击的coupon元素
            var $e = this.currentTarget = e.currentTarget?$(e.currentTarget):e,
                //获取当前元素上的couponCode
                couponCode = $e.attr("data-couponcode");
            //如果带有data-status则说明不可领取
            if ($e.attr('data-status') === 'y') {
                return;
            }
            //打开loading
            tip.events.trigger('popupTip:loading', true); 
            //判断用户是否登陆 
            getUserInfo.init({
                fixedURL:CONFIG.wwwURL+ CONFIG.wwwPATHNAME+'?couponCode='+couponCode,
                successCallback: $.proxy(function(){
                    //拉取产品数据
                    this.model.fetch({data:{couponCode: couponCode}});
                },this)
            });
        },
        //领取storeCoupon成功状态
        successCallback: function(messageText){
            var couponCode = this.currentTarget.attr('data-couponcode'),
                $ele = $("dl[data-couponcode='" + couponCode+"']"),
                cJGetNow = this.cJGetNow,
                cJPopGetNow = this.cJPopGetNow;
            //表示已经不可领取
            $ele.attr('data-status','y');
            
            $.each($ele, function(index, e){
                var $e = $(e);                
                $e.addClass('store-coupon-received').removeClass('store-coupon-sell');
                $e.find(cJGetNow).html('Received');
                $e.find(cJPopGetNow).html('');
            });
            
            //提示文案
            tip.events.trigger('popupTip:autoTip',{message:messageText,timer:1000});
        },
        //己经领光storeCouponcoupon
        doneCallback: function(messageText){
            var couponCode = this.currentTarget.attr('data-couponcode'),
                $ele = $("dl[data-couponcode='" + couponCode+"']"),
                cSCouponBtn = this.cSCouponBtn,
                cStoreCouponSold = this.cStoreCouponSold,
                cJGetNowCJpopGetNow = this.cJGetNowCJpopGetNow;
            
            //表示已经不可领取
            $ele.attr('data-status','y');
            
            $.each($ele, function(index, e){
                var $e = $(e);
                $e.find(cJGetNowCJpopGetNow).html('Out of Coupons');
                $e.addClass(cStoreCouponSold);
            });
            
            //提示文案
            tip.events.trigger('popupTip:autoTip',{message:messageText,timer:1000});
        }
    });
    return bindCouponView;
});