/**
 * module src: placeOrder/placeOrder.js
 * placeOrder展示初始化信息模块
**/
define('app/placeOrder', ['common/config', 'lib/backbone', 'appTpl/placeOrderTpl', 'tools/fastclick','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG, Backbone, tpl, FastClick,tip,dataErrorLog){
    //model-placeOrder
    var placeOrderModel = Backbone.Model.extend({
        //placeOrder模块
        defaults: function() {
            return {
                //状态码
                code: -1,
                //是否是游客
                isVisitor:true,
                //用户ID
                userId:'',
                orderSummary:{
                    //itemsSubtotal总价
                    itemsSubtotal:'',
                    //运费总价
                    shippingCost:'',
                    //总价
                    totalPrice:'',
                    //coupon金额
                    couponAmount:'',
                    //运费节省
                    shipCostSave:'',
                    //满减
                    orderSave:''
                },
                //运输地址
                shippingInfo:{
                    //运输地址id
                    shippingInfoId:"",
                    //名
                    firstname:"",
                    //姓
                    lastname:"",
                    //邮政编码
                    zipCode:"",
                    //国家名
                    country:"",
                    //国家id
                    countryid:"",
                    //州
                    state:"",
                    //电话号码
                    telephone:"",
                    //地址1
                    addressline1:"",
                    //地址2
                    addressline2:"",
                    //城市
                    city:"",
                    //税号
                    vatnum:""
                },
                //商品信息
                orders:[
                    {
                        //订单orderId
                        orderId:'',
                        orderItemDTOList:[
                            {
                               cartItemDTO:{
                                    //商品图片URL
                                    imgURL:'',
                                    //商品图片链接
                                    itemUrl:'',
                                    //商品名称
                                    prodName:'',
                                    //购物车列表项id
                                    cartItemId:'',
                                    //选择商品sku属性值
                                    skuInfo:'',
                                    //商品价格
                                    price: 0,
                                    //单位
                                    unit:'',
                                    //商品数量值
                                    quantity:'',
                                    //商品是否可卖
                                    sellStatus:true,
                                    //是否有库存
                                    inventoryStatus:true,
                                    //是否可运达
                                    canDelivery:true,
                                    //商品最大可售起动量
                                    maxQuantity: 0,
                                    //商品最低可售量
                                    minQuantity: 0,
                                    //国家
                                    currency:'',
                                    //运输天数
                                    leadingTime:'',
                                    //评论内容
                                    remark:''
                                },
                                shippingMethodList:[{
                                    //carriersName
                                    carriersName:'',
                                    //运输id
                                    shippingTypeId:'',
                                    //运费价格
                                    freightAmountRealFinal:'',
                                    //运输当前所在ID
                                    selected:'',
                                    //运输区间天数
                                    freightCycle:''
                                }]
                            }
                        ],
                        couponDTO:{
                            //主键id
                            campaignid:'',
                            //coupon金额
                            amount:''
                        },
                        supplier:{
                            //卖家名称
                            supplierName:''
                        }
                    }
                ],
                //临时记录产品备注
                __remarks: {}
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
                    url:CONFIG.wwwURL + '/mobileApiWeb/order-Order-getPlaceOrderInfo.do',
                    //url: 'placeOrder.json',
                    data: {
                        version: 3.3,
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
            var obj = {},
                self = this;

            obj.code = res.state==='0x0000'?200:-1;
            obj.orderSummary = {};
            obj.shippingInfo = {};
            obj.orders =[];
            if (obj.code !== -1) {
                //初始化商品信息
                $.each(res.data.orders, function(index,orders){
                    var __obj ={};
                    __obj.couponDTO ={};
                    __obj.orderItemDTOList =[];
                    $.each(orders.orderItemDTOList, function(index,pro){
                        var __obj1 ={};
                        //商品信息
                        self.orderItemDTOList(__obj1,pro);
                        __obj.orderItemDTOList.push(__obj1);
                        //运输方式列表
                        self.shippingMethodList(__obj1,pro);    
                    });
                    //coupon、order、和卖家名称
                    self.couponInfo(orders,__obj);
                    obj.orders.push(__obj);
                });
                //初始化接口金额信息
                var  data = res.data;
                obj.orderSummary.itemsSubtotal = data.orderSummary.itemsSubtotal;
                obj.orderSummary.shippingCost = data.orderSummary.shippingCost;
                obj.orderSummary.totalPrice = data.orderSummary.totalPrice;
                obj.orderSummary.couponAmount = data.orderSummary.couponAmount;
                obj.orderSummary.orderSave = data.orderSummary.orderSave;
                obj.orderSummary.shipCostSave = data.orderSummary.shipCostSave;
                //初始化接口运输地址信息
                if(typeof(data.shippingInfo) !== "undefined"){
                    obj.shippingInfo.shippingInfoId = data.shippingInfo.shippingInfoId;
                    obj.shippingInfo.firstname = data.shippingInfo.firstname;
                    obj.shippingInfo.lastname = data.shippingInfo.lastname;
                    obj.shippingInfo.zipCode = data.shippingInfo.postalcode;
                    obj.shippingInfo.countryname = data.shippingInfo.countryname;
                    obj.shippingInfo.countryid = data.shippingInfo.country;
                    obj.shippingInfo.state = data.shippingInfo.state;
                    obj.shippingInfo.tel = data.shippingInfo.tel;
                    obj.shippingInfo.addressline1 = data.shippingInfo.addressline1;
                    obj.shippingInfo.addressline2 = data.shippingInfo.addressline2||'';
                    obj.shippingInfo.city = data.shippingInfo.city;
                    obj.shippingInfo.vatnum = data.shippingInfo.vatNumber||'';
                }
                obj.isVisitor = data.isVisitor;
                obj.userId = data.userId;
            }
            return obj;
        },
        //商品信息
        orderItemDTOList:function(__obj1,pro){
            __obj1.cartItemDTO ={};
            __obj1.cartItemDTO.imgURL = pro.cartItemDTO.imgURL;
            __obj1.cartItemDTO.itemUrl = pro.cartItemDTO.itemUrl;
            __obj1.cartItemDTO.prodName = pro.cartItemDTO.prodName;
            __obj1.cartItemDTO.cartItemId = pro.cartItemDTO.cartItemId;
            __obj1.cartItemDTO.skuInfo = pro.cartItemDTO.skuInfo;
            __obj1.cartItemDTO.price = pro.cartItemDTO.price;
            __obj1.cartItemDTO.unit = pro.cartItemDTO.unit;
            __obj1.cartItemDTO.quantity = pro.cartItemDTO.quantity;
            __obj1.cartItemDTO.maxQuantity = pro.cartItemDTO.maxQuantity;
            __obj1.cartItemDTO.minQuantity = pro.cartItemDTO.minQuantity;
            __obj1.cartItemDTO.currency = pro.cartItemDTO.currency;
            __obj1.cartItemDTO.leadingTime = pro.cartItemDTO.leadingTime;
            __obj1.cartItemDTO.inventoryStatus = pro.cartItemDTO.inventoryStatus;
            __obj1.cartItemDTO.sellStatus = pro.cartItemDTO.sellStatus;
            __obj1.cartItemDTO.canDelivery = pro.cartItemDTO.canDelivery;
            __obj1.cartItemDTO.remark = pro.cartItemDTO.remark === undefined ? "":pro.cartItemDTO.remark;

            return;
        },
        //运输方式列表
        shippingMethodList:function(__obj1,pro){
            __obj1.shippingMethodList =[];
            $.each(pro.shippingMethodList, function(index,_pro){
               var __obj2 ={};
               if(pro.shippingMethodList !==""){
                    __obj2.shippingTypeId = _pro.shippingTypeId;
                    __obj2.freightAmountRealFinal = _pro.freightAmountRealFinal;
                    __obj2.selected = _pro.selected;
                    __obj2.freightCycle = _pro.freightCycle;
               }else{
                    __obj2.shippingTypeId = '';
                    __obj2.freightAmountRealFinal = '';
                    __obj2.selected ='';
                    __obj2.freightCycle = '';
               }
                __obj1.shippingMethodList.push(__obj2);
            });
            return;
        },
        //coupon、order、和卖家名称
        couponInfo:function(orders,__obj){
            __obj.orderId = orders.orderId;
            __obj.supplier = orders.supplier;
            if(orders.couponDTO !==undefined){
                //初始化coupon信息
                __obj.couponDTO.campaignid = orders.couponDTO.campaignid;
                __obj.couponDTO.amount = orders.couponDTO.amount;
            }
            return;
        },
        //对外提供向产品信息中添加备注信息
        addRemark: function(obj) {
            var result = [],
                self = this;
            $.each(obj, function(index,orders){
                var __obj ={};
                __obj.couponDTO ={};
                __obj.orderItemDTOList =[];
                $.each(orders.orderItemDTOList, function(index,pro){
                    var __obj1 ={};
                    //商品信息
                    self.orderItemDTOList(__obj1,pro);
                    
                    //从后端数据中读取备注信息
                    if (pro.cartItemDTO.remark) {
                        __obj1.cartItemDTO.remark = pro.cartItemDTO.remark;
                    //从临时数据中读取备注信息
                    } else if (self.get('__remarks')[__obj1.cartItemDTO.cartItemId]) {
                        __obj1.cartItemDTO.remark = self.get('__remarks')[__obj1.cartItemDTO.cartItemId];
                    //否则为空
                    } else {
                        __obj1.cartItemDTO.remark = '';
                    }

                    __obj.orderItemDTOList.push(__obj1);

                    //运输方式列表
                    self.shippingMethodList(__obj1,pro);
                });
                //coupon、order、和卖家名称
                self.couponInfo(orders,__obj);
                result.push(__obj);

            });
            return result;
        },
        //获取指定订单下的cartItemId的运费列表
        getShippingList: function(cartItemId, orders){
            var obj = [];
            $.each(orders, function(index, order){
                var __obj = {};
                __obj.orderItemDTOList = [];
                    //匹配对应订单下的cartItemId
                    $.each(order.orderItemDTOList, function(index, shopInfo){
                        if (cartItemId === shopInfo.cartItemDTO.cartItemId) {
                            var __obj1 = {};
                            __obj1.cartItemDTO = {};
                            __obj1.cartItemDTO.cartItemId = shopInfo.cartItemDTO.cartItemId;
                            __obj1.shippingMethodList = [];
                            $.each(shopInfo.shippingMethodList, function(index, shipping){
                                var __obj2 = {};
                                __obj2.shippingTypeId = shipping.shippingTypeId;
                                __obj2.freightAmountRealFinal =shipping.freightAmountRealFinal;
                                __obj2.freightCycle =shipping.freightCycle;
                                __obj2.selected =shipping.selected;
                                __obj2.carriersName =shipping.carriersName;
                                __obj1.shippingMethodList.push(__obj2);
                            });
                            __obj.orderItemDTOList.push(__obj1);
                        }
                    });
                //过滤__obj={}内容为空的情况
                if (__obj.orderItemDTOList.length > 0) {
                    obj.push(__obj);
                }
            });
            return obj;
        }
    });

    //view-placeOrder初始化模块信息
    var placeOrderView = Backbone.View.extend({
        //查看购物车外层包裹容器
        el: 'body',
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cJHeader = this.options.cJHeader;
            this.cJProcessBarWarp = this.options.cJProcessBarWarp;
            this.cJPlaceorderPrice = this.options.cJPlaceorderPrice;
            this.cJShippingAddress = this.options.cJShippingAddress;
            this.cShippingCostWarp =  this.options.cShippingCostWarp;
            this.cJOdCon = this.options.cJOdCon;
            this.cJOrderDetails = this.options.cJOrderDetails;
            this.cJCouponWarp = this.options.cJCouponWarp;
            this.cJRemark = this.options.cJRemark;
            this.cJChooseShipListWarp = this.options.cJChooseShipListWarp;
            this.cJPlaceorderWrap = this.options.cJPlaceorderWrap;
            this.cJPlaceOrderSubmit = this.options.cJPlaceOrderSubmit;
            this.cOnSubmit = this.options.cOnSubmit;
            this.cSubmit = this.options.cSubmit;
            this.cJSubmit = this.options.cJSubmit;
            this.template = this.options.template;
            this.userInfo = this.options.userInfo;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.FastClick = this.options.FastClick;
            this.lazyloadCallback = this.options.lazyloadCallback;
            this.renderCallback = this.options.renderCallback;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取产品数据
            this.model.fetch();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cJHeader = $(this.cJHeader);
            this.$cJProcessBarWarp = $(this.cJProcessBarWarp);
            this.$cJPlaceorderPrice = $(this.cJPlaceorderPrice);
            this.$cJShippingAddress = $(this.cJShippingAddress);
            this.$cShippingCostWarp = $(this.cShippingCostWarp);
            this.$cJOdCon = $(this.cJOdCon);
            this.$cJOrderDetails = $(this.cJOrderDetails);
            this.$cJCouponWarp = $(this.cJCouponWarp);
            this.$cJRemark = $(this.cJRemark);
            this.$cJChooseShipListWarp = $(this.cJChooseShipListWarp);
            this.$cJPlaceorderWrap = $(this.cJPlaceorderWrap);
            this.$cJPlaceOrderSubmit = $(this.cJPlaceOrderSubmit);
            this.$cOnSubmit = $(this.cOnSubmit);
            this.$cSubmit = $(this.cSubmit);
            this.$cJSubmit = $(this.cJSubmit);
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);

            //更新orderSummary字段
            this.listenTo(this.model, 'change:orderSummary', this.amount);

            //更新shippingInfo字段
            this.listenTo(this.model, 'change:shippingInfo', this.renderShipAddress);

            //更新商品金额渲染
            this.on('placeOrderView:render:renderProductInfoAmount', this.renderProductInfoAmount, this);

            //更新商品信息
            this.on('placeOrderView:render:renderProductInfo', this.renderProductInfo, this);

            //更新评论渲染
            this.on('placeOrderView:render:renderRemark', this.renderRemark, this);
            //当前选中coupon渲染
            this.on('placeOrderView:render:renderCoupon', this.renderCoupon, this);

            //运输方式渲染
            this.on('placeOrderView:render:renderShipping', this.renderShipping, this);

            //运输列表信息渲染
            this.on('placeOrderView:render:shippingListLayer', this.renderShippingListLayer, this);

            //重新初始化$dom对象自定义事件
            this.on('placeOrderView:render:initElement', this.initElement, this);

            //解决click事件的300毫秒延时
            //阻止大多数设备上的点透问题
            this.FastClick.attach(this.$el[0]);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //头部外层容器
                cJHeader:'.j-header',
                //支付流程图外层包裹容器
                cJProcessBarWarp:'.j-processBar-warp',
                //产品信息外层容器
                cJPlaceorderWrap:'.j-placeorder-wrap',
                //商品信息中价格外层产品数量包裹容器
                cJOdCon:'.j-od-con',
                //商品外层包裹容器
                cJOrderDetails:'.j-order-details',
                //金额外层容器
                cJPlaceorderPrice:'.j-placeorder-price',
                //运输地址外层容器
                cJShippingAddress:'.j-shipping-address',
                //运费外层容器
                cShippingCostWarp: '.j-shipping-cost-warp',
                //coupon外层容器
                cJCouponWarp:'.j-coupon-warp',
                //评论外层包裹容器
                cJRemark:'.j-remark',
                //浮层运输列表内容包裹容器
                cJChooseShipListWarp:'.j-choose-shipListWarp',
                //placeOrder按钮外层容器
                cJPlaceOrderSubmit:'.j-placeOrder-submit',
                //placeOrder按钮置灰
                cOnSubmit:'.onsubmit',
                //placeOrder按钮可点击状态
                cSubmit:'submit',
                //placeOrder按钮点击事件样式
                cJSubmit:'j-submit',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new placeOrderModel(),
                //阻止点透的函数
                FastClick: FastClick,
                //图片懒加载接口
                lazyloadCallback: $.noop,
                //页面绘制完成后的回调
                renderCallback: $.noop,
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
                var orders = response.data.orders;
                if(orders.length == 0){
                    tip.events.trigger('popupTip:dataErrorTip', {action:'gohome',message:'Error data.'});
                }
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //初始化渲染页面
                this.render(model.attributes);
            }else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，跳转到首页】
                tip.events.trigger('popupTip:dataErrorTip', {action:'gohome',message:response.message});
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
            //展示数据接口错误信息【点击ok，刷新页面】
            tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Network anomaly.'});
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
        //判断是否为数据模型实例
        isModelInstance: function(obj) {
            return _.has(obj,'attributes');
        },
        //根据data的类型获取正确的模型数据
        getData: function(obj) {
            return this.isModelInstance(obj)?obj.attributes:obj;
        },
        //页面整体渲染
        render: function(data) {
            //数据可用则绘制页面
            if (data.code !== -1) {
                //初始化头部
                this.header();
                //初始化支付流程页面进度提示
                this.payProcess();
                //初始化金额
                this.amount(data);
                //初始化运输地址列表信息
                this.renderShipAddress(data);
                //初始化商品信息
                this.renderProductInfo(data);
                //初始化placeOrder按钮
                this.placeOrderBtn();

                //重新初始化$dom对象
                this.initElement();

                //判断商品是否可运达、库存不足、是否可售
                this.canDelivery();

                //绘制运输方式模板
                this.renderShipping(data);

                //绘制coupon模板
                this.renderCoupon();

                //绘制评论
                this.renderRemark(data);
                
                //绘制完成后需要进行的其他初始化操作
                this.renderCallback();
            }
        },
        //初始化头部
        header :function(){
            var template = this.template,
                //模板
                tpl = this.tpl,
                //头部包裹容器模板
                header =  template(this.tpl.header.join(''));

            //页面绘制
            this.$cJHeader.html(header);
        },
        //初始化支付流程页面进度提示
       payProcess :function(){
            var template = this.template,
                //模板
                tpl = this.tpl,
                //头部包裹容器模板
                payProcess =  template(this.tpl.payProcess.join(''));

            //页面绘制
            this.$cJProcessBarWarp.html(payProcess);
        },
        //初始化金额渲染
        amount: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //金额模板
                amount = template(this.tpl.amount.join(''))(this.getData(data));

            //如果data为数据模型实例，则直接绘制页面
            if (this.isModelInstance(data)) {
                this.$cJPlaceorderPrice[0]&&this.$cJPlaceorderPrice.html(amount);

            //否则返回模板渲染数据
            } else {
                return amount;
            }
        },
        // 运输地址列表信息渲染
        renderShipAddress: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //运输地址模板
                shippingAddress =  template(this.tpl.shippingAddress.join(''))(this.getData(data));

            //如果data为数据模型实例，则直接绘制页面
            if (this.isModelInstance(data)) {
                this.$cJShippingAddress[0]&&this.$cJShippingAddress.html(shippingAddress);

            //否则返回模板渲染数据
            } else {
                return shippingAddress;
            }
        },
        //初始化商品数据渲染
        renderProductInfo: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //产品信息外层包裹容器模板
                productInfoMain = template(tpl.productInfoMain.join(''))(data);

            //页面绘制
            this.$cJPlaceorderWrap.html(productInfoMain);

            //添加图片懒加载功能
            this.lazyloadCallback();
        },
        //商品信息金额渲染
         renderProductInfoAmount:function(data){
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //金额渲染
                productInfoAmount = template(this.tpl.productInfoAmount.join(''))(data).split('@');

            //页面绘制
            $.each(this.$cJOdCon, function(index, ele){
                $(ele).html(productInfoAmount[index]);
            });
         },
         //评论渲染
         renderRemark:function(data){
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //remark模板
                remark = template(tpl.remark.join(''))(data).split('@');

            $.each(this.$cJRemark, function(index, ele){
                $(ele).html(decodeURIComponent(remark[index]));
            });
         },
        //coupon渲染
        renderCoupon: function(){
            var email = this.userInfo.email;

            //判断用户是否是游客  不显示coupon信息
            if(email !=""){
                //coupon模板
                var coupon = this.template(this.tpl.coupon.join(''))(this.model.attributes).split('@');
                //页面绘制
                $.each(this.$cJCouponWarp, function(index, ele){
                    $(ele).html(coupon[index]);
                });  
            }
            
        },
        //运输方式渲染
        renderShipping: function(data){
            //每个seller的当前的运输方式
            var shippings = this.template(this.tpl.shipping.join(''))(data).split('@');
            //页面绘制
            $.each(this.$cShippingCostWarp, function(index, ele){
                $(ele).html(shippings[index]);
            });
        },
        //placeOrder下单按钮渲染
        placeOrderBtn:function(){
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //placeOrderBtn按钮
                placeOrderBtn =  template(this.tpl.placeOrderBtn.join(''));

            //页面绘制
            this.$cJPlaceOrderSubmit.html(placeOrderBtn);
        },
        //运费列表渲染
        renderShippingListLayer: function(cartItemId) {
                //运费列表数据
            var data = this.model.getShippingList(cartItemId,this.model.get('orders')),
                //模板引擎
                template = this.template,
                //模板
                tpl = this.tpl,
                //运费列表渲染
                shippingList = template(this.tpl.shippingList.join(''))(data);

            //页面绘制
            this.$cJChooseShipListWarp.html(shippingList);
        },
        //遍历shippingInfo对象转换成数组
        ShippingInfoArray:function(obj){
            var keys = this.keys = [];        
            for(var i in obj){
                keys.push(i);
            }
            return keys;
        },
        //判断商品是否可运达、库存不足、是否可售
        canDelivery:function(){
            var $cOnSubmit= this.$cOnSubmit,
                cSubmit = this.cSubmit,
                cJSubmit= this.cJSubmit,
                shippingInfo = JSON.parse(decodeURIComponent($($('.j-shipping-address h3')).attr("data-info")))['shippingInfo'],
                OrderDetailLen = this.$cJOrderDetails.length,
                len;

            //将shippingInfo信息转换成数组
            this.ShippingInfoArray(shippingInfo);

            len = this.keys.length;

            for(var i=0; i < OrderDetailLen;i++){
                var $ele =$(this.$cJOrderDetails[i]),
                    canDelivery = JSON.parse(decodeURIComponent($ele.attr("data-info")))['canDelivery'],
                    sellStatus = JSON.parse(decodeURIComponent($ele.attr("data-info")))['sellStatus'];

                if(canDelivery === true && sellStatus === true && len != 0){
                    $cOnSubmit.addClass(cSubmit).addClass(cJSubmit);
                    return false;
                }else{
                    $cOnSubmit.removeClass(cSubmit).removeClass(cJSubmit);
                }
            }
        }
    });

    return placeOrderView;
});