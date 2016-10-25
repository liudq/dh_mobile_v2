/**
 * module src: common/detail/PriceRange.js
 * sku价格区间
**//**/
define('common/detail/PriceRange', ['common/config','tpl/detail/priceRangeTpl','checkoutflow/popupTip'], function(CONFIG,tpl,tip){
    //PriceRangeModel的数据格式化方法
    var PriceRangeModelParse = function(res) {
        var obj = {};
        //是否为VIP用户
        obj.isVip = res.isVip;
        //是否是限时限量促销  2:dailydetails 3:店铺限时限量
        obj.isLimitPromo = res.promoTypeId === 2 || res.promoTypeId === 3 ? true :false;
        //是否展示删除价
        obj.isDeletePrice = res.priceRanges[0].discountPrice > 0 ? true : false;
        //每包多少件
        obj.lot = res.lot;
        //是否按包卖（1:按件卖，>1按包卖）
        obj.isLot = res.lot > 1 ? true : false;
        //原价的最大价和最小价是否相等
        if(res.displayPrice.isEqual === true){
            //单价取最小价格
            obj.displayPrice = res.displayPrice.minPrice;
        }else{
            //区间价
            obj.displayPrice = res.displayPrice.minPrice + '-' + res.displayPrice.maxPrice;
        }
        
        //检查是否有删除价
        if(res.deletePrice !== ''){
            //删除价的最大价和最小价是否相等
            if(res.deletePrice.isEqual === true){
                //单价取最小价格
                obj.deletePrice = res.deletePrice.minPrice;
            }else{
                //区间价
                obj.deletePrice = res.deletePrice.minPrice + '-' + res.deletePrice.maxPrice;
            }    
        }
        //购买产品单复数计量单位
        obj.plural = res.plural;
        //购买产品单数计量单位
        obj.measureName =res.measureName;
        //库量量
        obj.inventoryQuantity = res.inventoryQuantity;
        //限量限购最大库存量
        obj.maxPurchaseQuantity = res.maxPurchaseQuantity;
        //最小购买数量
        obj.minOrder = res.minOrder;
        //购买数量
        obj.quantity = res.quantity;
        //价格区间
        obj.priceRanges = res.priceRanges;
        
        return obj;
    };
    
    //model-sku价格区间
    var PriceRangeModel = Backbone.Model.extend({
        //sku价格区间初始化属性[attributes]
        defaults: function() {
            return {
                //是否为VIP用户
                isVip: false,
                //展示价
                displayPrice: '',
                //删除价
                deletePrice: '',
                //是否按包卖
                isLot: false,
                //是否按包卖（1:按件卖，>1按包卖）
                lot: -1,
                //购买产品单复数计量单位
                plural: '',
                //购买产品单数计量单位
                measureName: '',
                //是否为限时限量的促销
                isLimitPromo: false,
                //是否展示删除价
                isDeletePrice: false,
                //产品是否可售
                istate: true,
                //最小购买数量
                minOrder: -1,
                //价格区间
                priceRanges: [],
                //购买数量
                quantity: -1,
                //库存量
                inventoryQuantity: -1,
                //限时限购最大购买数量
                maxPurchaseQuantity: -1,
                //临时存储skuMd5
                __skuMd5: ''
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
            this.productAttrPopuInstance = this.options.productAttrPopuInstance;
            this.getDefaultShipCostAndWayInstance = this.options.getDefaultShipCostAndWayInstance;
            //事件初始化
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            this.on('PriceRangeModel:setSelectSkuAttrModelData', this.setSelectSkuAttrModelData ,this);
            this.on('PriceRangeModel:setQuantity', this.setQuantity, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                productAttrPopuInstance: null,
                getDefaultShipCostAndWayInstance: null
            };
            $.extend(true, this.options, options||{});
        },
        //设置价格区间/库存量/__skuMd5
        setSelectSkuAttrModelData: function(data){
            //切换sku时重置展示/删除价
            this.setPrices({
                discountPrice: data.priceRanges[0].discountPrice,
                originalPrice: data.priceRanges[0].originalPrice
            });
            
            this.set({
                inventoryQuantity: data.inventoryQuantity,
                priceRanges: data.priceRanges,
                maxPurchaseQuantity: data.maxPurchaseQuantity,
                __skuMd5: data.Md5
            });
        },
        //设置原价/删除价
        setPrices: function(data){
            var obj = {};
            if(data.discountPrice > 0){
                obj.deletePrice = data.originalPrice;
                obj.displayPrice = data.discountPrice;
            }else{
                obj.deletePrice = -1;
                obj.displayPrice = data.originalPrice;
            }
            this.set(obj);
            //在sku或购买数量发生变化的时候需要更新首屏展示价/删除价
            this.trigger('PriceRangeView:updataPriceRange', obj);
        },
        //获取当前选中价格区间索引值
        getSelectedPriceRangeIndex: function() {
            var index = -1,
                quantity = this.get('quantity');
            $.each(this.get('priceRanges'), function(i, priceRange){
                var numLowerLimit = priceRange.numLowerLimit,
                    numUpperLimit = priceRange.numUpperLimit;
                if (index > -1) {
                    return;
                } else {
                    if (quantity>=numLowerLimit && quantity<=numUpperLimit) {
                        index = i;
                    }
                }
            });
            //设置对应价格区间选中状态
            this.trigger('PriceRangeView:setSelectPriceRangeStatus', index);
            //修改展示/删除价
            this.setPrices({
                discountPrice: this.get('priceRanges')[index].discountPrice,
                originalPrice: this.get('priceRanges')[index].originalPrice
            });
        },
        //设置购买数量
        setQuantity: function(quantity){
            this.set({quantity: quantity},{validate:true, type:'quantity'});
        },
        //验证表单字段
        validate: function(attrs, options) {
            //购买数量校验
            if (options.type === 'quantity') {
                var res = this.validateQuantity(attrs);
                if (typeof res === 'string') {
                    return res;
                }
            }
        },
        //验证购买数量
        validateQuantity: function(attrs) {
            var value = attrs.quantity,
                isLimitPromo = this.get('isLimitPromo'),
                minValue = this.get('minOrder'),
                maxValue;
            
            //限时限量去活动展示活动库存量
            if (isLimitPromo === true) {
                maxValue = this.get('maxPurchaseQuantity');
            //反之，默认库存量
            } else {
                maxValue = this.get('inventoryQuantity');
            }

            //超过最大购买数量
            if (value > maxValue) {
                return 'isMax';
            //低于最小购买数量
            } else if (value < minValue) {
                return 'isMin';
            //非法字符
            } else if (isNaN(value) || /\D/.test(value)) {
                return 'isValidate';
            }

            //最小值临界值将禁用减少购买数量按钮
            if (value === minValue) {
                this.trigger('PriceRangeView:setQuantityStatus', 1);
            //最大值临界值将禁用增加购买数量按钮
            } else if (value === maxValue) {
                this.trigger('PriceRangeView:setQuantityStatus', 2);
            //操作购买数量按钮状态全部设置可用
            } else {
                this.trigger('PriceRangeView:setQuantityStatus'); 
            }
        }
    });

    //view-sku弹层价格区间
    var PriceRangeView =Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-pro-plus': 'increaseNum',
            'click .j-pro-reduce': 'reduceNum',
            'blur .j-pro-num': 'setQuantity'
        },
        //初始化入口
        initialize: function(options){
            //配置对象初始化
            this.setOptions(options);
            this.cJPriceRange = this.options.cJPriceRange;
            this.cJpriceRangeWarp = this.options.cJpriceRangeWarp;
            this.cJProNum = this.options.cJProNum;
            this.cTrCurrent = this.options.cTrCurrent;
            this.cJProPlus = this.options.cJProPlus;
            this.cJProReduce = this.options.cJProReduce;
            this.cProNumberSold = this.options.cProNumberSold;
            this.cJOriginalPrice = this.options.cJOriginalPrice;
            this.cJDiscountPrice = this.options.cJDiscountPrice;
            this.cJQuantityUnit = this.options.cJQuantityUnit;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //渲染价格区间主题
            this.render(this.model.attributes);
            //渲染展示/删除价格
            this.renderProductPrice(this.model.attributes);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //产品价格区间外层包裹容器
                cJPriceRange: '.j-priceRange',
                //价格区间购买数量外层包裹容器
                cJpriceRangeWarp:'.j-priceRangeWarp',
                //购买数量表单外层包裹容器
                cJProNum: '.j-pro-num',
                //价格区间当前选中样式
                cTrCurrent: 'tr-current',
                //增加quantity购买数量
                cJProPlus: '.j-pro-plus',
                //减少quantity购买数量
                cJProReduce: '.j-pro-reduce',
                //quantity按钮置灰样式
                cProNumberSold: 'pro-number-sold',
                //初始化显示原价外层包裹容器
                cJOriginalPrice: '.j-originalPrice',
                //初始化显示促销价外层包裹容器
                cJDiscountPrice: '.j-discountPrice',
                //购买数量计量单位外层包裹容器
                cJQuantityUnit: '.j-quantityUnit',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new PriceRangeModel(PriceRangeModelParse(options.syncData), {
                    //productAttrPopup的实例对象
                    productAttrPopuInstance: options.productAttrPopuInstance,
                    //getDefaultShipCostAndWay的实例对象
                    getDefaultShipCostAndWayInstance:options.getDefaultShipCostAndWayInstance
                })
            };
            $.extend(true, this.options, options||{});
        },
        //事件初始化
        initEvent: function() {
            //监听购买数量值发生变化
            this.listenTo(this.model, 'change:quantity', $.proxy(function(){
                this.getSelectedPriceRangeIndex();
            },this.model));
            this.listenTo(this.model, 'change:quantity', this.renderProductPrice);
            this.listenTo(this.model, 'change:quantity', this.renderQuantityUnit);
            this.listenTo(this.model, 'change:quantity', $.proxy(function(){
                this.productAttrPopuInstance.model.trigger('productAttrPopupModel:updateQuantity', this.get('quantity'));
            },this.model));

            //监听模型数据字段验证
            this.listenTo(this.model, 'invalid', this.matchErrorTip);	
            //监听skuMd5的值发生变化
            this.listenTo(this.model, 'change:__skuMd5', this.render);
            this.listenTo(this.model, 'change:__skuMd5', this.renderProductPrice);
            //在model上绑定选中价格区间状态的事件
            this.model.on('PriceRangeView:setSelectPriceRangeStatus', this.setSelectPriceRangeStatus, this);
            //在model上绑定更新首屏展示价/删除价的事件
            this.model.on('PriceRangeView:updataPriceRange', this.updataPriceRange, this);
            //在model上绑定设置购买数量增减按钮状态的事件
            this.model.on('PriceRangeView:setQuantityStatus', this.setQuantityStatus, this);
        },
        //$dom对象初始化
        initElement: function() {
            this.$cJPriceRange = this.$cJPriceRange||$(this.cJPriceRange);
            this.$cJpriceRangeWarp = this.$cJpriceRangeWarp||$(this.cJpriceRangeWarp);
            this.$cJProNum = $(this.cJProNum);
            this.$cJProPlus = $(this.cJProPlus);
            this.$cJProReduce = $(this.cJProReduce);
            this.$cJOriginalPrice = $(this.cJOriginalPrice);
            this.$cJDiscountPrice = $(this.cJDiscountPrice);
            this.$cJQuantityUnit = $(this.cJQuantityUnit);
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
            var $cJpriceRangeWarp = this.$cJpriceRangeWarp,
                //模板引擎
                template = this.template,
                //模板
                tpl = this.tpl,
                //主体内容模板
                main = template(tpl.main.join(''))(this.getData(data)),
                //价格区间模板
                arrtPriceRanges = template(tpl.arrtPriceRanges.join(''))(this.getData(data)),
                //购买数量模板
                quantity = template(tpl.quantity.join(''))(this.getData(data)),
                //购买数量计量单位模板
                quantityUnit = this.renderQuantityUnit(data, 'initRender'),
                //限时限量提示内容模板
                limitPromoContent = template(tpl.limitPromoContent.join(''))(this.getData(data));

            main = main.replace(/\{\{main\}\}/, main)
                       .replace(/\{\{arrtPriceRanges\}\}/, arrtPriceRanges)
                       .replace(/\{\{quantity\}\}/, quantity)
                       .replace(/\{\{quantityUnit\}\}/, quantityUnit)
                       .replace(/\{\{limitPromoContent\}\}/, limitPromoContent)
                       ;
            
            //绘制页面             
            $cJpriceRangeWarp.html(main);
            //重新初始化$dom对象
            this.initElement();
        },
        //展示/删除价渲染
        renderProductPrice: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //标题模板
                productPrice = template(tpl.productPrice.join(''))(this.getData(data));

            //页面绘制   
            this.$cJPriceRange.html(productPrice);
        },
        //购买数量计量单位渲染
        renderQuantityUnit: function(data, type) {
            var $cJQuantityUnit = this.$cJQuantityUnit,
                //模板引擎
                template = this.template,
                //模板
                tpl = this.tpl,
                //购买数量计量单位
                quantityUnit = template(tpl.quantityUnit.join(''))(this.getData(data));

            //如果data为数据模型实例，并且不为重新初始化渲染，则直接绘制页面
            if (this.isModelInstance(data) && type!=='initRender') {
                $cJQuantityUnit[0]&&$cJQuantityUnit.html(quantityUnit);
            //否则返回模板渲染数据
            } else {
                return quantityUnit;
            }
        },
        //设置选中价格区间的状态
        setSelectPriceRangeStatus: function(index){
            var cTrCurrent = this.cTrCurrent,
                priceRangesTrs = this.$cJpriceRangeWarp.find('tbody tr');
            $(priceRangesTrs[index]).addClass(cTrCurrent).siblings().removeClass(cTrCurrent);
        },
        //设置购买数量
        setQuantity: function(value) {
            var value;
            //如果是$dom事件触发则值从dom元素上取
            if (value.target) {
                value = this.$cJProNum.val();
            }
            this.model.trigger('PriceRangeModel:setQuantity', parseInt($.trim(value)));
        },
        //设置为最小购买数量
        setQuantityMin: function() {
            var minValue = this.model.get('minOrder');
            //将购买数量表单中的值改为最大购买数量
            this.$cJProNum.val(minValue);
            //将数据模型上的quantity字段的值改为最大购买数量
            this.setQuantity(minValue);
        },
        //设置为最大购买数量
        setQuantityMax: function() {
            var isLimitPromo = this.model.get('isLimitPromo'),
                maxValue;
            
            //限时限量去活动展示活动库存量
            if (isLimitPromo === true) {
                maxValue = this.model.get('maxPurchaseQuantity');
            //反之，默认库存量
            } else {
                maxValue = this.model.get('inventoryQuantity');
            }
            
            //将购买数量表单中的值改为最大购买数量
            this.$cJProNum.val(maxValue);
            //将数据模型上的quantity字段的值改为最大购买数量
            this.setQuantity(maxValue);
        },
        //匹配错误提示
        matchErrorTip: function(model, error, options) {
            //购买数量
            if (options.type === 'quantity') {
                this.setQuantityErrorTip(error);
            }
        },
        //设置购买数量错误提示
        setQuantityErrorTip: function(error) {
            //超过可购买的最大值
            if (error === 'isMax') {
                //展示限时限量去活动展示活动库存量
                if (this.model.get('isLimitPromo') === true) {
                    tip.events.trigger('popupTip:autoTip',{message:this.model.get('maxPurchaseQuantity')+' at most per customer',timer:1000});
                //反之，展示默认库存量
                } else {
                    tip.events.trigger('popupTip:autoTip',{message:'Max Stock '+this.model.get('inventoryQuantity'),timer:1000});
                }
                //修正为最大购买数量
                this.setQuantityMax();
                //禁用购买数量增加按钮
                this.setQuantityStatus(2);
            //低于最小购买数量
            } else if (error === 'isMin') {
                tip.events.trigger('popupTip:autoTip',{message:'Min order '+this.model.get('minOrder'),timer:1000});
                //修正为最小购买数量
                this.setQuantityMin();
                //禁用购买数量减少按钮
                this.setQuantityStatus(1);
            //非法字符
            } else if (error === 'isValidate') {
                tip.events.trigger('popupTip:autoTip',{message:'Min order '+this.model.get('minOrder'),timer:1000});
                //修正为最小购买数量
                this.setQuantityMin();
                //禁用购买数量减少按钮
                this.setQuantityStatus(1);
            }
        },
        //设置购买数量的按钮状态
        setQuantityStatus: function(status){
            var $cJProReduce = this.$cJProReduce,
                $cJProPlus = this.$cJProPlus,
                cProNumberSold = this.cProNumberSold;
            if (status === 1) {
                //禁用购买数量减少按钮
                $cJProPlus.removeClass(cProNumberSold);
                $cJProReduce.addClass(cProNumberSold);
            } else if (status === 2){
                //禁用购买数量增加按钮
                $cJProPlus.addClass(cProNumberSold);
                $cJProReduce.removeClass(cProNumberSold);
            } else {
                //全部可用
                $cJProPlus.removeClass(cProNumberSold);
                $cJProReduce.removeClass(cProNumberSold);
            }
        },
        //增加购买数量
        increaseNum: function(e){
            var value = parseInt($.trim(this.$cJProNum.val())) + 1,
                $e = $(e.currentTarget),
                cProNumberSold = this.cProNumberSold;
            //增加按钮有cProNumberSold按钮则不可点击
            if ($e.hasClass(cProNumberSold)) {
                return;
            }
            //增加购买的数量
            this.$cJProNum.val(value);
            //设置购买数量
            this.setQuantity(value);
        },
        //减少购买数量
        reduceNum: function(e){
            var value = parseInt($.trim(this.$cJProNum.val())) - 1,
                $e = $(e.currentTarget),
                cProNumberSold = this.cProNumberSold;
            //减少按钮有cProNumberSold按钮则不可点击
            if ($e.hasClass(cProNumberSold)) {
                return;
            }
            //减少购买的数量
            this.$cJProNum.val(value);
            //设置购买数量
            this.setQuantity(value);
        },
        //更新首屏展示价/删除价
        updataPriceRange: function(data){
            this.$cJDiscountPrice.html('US $' + data.displayPrice);
            this.$cJOriginalPrice[0]&&this.$cJOriginalPrice.html('US $' + data.deletePrice);
        }
    });

    return PriceRangeView;

});