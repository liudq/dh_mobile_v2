/**
 * module src: placeOrder/saveEditAddress.js
 * 编辑保存地址
**/
define('app/saveEditAddress', ['common/config','lib/backbone','app/getShippingAddressList','app/getPlaceOrder','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,getShippingAddressList,getPlaceOrder,tip,dataErrorLog){
    //model-编辑保存地址模块
    var saveEditAddressModel = Backbone.Model.extend({
        //移除购物车列表模块
        defaults: function() {
            return {
                //状态码
                code: -1
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
                    url: CONFIG.wwwURL + '/mobileApiWeb/user-Shipping-saveShippingAddress.do',
                    //url: 'saveEditAddress.json',
                    data: {},
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
        sync: function(method, model, options) {
            //请求异常的时候“dataErrorLog”会捕获“__params”
            this.__params = $.extend(true, {}, this.ajaxOptions, options||{});
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        /**
         * parse（数据格式化）
         *
         * 接口地址：
         * /mobileApiWeb/order-Order-submitToPayment.do
         * 接口文档地址：
         * http://m.dhgate.com/mobileApiWeb/order-Order-submitToPayment.do
         *
         * 说明：
         * 就目前WAP端业务而言并不会用到所有的字段信息
         *
         * 原始数据结构
         * {
         *     "data":{
         *         //订单金额
         *         "amount":"true",
         *          //订单orderId
         *          orderIds:''
         *     },
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
        **/
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            if (obj.code !== -1) {

            }
            return obj;
        }
    });

    //model-编辑保存地址模块
    var saveEditAddressView = Backbone.View.extend({
        //根节点
        el:'.mainBox',
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.model = this.options.model;
            this.placeOrder = this.options.placeOrder;
            this.shipAddress = this.options.shipAddress;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //绑定添加运输地址事件
            this.on('saveEditAddressView:saveEditAddress', this.saveEditAddress, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //数据模型
                model: new saveEditAddressModel(),
                //placeOrder实例对象
                placeOrder: $({}),
                //运输地址列表实例对象
                shipAddress: $({}),
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
            if (model.get('code') === 200) {
                //关闭编辑地址弹层
                this.placeOrder.trigger('closeLayer');

                //执行外部成功回调
                this.successCallback();
                //调用运输地址列表接口
                getShippingAddressList.get(this.shipAddress.model);

                //请求数据成功调用初始化接口局部刷新页面
                this.getPlaceOrder(this.placeOrder.model);
            }else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
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
        saveEditAddress:function(options){
            //运输地址数据
            var data = options.data;
            //保存成功后的回调
            this.successCallback = options.successCallback;
            //拉取产品数据
            this.model.fetch({data:this.getParams(data)});

            //传递参数
            getShippingAddressList.init({
                placeOrder: this.placeOrder
            });
        },
        //获取参数
        getParams:function(data){
            var obj = {};
            obj.shippingInfoId = data.shippingInfoId||'';
            obj.country = data.countryid
            obj.countryname = data.country;
            obj.city = data.city;
            obj.state = data.state;
            obj.addressline1 = data.addressOne;
            obj.addressline2 = data.addressTwo||'';
            obj.tel = data.telephone;
            obj.postalcode = data.zipCode;
            obj.firstname = data.firstName;
            obj.lastname = data.lastName;
            obj.vatNumber = data.vatnum||'';
            obj.email = data.email||'';
            obj.client = 'wap';
            obj.version = 'version';
            return obj;
        },
        //调用初始化接口
        getPlaceOrder:function(model){
            getPlaceOrder.events.trigger('GetPlaceOrder:fetch', {
                successCallback: $.proxy(function(res){
                   //向订单产品中注入匹配的临时数据中的备注信息
                    res.orders = model.addRemark(res.orders);

                    model.set({
                       orderSummary: $.extend(true, {},model.get('orderSummary'), res.orderSummary),
                       shippingInfo: res.shippingInfo,
                       orders: res.orders
                    });
                    //更新商品商品渲染
                    this.placeOrder.trigger('placeOrderView:render:renderProductInfo', res);

                    //重新初始化$dom对象自定义事件
                    this.placeOrder.trigger('placeOrderView:render:initElement');
                    //运输方式渲染
                    this.placeOrder.trigger('placeOrderView:render:renderShipping', res);
                    //更新备注
                    this.placeOrder.trigger('placeOrderView:render:renderRemark', res);
                    //当前coupon信息绘制
                    this.placeOrder.trigger('placeOrderView:render:renderCoupon',res);

                    //判断商品是否可运达、库存不足、是否可售
                    this.placeOrder.canDelivery();
                }, this)
            });
        }
    });
    
    return saveEditAddressView;
});

