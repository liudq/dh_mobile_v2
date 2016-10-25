/**
 * module src: cart/moveToCart.js
 * 点击moveToCart移除saveForLater到购物车列表
**/
define('app/moveToCart', ['common/config','lib/backbone','app/getSaveForLater','app/getCartList','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,getSaveForLater,getCartList,tip,dataErrorLog){
    //model-点击moveToCart移除saveForLater到购物车列表
    var moveToCartModel = Backbone.Model.extend({
        //移除购物车列表模块
        defaults: function() {
            return {
                //状态码
                code: -1,
                //dom事件对象
                evt: null,
                //需要删除的itemId
                cartItemIds: '',
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
                    url: CONFIG.wwwURL + '/mobileApiWeb/cart-Cart-moveToCart.do',
                    //url: 'moveToCart.json',
                    data: {
                        version: 3.3,
                        client: 'wap',
                        cartItemId: this.get('cartItemIds')
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

    //model-点击moveToCart移除saveForLater到购物车列表
    var moveToCartView = Backbone.View.extend({
        //根节点
        el:'body',
        //backbone提供的事件集合
        events: {
            'click .j-moveToCart': 'moveToCart'

        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.model = this.options.model;
            this.cartList = this.options.cartList;
            this.saveForLaverList = this.options.saveForLaverList;
            this.moreSaveForLater = this.options.moreSaveForLater;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化事件
            this.initEvent();

            //初始化$dom对象
            this.initElement(); 
        },
        //$dom对象初始化
        initElement: function() {

        },
        //事件初始化
        initEvent: function() {
            //监听cartItemId
            this.listenTo(this.model, 'change:cartItemIds', this.resetAjaxOptions);
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //查看购物车列表单个产品外层包裹容器
                cJOrderDetails:'.j-orderDetails',
                //购物车中选中的总价格
                cJTotalPrice:".j-totalPrice",
                //移除购物车按钮
                cJOdDelete: '.j-odDelete',
                //checkout外层容器
                cJCheckOutWap:'.j-check-out-wap',
                //checkout按钮
                cJcheckOut:'.j-checkOut',
                //check按钮置灰
                cNoClick:'noClick',
                //checked选中样式
                cChecked:'checked',
                //数据模型
                model: new moveToCartModel(),
                //购物车列表实例对象
                cartList: $({}),
                //saveForLaverList实例对象
                saveForLaverList: $({}),
                //moreSaveForLater实例对象
                moreSaveForLater: $({}),
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

                //调取saveForLater接口数据
                getSaveForLater.get(this.saveForLaverList.model);

                //调取cartLlist列表接口数据
                getCartList.get(this.cartList.model);

                //重置showMore页数
                this.moreSaveForLater.trigger('moreSaveForLaterView:setPageNo');

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
        //重置ajax()配置对象
        resetAjaxOptions: function(){
            this.model.initialize({
                ajaxOptions: {
                    data: {
                        cartItemId: this.model.get('cartItemIds')
                    }
                }
            });
        },
        //获取itemId
        getCartItemId: function(e){
            var $parent =$(e.target).closest('.saveForLaterInfo');
            return JSON.parse(decodeURIComponent($parent.attr("data-info")))['cartItemId'];
        },
        //点击moveToCart移除saveForLater到购物车列表
        moveToCart:function(e){
            //显示loadding弹层
            tip.events.trigger('popupTip:loading', true);

            //获取CartItemId
            this.model.set({evt: e, cartItemIds: this.getCartItemId(e)});

            //拉取产品数据
            this.model.fetch();

            //调用saveForLater列表接口传递参数
            getSaveForLater.init({
                saveForLaverList: this.saveForLaverList   
            });

            //调用cartList列表接口传递参数
            getCartList.init({
                cartList: this.cartList   
            });
        }
    });
    
    return moveToCartView;
});

