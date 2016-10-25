/**
 * module src: common/detail/productAttrPopup.js
 * sku弹层 关闭按钮、Confirm按钮、图片
**/
define('common/detail/productAttrPopup', ['common/config','common/detail/findSkuAttr','common/detail/PriceRange','common/detail/selectSkuAttr','common/detail/addToCart','common/detail/buyItNow','tpl/detail/productAttrPopupTpl','checkoutflow/popupTip'], function(CONFIG,findSkuAttr,PriceRange,selectSkuAttr,addToCart,buyItNow,tpl,tip){
    //构造函数
    var productAttrPopupModel = Backbone.Model.extend({
        //sku弹层 关闭按钮、Confirm按钮、图片
        defaults: function() {
            return {
                //状态码
                code: -1,
                //弹出层产品首图
                thumbListFirst: '',
                //产品是否可售
                istate: true,
                //最小购买数量
                minOrder: -1,
                //促销类型
                promoTypeId: -1,
                //库存量
                inventoryQuantity: -1,
                //限时限购最大购买数量
                maxPurchaseQuantity: -1,
                //是否可以运达到当前目的国家
                isShipto: true,
                //添加购物车或立即购买接口所需参数
                submitData:{
                    //产品编号
                    itemCode: -1,
                    //卖家id
                    supplierid: '',
                    //产品id
                    productId: '',
                    //购买产品单数计量单位measureName
                    unit: '',
                    //加入购物车的产品数量
                    quantity: 1,
                    //Md5
                    skuMd5:'',
                    //skuId
                    skuid:'',
                    //运达目的国家id
                    shipToCountry:'',
                    //物流方式
                    shipTypeId:'',
                    //库存国家id
                    stockIn:'',
                    //浏览器地址栏#号后面所传参数统计数据调用
                    impressionInfo:''
                },
                //临时存储skuMd5
                __skuMd5: '',
                //临时存储购买数量
                __quantity: -1,
                //临时存储选择sku的属性值名称
                __selectAttrsName:[],
                //临时存储未选择sku的属性组名称
                __attributeName: []
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

            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            //设置库存量和限时限购最大购买数量
            this.on('productAttrPopupModel:setPriceRangeModelData', this.setPriceRangeModelData ,this);
            //查看selectSkuAttrModel数据
            this.on('productAttrPopupModel:getSelectSkuAttrModelData', this.getSelectSkuAttrModelData ,this);
            //自定义加入购物车产品quantity数量的数据
            this.on('productAttrPopupModel:updateQuantity', this.updateQuantity, this);
            //获取运达目的国家id和物流运输方式
            this.on('productAttrPopupModel:shipToCountryShipTypeId', this.shipToCountryShipTypeId, this);
            //获取当前目的国家是否可以运达
            this.on('productAttrPopupModel:getShipCost', this.getShipCost, this);
            //自定义选择sku的属性值名称
            this.on('productAttrPopupModel:selectAttrsName', this.selectAttrsName, this);
            //自定义设置未选中属性组名称
            this.on('productAttrPopupModel:setAttributeName', this.setAttributeName, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {};
            $.extend(true, this.options, options||{});
        },
        //设置库存量和限时限购最大购买数量
        setPriceRangeModelData: function(data) {
            this.set({
                inventoryQuantity: data.inventoryQuantity,
                maxPurchaseQuantity: data.maxPurchaseQuantity
            });
        },
        //获取由selectSkuAttrModel回传的部分数据
        getSelectSkuAttrModelData: function(data){
            this.set({
                submitData: $.extend(true, {}, this.get('submitData'), {
                    //md5
                    skuMd5: data.Md5,
                    //skuId
                    skuid: data.id,
                }),
                __skuMd5: data.Md5,
            });
            //切换sku时，设置库存量和限时限购最大购买数量
            this.setPriceRangeModelData({
                inventoryQuantity: data.inventoryQuantity,
                maxPurchaseQuantity: data.maxPurchaseQuantity
            });
            //切换sku时，设置库存国家id
            this.setStockIn(data.inventoryCountryId);
        },
        //自定义选择sku的属性值名称由selectSkuAttrModel
        selectAttrsName: function(data){
            this.set({
                __selectAttrsName: data
            });
        },
        //设置未选中属性组名称
        setAttributeName: function(data){
            this.set({
                __attributeName: data
            });
        },
        //更新加入购物车产品quantity的数量的数据
        updateQuantity: function(quantity){
            this.set({
                submitData: $.extend(true, {}, this.get('submitData'), {quantity: quantity}),
                __quantity: quantity
            });
        },
        //获取运达目的国家id和物流运输方式
        shipToCountryShipTypeId:function(data){
            this.set({
                submitData: $.extend(true, {}, this.get('submitData'), {
                    shipToCountry: data.shipToCountry,
                    shipTypeId: data.shipTypeId
                })
            });
        },
        //设置库存国家id
        setStockIn: function(inventoryCountryId) {
            this.set({
                submitData: $.extend(true, {}, this.get('submitData'), {stockIn: inventoryCountryId})
            });
        },
        //获取当前目的国家是否可以运达
        getShipCost: function(shipcost){
            //标记默认为可运达
            var flag = true;
            //如果运费为-1则不可运达
            if(shipcost === -1){
                flag = false;
            }
            this.set({
                isShipto: flag
            });
        }
    });
    //view-sku弹层 关闭按钮、Confirm按钮、图片
    var productAttrPopuView =Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-selectSkuAttr,.j-cartSelectSkuAttr,.j-buySelectSkuAttr': 'isSkuData',
            'click .j-addToCart': 'toCart',
            'click .j-buyItNow': 'toBuy',
            'click .j-product-title-top':'closedCouponLayer'
        },
        //初始化入口
        initialize: function(options){
            //配置对象初始化
            this.setOptions(options);
            this.cJSelectSkuAttr = this.options.cJSelectSkuAttr;
            this.cJAttributeName = this.options.cJAttributeName;
            this.cJQuantityVal = this.options.cJQuantityVal;
            this.cJDatailBtn = this.options.cJDatailBtn;
            this.cJDatailProductAttributes = this.options.cJDatailProductAttributes;
            this.cJProductImg = this.options.cJProductImg;
            this.cJSelectOptionScroll = this.options.cJSelectOptionScroll;
            this.cJQuantityVal = this.options.cJQuantityVal;
            this.cJConfirm = this.options.cJConfirm;
            this.cJLayerBottomBox = this.options.cJLayerBottomBox;
            this.cCurrent = this.options.cCurrent;
            this.cOpenLayer = this.options.cOpenLayer;
            this.cClosedLayer = this.options.cClosedLayer;
            this.originalSyncData = this.options.originalSyncData;
            this.getDefaultShipCostAndWay = this.options.getDefaultShipCostAndWay;
            this.cHtml = this.options.cHtml;
            this.cHide = this.options.cHide;
            this.cDhmHtmlOverflow = this.options.cDhmHtmlOverflow;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            /**
             * 控制是否需要刷新运费而设置的缓存标识：
             * {'skuMd5_skuid_quantity': 'Y'}
             * 只存储当前的访问状态
            **/
            this.skuCache = {};

            //初始化$dom对象
            this.initElement();
            //事件初始化
            this.initEvent();
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //展示sku属性值和购买数量外层包裹容器
                cJSelectSkuAttr: '.j-selectSkuAttr',
                //展示属性值名称外层包裹容器
                cJAttributeName: '.j-attribute-name',
                //展示购买数量外层包裹容器
                cJQuantityVal: '.j-quantityVal',
                //初始化addToCart、buyItNow外层包裹容器
                cJDatailBtn: '.j-datail-btn',
                //sku弹层外层包裹容器
                cJDatailProductAttributes: '.j-datail-product-attributes',
                //sku产品图价格外层包裹容器
                cJProductImg: '.j-product-img',
                //sku弹层sku属性外层包裹容器
                cJSelectOptionScroll: '.j-selectOption-scroll',
                //confirm按钮包裹容器
                cJConfirm: '.j-confirm',
                //初始化底部滚动条底部外层包裹容器
                cJLayerBottomBox:'.j-layer-bottom-box',
                //单个sku产品当前选中的样式
                cCurrent: 'current',
                //html样式
                cHtml: 'dhm-htmlOverflow',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //html样式
                cDhmHtmlOverflow: 'dhm-htmlOverflow',
                //控制SKU弹出层滑动显示展示样式
                cOpenLayer:'open-layer1',
                //控制SKU弹出层滑动隐藏展示样式
                cClosedLayer:'close-layer1',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new productAttrPopupModel(options.syncData)
            };
            $.extend(true, this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$body = this.body||$('body');
            this.$window = this.$window||$(window);
            this.$cJSelectSkuAttr = this.$cJSelectSkuAttr||$(this.cJSelectSkuAttr);
            this.$cJAttributeName = this.$cJAttributeName||$(this.cJAttributeName);
            this.$cJQuantityVal = this.$cJQuantityVal||$(this.cJQuantityVal);
            this.$cJDatailBtn = this.$cJDatailBtn||$(this.cJDatailBtn);
            this.$cJLayerBottomBox = this.$cJLayerBottomBox||$(this.cJLayerBottomBox);
            this.$cJDatailProductAttributes = $(this.cJDatailProductAttributes);
            this.$cJProductImg = $(this.cJProductImg);
            this.$cJSelectOptionScroll = $(this.cJSelectOptionScroll);
            this.$cJConfirm = $(this.cJConfirm);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;

            //监听当前目的国家是否可以运达
            this.listenTo(this.model, 'change:isShipto', this.renderbuyCart);
            this.listenTo(this.model, 'change:isShipto', this.renderBottomScrollBar);
            this.listenTo(this.model, 'change:__skuMd5',this.renderSetSkuConfirm);
            this.listenTo(this.model, 'change:__skuMd5', this.renderbuyCart);
            this.listenTo(this.model, 'change:__skuMd5', this.renderBottomScrollBar);
            //监听购买数量发生变化
            this.listenTo(this.model, 'change:__quantity', this.updateAttributeNameQuantity);
            //监听sku的属性值名称值发生变化
            this.listenTo(this.model, 'change:__selectAttrsName', this.updateAttributeNameQuantity);
            //屏幕旋转事件
            //sku弹层列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange, resize', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setSkuStyle();
                }, 500);
            });
        },
        //拉取数据
        fetch: function(){
            //打开loading
            tip.events.trigger('popupTip:loading', true);
            //获取当前产品下的所有sku数据
            findSkuAttr.init({
                itemcode: this.originalSyncData.itemCode,
                successCallback: $.proxy(function(skuData){
                    var priceRange;
                    //初始化设置库存
                    this.model.trigger('productAttrPopupModel:setPriceRangeModelData', {
                        //默认库存
                        inventoryQuantity: skuData.defaultInventoryQuantity,
                        //限时限购活动库存
                        maxPurchaseQuantity: skuData.defaultMaxPurchaseQuantity
                    });
                    //渲染页面
                    this.render(this.model.attributes);

                    //价格区间 (选择SKU产品属性将价格区间同步到PriceRangeModel中先执行priceRange)
                    priceRange = new PriceRange({
                        syncData: {
                            isVip: this.originalSyncData.isVip,
                            displayPrice: this.originalSyncData.displayPrice,
                            deletePrice: this.originalSyncData.deletePrice,
                            lot: this.originalSyncData.lot,
                            measureName: this.originalSyncData.measureName,
                            plural: this.originalSyncData.plural,
                            minOrder: this.originalSyncData.minOrder,
                            promoTypeId: this.originalSyncData.promoTypeId,
                            istate: this.originalSyncData.istate,
                            priceRanges: skuData.defaultPriceRanges,
                            inventoryQuantity: skuData.defaultInventoryQuantity,
                            maxPurchaseQuantity: skuData.defaultMaxPurchaseQuantity,
                            quantity: this.originalSyncData.minOrder,
                        },
                        productAttrPopuInstance: this
                    });

                    //判断产品无sku属性的情况下将skuId和skuMd5同步到productAttrPopupModel中
                    if(skuData.skus['9999']){
                        //同步模型数据到productAttrPopupModel
                        this.model.trigger('productAttrPopupModel:getSelectSkuAttrModelData', skuData.skus['9999']);
                    //反之有SKU属性的情况下实例化selectSkuAttr
                    }else{
                        //选择sku产品属性
                        new selectSkuAttr({
                            skuData: {
                                attrGroups: skuData.attrGroups,
                                skus: skuData.skus
                            },
                            //注册PriceRangeView的实例
                            priceRangeInstance: priceRange,
                            //注册productAttrPopuView的实例
                            productAttrPopuInstance: this
                        });
                    }

                    //200为标记所有数据准备完毕
                    this.model.set({code: 200});
                    //写入缓存数据
                    this.setCache([
                        this.model.get('submitData').skuMd5||'',
                        this.model.get('submitData').skuid||'',
                        this.model.get('submitData').quantity
                    ].join('_'));
                    //显示SKU产品属性弹层
                    this.openCouponLayer();
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                },this)
            });
        },
        //是否拉取过SKU数据
        isSkuData: function(e) {
            //记录当前触发sku弹层打开的$dom对象
            this.$skupopBtn = $(e.currentTarget);

            //没有缓存数据
            if (this.model.get('code') === -1) {
                //拉取数据
                this.fetch();
            //带有缓存
            } else {
                //点击Please Select Options、buyItNow addToCart打开sku弹层buyItNow addToCart confirm按钮展示
                this.renderSetSkuConfirm(this.model.attributes);
                //显示SKU产品属性弹层
                this.openCouponLayer();
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
        render: function(data,e) {
            var type = this.$skupopBtn.attr('data-skupop'),
                //模板引擎
                template = this.template,
                //模板
                tpl = this.tpl,
                //主体内容模板
                main = template(tpl.main.join(''))(data),
                //标题模板
                title = template(tpl.title.join(''))(data),
                //产品图
                productPicture = template(tpl.productPicture.join(''))(data),
                //sku弾层中的立即购买、添加购物车按钮模板
                confirm = template(tpl.confirm.join(''))($.extend({},this.getData(data),{btnType:type}));

            main = main.replace(/\{\{main\}\}/, main)
                       .replace(/\{\{title\}\}/, title)
                       .replace(/\{\{productPicture\}\}/, productPicture)
                       .replace(/\{\{confirm\}\}/, confirm)
                       ;

            //页面绘制
            this.$body.append(main);
            //重新初始化$dom对象
            this.initElement();
        },
        //点击Please Select Options、buyItNow addToCart打开sku弹层buyItNow addToCart confirm按钮展示
        renderSetSkuConfirm:function(data){
            var $cJConfirm = this.$cJConfirm,
                //标识从那个按钮点击打开的sku弾层
                type = this.$skupopBtn.attr('data-skupop'),
                template = this.template,
                //模板
                tpl = this.tpl,
                //初始化立即购买加入到购物车按钮模板
                confirm = template(tpl.confirm.join(''))($.extend({},this.getData(data),{btnType:type}));

            //绘制页面
            $cJConfirm.html(confirm);
        },
        //首图下方展示addToCart和buyItNow按钮
        renderbuyCart: function(data){
            var $cJDatailBtn = this.$cJDatailBtn,
                //模板引擎
                template = this.template,
                //模板
                tpl = this.tpl,
                //标题模板
                buyCart = template(tpl.buyCart.join(''))(this.getData(data));
            
            //只有在非sold out的状态下才能绘制页面
            if (this.model.get('istate') === true) {
                $cJDatailBtn.html(buyCart);
            }
        },
        //初始化底部滚动条
        renderBottomScrollBar: function(data){
            var $cJLayerBottomBox = this.$cJLayerBottomBox,
                //模板引擎
                template = this.template,
                //模板
                tpl = this.tpl,
                //标题模板
                bottomScrollBar = template(tpl.bottomScrollBar.join(''))(this.getData(data));
            
            //只有在非sold out的状态下才能绘制页面
            if (this.model.get('istate') === true) {
                $cJLayerBottomBox.html(bottomScrollBar);
            }
        },
        //更新属性值名称和购买数量
        updateAttributeNameQuantity: function(){
            var $cJAttributeName = this.$cJAttributeName,
                $cJQuantityVal = this.$cJQuantityVal,
                selectAttrsName = this.model.get('__selectAttrsName'),
                quantity = this.model.get('submitData').quantity,
                arr = [],
                len = selectAttrsName.length;

            for (var i = 0; i < len; i++) {
                arr.push('['+selectAttrsName[i]+']');
            }

            //查看是否有属性值名称
            if (len>0) {
                //修改属性值
                $cJAttributeName.html('Selection: ' + arr.join(', '));
            }
            //修改购买数量
            $cJQuantityVal.html(quantity);
        },
        //设置缓存数据
        setCache: function(key) {
            //删除缓存数据
            this.deleteCache();
            this.skuCache[key] = 'Y';
        },
        //获取缓存数据
        getCache: function(key) {
            var flag = false;
            if(this.skuCache[key] === 'Y'){
                flag = true;
            }
            return flag;
        },
        //删除缓存数据
        deleteCache: function() {
            this.skuCache = {};
        },
        //立即购买
        toBuy: function() {
            var self = this,
                data = this.model.attributes,
                skuMd5 = this.model.get('submitData').skuMd5,
                skuid = this.model.get('submitData').skuid,
                quantity = this.model.get('submitData').quantity,
                key = [skuMd5,skuid,quantity].join('_');


            //如果没有选择SKU属性点击addToCart出现提示框否则添加购物车
            if(skuMd5 === undefined || skuid === undefined){
                //提示文案
                tip.events.trigger('popupTip:autoTip',{message:'Please Select ' + this.model.get('__attributeName'),timer:1000});
            }else{
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                //判断是否需要刷新运费
                if(!this.getCache(key)){
                    this.options.getDefaultShipCostAndWay.trigger('GetDefaultShipCostAndWayView:upadteShipCostInfo',{
                        quantity: quantity,
                        skuId: skuid,
                        skuMd5: skuMd5,
                        stockCountryId: this.model.get('submitData')['stockIn'],
                        updateCallback: $.proxy(function(options) {
                            //获取运达目的国家id和物流运输方式
                            this.model.trigger('productAttrPopupModel:shipToCountryShipTypeId', {
                                shipToCountry: options.model1.get('whitherCountryId'),
                                shipTypeId: options.model1.get('expressType')
                            });
                            //立即购买
                            buyItNow.fetch(data);
                        },this)
                    });
                    //写入缓存数据
                    this.setCache(key);
                //立即购买
                }else{
                   buyItNow.fetch(data);
                }
            }
        },
        //添加到购物车
        toCart: function() {
            var data = this.model.attributes,
                skuMd5 = this.model.get('submitData').skuMd5,
                skuid = this.model.get('submitData').skuid,
                quantity = this.model.get('submitData').quantity,
                key = [skuMd5,skuid,quantity].join('_');
            //如果没有选择SKU属性点击addToCart出现提示框否则添加购物车
            if(skuMd5 === undefined || skuid === undefined){
                //提示文案
                tip.events.trigger('popupTip:autoTip',{message:'Please Select ' + this.model.get('__attributeName'),timer:1000});
            }else{
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                //判断是否需要刷新运费
                if(!this.getCache(key)){
                    this.options.getDefaultShipCostAndWay.trigger('GetDefaultShipCostAndWayView:upadteShipCostInfo',{
                        quantity: quantity,
                        skuId: skuid,
                        skuMd5: skuMd5,
                        stockCountryId: this.model.get('submitData')['stockIn'],
                        updateCallback: $.proxy(function(options) {
                            //获取运达目的国家id和物流运输方式
                            this.model.trigger('productAttrPopupModel:shipToCountryShipTypeId', {
                                shipToCountry: options.model1.get('whitherCountryId'),
                                shipTypeId: options.model1.get('expressType')
                            });
                            //添加购物车
                            addToCart.fetch(data);
                        },this)
                    });
                    //写入缓存数据
                    this.setCache(key);
                }else{
                   //添加购物车
                   addToCart.fetch(data);
                }
            }
        },
        //是否刷新运费
        refreshShipCostAndWay: function(){
            var skuMd5 = this.model.get('submitData').skuMd5||'',
                skuid = this.model.get('submitData').skuid||'',
                quantity = this.model.get('submitData').quantity||'',
                key = [skuMd5,skuid,quantity].join('_');

            if(!this.getCache(key)){
                this.options.getDefaultShipCostAndWay.trigger('GetDefaultShipCostAndWayView:upadteShipCostInfo',{
                    quantity: quantity,
                    skuId: skuid,
                    skuMd5: skuMd5,
                    stockCountryId: this.model.get('submitData')['stockIn'],
                    updateCallback: $.proxy(function(options) {
                        //获取运达目的国家id和物流运输方式
                        this.model.trigger('productAttrPopupModel:shipToCountryShipTypeId', {
                            shipToCountry: options.model1.get('whitherCountryId'),
                            shipTypeId: options.model1.get('expressType')
                        });
                    },this)
                });
                //写入缓存数据
                this.setCache(key);
            }
        },
        //设置sku弹出层展示时的页面样式
        setPageStyle: function(flag) {
            var $html = this.$html,
                $body = this.$body,
                cHtml = this.cHtml;

            //展示时
            if (flag === true) {
                //临时记录页面垂直滚动条的距离顶部的距离
                this.__scrollY = parseInt(this.$window.scrollTop());
                $html.addClass(cHtml);
                $body.css({'margin-top':-this.__scrollY});
            //隐藏时
            } else {
                $html.removeClass(cHtml);
                $body.attr({style:''});
                window.scroll(0, this.__scrollY);
            }
        },
        //设置sku弹层列表样式
        setSkuStyle: function(){
            var $cJSelectOptionScroll = $(this.cJSelectOptionScroll),
                windowHeight = this.$window.height()*1,
                sumHeight = 0,
                $siblings;

            $siblings = $cJSelectOptionScroll.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });

            $cJSelectOptionScroll.css({height:windowHeight - sumHeight});
        },
        //显示SKU产品属性弹出层
        openCouponLayer: function(){
            var $cJDatailProductAttributes = this.$cJDatailProductAttributes,
                cOpenLayer = this.cOpenLayer,
                cClosedLayer = this.cClosedLayer,
                cHide = this.cHide;

            //设置sku弹出层展示时的页面样式
            this.setPageStyle(true);
            //先设置display
            $cJDatailProductAttributes.removeClass(cHide);
            //设置sku弹层列表样式
            this.setSkuStyle();

            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $cJDatailProductAttributes.removeClass(cClosedLayer).addClass(cOpenLayer);
            }, 10);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //关闭SKU产品属弹出层
        closedCouponLayer:function(){
            var $cJDatailProductAttributes = this.$cJDatailProductAttributes,
                cOpenLayer = this.cOpenLayer,
                cClosedLayer = this.cClosedLayer,
                cHide = this.cHide;

            //设置sku弹出层展示时的页面样式
            this.setPageStyle(false);
            //先滑动隐藏展示
            $cJDatailProductAttributes.removeClass(cOpenLayer).addClass(cClosedLayer);

            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                $cJDatailProductAttributes.addClass(cHide);
            }, 510);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();

            //是否刷新运费
            this.refreshShipCostAndWay();
        }
    });

    return productAttrPopuView;
});