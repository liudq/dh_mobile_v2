/**
 * module src: cart/checkOut.js
 * 点击checkOut按钮到placeorder页面
**/
define('app/checkOut', ['common/config','lib/backbone','checkoutflow/getUserInfo','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,getUserInfo,tip,dataErrorLog){
    //model-checkOut
    var checkOutModel = Backbone.Model.extend({
        //移除购物车列表模块
        defaults: function() {
            return {
                //状态码
                code: -1,
                //dom事件对象
                evt: null,
                //需要删除的itemId
                cartItemIds: '',
                //目地的国家
                shipToCountry: '',
                //成功或失败提示语
                message:''
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
                    url: CONFIG.wwwURL +'/mobileApiWeb/order-Order-toPlaceOrder.do',
                    //url: 'checkOut.json',
                    data: {
                        version: 3.3,
                        client: 'wap',
                        cartIds: this.get('cartItemIds'),
                        shipToCountry: this.get('shipToCountry')
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
            return obj;
        }
    });

    //model-移除购物车列表模块
    var checkOutView = Backbone.View.extend({
        //根节点
        el:'.check-out',
        //backbone提供的事件集合
        events: {
            'click .j-checkOut': 'checkOut'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cJOrderList = this.options.cJOrderList;
            this.cJOrderDetails = this.options.cJOrderDetails;
            this.cJCheckOut = this.options.cJCheckOut;
            this.cNoClick = this.options.cNoClick;
            this.cChecked = this.options.cChecked;
            this.model = this.options.model;
            this.cartList = this.options.cartList;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化事件
            this.initEvent();

            //初始化$dom对象
            this.initElement();
            
        },
        //$dom对象初始化
        initElement: function() {
            this.$cJOrderList = $(this.cJOrderList);
            this.$cJOrderDetails = $(this.cJOrderDetails);
            this.$cJCheckOut = $(this.cJCheckOut);
           
        },
        //事件初始化
        initEvent: function() {
            //监听cartItemId
            this.listenTo(this.model, 'change:cartItemIds', this.resetAjaxOptions);
            //监听shipToCountry目地的国家
            this.listenTo(this.model, 'change:shipToCountry', this.resetAjaxOptions);
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //查看购物车外层包裹容器
                cJOrderList:'.j-order-list',
                //查看购物车列表单个产品外层包裹容器
                cJOrderDetails:'.j-orderDetails',
                //checkout
                cJCheckOut:'.j-checkOut',
                //checked样式
                cJOdChecked:'.j-odChecked',
                //checked选中样式
                cChecked:'checked',
                //checkout按钮置灰
                cNoClick:'noClick',
                //数据模型
                model: new checkOutModel(),
                //购物车列表实例对象
                cartList: null,
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
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //页面跳转
                this.checkOutSuccess();
            }else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，刷新页面】
                tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:response.message});
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
        //重置ajax()配置对象
        resetAjaxOptions: function(){
            this.model.initialize({
                ajaxOptions: {
                    data: {
                        cartIds: this.model.get('cartItemIds'),
                        shipToCountry:this.model.get('shipToCountry')
                    }
                }
            });
        },
        //获取itemId
        getCartItemId: function(){
            var $cJOrderDetails = this.$cJOrderDetails,
                cChecked = this.cChecked,
                cartItemIds = [];
            $cJOrderDetails.each(function(i,ele){
                var $ele=$(ele);
                if($ele.find(".j-odChecked").hasClass(cChecked)){
                  cartItemIds.push($ele.attr("cartitemid"));
                }     
            });
            return cartItemIds.join(",");
        },
        //获取shipToCountry
        shipToCountry:function(){
            return JSON.parse(decodeURIComponent(this.$cJOrderList.attr("data-info")))['shipToCountry'];
        },
        //checkOut
        checkOut: function(e){
            //重新初始化$dom对象
            this.initElement();
            
            var model = this.model,
                _self = this,
                $cJCheckOut = $(this.cJCheckOut),
                cNoClick = this.cNoClick;
                if($cJCheckOut.parent().hasClass(cNoClick)) return;
               
            //显示loadding弹层
            tip.events.trigger('popupTip:loading', true);
            
            //获取CartItemId
            model.set({evt: e, cartItemIds: _self.getCartItemId()});

            //获取shipToCountry
            model.set({evt: e, shipToCountry: _self.shipToCountry()});

            //拉取产品数据
            model.fetch();
        },
        //fetch写入数据后进行跳转
        checkOutSuccess:function(){
            getUserInfo.get(function(userInfo){
                if (userInfo.code === 200) {
                    window.location.href = "/placeorder/placeOrder.html";
                }
            }, "/placeorder/placeOrder.html");
        }
    });
    
    return checkOutView;
});

