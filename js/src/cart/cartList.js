/**
 * module src: cart/cartList.js
 * 查看购物车模块
**/
define('app/cartList', ['common/config', 'lib/backbone', 'appTpl/cartListTpl', 'tools/fastclick','checkoutflow/popupTip','checkoutflow/dataErrorLog','app/formatTime'], function(CONFIG, Backbone, tpl,FastClick,tip,dataErrorLog,formatTime){
    //model-查看购物车
    var CartListModel = Backbone.Model.extend({
        //查看购物车列表
        defaults: function() {
            return {
                //状态码
                code: -1,
                //当前购物车中的cart item数量
                cartItemCount:1,
                //查看购物车列表
                cartItemGroups: [{
                    //当前卖家的所有购物车项的个数
                    cartItemCount:1,
                    cartItems:[{
                        //cartItemId
                        cartItemId:'',
                        //图片地址
                        imgURL: '',
                        //产品图片链接
                        proUrl:'',
                        //商品itemcode 
                        itemCode:'',
                        //产品名称
                        prodName: '',
                        //描述SKU的信息
                        skuInfo: '',
                        //商品是否可卖
                        sellStatus:true,
                        //购买数量
                        quantity:'',
                        //商品最大起动量
                        maxQuantity: 1,
                        //商品最低起售数量
                        minQuantity: 5,
                        //商品是否可送达该国家
                        canDelivery:true,
                        //产品价格
                        price: 0,
                        //产品价格单位
                        unit: '',
                        //购物车营销SKU营销优惠金额
                        cheapen: 0,
                        //购物车营销SKU活动结束日期
                        endDate: 0
                    }],
                    //卖家名称
                    supplierName: '',
                    //total:
                    total: 0

                }],
                //目地的国家
                shipToCountry:''
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
                    url: CONFIG.wwwURL + '/mobileApiWeb/cart-Cart-getCartList.do',
                    //url: '/mobile_v2/css/cart/html/cartList.do',
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
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            obj.cartItemGroups = [];
            if (obj.code !== -1 && res.data !="" && res.data.cartItemGroups != undefined) {
                $.each(res.data.cartItemGroups, function(index, pro){
                    var __obj = {};
                    __obj.cartItems = [];
                    $.each(pro.cartItems, function(_index, _pro){
                        var __obj1 = {};
                        __obj1.cartItemId = _pro.cartItemId;
                        __obj1.itemCode = _pro.itemCode;
                        __obj1.imgURL = _pro.imgURL;
                        __obj1.itemUrl = CONFIG.wwwURL.replace('https','http') + '/' + _pro.itemUrl;
                        __obj1.prodName = _pro.prodName;
                        __obj1.skuInfo = _pro.skuInfo;
                        __obj1.sellStatus = _pro.sellStatus;
                        __obj1.inventoryStatus = _pro.inventoryStatus;
                        __obj1.canDelivery = _pro.canDelivery;
                        __obj1.maxQuantity = _pro.maxQuantity;
                        __obj1.minQuantity = _pro.minQuantity;
                        __obj1.price = _pro.price;
                        __obj1.unit = _pro.unit;
                        __obj1.quantity = _pro.quantity;
                        __obj1.cheapen = _pro.cheapen?_pro.cheapen:'';
                        __obj1.endDate = _pro.endDate?formatTime.get(_pro.endDate):'';
                        __obj.cartItems.push(__obj1);                 
                    });
                    __obj.supplierName = pro.supplier.supplierName;
                    __obj.cartItemCount =pro.cartItemCount;
                    obj.cartItemGroups.push(__obj);
                });
                obj.shipToCountry = res.data.shipToCountry;

            }
           // console.dir(obj);
            /**
             * 最终将其格式化为：
             * {
             *     code: 200
             *     cartItemGroups: [{
             *       cartItems:[{
             *           //商品itemCode
             *           itemCode:'',   
             *           //图片地址
             *           imgURL: '',
             *           //产品图片链接
             *           proUrl:'',
             *           //产品名称
             *           prodName: '',
             *           //描述SKU的信息
             *           skuInfo: '',
             *           //商品是否可卖
             *           sellStatus: '',
             *           //商品最大起动量
             *           maxQuantity: '',
             *           //商品最低起售数量
             *           minQuantity: '',
             *           //商品是否可送达该国家
             *           canDelivery: '',
             *           //产品价格
             *           price: 0,
             *           //产品价格单位
             *           unit: ''
             *       }],
             *       //卖家名称
             *       supplierName: ''
             *       //目地的国家
             *       shipToCountry:''
             *    }],
             *  ...
             * }
            **/
            return obj;
        }
    });

    //view-查看购物车
    var CartListView = Backbone.View.extend({
        //查看购物车外层包裹容器
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-odChecked': 'checked'
        },  
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cJHeader = this.options.cJHeader;
            this.cJWrapOrder = this.options.cJWrapOrder;
            this.cJOrderDetails = this.options.cJOrderDetails;
            this.cJOdChecked = this.options.cJOdChecked;
            this.cJnum = this.options.cJnum;
            this.cJItemsTotal = this.options.cJItemsTotal;
            this.cJTotalPrice = this.options.cJTotalPrice;
            this.cJUnitPrice = this.options.cJUnitPrice;
            this.cJItemPrice = this.options.cJItemPrice;
            this.cJCheckOutWap = this.options.cJCheckOutWap;
            this.cChecked = this.options.cChecked;
            this.cNoClick = this.options.cNoClick;
            this.cJcheckOut = this.options.cJcheckOut;
            this.cJErrorInfo = this.options.cJErrorInfo;
            this.template = this.options.template;
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
            this.$cJWrapOrder = $(this.cJWrapOrder);
            this.$cJOrderDetails = $(this.cJOrderDetails);
            this.$cJOdChecked = $(this.cJOdChecked);
            this.$cJnum = $(this.cJnum);
            this.$cJItemsTotal = $(this.cJItemsTotal);
            this.$cJTotalPrice = $(this.cJTotalPrice);
            this.$cJUnitPrice = $(this.cJUnitPrice);
            this.$cJItemPrice = $(this.cJItemPrice);
            this.$cJCheckOutWap = $(this.cJCheckOutWap);
            this.$cJcheckOut = $(this.cJcheckOut);
            this.$cJErrorInfo = $(this.cJErrorInfo);

        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);

            //查看购物车列表
            this.on('CartListView:render:renderCartList', this.renderCartList, this);

            //重新初始化$dom对象自定义事件
            this.on('CartListView:render:initElement', this.initElement, this);

            //解决click事件的300毫秒延时
            //阻止大多数设备上的点透问题
            this.FastClick.attach(this.$el[0]);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //头部外层包裹容器
                cJHeader:'.j-header',
                //查看购物车外层包裹容器
                cJWrapOrder: '.j-wrap-order',
                //查看购物车列表单个产品外层包裹容器
                cJOrderDetails:'.j-orderDetails',
                //单选框样式
                cJOdChecked:'.j-odChecked',
                //增加购物车产品数量文本框的值
                cJnum:'.j-num',
                //当前购物车中的cart item数量
                cJItemsTotal:'.j-itemsTotal',
                //购物车中单个产品的价格
                cJItemPrice:".j-itemPrice",
                //购物车中选中的总价格
                cJTotalPrice:".j-totalPrice",
                //商品信息价格外层包裹容器
                cJUnitPrice:'.j-unit-price',
                //checkOut外层包裹容器
                cJCheckOutWap:'.j-check-out-wap',
                //checked选中样式
                cChecked:'checked',
                //checkOut按钮是否置灰
                cJcheckOut:".j-checkOut",
                //checkOut按钮置灰
                cNoClick:"noClick",
                //错误信息提示信息
                cJErrorInfo:'.j-errorInfo',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new CartListModel(),
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
        render:function(data){
            //数据可用则绘制页面
            if (data.code !== -1) {
                //头部渲染
                this.renderHeader();
                //cartList列表渲染
                this.renderCartList(data);
                //checkOut按钮渲染
                this.renderCheckOut();
               

                //初始化总价渲染
                $(this.cJTotalPrice).text(this.getTotalPrice());

                //重新初始化$dom对象
                this.initElement();
                
                //获取checked选中的个数
                this.getCheckNum();

                //获取价格
                this.getPrice();
                
                //绘制完成后需要进行的其他初始化操作
                this.renderCallback();
            }
            
        },
        //头部渲染
        renderHeader:function(){
            var template = this.template,
                //模板
                tpl = this.tpl,
                //运输地址列表渲染
                header =  template(this.tpl.header.join(''));
         
            //页面绘制
            this.$cJHeader.html(header);
        },
        //cart列表渲染
        renderCartList:function(data){
            var template = this.template,
                //模板
                tpl = this.tpl,
                //运输地址列表渲染
                cartList =  template(this.tpl.cartList.join(''))(data);

            //页面绘制
            this.$cJWrapOrder.html(cartList);
            //添加图片懒加载功能
            this.lazyloadCallback();
        },
        renderCheckOut:function(){
           var template = this.template,
                //模板
                tpl = this.tpl,
                //运输地址列表渲染
                checkOut =  template(this.tpl.checkOut.join(''));

            //页面绘制
            this.$cJCheckOutWap.html(checkOut);     
        },
        
        //获取选中的个数
        getCheckNum:function(){
            var i = 0,
                $cJWrapOrder = this.$cJWrapOrder,
                $cJItemsTotal = this.$cJItemsTotal,
                cJOdChecked = this.cJOdChecked,
                cChecked = this.cChecked,
                $checked = $cJWrapOrder.find(cJOdChecked);

            $checked.each(function(index,ele){
                if($(ele).hasClass(cChecked)){
                    i++;
                }
            });
            $cJItemsTotal.text(i);
            return i;
        },
        //获取选中的总价格
        getTotalPrice:function(){
            var total=0,
                cJOrderDetails =this.cJOrderDetails,
                cJOdChecked = this.cJOdChecked,
                cChecked = this.cChecked,
                cJnum = this.cJnum,
                cJItemPrice =this.cJItemPrice;
            $(cJOrderDetails).each(function(index,ele){
                var $ele = $(ele),
                    i = parseInt($ele.find(cJnum).val()),
                    p = parseInt($ele.find(cJItemPrice).text().replace(/[,]/g,"")*1000);

                if($ele.find(cJOdChecked).hasClass(cChecked)){
                    total+=parseInt(i*p);
                }
            });
            return total/1000;
        },

        //checked是否选中交互
        checked:function(e){
            var _self = this,
                $target = $(e.currentTarget),
                cChecked = this.cChecked,
                $cJOrderDetails = this.$cJOrderDetails,
                $cJItemsTotal = this.$cJItemsTotal,
                $cJTotalPrice = this.$cJTotalPrice,
                $cJcheckOut = this.$cJcheckOut,
                cJOdChecked = this.cJOdChecked,
                cNoClick = this.cNoClick,
                i = _self.getCheckNum();

            $target.toggleClass(cChecked);
            if($target.hasClass(cChecked)){
                ++i;
            }else{
                --i;
            }
            $cJItemsTotal.text(i);
            if(i==0){
                $cJcheckOut.parent().addClass(cNoClick);
            }else{
                $cJcheckOut.parent().removeClass(cNoClick);
            }
            $cJTotalPrice.text(_self.getTotalPrice());
        },
        //获取价格
        getPrice:function(){
            var $cJTotalPrice = $(this.cJTotalPrice),
                $cJCheckOutWap = $(this.cJCheckOutWap),
                $cJcheckOut  = $(this.cJcheckOut),
                cNoClick = this.cNoClick,
                cartList = this.cartList,
                i = this.getCheckNum();
            //获取总价
            $cJTotalPrice.text(this.getTotalPrice());
            if(i==0){
                $cJcheckOut.parent().addClass(cNoClick);
            }else{
                $cJcheckOut.parent().removeClass(cNoClick);
            }
        }

    });
    
    return CartListView;
});

