/**
 * module src: common/recommend/youMyLike.js
 * 猜你喜欢推荐模块
**/
//alert(11111)
define('common/recommend/youMyLike', ['common/config', 'tpl/recommend/youMyLikeTpl', 'lib/underscore'], function(CONFIG, tpl, _){
    //构造函数
    var YouMyLike = function(options) {
        //初始化配置对象
        this.setOptions(options);
        this.el = this.options.el;
        this.title = this.options.title;
        this.trackingPrefix = this.options.trackingPrefix;
        this.url = this.options.api.url;
        this.param = this.options.api.param;
        this.template = this.options.template;
        this.tpl = this.options.tpl;
        this.cHide = this.options.cHide;

        //初始化$dom对象
        this.initElement();
        //拉取业务数据
        this.fetch();
    };

    //注册静态属性与方法
    $.extend(YouMyLike,{
        init: function(options) {
            return new YouMyLike(options);
        }
    });

    //注册原型属性与方法
    $.extend(YouMyLike.prototype,{
        setOptions: function(options) {
            this.options = {
                //根节点
                el: '.j-recommend-view1',
                //区块标题
                title: '',
                //跟踪码标识前缀
                trackingPrefix: '',
                //数据接口
                api: {
                    //地址
                    url: CONFIG.wwwURL + '/mobileApiWeb/search-Recommend-getRecomByLike.do',
                    //url: 'search-Recommend-getRecomByLike.do',
                    //url: '/api.php?jsApiUrl=http://m.dhgate.com/mobileApiWeb/search-Recommend-getRecomByLike.do',
                    //参数
                    param: {
                        //通用参数
                        client: 'wap',
                        version: '3.3',
                        //当前页数
                        pageNum: 1,
                        //每页产品数量
                        pageSize: 16,
                        //itemcode-最终页传当前产品，首页和列表页传最近3个浏览过的产品
                        itemID: '',
                        //最新一个产品的底级类目号
                        category: '',
                        //搜索关键词（srp页需要提供）
                        keyword: '',
                        //页面类型[Home|Srp|Item|YmlMore]
                        pageType: ''
                    }
                },
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //控制区块内容展示的className
                cHide: 'dhm-hide'
            };
            $.extend(true, this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$el = $(this.el);
        },
        //拉取数据
        fetch: function() {

            $.ajax({
                type: 'GET',
                url: this.url,
                async: true,
                cache: false,
                dataType: 'json',
                data: this.param,
                context: this,
                success: function(res){
                    //alert(res)
                    var data = this.parse(res);
                    if (data.code !== -1) {
                        this.render(data);
                    } else {
                        try{throw('success(): data is wrong');}catch(e){}
                    }
                },
                error: function(){
                    //alert(2555)
                    try{throw('error(): request is wrong');}catch(e){}
                }
            });
        },
        //获取促销类型
        getPromoType: function(promoType) {
                //促销类型：
                //[
                //    1：打折
                //    2：直降
                //    3、VIP
                //    4、VIP打折
                //    5、VIP直降
                //    6、移动专享打折
                //    7、移动专项直降
                //    8、移动专享VIP打折
                //    9、移动专享VIP直降
                //    10、APP独享
                //    11、APPVIP独享
                //]
            var type = '-1';

            //打折
            if (promoType==='0') {
                type = '1';
            //直降
            } else if (promoType==='10') {
                type = '2';
            //VIP
            } else if (promoType==='20') {
                type = '3';
            //VIP打折
            } else if (promoType==='30') {
                type = '4';
            //VIP直降
            } else if (promoType === '40') {
                type = '5';
            //移动专享打折
            } else if (promoType === '50') {
                type = '6';
            //移动专享直降
            } else if (promoType === '60') {
                type = '7';
            //移动专享VIP打折
            } else if (promoType === '70') {
                type = '8';
            //移动专享VIP直降
            } else if (promoType === '80') {
                type = '9';
            //APP独享
            } else if (promoType === '90') {
                type = '10';
            //APP VIP独享
            } else if (promoType === '100') {
                type = '11';
            }

            return type;
        },
        //server原始数据处理
        parse: function(res) {
            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * /mobileApiWeb/search-Recommend-getRecomByLike.do
             * 接口文档地址：https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=29392914
             *
             * 原始数据结构
             * {
             *     "data": {
             *         //货币类型
             *         "currencyText": "US $",
             *         //分页信息
             *         "page": {
             *             "currentRecord": 1,
             *             "endNo": 16,
             *             "nextPageNo": 1,
             *             "pageNum": 1,
             *             "pageSize": 16,
             *             "pages": 1,
             *             "prePageNo": 1,
             *             "startNo": 1,
             *             "totalPage": 1,
             *             "totalRecord": 16
             *         },
             *         //产品列表
             *         "resultList": [
             *             {
             *                 //D1推荐曝光打标
             *                 D1Tag: "mhp1601-inby-1-3|null:null:1555009816",
             *                 //促销价格
             *                 "discountPrice": "2.64",
             *                 //则扣率|直降额
             *                 "discountRate": 5,
             *                 //产品图片地址
             *                 "imgUrl": "http://www.dhresource.com/600x600/f2/albu/g2/M01/2D/2B/rBVaGlQ7m4SAco5KAAC1IWQvGsE009.jpg",
             *                 //产品id
             *                 "itemCode": "206996950",
             *                 //最大价
             *                 "maxPrice": 2.78,
             *                 //最小价
             *                 "minPrice": 2.57,
             *                 //原价
             *                 "originalPrice": 2.64,
             *                 //促销类型
             *                 "promoType": "1",
             *                 //SEO
             *                 "seoName": "fine-decor-wallpaper-roll-modern-natural",
             *                 //卖家Id
             *                 "supplierId": "ff80808131adf1ce0131bdedbf443213",
             *                 //产品标题
             *                 "title": "Wholesale - Fine decor wallpaper roll Modern natural rustic grey/red Brick stone wall wallpaper hotel background wall decor pvc wallpaper",
             *                 //最小起订量
             *                 "minOrder": 7,
             *                 //打包卖
             *                 "lots": "7Piece / Lot",
             *                 //计量单位
             *                 "measure": "Piece"
             *             }
             *         ]
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
                self = this;

            //状态码
            obj.code = (res.state==='0x0000'?200:-1);
            //区块标题
            obj.blockTit = this.title;
            //跟踪码标识前缀
            obj.trackingPrefix = this.trackingPrefix;
            //产品列表
            obj.list = [];

            if (obj.code !== -1) {
                $.each(res.data.resultList, function(index, product){
                    var __obj = {};
                    __obj.title = product.title;
                    __obj.price = product.discountPrice||product.originalPrice;
                    __obj.imageUrl = product.imgUrl;
                    __obj.url = CONFIG.wwwURL + '/product/'+product.seoName+'/'+product.itemCode+'.html'+(('#'+product.D1Tag)||'');
                    __obj.promoType = self.getPromoType(product.promoType);
                    __obj.discount = product.discountRate||0;
                    __obj.measure = product.measure;
                    __obj.curreny = res.data.currencyText;
                    obj.list.push(__obj);
                });
            }

            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     //区块标题
             *     blockTit: '',
             *     //产品列表
             *     list: [
             *         {
             *             //产品标题
             *             title: '',
             *             //产品价格
             *             price: 0,
             *             //产品图片地址
             *             imageUrl: '',
             *             //产品链接
             *             url: '',
             *             //促销类型
             *             promoType: '',
             *             //折扣率|直降额
             *             discount: '',
             *             //产品数量单位（piece/lot）
             *             measure: '',
             *             //币种
             *             curreny: ''
             *         }
             *     ]
             * }
            **/
            return obj;
        },
        //数据渲染
        render: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //主体内容模板
                main = template(tpl.main.join(''))(data),
                //标题模板
                title = template(tpl.title.join(''))(data),
                //产品列表模板
                products = template(tpl.products.join(''))(data);
            
            main = main.replace(/\{\{title\}\}/, title)
                   .replace(/\{\{products\}\}/, products);

            //页面绘制
            this.$el[0]&&this.$el.html(main).removeClass(this.cHide);
        }
    });

    return YouMyLike;
});