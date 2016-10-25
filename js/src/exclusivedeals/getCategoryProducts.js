/**
 * module src: exclusivedeals/getCategoryProducts.js
 * 移动专享价专区类目推荐产品列表模块
**/
define('app/getCategoryProducts', ['common/config'], function(CONFIG){
    var GetCategoryProducts = function() {
        //自定义事件对象
        this.events = $({});
        //初始化事件
        this.initElement();
    };

    //注册静态属性和方法
    $.extend(GetCategoryProducts, {
        init: function(){
            return new GetCategoryProducts();
        }
    });

    //注册原型属性和方法
    $.extend(GetCategoryProducts.prototype, {
        //事件初始化
        initElement: function() {
            this.events.on('GetCategoryProducts:fetch', $.proxy(this.fetch, this));
        },
        //获取接口所需参数
        getParams: function(options) {
            var obj = {};
            //通用参数
            obj.client = 'wap';
            obj.version = '3.3';
            //类目Id
            obj.categoryId = options.categoryId;
            //语种
            obj.language = options.language;
            //当前页数
            obj.pageNum = options.pageNum;
            //每页产品数量
            obj.pageSize = options.pageSize;

            return obj;
        },
        //拉取类目推荐产品数据
        fetch: function() {
                //arguments（实参）
                //[
                //    0：事件对象,
                //    1：自定义配置对象
                //]
            var options = arguments[1];

            $.ajax({
                type: 'GET',
                url: CONFIG.wwwURL + '/mobileApiWeb/promo-AppExcDeals-getAppExcDeals.do',
                //url: 'promo-AppExcDeals-getAppExcDeals.do',
                data: this.getParams(options),
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        this.parse($.extend(options, {data: res.data, code: 200}));
                    } else {
                        this.parse($.extend(options, {code: -1}));
                    }
                },
                error: function() {
                    if(confirm("Please try again.")) {
                        window.location.reload();
                    }
                }
            });
        },
        //数据格式化
        parse: function(options) {
            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * /mobileApiWeb/promo-AppExcDeals-getAppExcDeals.do
             * 接口文档地址：https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=28344335
             *
             * 原始数据结构
             * {
             *     "data": {
             *         //产品列表
             *         "itemList": [{
             *              //产品itemcode
             *              "productno": "256428045",
             *              //产品链接地址
             *              "produrl": "/product/510-silicone-mouthpiece-cover-drip-tip-disposable/256428045.html",
             *              //产品图片地址
             *              "imgurl": "http://www.dhresource.com/260x260/f2/albu/g3/M00/06/E3/rBVaHFX5QdOATFvyAAUbi7eFPKY980.jpg",
             *              //单位
             *              "measure": "piece",
             *              //价格区间
             *              "finalPrice": "US $5.31 - 6.98",
             *              //产品参加的活动类型：
             *              //[
             *              //    1：移动专享非促销（wap专用）
             *              //    2：移动专享&促销
             *              //    3：vip+移动专享非促销（wap专用）
             *              //    4：移动专享+vip+促销]
             *              //]
             *              "itemType": "1",
             *              //折扣率
             *              "discount": "$80",
             *              //产品促销类型：
             *              //[
             *              //    0：打折
             *              //    10：直降
             *              //]
             *             "promoType": "0"
             *         }],
             *         //产品总数
             *         totalRecord: 88
             *     },
             *     //调用接口返回成功或错误的信息
             *     "message":"Success",
             *     //服务器时间
             *     "serverTime":1444460214692,
             *     //状态码
             *     "state":"0x0000"
             * }
            **/
            var obj = {},
                //当前类目页数产品集合索引（类目Id+当前页数）
                categoryIndex = options.categoryId+'-'+options.pageNum;
            
            //当前类目产品列表页数
            obj.pageNum = options.pageNum;
            
            if ((obj.code = options.code) !== -1) {
                //当前类目产品列表总页数
                obj[options.categoryId+'-'+'pageTotal'] = Math.ceil(options.data.totalRecord/options.model.pageSize);
                //当前类目下指定页数的产品集合
                obj[categoryIndex] = [];
                
                //类目推荐产品列表
                $.each(options.data.itemList,function(index, product){
                    var __obj = {};
                    //产品链接地址
                    __obj.url = CONFIG.wwwURL + product.produrl;
                    //产品图片地址
                    __obj.imageUrl = product.imgurl;
                    //产品数量单位（piece/lot）
                    __obj.measure = product.measure;
                    //币种
                    __obj.curreny = options.model.getCurreny(product.finalPrice);
                    //产品价格区间
                    __obj.prices = options.model.getPriceRange(product.finalPrice);
                    //产品促销类型
                    __obj.promoType = options.model.getPromoType({itemType:product.itemType, promoType:product.promoType});
                    //折扣率
                    __obj.discount = options.model.getDiscount(product.discount);
                    //类目Id
                    __obj.categoryId = options.categoryId;
                    //当前页数
                    __obj.pageNum = options.pageNum;
                    //写入数据
                    obj[categoryIndex].push(__obj);
                });
            }
            
            /**
             * 最终将其格式化为：
             * {
             *     '011-pageTotal': 8,
             *     '011-1': [{
             *         url: '',
             *         imageUrl: '',
             *         measure: '',
             *         curreny: '',
             *         prices: '',
             *         promoType: '',
             *         discount: ''
             *     }]
             * }
            **/

            //执行回调
            options.callback(obj);
        }
    });

    return GetCategoryProducts.init();
});