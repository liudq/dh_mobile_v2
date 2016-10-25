/**
 * module src: common/detail/selectSkuAttr.js
 * sku属性选择
**/
define('common/detail/selectSkuAttr', ['common/config','common/detail/findSkuAttr','tpl/detail/selectSkuAttrTpl'], function(CONFIG,preprocessingSyncData,tpl){
    //model-sku属性选择
    var selectSkuAttrModel = Backbone.Model.extend({
        //sku列表初始化属性[attributes]
        defaults: function() {
            return {
                //产品属性组
                attrGroups: [{
                   //属性组id
                   id: -1,
                   //属性组名称
                   name: '',
                   //属性组中的属性值列表
                   attrs: [{
                        //属性值id
                        id: -1,
                        //属性值名称
                        name: '',
                        //属性图片地址
                        imgUrl: ''
                   }]
                }],
                //sku列表
                skus:{
                    "1001_1002": {
                        //skuId
                        id: '',
                        //skuMd5
                        Md5: '',
                        //sku库存国家id
                        inventoryCountryId: '',
                        inventoryQuantity: '',
                        maxPurchaseQuantity: '',
                        //sku价格区间
                        priceRanges: [{
                            //购买数量下限
                            numLowerLimit: -1,
                            //购买数量上限
                            numUpperLimit: -1,
                            //购买数量区间对应的原价
                            originalPrice: -1,
                            //购买数量区间对应的折扣价格
                            discountPrice: -1
                        }]
                    }
                }
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
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {};
            $.extend(true, this.options, options||{});
        }
    });

    //view-sku属性选择
    var selectSkuAttrView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-skuClick': 'selectSku'
        },
        //初始化入口
        initialize: function(options){
            //配置对象初始化
            this.setOptions(options);
            this.cJSelectSkuAttrOption = this.options.cJSelectSkuAttrOption;
            this.cJSkuAttr = this.options.cJSkuAttr;
            this.cJSkuClick = this.options.cJSkuClick;
            this.cCurrent = this.options.cCurrent;
            this.cDisabled = this.options.cDisabled;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.productAttrPopuInstance = this.options.productAttrPopuInstance;
            this.priceRangeInstance = this.options.priceRangeInstance;
            
            //初始化$dom对象
            this.initElement();
            //绘制页面
            this.render(this.model.attributes);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //属性组列表外层包裹容器
                cJSelectSkuAttrOption: '.j-selectSkuAttrOption',
                //属性值外层包裹容器
                cJSkuAttr: '.j-skuAttr',
                //属性值点击事件选择器
                cJSkuClick: 'j-skuClick',
                //当前选中属性值样式
                cCurrent: 'current',
                //属性值不可点击样式
                cDisabled: 'disabled',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new selectSkuAttrModel(options.skuData),
                //productAttrPopup的实例对象
                productAttrPopuInstance: null,
                //PriceRange的实例对象
                priceRangeInstance: null
            };
            $.extend(true, this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$cJSelectSkuAttrOption = this.$cJSelectSkuAttrOption||$(this.cJSelectSkuAttrOption);
            this.$cJSkuAttr = $(this.cJSkuAttr);
        },
        //页面整体渲染
        render: function(data) {
            //初始化SKU产品属性
            this.renderSelectSkuAttr(data);
            //重新初始化$dom对象
            this.initElement();
            //初始化SKU属性可选状态
            this.initOptionalState(data);
            //获取未选中的属性组名称,并同步到productAttrPopupModel
            this.productAttrPopuInstance.model.trigger('productAttrPopupModel:setAttributeName',this.getAttributeName());
        },
        //sku产品属性渲染
        renderSelectSkuAttr: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //标题模板
                selectSkuAttr = template(tpl.selectSkuAttr.join(''))(data);

            //页面绘制
            this.$cJSelectSkuAttrOption.html(selectSkuAttr);
        },
        //初始化SKU属性可选状态
        initOptionalState: function(data){
            var skuResult = data.skus,
                $cJSkuAttr = this.$cJSkuAttr,
                cJSkuClick = this.cJSkuClick,
                cDisabled = this.cDisabled;

            //禁用没有sku组合的属性值
            $cJSkuAttr.each(function(i,e){
                var $e = $(e),
                    attr_id = $e.attr('attr_id');

                //查找是否含有该属性值的sku组合
                if(!skuResult[attr_id]) {
                    $e.removeClass(cJSkuClick).addClass('disabled');
                }
            });
        },
        //sku属性值排序
        skuAttrValsSort: function(arr) {
            arr.sort(function(a, b){
                return parseInt(a) - parseInt(b);
            });
        },
        //选择sku属性值
        selectSku: function(evt){
            var $cJSelectSkuAttrOption = this.$cJSelectSkuAttrOption,
                $target = $(evt.currentTarget),
                $cJSkuAttr = this.$cJSkuAttr,
                cJSkuClick = this.cJSkuClick,
                cCurrent = this.cCurrent,
                cDisabled = this.cDisabled,
                $currents,
                skuResult = this.model.get('skus'),
                selectedIds = [],
                skuVal;

            //当前属性值状态为已选中则跳出
            if ($target.hasClass(cCurrent)) {
                return;
            }
            
            //添加选中状态
            $target.addClass(cCurrent);
            //移除相邻同辈节点选中状态
            $target.siblings().removeClass(cCurrent);
            
            //获取所有已选中的属性值$dom节点
            $currents = $cJSelectSkuAttrOption.find('.'+cCurrent);
            //sku组合Key值
            $currents.each(function(){
               selectedIds.push($(this).attr('attr_id'));
            });
            //sku属性值排序
            this.skuAttrValsSort(selectedIds);
            
            //变更其他属性值是否可选的状态
            $cJSkuAttr.not($currents).each($.proxy(function(i,e){
                var $e = $(e),
                    //获取相邻选中节点元素
                    selectState = $e.siblings('.'+cCurrent),
                    skuAttrId = [],
                    selectStateAttrId;

                //当前元素所在属性组的选中属性值
                selectStateAttrId = selectState.attr('attr_id');
                /**
                 * selectedIds：已选择出的sku属性值组合；
                 * selectStateAttrId：当前元素所在属性组选中的属性值；
                 * skuAttrId: 待验证的属性值组合，它的值为从selectedIds中排除掉selectStateAttrId；
                **/
                for(var i = 0, len = selectedIds.length; i < len; i++) {
                    if (selectedIds[i] !== selectStateAttrId) {
                        skuAttrId.push(selectedIds[i]);
                    }
                }
                skuAttrId = skuAttrId.concat($e.attr('attr_id'));
                
                //属性值排序
                this.skuAttrValsSort(skuAttrId);
                //属性值组合不存在
                if(!skuResult[skuAttrId.join('_')]) {
                    $e.removeClass(cJSkuClick).addClass(cDisabled);
                //反之
                } else {
                    $e.addClass(cJSkuClick).removeClass(cDisabled);
                }
            },this));
            //获取当前所有选择的属性值名称，并同步到productAttrPopupModel
            this.productAttrPopuInstance.model.trigger('productAttrPopupModel:selectAttrsName',this.getSelectAttrsName($currents));
            //获取单个sku
            skuVal = skuResult[selectedIds.join('_')];
            //获取未选中的属性组名称,并同步到productAttrPopupModel
            this.productAttrPopuInstance.model.trigger('productAttrPopupModel:setAttributeName',this.getAttributeName());
            //如果拿到一个正确的sku组合则同步到[productAttrPopupModel/PriceRangeModel]
            if (_.isObject(skuVal)) {
                //同步模型数据到productAttrPopupModel
                this.productAttrPopuInstance.model.trigger('productAttrPopupModel:getSelectSkuAttrModelData', {
                    Md5: skuVal.Md5,
                    id: skuVal.id,
                    inventoryQuantity: skuVal.inventoryQuantity,
                    maxPurchaseQuantity: skuVal.maxPurchaseQuantity,
                    inventoryCountryId: skuVal.inventoryCountryId
                });
                //同步模型数据到PriceRangeModel
                this.priceRangeInstance.model.trigger('PriceRangeModel:setSelectSkuAttrModelData', {
                    priceRanges: skuVal.priceRanges,
                    inventoryQuantity: skuVal.inventoryQuantity,
                    maxPurchaseQuantity: skuVal.maxPurchaseQuantity,
                    Md5: skuVal.Md5
                });

               //自定义更新购买数量的数据
               this.priceRangeInstance.model.trigger('PriceRangeModel:setQuantity', this.priceRangeInstance.model.get('minOrder'));
            }
        },
        //获取当前所有选择属性值的名称
        getSelectAttrsName: function($eles){
            var arr = [];
            $eles.each(function(i,e){
                var $e = $(e);
                if($e.find("img").length > 0){
                    arr.push($e.find('img').attr('alt'));
                }else{
                    arr.push($e.text());
                }
            });
            return arr;
        },
        //获取未选择属性组名称
        getAttributeName: function(){
            var arr = [],
                $parent = this.$cJSkuAttr.closest('div[data-name]'),
                cCurrent = this.cCurrent;

            $.each($parent, function(i,ele){
                var $ele = $(ele);
                if ($ele.find('li').hasClass(cCurrent) === false) {
                    arr.push(decodeURIComponent($ele.attr('data-name')));
                }
            });
            
            return arr.join(', ');
        },
    });

    return selectSkuAttrView;
});