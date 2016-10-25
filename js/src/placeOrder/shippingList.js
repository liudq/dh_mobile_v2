/**
 * module src: placeOrder/shippingList.js
 * 点击展示运输方式列表
**/
define('app/shippingList', ['common/config','lib/backbone','app/getPlaceOrder','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,getPlaceOrder,tip,dataErrorLog){
	var ShippingListModel = Backbone.Model.extend({
        //运输信息列表
        defaults: function() {
            return {
                //状态码
                code: -1,
                //dom事件对象
                evt: null
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
                    url: CONFIG.wwwURL + '/mobileApiWeb/order-Order-changeOrderShippingMethod.do',
                    //url: 'chageOrderShipping.json',
                    data: {
                        version: 3.3,
                        client: 'wap',
                        cartItemId: this.get('cartItemIds'),
                        shipType: this.get('shipType')
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

	//view-运输信息列表
	var ShippingListView =Backbone.View.extend({
		//根节点
        el: '.mainBox',
        //backbone提供的事件集合
        events: {
            'click .j-shipping-cost a': 'openLayer',
            'click .j-ship-closed': 'closeLayer',
            'click .j-shadow': 'closeLayer',
            'click .j-shipList li': 'chooseShipList'
        },
        //初始化入口
        initialize: function(options){
        	 //配置对象初始化
            this.setOptions(options);
            this.placeOrder = this.options.placeOrder;
            this.cHtml = this.options.cHtml;
            this.cJShadow = this.options.cJShadow;
            this.cJLayer = this.options.cJLayer;
            this.cOpenLayer = this.options.cOpenLayer;
            this.cClosedLayer = this.options.cClosedLayer;
            this.cJShipList = this.options.cJShipList;
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
        		//html样式
                cHtml: 'htmlOverflow',
                //灰色透明层
                cJShadow:".j-shadow",
                //弹层外层包裹容器
                cJLayer:'.j-layer',
                //显示浮层外层包裹容器
                cOpenLayer:'open-layer',
                //关闭浮层外层包裹容器
                cClosedLayer:'closed-Layer',
                //选列运输列表外层包裹容器
                cJShipList:'.j-shipList',
                //数据模型
                model: new ShippingListModel(),
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

                //请求数据成功调用初始化接口局部刷新页面
                this.getPlaceOrder(this.placeOrder.model);
            }else {
                //还原运输方式列表选中状态
                this.reductionRecord();
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
            //还原运输方式列表选中状态
            this.reductionRecord();
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
            this.$window = this.$window||$(window);
        	this.$html = this.$html||$('html');
            this.$body = this.$body||$('body');
        	this.$cJShadow = $(this.cJShadow);
        	this.$cJLayer = $(this.cJLayer);
        	this.$cOpenLayer = $(this.cOpenLayer);
        	this.$cClosedLayer = $(this.cClosedLayer);
        	this.$cJShipList = $(this.cJShipList);
        },
        //事件初始化
        initEvent: function() {
             //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);

        	//监听cartItemId
            this.listenTo(this.model, 'change:cartItemIds', this.resetAjaxOptions);
            //监听shipType
            this.listenTo(this.model, 'change:shipType', this.resetAjaxOptions);

            //在placeOrder上绑定关闭弹层事件
            this.placeOrder.on('closeLayer', this.closeLayer, this);
        },
        //重置ajax()配置对象
        resetAjaxOptions: function(){
            this.model.initialize({
                ajaxOptions: {
                    data: {
                        cartItemId: this.model.get('cartItemIds'),
                        shipType: this.model.get("shipType")
                    }
                }
            });
        },
        //获取orderId
        getOrder:function(e){
        	return JSON.parse(decodeURIComponent($(e.currentTarget).attr("data-info")))['orderId'];
        },
        //获取itemId
        getCartItemId: function(e){
            return JSON.parse(decodeURIComponent($(e.currentTarget).attr("data-info")))['cartItemId'];
        },
        //获取shippingTypeId
        getShipType: function(e){
        	return JSON.parse(decodeURIComponent($(e.currentTarget).attr("data-info")))['shippingTypeId'];
        },
        //运输信息列表浮层
        openLayer: function(e){
            var $target = $(e.currentTarget),
                $parent = $target.parent('.j-shipping-cost'),
                shippingInfo = JSON.parse(decodeURIComponent($($('.j-shipping-address h3')).attr("data-info")))['shippingInfo'],
                $cJerror = $parent.next('.j-errorInfo');
            if(Object.keys(shippingInfo) != 0){
                //运输列表数据绘制
                this.placeOrder.trigger('placeOrderView:render:shippingListLayer', this.getCartItemId(e));
                //展示弹层
                this.showLayer(e);
            }else{
                $cJerror.show();
            }

        },
        //判断是否是运输列表弹层蒙板
        isShippingList: function(){
            return !!$('.j-ship-closed').length;
        },
        //点击选择运输方式打开出层获取运输方式距离顶部的距离
        getScrollTop:function(options){
            var y,
                $ele = options.$ele,
                type = options.type,
                wScrollTop = parseInt(this.$window.scrollTop());

            if (type === 'open') {
                y = -wScrollTop;
                this.__wScrollTop = wScrollTop;
            } else {
                y = this.__wScrollTop;
            }

            return y;
        },
        //显示浮层
        showLayer:function(e){
        	var $html = this.$html,
                $body = this.$body,
                $target = this.openshiplistBtn = $(e.currentTarget),
                $cJShadow = this.$cJShadow,
        		$cJLayer = this.$cJLayer,
        		cHtml = this.cHtml,
        		cOpenLayer = this.cOpenLayer,
        		cClosedLayer = this.cClosedLayer,
                scrollTop = this.getScrollTop({
                    type: 'open',
                    $ele: $target
                });

        	//设置html/body样式
            $html.css({"position":"fixed","overflow":"hidden"});
            $body.css({"position":"fixed", "top":scrollTop,"width":"100%"});

            //控制遮罩层和弹出层样式
            $cJShadow.show();
        	$cJLayer.removeClass(cClosedLayer);
        	$cJLayer.addClass(cOpenLayer);
        },
        //关闭浮层
        closeLayer:function(){
        	var $html = this.$html,
                $body = this.$body,
                $cJShadow = this.$cJShadow,
                $cJLayer = this.$cJLayer,
        		cOpenLayer = this.cOpenLayer,
        		cClosedLayer = this.cClosedLayer,
                offset = parseInt($("body").css("top"));

            //判断是否是运输列表弹层蒙板
            if (!this.isShippingList()) {
                return;
            }

            //设置html/body样式
            $html.attr({"style":''});
            $body.attr({"style":''});
            window.scroll(0, this.getScrollTop({
                type: 'close',
                $ele: this.openshiplistBtn
            }));

            //控制遮罩层和弹出层样式
        	$cJShadow.hide();
        	$cJLayer.removeClass(cOpenLayer);
        	$cJLayer.addClass(cClosedLayer);
        },
        //选择运输方式
        chooseShipList:function(e){
            var $currentTarget = $(e.currentTarget),
                $siblings = $currentTarget.siblings(),
                //记录在coupon列表选择改变之前的$dom
                $siblingsSelected = this.$siblingsSelected = $currentTarget.siblings('[class*="active"]'),
                stateActive = $currentTarget.hasClass('active');

            $currentTarget.addClass('active');
            $siblings.removeClass('active');

            //获取CartItemId
            this.model.set({evt: e, cartItemIds: this.getCartItemId(e)});

            //获取shippingTypeId
            this.model.set({evt: e, shipType: this.getShipType(e)});

            //判断运输方式是否是当前选中状态,当前选中状态点击的时候不发送请求
            if(!stateActive){
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                //拉取产品数据
                this.model.fetch();
            }else{
                //关闭弹层
                this.closeLayer();
            }
        },
        //还原运输列表选中状态
        reductionRecord:function(){
            var beforeSiblingsSelected  = this.$siblingsSelected;
            if(beforeSiblingsSelected.length != 0){
                beforeSiblingsSelected.addClass('active').siblings().removeClass('active');
            }else{
                $(this.$siblingsSelected.context).removeClass('active'); 
            }
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
                    //更新商品金额渲染
                    this.placeOrder.trigger('placeOrderView:render:renderProductInfoAmount', res);
                    //重新初始化$dom对象自定义事件
                    this.placeOrder.trigger('placeOrderView:render:initElement');
                    //运输方式渲染
                    this.placeOrder.trigger('placeOrderView:render:renderShipping', res);
                    //更新备注
                    this.placeOrder.trigger('placeOrderView:render:renderRemark', res);
                    //当前coupon信息绘制
                    this.placeOrder.trigger('placeOrderView:render:renderCoupon',res);
                    //关闭运输方式弹窗
                    this.closeLayer();
                }, this)
            });
        }
	});
	return ShippingListView;
});