/**
 * module src: youmylike/youmylike.js
 * 猜你喜欢专区推荐模块
**/
define('app/youmylike', ['common/config', 'lib/backbone', 'appTpl/youmylikeTpl'], function(CONFIG, Backbone, tpl){
    //model-猜你喜欢专区推荐
    var youmylikeModel = Backbone.Model.extend({
        //猜你喜欢专区商品属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //区块标题
                blockTit: '',
                //产品列表
                list: [{
                    //产品标题
                    title: '',
                    //产品价格
                    price: 0,
                    //产品图片地址
                    imageUrl: '',
                    //产品链接
                    url: '',
                    //促销类型
                    promoType: '',
                    //折扣率|直降额
                    discount: '',
                    //产品数量单位（piece/lot）
                    measure: '',
                    //币种
                    curreny: ''
                }]
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
            this.blockTit = this.options.blockTit;
            this.pageNum = this.options.pageNum;
            this.pageTotal = this.options.pageTotal;
            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            //提供给youmylikeView的增加当前页数事件
            this.on('youmylikeModel:addPageNum', this.addPageNum, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: '/mobileApiWeb/search-Recommend-getRecomByLike.do',
                    data: {
                        //通用参数
                        client: 'wap',
                        version: '3.3',
                        //当前页数
                        pageNum: 1,
                        //每页产品数量
                        pageSize: 20,
                        //itemcode-最终页传当前产品，首页和列表页传最近3个浏览过的产品
                        itemID: '',
                        //最新一个产品的底级类目号
                        category: '',
                        //搜索关键词（srp页需要提供）
                        keyword: '',
                        //页面类型[Home|Srp|Item|YmlMore]
                        pageType: 'YmlMore'
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
                },
                //区块标题
                blockTit: 'You May Like',
                //当前页数
                pageNum: 1,
                //总页数
                pageTotal: 1
            };
            $.extend(true, this.options, options||{});
        },
        //设置生成模型的url
        urlRoot: function() {
            return CONFIG.wwwURL + this.ajaxOptions.url;
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
            obj.blockTit = this.blockTit;
            //当前页数
            obj.pageNum = this.pageNum;
            //产品列表
            obj.list = [];

            if (obj.code !== -1) {
                $.each(res.data.resultList, function(index, product){
                    var __obj = {};
                    __obj.title = product.title;
                    __obj.price = product.discountPrice||product.originalPrice;
                    __obj.imageUrl = product.imgUrl;
                    __obj.url = '/product/'+product.seoName+'/'+product.itemCode+'.html'+(('#'+product.D1Tag)||'');
                    __obj.promoType = self.getPromoType(product.promoType);
                    __obj.discount = product.discountRate||0;
                    __obj.measure = product.measure;
                    __obj.curreny = res.data.currencyText;
                    obj.list.push(__obj);
                });
                //总页数
                this.pageTotal = res.data.page.totalPage;
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     //区块标题
             *     blockTit: '',
             *     //总页数
             *     totalPage: 0
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
             *             promoType: ''
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
        //增加当前页数
        addPageNum: function() {
            var pageNum = this.pageNum,
                pageTotal = this.pageTotal;
            //判断当前页数是否大于总页数，否则增加当前页数
            this.pageNum = pageNum <= pageTotal ? ++pageNum : pageNum;
        }
    });

    //view-猜你喜欢专区推荐
    var youmylikeView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {},
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cYmlikeWarp = this.options.cYmlikeWarp;
            this.cFooter = this.options.cFooter;
            this.cLoading = this.options.cLoading;
            this.cHide = this.options.cHide;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.timer = null;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取业务数据
            this.model.fetch();
        },
        //$dom对象初始化
        initElement: function() {
            this.$window = $(window);
            this.$body = $('body');
            this.$cFooter = $(this.cFooter);
            this.$cYmlikeWarp = $(this.cYmlikeWarp);
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //绑定分页事件
            this.$window.on('scroll', $.proxy(this.paging, this));
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //外层包裹容器
                cYmlikeWarp: '.j-ymlike-warp',
                //footer的外层包裹容器
                cFooter: '.footer',
                //loading外层包裹容器的className
                cLoading: '.j-pro-load',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new youmylikeModel()
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            //200：正常状态
            if (model.get('code')===200) {
                //初始化渲染页面
                if (!this.first) {
                    //初始化渲染
                    this.render(model.attributes);
                    //标记已完成初始化渲染
                    this.first = true;
                //专区推荐产品列表渲染
                } else {
                    this.renderYmlikeProducts(model.attributes);
                }

                //增加当前页数
                this.model.trigger('youmylikeModel:addPageNum');

            //-1：数据异常情况处理
            } else {
                try{throw('success(): data is wrong');}catch(e){
                    alert('Data is wrong.');
                }
            }
        },
        //拉取数据失败回调
        error: function() {
            try{throw('error(): request is wrong');}catch(e){
                alert('Network anomaly.');
            }
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
            this.$cYmlikeWarp.html(main);
        },
        //产品列表渲染
        renderYmlikeProducts: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //产品列表模板
                products = template(tpl.products.join(''))(data),
                //外层包裹容器
                $warp = this.$cYmlikeWarp,
                //loading
                cLoading = this.cLoading;

            //移除loading状态
            $warp.find(cLoading).remove();
            //页面绘制
            $warp.find('ul').append(products);
        },
        //滑动分页
        paging: function() {
                //外层包裹容器$dom
            var $warp = this.$cYmlikeWarp,
                //数据模型：youmylikeModel
                model = this.model,
                //loading模板
                loading = this.tpl.loading.join(''),
                //当前页数
                pageNum = model.pageNum,
                //总页数
                pageTotal = model.pageTotal,
                //可视区域的高度
                wHeight = this.$window.height(),
                //滚动条距离顶部的高度
                tScrollHeight = this.$window.scrollTop(),
                //页面高度
                bHeight = this.$body.height(),
                //footer的高度
                fHeight = this.$cFooter.height();

            //清除定时器
            if (this.timer) {
                clearTimeout(this.timer);
            }

            //控制是否进行翻页
            if (bHeight-(tScrollHeight+wHeight) > (660+fHeight)) {
                return;
            }

             //避免重复执行，延迟100毫秒
            this.timer = setTimeout((function(self){
                return function() {
                    //查看当前是否为拉取数据的状态
                    if ($warp.find(self.cLoading).length !== 0) {
                        return;
                    }

                    //查看是否达到最大页数
                    if (pageNum > pageTotal) {
                        //注销翻页事件
                        self.$window.unbind('scroll');
                        return;
                    }

                    //拉取对应页数产品数据
                    model.fetch({data:{pageNum: pageNum}});

                    //修改为拉取数据的状态
                    $warp.append(loading);
                };
            }(this)), 100);
        }
    });

    return youmylikeView;
});