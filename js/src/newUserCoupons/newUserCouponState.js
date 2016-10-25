/**
 * module src: newUserCoupons/newUserCouponState.js
 * 新人注册送大礼包活动页面模块
 **/
define('app/newUserCouponState', ['common/config', 'lib/backbone','checkoutflow/popupTip','checkoutflow/dataErrorLog', 'appTpl/newUserCouponTpl', 'app/bindCouponPackage'], function(CONFIG,Backbone,tip,dataErrorLog,tpl,bindCouponPackage){
    //model-新人注册送大礼包活动页面
    var newUserCouponStateModel = Backbone.Model.extend({
        //获取新人领取大礼包属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //区分高低版本
                version: 'high'
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
                ajaxOptions: {
                    url: '/mobileApiWeb/coupon-Coupon-hasNewBuyerReceivedCouponPackage.do',
                    data: {
                        clientextra: 'wapinapp',
                        client:CONFIG.isAndroid?"android":"ios"
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
            var obj = {};
            obj.code = res.state;
            obj.version = this.versionType();
            return obj;
        },
        //判断高低版本号
        versionType: function(){
            var ua = navigator.userAgent;
                 //ios
                if (/\d\.\d\.\d/.test(ua) && ua.match(/\/(\d\.\d\.\d)/)!==null  && ua.match(/\/(\d\.\d\.\d)/)[1] > '3.7.3') {
                    return true;
                //android
                } else  if(/version=\d\.\d\.\d/.test(ua) && ua.match(/\/(version=(\d\.\d\.\d))/)!==null  && ua.match(/\/(version=(\d\.\d\.\d))/)[2] > '3.7.2') {
                    return true;
                } else {
                    return false;
                }
        }
    });
    //view-新人注册送大礼包展示状态模块
    var newUserCouponStateView = Backbone.View.extend({
        //根节点
        el: 'body',
        events: {
            'click .j-bindCoupon': 'bindNewUserCoupon',
            'click .j-continue':'continueShopping'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.cCouponContent = this.options.cCouponContent;
            this.template = this.options.template;
            this.dataErrorLog = this.options.dataErrorLog;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.couponCode = this.options.couponCode;
            this.bindCouponPackage = this.options.bindCouponPackage;
            this.client = this.options.client;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取初始化数据
            this.model.fetch({data:this.getParams()});
        },
        //获取参数
        getParams: function(options) {
            var sessionkey = this.getUrlParam('session');
            return  $.extend(true, {}, {client:this.client,sessionKey:sessionkey}, options);
        },
        //$dom对象初始化
        initElement: function() {
            this.$cCouponContent = $(this.cCouponContent);
        },
        //事件初始化
        initEvent: function() {
           //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            this.$cCouponContent.on('click','.j-shareCoupon', $.proxy(this.share,this));
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //coupon大礼包容器
                cCouponContent: '.j-couponContent',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new newUserCouponStateModel(),
                //couponId表示 未登录时点击领取登录之后app传过来的参数
                couponCode: this.getUrlParam("couponCode"),
                //绑定coupon package操作
                bindCouponPackage: bindCouponPackage,
                //设备
                client: CONFIG.isAndroid?"android":"ios",
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: false,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {

            //渲染已领取过的页面
            if(model.get('code') === '0x0000') {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //显然已领取过的页面
                this.render(model.attributes);
                this.resizeHeight();
            } else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //在之前未领取过的情况下 登录之后如果有couponCode参数 则执行绑定操作
                if( this.couponCode === 'clicked'){
                    this.triggerBind();
                }
                //渲染默认页面
                this.renderDefaultState(model.attributes);
                this.resizeHeight();
                //捕获异常
                try {
                    throw('success(): data is wrong');
                } catch(e) {
                    //异常数据收集
                    dataErrorLog.events.trigger('save:dataErrorLog', {
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
            //展示数据接口错误信息【点击ok，关闭页面】
            tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
            //捕获异常
            try{
                throw('error(): request is wrong');
            }catch(e){
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
        },
        //数据渲染
        render: function(data) {
            var receivedState = this.template(this.tpl.receivedState.join(''))(data),
                banner = this.template(this.tpl.banner.join(''))(data);
                this.$cCouponContent.append(this.template(banner)).append(this.template(receivedState));
        },
        //绘制默认状态下未领取新人注册大礼包的页面
        renderDefaultState: function(data) {
            var defaultState = this.template(this.tpl.defaultState.join(''))(data),
                banner = this.template(this.tpl.banner.join(''))(data);
            this.$cCouponContent.append(this.template(banner)).append(this.template(defaultState));
        },
        //改变高度使整体高度自适应
        resizeHeight: function(){
            var html = $('html'),
                body = $('body'),
                text = $('.text'),
                bodyHeight = $(window).height();
            html.css('width','100%').css('height','100%');
            body.css('width','100%').css('height','100%');
            text.css('height',bodyHeight - 110 - 24 - 80);
        },
        //点击绑定新人大礼包
        bindNewUserCoupon: function(evt) {
            var _self = this,
                sessionKey = _self.getUrlParam('session'),
                loginState = sessionKey && sessionKey!==''?true:false;
            //如登录则直接绑定，未登录跳转app登录页面
            if(loginState === true) {
                this.bindCouponPackage.get(sessionKey,this.client);
            } else {
                try {
                    //ios APP
                    toLogin("clicked");
                } catch(e) {
                    //andoird APP
                    if (window.order && window.order.toLogin) {
                        window.order.toLogin("clicked");
                    }
                }
            }
        },
        //领取完之后  显示continue shopping 点击唤起app首页
        continueShopping: function(){
            var params = {des:"home",founction:"newCoupon"};
            try {
                //ios APP
                webLinkCommon(params);
            } catch(e) {
                //andoird APP
                if (window.order && window.order.webLinkCommon) {
                    window.order.webLinkCommon(JSON.stringify(params));
                }
            }
        },
        //触发绑定coupon package操作
        triggerBind: function(){
            var _self = this,
                sessionKey = _self.getUrlParam('session');
            this.bindCouponPackage.get(sessionKey,this.client);
        },
        //获取url上从app传过来的参数
        getUrlParam:function(key){
            var url = location.href,
                paraString = url.substring(url.indexOf("?") + 1, url.length).split("&"),
                paraObj = {};

            for (var i = 0, j; j = paraString[i]; i++) {
                paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
            }
            //排除key=wedding+dresses#aa中#aa 把‘+’去掉
            var returnValue = paraObj[key.toLowerCase()];
            if (typeof (returnValue) == "undefined") {
                return "";
            } else {
                return returnValue.replace(/(.+)#.*/, '$1').replace(/\+/g, ' ');
            }
        },
        //分享新人专享活动
        share: function() {
            var shareLinkUrl = "http://m.dhgate.com/newpacks/newpacks-share.html";
            var anShare = {"des":"http://m.dhgate.com/newpacks/newpacks-share.html"};
            try {
                webLinkShare(shareLinkUrl);
            } catch(e) {
                if (window.order && window.order.webLinkShare) {
                    window.order.webLinkShare(JSON.stringify(anShare));
                }
            }
        }
    });
    return newUserCouponStateView;
});