/**
 * module src: home/youMyLike.js
 * 猜你喜欢的推荐产品模块
**/

define('app/youMyLike', ['common/config', 'lib/backbone', 'appTpl/youMyLikeTpl', 'tools/fastclick'], function(CONFIG, Backbone, tpl, FastClick){
    //model-猜你喜欢的推荐产品
    var YouMyLikeModel = Backbone.Model.extend({
        //推荐产品属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //每日优惠商品列表
                list: [{
                    //图片地址
                    imgUrl: '',
                    //产品地址
                    proUrl: '',
                    //折扣率
                    discountRate:'',
                    //价格
                    price: 0,
                    //是否移动专享活动 ‘1’:是,'0':否
                    appExclusive:'0',
                    //折扣类型
                    discountType: '-1'
                }],
                //判断当前国家的缩写
                countryCur:'en'
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
                    url: '/mobileApiWeb/search-Product-getItems.do',
                    //url: '/api.php?jsApiUrl=http://m.dhgate.com/mobileApiWeb/search-Product-getItems.do',
                    //旧有代码里面需要传递这些参数，具体含义还不是很确定
                    data: {
                        version: 3.3,
                        client: 'wap',
                        pageSize: 40,
                        type: 2,
                        source: 1,
                        pageNum: 1,
                        pageType: 'Home',
                        language:CONFIG.countryCur
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
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            /**
             * /mobileApiWeb/search-Product-getItems.do
             * 这是一个旧有的接口，支持多语言调用，返回的字段较多
             * 目前首页展示的逻辑较为简单，不需要使用全部的字段，
             * 在此对其做进一步的数据格式化
            **/
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            obj.list = [];

            if (obj.code !== -1) {
                $.each(res.data.resultList, function(index, pro){
                    var __obj = {},
                        //是否带有促销价格
                        idDiscountPrice = pro.discountPrice && pro.discountPrice*1 > 0;

                    __obj.imgUrl = pro.imgUrl;
                    __obj.proUrl = CONFIG.wwwURL + '/product/' + pro.seoName + '/' + pro.itemCode + '.html' + '#mhp1509-reit-' + (index+1);
                    __obj.discountRate = pro.discountRate;

                    //是否带有促销价
                    if (idDiscountPrice) {
                        __obj.price = pro.discountPrice;
                    //反之取最大价格
                    } else {
                        __obj.price = pro.maxPrice;
                    }
                    
                    //移动专享价标识[50|60|70|80]
                    if(pro.promoType==='50' || pro.promoType==='60' || pro.promoType==='70' || pro.promoType==='80'){
                        __obj.appExclusive = '1';
                    }

                    //促销打标，首先判断是否带有促销价
                    if (idDiscountPrice){
                        //折扣：discountType = 0
                        if(pro.promoType==='0' || pro.promoType==='50' ||  pro.promoType==='70'){
                            __obj.discountType='0';
                        //直降：discountType = 10 
                        }else if(pro.promoType==='10' || pro.promoType==='60' || pro.promoType==='80'){
                            __obj.discountType='1';
                        }
                    }          

                    obj.list.push(__obj);
                });
                obj.currencyText = res.data.currencyText;
                obj.countryCur = CONFIG.countryCur;
            }

            /**
             * 最终将其格式化为：
             * {
             *     code: 200
             *     list: [
             *         {
             *             imgUrl: '',
             *             proUrl: '',
             *             price: ''
             *         },
             *         ...
             *     ]
             * }
            **/
            return obj;
        }
    });
    
    //view-猜你喜欢的推荐产品
    var YouMyLikeView = Backbone.View.extend({
        //根节点
        el: '.j-youMyLike',
        //backbone提供的事件集合
        events: {
            'click .j-youMyLikeMore': 'open'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.cHide = this.options.cHide;
            this.cYouMyLikeMore = this.options.cYouMyLikeMore;
            this.template = this.options.template;
            this.model = this.options.model;
            this.FastClick = this.options.FastClick;
            this.lazyloadCallback = this.options.lazyloadCallback;
            
            //初始化事件
            this.initEvent();
            //拉取产品数据
            this.model.fetch();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cYouMyLikeMore = $(this.options.cYouMyLikeMore);
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //控制整个区域显示隐藏的className
                cHide: 'dhm-hide',
                //展示更多的产品的按钮
                cYouMyLikeMore: '.j-youMyLikeMore',
                //模板
                template: _.template(tpl.join('')),
                //数据模型
                model: new YouMyLikeModel(),
                //阻止点透的函数
                FastClick: FastClick,
                //图片懒加载接口
                lazyloadCallback: $.noop
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                this.render(model.attributes);
            } else {
                try{throw('success(): data is wrong');}catch(e){}
            }
        },
        //拉取数据失败回调
        error: function() {
            try{throw('error(): request is wrong');}catch(e){}
        },
        //数据渲染
        render: function(data) {
            //页面绘制
            this.$el.html(this.template(data)).removeClass(this.cHide);
            
            //初始化$dom对象
            this.initElement();
            
            //阻止打开展示按钮点透   
            this.FastClick.attach(this.$cYouMyLikeMore[0]);
            
            //添加图片懒加载功能
            this.lazyloadCallback();
        },
        //展示更多的产品
        open: function(ev) {
            //展示所有隐藏项
            this.$el.find(':hidden').show();
            //删除按钮
            $(ev.target).remove();
            
            //hack: 目的是触发lazyload中的scroll事件
            window.scroll(0, $(window).scrollTop()*1+1);
            
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        }
    });
    
    return YouMyLikeView;
});

