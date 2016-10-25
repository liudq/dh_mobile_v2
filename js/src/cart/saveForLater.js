/**
 * module src: cart/saveForLater.js
 * saveForeLater模块
**/
define('app/saveForLater', ['common/config', 'lib/backbone', 'appTpl/saveForLaterTpl','checkoutflow/popupTip','checkoutflow/dataErrorLog','app/formatTime'], function(CONFIG, Backbone, tpl, tip,dataErrorLog,formatTime){
    //model-查看saveForLater
    var saveForLaterModel = Backbone.Model.extend({
        //查看购物车列表
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
                        unit: '',
                        //购物车营销SKU营销优惠金额
                        cheapen: 0,
                        //购物车营销SKU活动结束日期
                        endDate: 0
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
                    //url: 'saveForLaterList.json',
                    data: {
                        version: 3.3,
                        client: 'wap',
                        pageNo: 1,
                        pageSize:10
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
                    __obj.itemUrl = CONFIG.wwwURL.replace('https','http') + '/' + pro.itemUrl;
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

    //view-查看saveForLater
    var saveForLaterView = Backbone.View.extend({
        //查看购物车外层包裹容器
        el: '.j-saveForLater',   
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.pageNo = this.options.pageNo;
            this.cJSaveForLater = this.options.cJSaveForLater;
            this.cJSaveForLaterH3 = this.options.cJSaveForLaterH3;
            this.cJShowMore = this.options.cJShowMore;
            this.cJShowMoreBtn = this.options.cJShowMoreBtn;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
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
           this.$cJSaveForLater = $(this.cJSaveForLater);
           this.$cJSaveForLaterH3 = $(this.cJSaveForLaterH3);
           this.$cJShowMore = $(this.cJShowMore);
           this.$cJShowMoreBtn = $(this.cJShowMoreBtn);

        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);

            //更新saveforLater
            this.on('saveForLaterView:render:renderSaveForLater', this.renderSaveForLater, this);

            //点击showMore查看saveForLater
            this.on('saveForLaterView:render:renderMoreSaveForLater', this.renderMoreSaveForLater, this);

            //showMore渲染
            this.on('saveForLaterView:render:renderShowMore', this.renderShowMore, this);

        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                pageNo:1,
                //saveForLater外层包裹容器
                cJSaveForLater:'.j-saveForLater',
                //saveForLater标题包裹容器
                cJSaveForLaterH3:".j-saveForLater h3",
                //showMore外层包裹容器
                cJShowMore:'.j-showMore',
                //showMore按钮包裹容器
                cJShowMoreBtn:'.j-show-moreBtn',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new saveForLaterModel(),
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
                //tip.events.trigger('popupTip:loading', false);
                //初始化渲染页面
                this.render(model.attributes);
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
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，刷新页面】
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
        //初始化数据渲染
        render:function(data){
            if (data.code !== -1) {
                //渲染saveForLater
                this.renderSaveForLater(data);
                //showMore
                this.renderShowMore(data);
            }
            
            
            //绘制完成后需要进行的其他初始化操作
            this.renderCallback();
        },
        //初始saveForLater
        renderSaveForLater :function(data){
            var template = this.template,
                //模板
                tpl = this.tpl,
               //saveForLater包裹容器模板
               saveForLaterList =  template(tpl.saveForLaterList.join(''))(data);
            //页面绘制
            this.$cJSaveForLater.html(saveForLaterList);

            //添加图片懒加载功能
            this.lazyloadCallback();
        },
        //点击showMore后渲染saveforLater列表
        renderMoreSaveForLater :function(data){
            var template = this.template,
                //模板
                tpl = this.tpl,
               //saveForLater包裹容器模板
               saveForLaterList =  template(tpl.saveForLaterList.join(''))(data);
            //页面绘制
            this.$cJSaveForLater.append(saveForLaterList);
            $(this.cJSaveForLaterH3).hide();
            $('.j-saveForLater h3:eq(0)').show();
        },
        //showMore
        renderShowMore :function(data){
            var template = this.template,
                //模板
                tpl = this.tpl,
               //saveForLater包裹容器模板
               showMore =  template(tpl.showMore.join(''))(data);
            //页面绘制
            this.$cJShowMore.html(showMore);
        }
    });
    
    return saveForLaterView;
});

