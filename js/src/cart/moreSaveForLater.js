/**
 * module src: cart/moreSaveForLater.js
 * 点击show more按钮查看更多saveForLater列表
**/
define('app/moreSaveForLater', ['common/config','lib/backbone','app/getSaveForLater','app/getCartList','checkoutflow/popupTip','checkoutflow/dataErrorLog','app/formatTime'], function(CONFIG,Backbone,getSaveForLater,getCartList,tip,dataErrorLog,formatTime){
    //model-点击show more按钮查看更多saveForLater列表
    var moreSaveForLaterModel = Backbone.Model.extend({
        //点击show more按钮查看更多saveForLater列表
        defaults: function() {
            return {
                //状态码
                code: -1,
                cartItems:[{
                        //cartItemId
                        cartItemId:'',
                        //图片地址
                        imgURL: '',
                        //产品图片链接
                        itemUrl:'',
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
                        unit: ''
                }],
                //页数
                pageCount:1,
                //总页数
                totalCount:10

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
                    url: CONFIG.wwwURL + '/mobileApiWeb/cart-Cart-getSave4LaterList.do',
                    //url: 'moveToCart.json',
                    data: {
                        
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
            obj.cartItems = [];
            if (obj.code !== -1 && res.data.cartItems !==undefined) {
                $.each(res.data.cartItems,function(index,pro){
                    var __obj = {};
                    __obj.cartItemId = pro.cartItemId;
                    __obj.itemCode = pro.itemCode;
                    __obj.imgURL = pro.imgURL;
                    __obj.itemUrl = CONFIG.wwwURL + '/' + pro.itemUrl;
                    __obj.prodName = pro.prodName;
                    __obj.skuInfo = pro.skuInfo;
                    __obj.sellStatus = pro.sellStatus;
                    __obj.inventoryStatus = pro.inventoryStatus;
                    __obj.canDelivery = pro.canDelivery;
                    __obj.maxQuantity = pro.maxQuantity;
                    __obj.minQuantity = pro.minQuantity;
                    __obj.price = pro.price;
                    __obj.unit = pro.unit;
                    __obj.quantity = pro.quantity;
                    __obj.cheapen = pro.cheapen?pro.cheapen:'';
                    __obj.endDate = pro.endDate?formatTime.get(pro.endDate):'';
                    obj.cartItems.push(__obj);
                })
                obj.pageCount = res.data.pageCount;
                obj.totalCount = res.data.totalCount;
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: 200
             *     cartItems:[{
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
             *      }],
             *  ...
             * }
            **/
            return obj;
        }
    });

    //model-点击show more按钮查看更多saveForLater列表
    var  moreSaveForLaterView = Backbone.View.extend({
        //根节点
        el:'body',
        //backbone提供的事件集合
        events: {
            'click .j-show-moreBtn': 'showMore'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cJShowMoreBtn = this.options.cJShowMoreBtn;
            this.pageNo = this.options.pageNo;
            this.model = this.options.model;
            this.cartList = this.options.cartList;
            this.saveForLaverList = this.options.saveForLaverList;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化事件
            this.initEvent();

        },
        
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //绑定设置当前页数事件
            this.on('moreSaveForLaterView:setPageNo', this.setPageNo, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //showMore外层包裹容器
                cJShowMoreBtn:'.j-show-moreBtn',
                pageNo :1,
                //数据模型
                model: new moreSaveForLaterModel(),
                //购物车列表实例对象
                cartList: $({}),
                //saveForLaverList实例对象
                saveForLaverList: $({}),
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
                //saveForLater列表渲染
                this.saveForLaverList.trigger('saveForLaterView:render:renderMoreSaveForLater', model.attributes);

                //大于总页数，移除showMore按钮
                var pageNo = this.pageNo;
                if(pageNo >= response.data.pageCount){
                    $(this.cJShowMoreBtn).remove();
                }

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
        //设置当前页数
        setPageNo: function(type){
            if (type && type === 'auto') {
                this.pageNo++;
            } else {
                this.pageNo = 1;
            }
        },
        //点击showMore按钮显示更多saveForLater列表
        showMore:function(e){
            this.setPageNo('auto');
            //显示loadding弹层
            tip.events.trigger('popupTip:loading', true);
            //拉取产品数据
            this.model.fetch({data:this.getParams()});
        },
        //获取参数
        getParams:function(){
            return  $.extend(true, {}, {version: 3.3,client: 'wap',pageNo:this.pageNo,pageSize:10});
        }
    });
    
    return moreSaveForLaterView;
});

