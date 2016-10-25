/**
 * module src: common/mydhgate/order/canProceedToPay.js
 * 支付订单跳转模块
**/
define('mydhgate/order/toPayOrder',['common/config','lib/backbone','checkoutflow/popupTip','checkoutflow/dataErrorLog'],function(CONFIG,Backbone,tip,dataErrorLog){
    //model-订单支付跳转
    var toPayOrderModel = Backbone.Model.extend({
        //支付订单初始化属性
        defaults: function() {
            return {
                //状态码
                code: -1
            }
        },
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions:function(options) {
            this.options = {
                ajaxOptions: {
                    url: '/canProceedToPay.do',
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
            $.extend(true,this.options,options||{});
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
            //状态码
            obj.code = res.result==='1'?200:-1;
            return obj;
        }
    });

    //view-支付订单跳转
    var toPayOrderView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .pay_topay': 'toPayOrderByRfid'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            
            //初始化事件
            this.initEvent();
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //数据模型
                model: new toPayOrderModel(),
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
        },
        //拉取数据成功回调
        success:function(model,response,options) {
            if (model.get('code') === 200) {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //跳转到支付页面
                this.toPayArea(this.orderNo);
            } else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，刷新页面】
                tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:response.message||'Query payment information failure.'});
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
        //获取订单id和订单号
        getRfid: function(evt) {
            var $ele = $(evt.target).parents('p');
            //订单号
            this.orderNo = $ele.attr('orderNo');
            //订单id
            this.rfid = $ele.attr('rfid');
        },
        //支付订单
        toPayOrderByRfid: function(evt) {
            //打开loading
            tip.events.trigger('popupTip:loading', true);
            //获取订单信息
            this.getRfid(evt);
            //查询订单状态是否可以进行支付
            this.model.fetch({data:{rfid: this.rfid}});
        },
        //判断是否为老订单
        isOldNO: function(value) {
            var flag = false;
            //老订单是以数字1开头的10位数值
            if (/^1\d{9}$/.test(value)) {
                flag = true;
            }
            return flag;
        },
        //跳转到支付页面
        toPayArea: function(orderNo) {
            //老订单走旧有的支付页面
            if (this.isOldNO(orderNo)) {
                window.location.href = '/dhpayment.do?rfid=' + this.rfid;
            //新订单走新版支付页面
            } else {
                window.location.href = '/payment/pay.html?orderNo=' + this.orderNo;
            }
        }
    });

    return toPayOrderView;
});
