/**
 * module src: placeOrder/email.js
 * 游客邮箱验证是否被占用
**/
define('app/email', ['common/config','lib/backbone','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,tip,dataErrorLog){
    //model-游客邮箱验证
    var emailModel = Backbone.Model.extend({
        defaults: function() {
            return {
                //状态码
                code: -1,
                data:{
                  //邮箱是否被占用
                  isExists:true
                }
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
                    url: CONFIG.wwwURL + '/mobileApiWeb/user-User-verify.do',
                    //url: 'userVerify.json',
                    data: {
                        version: 3.3,
                        client: 'wap'
                    },
                    type: 'POST',
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
            //return CONFIG.wwwURL + this.ajaxOptions.url;
            return this.ajaxOptions.url;
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
            if (obj.code !== -1) {
            }
            return obj;
        },
    });

    //view-游客邮箱验证
    var emailView =Backbone.View.extend({
        //根节点
        el: '.mainBox',
        //初始化入口
        initialize: function(options){
            //配置对象初始化
            this.setOptions(options);
            this.cJErrorTips = this.options.cJErrorTips;
            this.cJEmailValue = this.options.cJEmailValue;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化事件
            this.initEvent();
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //数据模型
                model: new emailModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //绑定邮箱验证事件
            this.on('emailView:email', this.email, this);
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                //验证邮箱是否被占用
                this.emailOccupy(response);
            }else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，关闭弹层】
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
            //展示数据接口错误信息【点击ok，关闭弹层】
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
        email:function(options){
            //邮箱地址
            var value = options.email;
            //验证成功的回调
            this.successCallback = options.successCallback;
            //拉取产品数据
            this.model.fetch({data:$.extend(true, {}, {version: 3.3,client: 'wap', email: value})});
        },
        //判断邮箱是否被占用
        emailOccupy:function(response){
            var isExists = response.data.isExists;
            if (isExists===true) {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //邮箱被占用提示
                tip.events.trigger('popupTip:autoTip',{message:'Email has already been taken, please change.'});
            //执行回调
            } else {
                this.successCallback();
            }
        }
    });

    return emailView;
});