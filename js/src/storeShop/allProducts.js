/**
 * Created by liudongqing on 2015/11/11.
 */
/*
* module src:storeShop/allProducts.js
* 全部商品信息模块
* */
define('app/allProducts',['common/config', 'lib/backbone', 'appTpl/allProductsTpl'],function(CONFIG, Backbone, tpl){
    //model 店铺全部商品信息
    var allProductsModel = Backbone.Model.extend({
        //全部商品初始化属性[attributes]
        defaults:function(){
            return {
                //状态码
                code: 200,
                list:{
                    totalRecord:'',//总记录数
                    itemWinDtos:[{
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
                        type:'',//1.原价  2.促销  3.移动专享非促销 4.移动专享&促销（wap取原价）  5.vip ； 3和4对app没影响，取对应的价格和折扣，wap：3只取得价格，4价格+促销
                        itemWinPromoDto:[{
                            discountRate:'',//折扣率      促销和vip的
                            dynamicType:'',//元素类型    0：固定标识  1：动态标识  2：固定图片（待确认）
                            promoTypeId:'',//0是折扣，10是直降
                            promoclass:''
                        }]
                    }]
                }
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
                     url:'http://m.dhgate.com/mobileApiWeb/store-Store-getAllProduct.do',
                    data:{
                      //通用接口参数
                        client:'wap'
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
            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * /mobileApiWeb/store-Store-getAllProduct.do
             * 接口文档地址：https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=24248327
             *
             * 原始数据结构
             {
                "data": {
                    "itemWinDtos": [
                        {
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
                        }
                    ],
                    "totalRecord": 2623
                },
                "message": "Success",
                "serverTime": 1447652943693,
                "state": "0x0000"
            }
             */
            var obj = {},
                expireYear = (new Date(res.serverTime)).getFullYear().toString();
            obj.code = (res.state==='0x0000'?200:-1);

            obj.list ={};
            obj.list.totalRecord = res.data.totalRecord;
            obj.list.itemWinDtos = [];
            if (obj.code !== -1) {
                //初始接口里面传过来的全部商品list分类
                if(res.data.itemWinDtos){
                    $.each(res.data.itemWinDtos,function(index,pro){
                        var __obj = {};
                        __obj.isfreeShipping = pro.isfreeShipping;
                        __obj.type = pro.type;
                        __obj.itemImgUrl = pro.itemImgUrl;
                        __obj.itemName = pro.itemName;
                        __obj.itemWinPromoDto = {};
                        if(pro.type === 2 || pro.type === 4){
                            __obj.itemWinPromoDto.discountRate = pro.itemWinPromoDto.discountRate;
                            __obj.itemWinPromoDto.dynamicType = pro.itemWinPromoDto.dynamicType;
                            __obj.itemWinPromoDto.promoTypeId = pro.itemWinPromoDto.promoTypeId;
                            __obj.itemWinPromoDto.promoclass = pro.itemWinPromoDto.promoclass;
                        }

                        __obj.itemcode = pro.itemcode;
                        __obj.maxPrice = pro.maxPrice;
                        __obj.measureName = pro.measureName;
                        __obj.minOrder = pro.minOrder;
                        __obj.minPrice = pro.minPrice;
                        __obj.seoItemName = pro.seoItemName;
                        __obj.soldNum = pro.soldNum;
                        __obj.productUrl = 'http://m.dhgate.com/product/' + pro.seoItemName + '/' + pro.itemcode + '.html#st-storehome-' + (index + 1) + '-null';

                        obj.list.itemWinDtos.push(__obj);
                    })
                }

                obj.serverTime = res.serverTime*1;
            }
            return obj;
        }
    });
    //view 店铺全部商品初始化
    var allProductsView = Backbone.View.extend({
        //根节点
        el:'body',
        events:{
              'click #j-store-products':'changeStoreList',
              'click .show-more':'showMore'
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
            this.FastClick = this.options.FastClick;
            this.successCallback = this.options.successCallback;
            this.lazyloadCallback = this.options.lazyloadCallback;
            this.showMoreNum = this.options.showMoreNum;
            //初始化$dom对象
            this.initElement();
            //拉取业务数据 data参数
            this.model.fetch({data:this.getParams({pageNum:0})});
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
            this.$totalRecord = this.$totalRecord || $(this.totalRecord);
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
                showMoreNum: 0,
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new allProductsModel(),
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
        },
        success:function(model,response,options){
            if(model.get('code') === 200){
                if(!this.validateStore(!response.data && [])){
                    return;
                };
               this.render(model.attributes);
                this.successCallback(model);
                this.lazyloadCallback(model);
            }
        },
        error: function(){
            try{throw('error(): request is wrong');}catch(e){}
        },
        //获取参数
        getParams:function(options){
            var storeNo = window.location.pathname.match(/\d+/g)[0];
            return  $.extend(true, {}, {supplierseq:storeNo,pageSize:40},options);
        },
        //页面整体渲染
        render: function(data) {
            //数据可用则绘制页面
            if (data.code !== -1) {
                this.renderAllProducts(data);
            }
        },
        renderAllProducts:function(data){
            var template = this.template,
                 tpl = this.tpl,
                 allProducts = template(tpl.allProducts.join(''))(data);
                 this.$lAllListWrap.append(allProducts);

                 var $moreBtn = ['<a class="show-more">Show  More<i></i></a>'];
                 if(this.$lAllContents.find('li').length > 0 && this.$lAllContents.find('a.show-more').length <= 0){
                    this.$lAllListWrap.after($moreBtn.join());
                };
                this.showMoreNum++;
                if(this.showMoreNum*40 >= data.list.totalRecord){
                    $('.show-more').remove();
                    return;
                }
        },
        //切换到store Home
        changeStoreList:function(e){
            this.$lStoreProductsTab.addClass('current');
            this.$lAllProductsTab.removeClass('current');
            this.$lStoreTabWrap.removeClass('hide');
            this.$lStoreListWrap.removeClass('hide');
            this.$lAllContents.addClass('hide');
            this.$lStoreTabWrap.closest('div').css('border-bottom','1px solid #ddd');
        },
        //show more
        showMore:function(evt){
            $('.show-more').css('display','none');
            var $loading = ['<div class="loading"></div>'];
            $('.show-more').hide();
            this.$lAllListWrap.after($loading);
            this.model.fetch({data:this.getParams({pageNum:this.showMoreNum})});//再拉取一次数据
            setTimeout("$('.show-more').css('display','inline-block');",2000);
        },
        //验证是否存在全部商品
        validateStore:function(arr){
            var flag = true;
            if (arr.length < 1) {
                $('.navs').hide();
                $('.j-store-list').hide();
                this.$lAllContents.html('<div style="margin-left: 80px;margin-top:40px;margin-bottom:40px;display:inline-block;">There is no items in this store.</div>');
                flag = false;
            }
            return flag;
        }

    });
    return allProductsView;
})