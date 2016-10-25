/**
 * module src: paySucc/paySucc.js
 * 支付成功信息初始化模块
**/
define('app/paySucc', ['common/config', 'lib/backbone', 'appTpl/paysuccTpl', 'tools/fastclick','checkoutflow/regexpConfig','app/modifyPassword', 'checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG, Backbone, tpl, FastClick, regexpConfig,modifyPassword,tip,dataErrorLog){
    //model-支付成功页面
    var PaySuccModel = Backbone.Model.extend({
        //支付成功页面属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //运达地址
                shippingAddress: [{
                   //运达国家
                   countryname: '',
                   //运达城市
                   city: '',
                   //运到州
                   state: '',
                   //地址1
                   addressline1: '',
                   //地址2
                   addressline2: '',
                   //电话号码
                   tel: '',
                   //邮编
                   postalcode: '',
                   //姓
                   firstname: '',
                   //名
                   lastname:''
                }],
                //是否为游客
                isVisitor:false,
                //邮箱
                email: ''
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
            //接受PaySuccView的游客信息
            this.set('isVisitor',this.options.isVisitor);
            this.set('email',this.options.email);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                ajaxOptions: {
                    url: '/mobileApiWeb/user-Shipping-getDefaultShippingAddress.do',
                    //url: 'shippingAddress.do',
                    data: {
                        version: 1.0,
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
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            obj.shippingAddress = [];
            if (obj.code !== -1) {
                obj.shippingAddress.push(res.data);
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     shippingAddress: [{
             *         shippingInfoId: '',
             *         countryname: '',
             *         city: '',
             *         state: '',
             *         addressline1: '',
             *         addressline2: '',
             *         tel: '',
             *         postalcode: '',
             *         firstname: '',
                       lastname:''
             *     }]
             * }
            **/
            return obj;
        }
    });

    //view-支付成功页面
    var PaySuccView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'blur .j-password': 'modifyPasswordEvent'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.cPaysuccWap = this.options.cPaysuccWap;
            this.cHide = this.options.cHide;
            this.cErrortips = this.options.cErrortips;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.FastClick = this.options.FastClick;
            this.dataErrorLog = this.options.dataErrorLog;
            this.modifyPassword = this.options.modifyPassword;
            this.regexpConfig = this.options.regexpConfig;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //验证是否为正常访问
            this.validateAccess();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cPaysuccWap = this.$cPaysuccWap||$(this.cPaysuccWap);
            this.$cErrortips = $(this.cErrortips);
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //解决click事件的300毫秒延时
            //阻止大多数设备上的点透问题
            this.FastClick.attach(this.$el[0]);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //支付成功外层包裹容器
                cPaysuccWap: '.js-paysucc-wrap',
                //控制整个区域显示隐藏的className
                cHide: 'dhm-hide',
                //错误提示语言
                cErrortips: '.j-errortips',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new PaySuccModel({}, options.modelParams),
                //阻止点透的函数
                FastClick: FastClick,
                //修改密码
                modifyPassword: modifyPassword,
                //表单验证
                regexpConfig: regexpConfig,
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
            //绘制页面
            this.render(model.attributes);
            //捕获异常
            if (model.get('code') === -1) {
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
                //捕获异常
                try{
                    throw('success(): data is wrong');
                }catch(e){
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
        error: function(model, response, options) {
            var dataNull;
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，关闭页面】
            tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
            //自定义网络出问题的数据
            dataNull = {
                shippingAddress:[]
            };
            //绘制页面
            this.render(dataNull);
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
        //验证是否为正常访问
        validateAccess: function(){
            if(this.model.get('email')===""){
                 //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，去首页】
                tip.events.trigger('popupTip:dataErrorTip', {action:'gohome',message:'Network anomaly.'});
            }
            //拉取产品数据
            this.model.fetch();
        },
        //通过url获取序列化数据
        getUrlSerializeData: function() {
            var obj = {},
                serializeObj = CONFIG.wwwSEARCH.match(/(?:\?|&)v=([^&#]+)/i);
            if (serializeObj !== null) {
                obj = JSON.parse(decodeURIComponent(serializeObj[1]));
            }
            return obj;
        },
        //数据渲染
        render: function(data) {
            var isVisitorObj = {
                    isVisitor : this.model.get('isVisitor'),
                    email :this.model.get('email')
                },
                //url中包含的序列化数据
                urlSerializeData = this.getUrlSerializeData(),
                warp = this.template(this.tpl.warp.join(''))($.extend(data, {
                    //第三方支付成功后返回支付成功页的提示信息
                    thirdPayBackInfo: (urlSerializeData.data&&urlSerializeData.data.thirdPayBackInfo)||''
                })),
                shippedtoTpl = this.template(this.tpl.shippedTo.join(''))(data.shippingAddress),
                isVisitor = this.template(this.tpl.isVisitor.join(''))(isVisitorObj);
            
            warp = warp.replace(/\{\{isVisitor\}\}/, isVisitor).replace(/\{\{shippedTo\}\}/, shippedtoTpl);
            
            //页面绘制
            this.$cPaysuccWap.html(this.template(warp));
            //初始化$dom对象
            this.initElement();
        },
        //修改密码
        modifyPasswordEvent:function(ev){
            var target = $(ev.currentTarget),
                targetVal = target.val(),
                regVal,
                lastPassword;

            //失去焦点判断值和上一次是否一样。
            if(targetVal == target.attr('lastPassword')){
                return;
            }

            regVal = this.regexpConfig.password.test($.trim(targetVal));
            lastPassword = target.attr('lastPassword',targetVal);
            //验证各种状态
            if(regVal){
                this.modifyPassword.get(targetVal);
                this.$cErrortips.addClass(this.cHide);
            }else if(targetVal==""){
                this.$cErrortips.removeClass(this.cHide);
                this.$cErrortips.html('A password is required. Please try again.');
            }else{
                this.$cErrortips.removeClass(this.cHide);
                this.$cErrortips.html('6-30 characters required.');
            }
        }
    });

    return PaySuccView;
});
