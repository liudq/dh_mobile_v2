/**
 * Created by liudongqing on 2015/11/11.
 */
/*
* module src:storeShop/storeList.js
* 店铺橱窗商品信息模块
* */
define('app/storeList',['common/config', 'lib/backbone', 'appTpl/storeListTpl','app/allProducts'],function(CONFIG, Backbone, tpl,AllProducts){
    //model 店铺橱窗商品信息
    var storeListModel = Backbone.Model.extend({
        //店铺橱窗商品初始化属性[attributes]
        defaults:function(){
            return {
                //状态码
                code: 200,
                list:[{
                    displayWinName:'',//橱窗名称
                    itemWinList:[{
                        itemImgUrl:'',
                        itemName:'',//商品名称
                        itemcode:'',
                        maxPrice:'',//最大值
                        minPrice:'',//最小值
                        isfreeShipping:'',//是否免运费
                        measureName:'',//EN单位
                        minOrder:'',//最小起订量
                        soldNum:'',//已经售出数量
                        seoItemName:'',
                        type:'',//1.原价  2.促销  3.移动专享非促销 4.移动专享&促销（wap取原价）
                        itemWinPromoDto:[{
                            discountRate:'',//折扣率      促销和vip的
                            dynamicType:'',//元素类型    0：固定标识  1：动态标识  2：固定图片（待确认）
                            promoTypeId:'',//0是折扣，10是直降
                            promoclass:''
                        }]
                    }]
                }]
            }
        },
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions:function(options){
            this.options = {
                ajaxOptions:{
                    url:'/mobileApiWeb/store-Store-getDisplayWinList.do',
                    //url: '/api.php?jsApiUrl=' + 'http://m.dhgate.com/mobileApiWeb/store-Store-getDisplayWinList.do',
                    data:{
                       //通用接口参数
                        client:'wap'
                       // supplierseq:''
                    },
                    type:'GET',
                    dataType:'json',
                    async:true,
                    cache:false,
                    processData:true
                }
            };
            $.extend(true,this.options,options||{});
        },
        //设置生成模型的url
        urlRoot: function() {
            return this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },

        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * mobileApiWeb/store-Store-getDisplayWinList.do
             * 接口文档地址：https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=24248327
             *
             * 原始数据结构
             {
                        "data": [{
                            "displayWinName": "Hot Items",
                            "itemWinDtos": [{
                                "itemImgUrl": "http://www.dhresource.com/260x260/f2/albu/g1/M01/B1/C7/rBVaGVWeD1GAR62zAAD49a7fGhQ663.jpg",
                                "itemName": "Wholesale 6 Big Hero Key Chains Plastic Cement Baymax Key Rings Christmas Gifts For Kids Toys S2021",
                                "itemcode": "246310240",
                                "minPrice": 0.55,
                                "maxPrice": 0.68,
                                "isfreeShipping": true,
                                "measureName": "Piece",
                                "minOrder": 50,
                                "soldNum": 50,
                                "seoItemName": "wholesale-6-big-hero-key-chains-plastic-cement",
                                "type": 1,     //1.原价  2.促销  3.移动专享非促销 4.移动专享&促销
                                "itemWinPromoDto": {
                                    "discountRate": 10,
                                    "dynamicType": 1,
                                    "promoTypeId": 0,
                                    "promoclass": "off-ico2"
                                }
                            }]
                        }]
                        "message": "Success",
                        "serverTime": 1447229951291,
                        "state": "0x0000"
                    }
             */
            var obj = {},
                expireYear = (new Date(res.serverTime)).getFullYear().toString();
            obj.code = (res.state==='0x0000'?200:-1);
           // obj.category = [];
            obj.list =[];
            if (obj.code !== -1) {
                //初始接口里面传过来的橱窗商品list分类
                if(res.data){
                    $.each(res.data,function(index,pro){
                        var __obj = {};
                        __obj.displayWinName = pro.displayWinName;
                        __obj.itemWinList = [];
                        $.each(pro.itemWinList,function(index,pro){
                            var __obj2 = {};
                            __obj2.isfreeShipping = pro.isfreeShipping;
                            __obj2.itemImgUrl = pro.itemImgUrl;
                            __obj2.itemName = pro.itemName;
                            __obj2.itemcode = pro.itemcode;
                            __obj2.maxPrice = pro.maxPrice;
                            __obj2.minPrice = pro.minPrice;
                            __obj2.minOrder = pro.minOrder;
                            __obj2.measureName = pro.measureName;
                            __obj2.seoItemName = pro.seoItemName;
                            __obj2.soldNum = pro.soldNum;
                            __obj2.type = pro.type;
                            __obj2.itemWinPromoDto = {};
                            if(pro.type === 2 || pro.type === 4){
                                __obj2.itemWinPromoDto.discountRate = pro.itemWinPromoDto.discountRate;
                                __obj2.itemWinPromoDto.dynamicType = pro.itemWinPromoDto.dynamicType;
                                __obj2.itemWinPromoDto.promoTypeId = pro.itemWinPromoDto.promoTypeId;
                                __obj2.itemWinPromoDto.promoclass = pro.itemWinPromoDto.promoclass;
                            }

                            __obj2.productUrl = 'http://m.dhgate.com/product/' + pro.seoItemName + '/' + pro.itemcode + '.html#st-storehome-' + (index + 1) + '-null';
                            __obj.itemWinList.push(__obj2);
                        });
                        obj.list.push(__obj);
                    })
                };


                obj.serverTime = res.serverTime*1;
            }
            return obj;
        }
    });
    //view 店铺基本信息初始化
    var storeListView = Backbone.View.extend({
        //根节点
        el:'body',
        events:{
            'click .swiper-slide':'changeStoreCats',
            'click #j-all-products':'changeAllProducts'
        },

        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.lStoreProductsTab = this.options.lStoreProductsTab;
            this.lAllProductsTab = this.options.lAllProductsTab;
            this.lStoreTabWrap = this.options.lStoreTabWrap;
            this.lStoreListWrap = this.options.lStoreListWrap;
            this.lAllListWrap = this.options.lAllListWrap;
            this.lAllContents = this.options.lAllContents;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.successCallback = this.options.successCallback;
            this.lazyloadCallback = this.options.lazyloadCallback;


            //初始化$dom对象
            this.initElement();
            //拉取业务数据 data参数中的supplierseq
            this.model.fetch({data:this.getParams()});
            //初始化事件
            this.initEvent();
        },

        //$dom对象初始化
        initElement: function() {
            this.$lStoreProductsTab = this.$lStoreProductsTab || $(this.lStoreProductsTab);
            this.$lAllProductsTab = this.$lAllProductsTab || $(this.lAllProductsTab);
            this.$lStoreTabWrap = this.$lStoreTabWrap || $(this.lStoreTabWrap);
            this.$lStoreListWrap = this.$lStoreListWrap || $(this.lStoreListWrap);
            this.$lAllListWrap = this.$lAllListWrap || $(this.lAllListWrap);
            this.$lAllContents = this.$lAllContents || $(this.lAllContents);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                lStoreProductsTab:'#j-store-products',
                lAllProductsTab:'#j-all-products',
                lStoreTabWrap:'.storeTab ul',
                lStoreListWrap:'.j-store-list',
                lAllListWrap:'.all-list',
                lAllContents:'.allContent',
                sAllContentWrap:'#j-all-content',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new storeListModel(),
                //success()对外成功时的回调
                successCallback: $.noop,
                //图片懒加载接口
                lazyloadCallback: $.noop
            };
            $.extend(true, this.options, options||{});
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            this.resizeWindow;
        },
        success:function(model,response,options){
            if(model.get('code') === 200){
               this.render(model.attributes);
                this.successCallback(model);
                this.lazyloadCallback(model);
            }
        },
        error: function(){
            try{throw('error(): request is wrong');}catch(e){}
        },
        //获取参数
        getParams:function(){
            var storeNo = window.location.pathname.match(/\d+/g)[0];
            return  $.extend(true, {}, {supplierseq:storeNo});
        },
        //页面整体渲染
        render: function(data) {
            //数据可用则绘制页面
            if (data.code !== -1) {
                this.renderStoreList(data);
                var $defalutCats = this.$lStoreTabWrap.find('li').eq(0);
                var $defaultPros = this.$lStoreListWrap.find('ul').eq(0);
                $defalutCats.addClass('current');
                $defaultPros.removeClass('hide');

            }
        },
        renderStoreList:function(data){
            var template = this.template,
                tpl = this.tpl,
                storeCatogory =template(tpl.storeCategory.join(''))(data),
                storeList = template(tpl.storeList.join(''))(data);
                 this.$lStoreTabWrap.html(storeCatogory);
                 this.$lStoreListWrap.html(storeList);
                 this.calculateSwiperWidth();
        },
        //触发allProducts按钮
        changeAllProducts:function(e){
            this.$lStoreProductsTab.removeClass('current');
            this.$lAllProductsTab.addClass('current');
            this.$lStoreListWrap.find('.loading').remove();
            this.$lStoreTabWrap.addClass('hide').closest('div').css('border-bottom','0px');
            this.$lStoreListWrap.addClass('hide');
            this.$lAllContents.removeClass('hide');
            //如果allproducts中没有请求过，则发起请求
             if(this.$lAllListWrap.find('li').length <= 0) {
                this.$lAllContents.find('.loading').show();
                new AllProducts({
                    lazyloadCallback:function(){
                        $(".all-list .lazy").lazyload();
                    },
                    successCallback:function(){
                        this.$lAllContents.find('.loading').remove();
                    }
                });
            }
        },
        //触发橱窗商品的二级类目之后的动作
        changeStoreCats:function(e){
            var targetLi = $(e.target).parent('li');
            var index = targetLi.index();
            targetLi.removeClass('hide').addClass('current').siblings('li').removeClass('current');
            this.$lStoreListWrap.find('ul').eq(index).removeClass('hide').siblings('ul').addClass('hide');
        },
        //计算
        calculateSwiperWidth:function(){
            if(this.$lStoreTabWrap.find('li').length>0){
                var lis = this.$lStoreTabWrap.find('li');
                var lisWidth = 5;
                $.each(lis,function(index){
                    var $liWidth = $(this).width();
                    lisWidth = lisWidth + $liWidth;
                });
                this.$lStoreTabWrap.css('width',lisWidth+'px');
            }
        },
        //监控屏幕变化
        resizeWindow:function() {
            $(window).on('orientationchange resize', function(){
                this.calculateSwiperWidth;
            });
        }

    });
    return storeListView;
})