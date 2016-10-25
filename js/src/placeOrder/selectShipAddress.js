/**
 * module src: placeOrder/selectShipAddress.js
 * 选择运输地址列表信息
**/
define('app/selectShipAddress', ['common/config','lib/backbone','app/getPlaceOrder','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,getPlaceOrder,tip,dataErrorLog){
	var selectShipAddressModel = Backbone.Model.extend({
        //展示运输地址列表信息
        defaults: function() {
            return {
                //状态码
                code: -1,
                //dom事件对象
                evt: null,
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
                    url: CONFIG.wwwURL + '/mobileApiWeb/user-Shipping-setDefaultShippingAddress.do',
                    //url: 'setDefaultShippingAddress.json',
                    data: {
                        version: 3.3,
                        client: 'wap',
                        shippingInfoId: this.get('shippingInfoId')
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
        /**
         * parse（数据格式化）
         *
         * 接口地址：
         * /mobileApiWeb/user-Shipping-setDefaultShippingAddress.do
         * 接口文档地址：
         * http://m.dhgate.com/mobileApiWeb/user-Shipping-setDefaultShippingAddress.do
         *
         * 说明：
         * 就目前WAP端业务而言并不会用到所有的字段信息
         *
         * 原始数据结构
         * {
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
        **/
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            var obj = {};
                obj.list =[];
            obj.code = res.state==='0x0000'?200:-1;
            if (obj.code !== -1) {
                
            }
            return obj;
        }
    });

	//view-运输信息列表
	var selectShipAddressView =Backbone.View.extend({
		//根节点
        el: '.mainBox',
        //backbone提供的事件集合
        events: {
            'click .j-shipAdress-detail': 'selectAddress'
        },
        //初始化入口
        initialize: function(options){
            //配置对象初始化
            this.setOptions(options);
            this.placeOrder = this.options.placeOrder;
            this.hasSelect = this.options.hasSelect;
            this.cJShipAdressLists = this.options.cJShipAdressLists;
            this.cJShipAdressDetail = this.options.cJShipAdressDetail;
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
                //当前选中运输地址样式
                hasSelect:'hasSelect',
                //运输地址信息外层包裹容器
                cJShipAdressLists:'.j-shipAdress-lists',
                //运输地址包裹容器
                cJShipAdressDetail:'.j-shipAdress-detail',

                //数据模型
                model: new selectShipAddressModel(),
                //placeOrder实例对象
                placeOrder: $({}),
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
                //关闭运输地址弹层
                this.placeOrder.trigger('shipAdresscloseLayer');
                //回调成功之后重新渲染页面
                this.getPlaceOrder(this.placeOrder.model);
            }else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
                //还原运输地址列表选中状态
                this.reductionRecord();
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
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，关闭提示】
            tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
            //还原运输地址列表选中状态
            this.reductionRecord();
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
        	this.$hasSelect = $(this.hasSelect);
            this.$cJShipAdressLists = $(this.cJShipAdressLists);
            this.$cJShipAdressDetail = $(this.cJShipAdressDetail);
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);

            //监听shippingInfoId
            this.listenTo(this.model, 'change:shippingInfoId', this.resetAjaxOptions);
        },
        //重置ajax()配置对象
        resetAjaxOptions: function(){
            this.model.initialize({
                ajaxOptions: {
                    data: {
                        shippingInfoId: this.model.get('shippingInfoId')
                    }
                }
            });
        },
        //获取shippingInfoId
        getShippingInfoId:function(e){
            var $currentTarget = $(e.currentTarget);
                
            return JSON.parse(decodeURIComponent($currentTarget.attr("data-info")))['shippingInfoId'];
        },
        //选择运输地址列表信息
        selectAddress:function(e){
            var $currentTarget =  this.$currentTarget =  $(e.currentTarget),
                cJShipAdressDetail = this.cJShipAdressDetail,
                cJShipAdressLists = this.cJShipAdressLists,
                $siblingsSelected = this.$siblingsSelected = $($(cJShipAdressDetail).get(0)),
                hasSelect = this.hasSelect;

            $currentTarget.addClass(hasSelect);
            
            $currentTarget.closest(cJShipAdressLists).siblings().find(cJShipAdressDetail).removeClass(hasSelect);

            //获取shippingInfoId
            this.model.set({evt: e, shippingInfoId: this.getShippingInfoId(e)});

            //显示loading
            tip.events.trigger('popupTip:loading', true);

           //拉取产品数据
            this.model.fetch();
        },
        //调用初始化接口
        getPlaceOrder:function(model){
            getPlaceOrder.events.trigger('GetPlaceOrder:fetch', {
                //保存成功重置相关数据
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
        },
        //还原运输地址列表选中状态
        reductionRecord:function(){
           var beforeSiblingsSelected  = this.$siblingsSelected,
               hasSelect = this.hasSelect;

            this.$currentTarget.removeClass(hasSelect);
            beforeSiblingsSelected.addClass(hasSelect);
        },
	});
	return selectShipAddressView;
});