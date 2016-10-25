/**
 * module src: common/detail/recommended.js
 * 个性化推荐模块
**/
define('common/detail/recommended', ['common/config','tpl/detail/recommendedTpl','checkoutflow/dataErrorLog'], function(CONFIG,tpl,dataErrorLog){
    //model-个性化推荐
    var recommendedtModel = Backbone.Model.extend({
        //个性化推荐列表初始化属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                list:[{
                    //产品链接地址
                    url: '',
                    //产品图片地址
                    imageUrl: '',
                    //促销类型
                    promoType: '',
                    //折扣率|直降额
                    discount: '',
                    //产品价格
                    price: -1,
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
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: '/mobileApiWeb/search-Recommend-getItems.do',
                    //url: 'getItems.json',
                    data: {
                        version: '3.3',
                        client: 'wap',
                        pageNum:1,
                        pageSize: 16,
                        type: 2,
                        source: 1
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
            return CONFIG.wwwURL + this.ajaxOptions.url;
            //return this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            //请求异常的时候“dataErrorLog”会捕获“__params”
            this.__params = $.extend(true, {}, this.ajaxOptions, options||{});
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
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
            /**
             * 个性化推荐不展示以下促销类型
            **/
            ////VIP
            //} else if (promoType==='20') {
            //    type = '3';
            ////VIP打折
            //} else if (promoType==='30') {
            //    type = '4';
            ////VIP直降
            //} else if (promoType === '40') {
            //    type = '5';
            ////移动专享打折
            //} else if (promoType === '50') {
            //    type = '6';
            ////移动专享直降
            //} else if (promoType === '60') {
            //    type = '7';
            ////移动专享VIP打折
            //} else if (promoType === '70') {
            //    type = '8';
            ////移动专享VIP直降
            //} else if (promoType === '80') {
            //    type = '9';
            ////APP独享
            //} else if (promoType === '90') {
            //    type = '10';
            ////APP VIP独享
            //} else if (promoType === '100') {
            //    type = '11';
            }

            return type;
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * /mobileApiWeb/search-Recommend-getItems.do
             * 接口文档地址：http://192.168.76.42:8090/pages/viewpage.action?pageId=1572986
             *
             * 原始数据结构
             * {
             *     "data": {
             *         "currencyText": "US $",
             *         "localCurrencyLayout": 0,
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
             *         "resultList": [{
             *             "D1Tag": "cppd-1-9|null:01:1468779788",
             *             "discountPrice": 1.94,
             *             "discountRate": 5,
             *             "imgUrl": "http://www.dhresource.com/0x0/f2/albu/g1/M00/14/D4/rBVaGFYXdyCAP1vDAAK6rdWsC5Y431.jpg",
             *             "itemCode": "258876753",
             *             "lots": "",
             *             "maxPrice": 1.94,
             *             "measure": "Pair",
             *             "minOrder": "10",
             *             "minPrice": 1.48,
             *             "originalPrice": 1.94,
             *             "promoType": "50",
             *             "seoName": "2015-new-classic-brand-letter-m-k-stud-earring",
             *             "supplierId": "ff8080814ed09a89014f9a734c966c0d",
             *             "title": "2016 New Classic Brand English Letter Stud Earring Bling Bling Round Shaped Crystal Rhinestone Earrings",
             *             "unit": "Pair",
             *             "uuid": "1468779788"
             *         }]
             *     },
             *     //调用接口返回成功或错误的信息
             *     "message":"Success",
             *     //服务器时间
             *     "serverTime":1444460214692,
             *     //状态码
             *     "state":"0x0000"
             * }
            **/
            var obj = {};
                self = this;
            obj.code = res.state==='0x0000'?200:-1;
            obj.list = [];
            if (obj.code !== -1) {
                //产品列表
                $.each(res.data.resultList||[], function(index, product){
                    var __obj = {};
                    //产品链接地址
                    __obj.url = CONFIG.wwwURL + '/product/'+product.seoName+'/'+product.itemCode+'.html'+'#'+product.D1Tag;
                    //产品图片地址
                    __obj.imageUrl = product.imgUrl;
                    //促销类型
                    __obj.promoType = self.getPromoType(product.promoType);
                    //折扣率|直降额
                    __obj.discount = product.discountRate||-1;
                    //产品价格
                    __obj.price = __obj.promoType!=='-1'?product.discountPrice:product.maxPrice;
                    //币种
                    __obj.curreny = res.data.currencyText;
                    obj.list.push(__obj);
                });
            }
            
            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     //产品列表
             *     list: [{
             *         url: '',
             *         imageUrl: '',
             *         promoType: '',
             *         discount: '',
             *         price: 0,
             *         curreny: ''
             *     }]
             * }
            **/
            return obj;
        }
    });

    //view-个性化推荐
    var recommendedView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-recommended-more': 'showMore'
        },
        //初始化入口
        initialize: function(options){
            //配置对象初始化
            this.setOptions(options);
            this.cRecommendedProducts = this.options.cRecommendedProducts;
            this.cJRecommendedMore = this.options.cJRecommendedMore;
            this.cHide = this.options.cHide;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取产品数据
            this.model.fetch({data: {
                pageType: this.options.pageType,
                itemID: this.options.itemCode,
                category: this.options.cateDispId
            }});
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //个性化推荐外层包裹容器
                cRecommendedProducts:'.j-recommended-products',
                //个性化推荐loadMore按钮
                cJRecommendedMore:'.j-recommended-more',
                //页面类型
                pageType: '',
                //产品编号
                itemCode: -1,
                //底级类目号
                cateDispId: '',
                //控制个性化推荐展示隐藏的className
                cHide: 'dhm-hide',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new recommendedtModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$cRecommendedProducts = $(this.cRecommendedProducts);
            this.$cJRecommendedMore = $(this.cJRecommendedMore);
        },
        //事件初始化
        initEvent: function() {
             //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                //查看是否存在个性化推荐产品
                if (model.get('list').length > 0) {
                    this.render(model.attributes);
                }
            }else {
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
        //页面整体渲染
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
                products = template(tpl.products.join(''))(data),
                //查看更多模板
                recommendedMore = template(tpl.recommendedMore.join(''))(data);
            
            main = main.replace(/\{\{title\}\}/, title)
                   .replace(/\{\{products\}\}/, products)
                   .replace(/\{\{recommendedMore\}\}/, recommendedMore);

            //页面绘制        
            this.$cRecommendedProducts.html(main).removeClass(this.cHide);
        },
        //点击展示更多产品
        showMore: function(e){
            var $e = $(e.currentTarget),
                cHide = this.cHide,
                $hideGroups = this.$cRecommendedProducts.find('ul[class="'+this.cHide+'"]');

            //删除showMore按钮
            $e.remove();
            //加载剩余的产品图片
            this.loadImg($hideGroups);
            //展示剩余的产品
            $hideGroups.removeClass(cHide);
        },
        //动态加载图片
        loadImg: function($hideGroups){
            //遍历所有隐藏的产品组（2个产品为一组）
            $.each($hideGroups, function(i, hideGroup){
                //遍历每组中的产品
                $.each($(hideGroup).find('div[data-original]'), function(j, imgWarp){
                    //图片外层包裹容器
                    var $imgWarp = $(imgWarp);
                    //加载对应的图片
                    $(imgWarp).html('<img src="'+$imgWarp.attr('data-original')+'" />').removeAttr('data-original');
                })
                
            });
        }
    });
    
    return recommendedView;
});