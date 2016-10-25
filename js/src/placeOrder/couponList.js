/**
 * module src: placeOrder/couponList.js
 * 点击展示coupon列表
 *
**/
define('app/couponList', ['common/config','lib/backbone','appTpl/placeOrderTpl','app/getCouponInfo','app/addCouponInfo','app/unbindCoupon','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,tpl,getCouponInfo,addCouponInfo,unbindCoupon,tip,dataErrorLog){
	var couponListModel = Backbone.Model.extend({
        //coupon列表
        defaults: function() {
            return {
                //状态码
                code: -1,
                //dom事件对象
                evt: null,
                list:[{
                    //coupon优惠券金额
                    amount:'',
                    //coupon活动名称
                    campaignname:'',
                    //coupon是否可用
                    canUse:true,
                    //couponBuyerId
                    couponBuyerId:'',
                    //couponcode
                    couponcode:'',
                    //campaignid
                    campaignid:'',
                    //coupon选中标记
                    selected:true

                }],
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
                    url: CONFIG.wwwURL + '/mobileApiWeb/order-Order-getOrderAvaliableCouponList.do',
                    //url: 'couponList.json',
                    data: {
                        version: 3.3,
                        client: 'wap',
                        orderId:this.get('orderIds')
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
                obj.list =[];
            obj.code = res.state==='0x0000'?200:-1;
            if (obj.code !== -1) {
                //coupon列表信息
                $.each(res.data,function(index,pro){
                   var __obj ={};
                    __obj.amount = pro.amount;
                    __obj.campaignname = pro.campaignname;
                    __obj.canUse = pro.canUse;
                    __obj.couponBuyerId = pro.couponBuyerId;
                    __obj.couponcode = pro.couponcode;
                    __obj.campaignid = pro.campaignid;
                    __obj.selected = pro.selected;
                    obj.list.push(__obj);
                })
            }
            return obj;
        }
    });

	//view-运输信息列表
	var couponListView =Backbone.View.extend({
		//根节点
        el: '.mainBox',
        //backbone提供的事件集合
        events: {
            'click .j-coupon a': 'openLayer',
            'click .j-coupon-closed': 'closeLayer',
            'click .j-shadow': 'closeLayer',
            'click .j-couponList li.couponLi': 'chooseCouponList',
            'click .j-ship-closed' :'closedShipAjax',
            'click .j-addBtn':'addCoupon',
            'click .j-bindCoupon':'unbindCoupon'
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
            this.cJCouponClosed = this.options.cJCouponClosed;
            this.cJChooseCouponListWarp = this.options.cJChooseCouponListWarp;
            this.cJShipList = this.options.cJShipList;
            this.cJCouponWarp = this.options.cJCouponWarp;
            this.cJCouponList = this.options.cJCouponList;
            this.cJCouponInput = this.options.cJCouponInput;
            this.cJErrorInfo = this.options.cJErrorInfo;
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
                //关闭coupon弹层列表按钮
                cJCouponClosed:'.j-coupon-closed',
                //coupon弹层列表外层包裹容器
                cJChooseCouponListWarp:'.j-choose-couponListWarp',
                //选列运输列表外层包裹容器
                cJShipList:'.j-shipList',
                //coupon外层容器包裹容器
                cJCouponWarp:'.j-coupon-warp',
                //coupon列表外层包裹容器
                cJCouponList:'.j-couponList',
                //添加coupon文本包裹容器
                cJCouponInput:'.j-coupon-input',
                //错误提示信息
                cJErrorInfo:'.j-errorInfo',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new couponListModel(),
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
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                
                //显示浮层样式
                this.showLayer();
                
                //初始化渲染页面
                this.render(model.attributes);
            }else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);

                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});

                //关闭coupon弹层
                this.placeOrder.trigger('closeLayer');
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

            //关闭coupon弹层
            this.placeOrder.trigger('closeLayer');
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
        //coupon渲染
        render:function(data){
            var template = this.template,
                //模板
                tpl = this.tpl,
                //coupon列表容器模板
                couponList =  template(this.tpl.couponList.join(''))(data);

            //页面绘制
            this.$cJChooseCouponListWarp.html(couponList);
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
            this.$cJCouponClosed = $(this.cJCouponClosed);
            this.$cJChooseCouponListWarp = $(this.cJChooseCouponListWarp);
        	this.$cJShipList = $(this.cJShipList);
            this.$cJCouponWarp = $(this.cJCouponWarp);
            this.$cJCouponList = $(this.cJCouponList);
            this.$cJCouponInput = $(this.cJCouponInput);
            this.$cJErrorInfo = $(this.cJErrorInfo);
        },
        //事件初始化
        initEvent: function() {
        	//监听orderId
            this.listenTo(this.model, 'change:orderIds', this.resetAjaxOptions);
            //监听campaignid
            this.listenTo(this.model, 'change:campaignid', this.resetAjaxOptions);
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);

            this.placeOrder.on('closeLayer', this.closeLayer, this);
        },
        //重置ajax()配置对象
        resetAjaxOptions: function(){
            this.model.initialize({
                ajaxOptions: {
                    data: {
                        orderId:this.model.get('orderIds')
                    }
                }
            });
        },
        //获取orderId
        getOrder:function(e){
            var $target = $(e.currentTarget),
                $li = $(e.currentTarget).siblings().find('li.couponLi.active');
           return $target.attr('type')==='del'?JSON.parse(decodeURIComponent($li.attr("data-info")))['orderId']:JSON.parse(decodeURIComponent($target.attr("data-info")))['orderId'];
        },
        //获取couponcode、couponBuyerId、orderId
        getCoupon:function(e){
            var $target = $(e.target),
                $li = $target.parent().siblings(this.cJCouponList).find('li');
            return $target.attr('type')==='button'?JSON.parse(decodeURIComponent($li.attr("data-info"))):JSON.parse(decodeURIComponent($target.attr("data-info")));
        },
        //判断是否是coupon弹层蒙板
        isCoupon: function(){
            return !!$('.j-coupon-closed').length;
        },
        //点击select a coupon按钮打开出层获取select a coupon距离顶部的距离
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
        //打开浮层
        openLayer: function(e){
            //打开coupon列表的按钮$dom
            this.openCouponListBtn = $(e.currentTarget)
            
            //显示loading
            tip.events.trigger('popupTip:loading', true);

            //获取orderId
            this.model.set({evt: e, orderIds: this.getOrder(e)});

            //拉取产品数据
            this.model.fetch();
        },
        //显示浮层
        showLayer:function(){
        	var $html = this.$html,
                $body = this.$body,
                $target = this.openCouponListBtn,
        		$cJLayer = this.$cJLayer,
                $cJShadow = this.$cJShadow,
        		cHtml = this.cHtml,
        		cOpenLayer = this.cOpenLayer,
        		cClosedLayer = this.cClosedLayer,
                scrollTop = this.getScrollTop({
                    type: 'open',
                    $ele: $target
                });

        	//设置html/body样式
        	$html.css({"position":"fixed", "overflow":"hidden"});
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
                $cJLayer = this.$cJLayer,
                $cJShadow = this.$cJShadow,
        		cOpenLayer = this.cOpenLayer,
        		cClosedLayer = this.cClosedLayer;

            //判断是否是coupon弹层蒙板
            if (!this.isCoupon()){
                return;
            }

        	//设置html/body样式
            $html.attr({"style":''});
            $body.attr({"style":''});
            window.scroll(0, this.getScrollTop({
                type: 'close',
                $ele: this.openCouponListBtn
            }));

            //控制遮罩层和弹出层样式
            $cJShadow.hide();
        	$cJLayer.removeClass(cOpenLayer);
        	$cJLayer.addClass(cClosedLayer);

            this.placeOrder.trigger('placeOrderView:render:renderCoupon');
        },
        //选择coupon列表
        chooseCouponList:function(e){
        	var $currentTarget = $(e.currentTarget),
                $siblings = $currentTarget.siblings(),
                //记录在coupon列表选择改变之前的$dom
                $siblingsSelected = this.$siblingsSelected = $currentTarget.siblings('[class*="active"]'),
                stateActive = $currentTarget.hasClass('active'),
                chooseCouponcampaignid = JSON.parse(decodeURIComponent($currentTarget.attr("data-info")))['campaignid'];

        	$currentTarget.addClass('active');
            $siblings.removeClass('active');

            //判断coupon是否是当前选中状态,当前选中状态点击的时候不发送请求
            if(!stateActive){
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                //选择绑定coupon传参
                this.bindCoupon(e);
            }else{
                //关闭弹层
                this.closeLayer();
            }
        },
        //选择绑定coupon传参
        bindCoupon:function(e){
            //记录在coupon列表选择改变之前的$dom
            getCouponInfo.beforeCouponLiSelected = this.$siblingsSelected
            getCouponInfo.init({
                placeOrder: this.placeOrder,
                params: this.getCoupon(e)
            });
        },
        //添加Coupon
        addCoupon:function(e){
            var $target = $(e.target),
                $cJCouponInput=$(this.cJCouponInput),
                $cJErrorInfo =$(e.currentTarget).parent().next(this.cJErrorInfo),
                addVal = $.trim($cJCouponInput.val());

            if(addVal==""){
                $cJErrorInfo.html('Please enter a coupon code').show();
                setTimeout(function(){
                    $cJErrorInfo.hide();
                },2000)
                return;
            }

            //显示loadding弹层
            tip.events.trigger('popupTip:loading', true);

            //添加coupon发送请求
            this.addCouponResponse(e);

        },
        //添加coupon发送请求
        addCouponResponse:function(e){
            addCouponInfo.init({
                placeOrder: this.placeOrder,
                orderId: this.getOrder(e)
            });
        },
        //订单解绑coupon
        unbindCoupon:function(e){
            //显示loadding弹层
            tip.events.trigger('popupTip:loading', true);

            unbindCoupon.init({
                placeOrder: this.placeOrder,
                orderId: this.getOrder(e)
            });
        }
	});
	return couponListView;
});