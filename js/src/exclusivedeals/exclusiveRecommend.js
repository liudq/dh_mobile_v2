/**
 * module src: exclusivedeals/exclusiveRecommend.js
 * 移动专享价专区推荐模块
**/
define('app/exclusiveRecommend', ['common/config', 'lib/backbone', 'appTpl/exclusiveTpl', 'app/getCategoryProducts', 'tools/fastclick'], function(CONFIG, Backbone, tpl, getCategoryProducts, FastClick){
    //model-移动专享价专区推荐
    var ExclusiveRecommendModel = Backbone.Model.extend({
        //移动专享价商品属性[attributes]
        defaults: function() {
            return {
                //当前站点语种
                lang: CONFIG.countryCur,
                //类目列表
                categorys: [{
                    //类目Id
                    id: '',
                    //类目名称
                    name: ''
                }],
                //专区推荐产品列表
                recommendProducts: [{
                    //产品链接地址
                    url: '',
                    //产品图片地址
                    imageUrl: '',
                    //产品数量单位（piece/lot）
                    measure: '',
                    //币种
                    curreny: '',
                    //产品价格区间
                    prices: '',
                    //产品促销类型
                    promoType: '',
                    //折扣率
                    discount: '',
                    //类目Id
                    categoryId: '',
                    //当前页数
                    pageNum: ''
                }],
                //类目推荐产品列表
                categoryProducts: {}
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
            this.pageNum = this.options.pageNum;
            this.pageSize = this.options.pageSize;
            this.pageTotal = this.options.pageTotal;
            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            //提供给ExclusiveRecommendView的增加专区推荐产品列表当前页数事件
            this.on('ExclusiveRecommendModel:addPageNum', this.addPageNum, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: '/mobileApiWeb/search-Recommend-getRecomByLike.do',
                    //url: 'search-Recommend-getRecomByLike.do',
                    data: {
                        //通用参数
                        client: 'wap',
                        version: '3.3',
                        //区分类型
                        pageType: 'ExcDeals'
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
                //当前页数
                pageNum: 1,
                //每页产品数量
                pageSize: 20,
                //总页数
                pageTotal: 1
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
             * 接口文档地址：https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=28344335
             *
             * 原始数据结构
             * {
             *     "data": {
             *         //类目列表
             *         "categoryTitles": [{
             *             //类目Id
             *             "categoryId": "103030",
             *             //类目名称
             *             "categoryName": "Electronic Cigarettes"
             *         }],
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
            var obj = {},
                self = this;
            //状态码
            obj.code = (res.state==='0x0000'?200:-1);
            //类目列表
            obj.categorys = [];
            //专区推荐产品列表
            obj.recommendProducts = [];
            //当前页数
            obj.pageNum = this.pageNum;
            
            if (obj.code !== -1 && res.data) {
                if (res.data.categoryTitles) {
                    $.each(res.data.categoryTitles, function(index, category){
                        var __obj = {};
                        //类目Id
                        __obj.id = category.categoryId;
                        //类目名称
                        __obj.name = category.categoryName;
                        //写入数据
                        obj.categorys.push(__obj);
                    });
                }

                if (res.data.itemList) {
                    $.each(res.data.itemList, function(index, product){
                        var __obj = {};
                        //产品链接地址
                        __obj.url = CONFIG.wwwURL + product.produrl;
                        //产品图片地址
                        __obj.imageUrl = product.imgurl;
                        //产品数量单位（piece/lot）
                        __obj.measure = product.measure;
                        //币种
                        __obj.curreny = self.getCurreny(product.finalPrice);
                        //产品价格区间
                        __obj.prices = self.getPriceRange(product.finalPrice);
                        //产品促销类型
                        __obj.promoType = self.getPromoType({itemType:product.itemType, promoType:product.promoType});
                        //折扣率
                        __obj.discount = self.getDiscount(product.discount);
                        //写入数据
                        obj.recommendProducts.push(__obj);
                    });

                    //有数据的情况下总页数加一，说明接下来可以尝试加载下一页
                    this.pageTotal++;
                } else {
                    //反之结束分页功能
                    this.pageTotal = 1;
                }
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     lang: '',
             *     categorys: [{
             *         id: '',
             *         name: ''
             *     }],
             *     recommendProducts: [{
             *         url: '',
             *         imageUrl: '',
             *         measure: '',
             *         curreny: '',
             *         prices: '',
             *         promoType: '',
             *         discount: ''
             *     }],
             *     categoryProducts: {}
             * }
            **/
            return obj;
        },
        //专区推荐产品列表增加当前页数
        addPageNum: function() {
            var pageNum = this.pageNum,
                pageTotal = this.pageTotal;
            //判断当前页数是否大于总页数，否则增加当前页数
            this.pageNum = pageNum <= pageTotal ? ++pageNum : pageNum;
        },
        //获取价格区间
        getPriceRange: function(str) {
            return str.replace(/[^\d]*(\d.+\d)[^\d]*/, '$1');
        },
        //获取折扣率
        getDiscount: function(str) {
            return str?str.replace(/[^\d]*(\d+)[^\d]*/, '$1'):'';
        },
        //获取币种
        getCurreny: function(str) {
            return str.replace(/([^\d]*)\s*\d.+\d\s*([^\d]*)/, '$1$2');
        },
        //获取移动专项价促销类型
        getPromoType: function(options) {
            var itemType = options.itemType,
                promoType = options.promoType||'',
                //促销类型：
                //[
                //    1：直降
                //    2：打折
                //    3：VIP直降
                //    4：VIP打折
                //    5：APP独享
                //    6：APP VIP独享
                //]
                type = '-1';

            //直降
            if (itemType==='2' && promoType==='10') {
                type = '1';
            //打折
            } else if (itemType==='2' && promoType==='0') {
                type = '2';
            //VIP直降
            } else if (itemType==='4' && promoType==='10') {
                type = '3';
            //VIP打折
            } else if (itemType==='4' && promoType==='0') {
                type = '4';
            //APP独享
            } else if (itemType === '1') {
                type = '5';
            //APP VIP独享
            } else if (itemType === '3') {
                type = '6';
            }

            return type;
        }
    });

    //view-移动专享价专区推荐
    var ExclusiveRecommendView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-allcate-iscroll a': 'open'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cExclusiveWarp = this.options.cExclusiveWarp;
            this.cExclusiveClassification = this.options.cExclusiveClassification;
            this.cJustForYouWarp = this.options.cJustForYouWarp;
            this.cFooter = this.options.cFooter;
            this.cLoading = this.options.cLoading;
            this.cProTip = this.options.cProTip;
            this.cCurrent = this.options.cCurrent;
            this.cHide = this.options.cHide;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.timer = null;
            this.FastClick = this.options.FastClick;
            this.successCallback = this.options.successCallback;
            this.openCallback = $.noop;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取业务数据（默认专区推荐产品列表）
            this.loadData();
        },
        //$dom对象初始化
        initElement: function() {
            this.$window = this.$window||$(window);
            this.$body = this.$body||$('body');
            this.$cExclusiveWarp = this.$cExclusiveWarp||$(this.cExclusiveWarp);
            this.$cFooter = this.$cFooter||$(this.cFooter);
            this.$cExclusiveClassification = $(this.cExclusiveClassification);
            this.$cJustForYouWarp = $(this.cJustForYouWarp);
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //绑定分页事件
            this.$window.on('scroll.exclusive', $.proxy(this.paging, this));
            //解决click事件的300毫秒延时
            //阻止大多数设备上的点透问题
            this.FastClick.attach(this.$el[0]);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //主体内容外层包裹容器
                cExclusiveWarp: '.j-exclusiveWarp',
                //专区内容分类标签外层包裹容器
                cExclusiveClassification: '.j-exclusiveClassification',
                //专区内容产品列表外层包裹容器
                cJustForYouWarp: '.j-justForYouWarp',
                //footer的外层包裹容器
                cFooter: '.footer',
                //loading外层包裹容器的className
                cLoading: '.j-pro-load',
                //错误提示信息外层包裹容器
                cProTip: '.pro-tip',
                //控制产品类型当前切换状态的className
                cCurrent: 'current',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new ExclusiveRecommendModel(),
                //阻止点透的函数
                FastClick: FastClick,
                //成功回调
                successCallback: $.noop
            };
            $.extend(true, this.options, options||{});
        },
        //是否为类目推荐
        isCategory: function(str) {
            return /^\d+$/.test(str);
        },
        //加载数据
        loadData: function(options) {
            var options = options||{},
                $ele = options.$ele,
                categoryId = options.categoryId,
                pageNum = options.pageNum||1,
                model = this.model;

            //拉取类目推荐产品
            if (this.isCategory(categoryId)) {
                getCategoryProducts.events.trigger('GetCategoryProducts:fetch', {
                    //类目Id
                    categoryId: categoryId,
                    //语种
                    language: model.get('lang'),
                    //当前页数
                    pageNum: pageNum,
                    //每页产品数量
                    pageSize: model.pageSize,
                    //数据模型：ExclusiveRecommendModel
                    model: model,
                    //回调函数
                    callback: $.proxy(function(data){
                        var $warp = $('.'+$ele.attr('data-type'));
                        if (data.code!==-1) {
                            //将当前拉取到的类目推荐产品列表添加到模型中
                            model.set({categoryProducts: $.extend(true, model.get('categoryProducts') ,data)}, {silent: true});
                            //当前选择类目产品数据渲染
                            this.renderCategoryProducts({
                                $warp: $warp,
                                res: model.get('categoryProducts')[categoryId+'-'+pageNum]
                            });
                        //如果数据异常，则隐藏loading停用该类目分页功能
                        } else {
                            $warp.find(this.cLoading).addClass(this.cHide).html('');
                            //如果是第一次拉取数据返回异常，则展示错误提示信息
                            if (data.pageNum === 1) {
                                this.renderErrorCategory({
                                    $warp: $warp,
                                    data: {name:$ele.html()}
                                });
                            }
                        }
                    }, this)
                });
            //拉取专区推荐产品
            } else {
                model.fetch({data:{language: model.get('lang'), pageNum: pageNum, pageSize: model.pageSize}});
            }
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
                    //执行成功回调外部依赖逻辑
                    this.successCallback(model);
                //专区推荐产品列表渲染
                } else {
                    this.renderRecommendProducts(model.attributes);
                }

                //只有在第一次拉取数据没有正确返回专区推荐产品时，输出自定义错误提示
                if (model.get('recommendProducts').length===0 && model.pageNum===1) {
                    this.renderJustForYouNothing(model.attributes);
                    return;
                }

                //增加专区推荐产品列表当前页数
                this.model.trigger('ExclusiveRecommendModel:addPageNum');

            //-1：数据异常情况处理
            } else {
                this.renderError(model.attributes);
            }
        },
        //拉取数据失败回调
        error: function() {
            if(confirm("Please try again.")) {
                window.location.reload();
            }
        },
        //页面整体渲染
        render: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //页面主体内容模板
                main = template(tpl.main.join(''))(data),
                //专区内容分类标签外层包裹容器模板
                exclusiveClassificationWarp = template(tpl.exclusiveClassificationWarp.join(''))(data),
                //类目标题列表模板
                categorysTitle = template(tpl.categorysTitle.join(''))(data),
                //类目列表产品外层包裹容器模板
                categorysProductWarp = template(tpl.categorysProductWarp.join(''))(data),
                //推荐产品模板
                exclusiveRecommendProduct = template(tpl.exclusiveRecommendProduct.join(''))(data),
                //loading状态模板
                loading = template(tpl.loading.join(''))(data);

            main = main.replace(/\{\{exclusiveClassificationWarp\}\}/, exclusiveClassificationWarp)
                   .replace(/\{\{categorysTitle\}\}/, categorysTitle)
                   .replace(/\{\{categorysProductWarp\}\}/, categorysProductWarp)
                   .replace(/\{\{exclusiveRecommendProduct\}\}/, exclusiveRecommendProduct)
                   .replace(/\{\{loading\}\}/g, loading)
                   ;

            //页面绘制
            this.$cExclusiveWarp.html(main);
            //重新初始化$dom对象
            this.initElement();
        },
        //没有专区推荐产品时渲染
        renderJustForYouNothing: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //提示信息模板
                tips = template(tpl.tips.join(''))(data),
                //专区推荐产品外层包裹容器
                $warp = this.$cJustForYouWarp;

            //页面绘制
            $warp.html(tips);
        },
        //重置专区产品列表渲染
        renderResetRecommendProducts: function() {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //loading状态模板
                loading = template(tpl.loading.join(''))(),
                //专区推荐产品外层包裹容器
                $warp = this.$cJustForYouWarp;

            $warp.html(loading);
        },
        //专区推荐产品列表渲染
        renderRecommendProducts: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //专区推荐产品外层包裹容器模板（重置使用）
                exclusiveRecommendProductWarp = template(tpl.exclusiveRecommendProductWarp.join(''))(data),
                //专区推荐产品模板
                exclusiveRecommendProduct = template(tpl.exclusiveRecommendProduct.join(''))(data),
                //专区推荐产品外层包裹容器
                $warp = this.$cJustForYouWarp,
                //loading
                cLoading = this.cLoading;

            //移除loading状态
            $warp.find(cLoading).remove();
            //页面绘制
            if (!this.again) {
                //分页
                $warp.find('ul').append(exclusiveRecommendProduct);
            } else {
                //重置
                $warp.html(exclusiveRecommendProductWarp.replace(/\{\{exclusiveRecommendProduct\}\}/, exclusiveRecommendProduct));
                //删除初始化标记
                delete this.again;
            }
        },
        //类目推荐产品列表渲染
        renderCategoryProducts: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //类目推荐产品模板
                categoryProduct = template(tpl.categoryProduct.join(''))(data.res),
                //loading
                cLoading = this.cLoading;

            //移除loading状态
            data.$warp.find(cLoading).remove();
            //页面绘制
            data.$warp.find('ul').append(categoryProduct);
        },
        //0x001-N情况下的渲染（专区推荐）
        renderError: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //提示信息模板
                tips = template(tpl.tips.join(''))(data),
                //主体内容外层包裹容器
                $warp = this.$cExclusiveWarp;

            //移除loading状态
            $warp.find(this.cLoading).remove();
            //只有在第一次拉取初始化数据异常的时候展示提示内容
            if (this.model.pageNum === 1) {
                //页面绘制
                $warp.html(tips);
                //注销专区滚动事件
                this.$window.unbind('scroll.exclusive');
            }
        },
        //0x001-N情况下的渲染（类目推荐）
        renderErrorCategory: function(options) {
               //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //提示信息模板
                tipsCategory = template(tpl.tipsCategory.join(''))(options.data);

            //页面绘制
            options.$warp.html(tipsCategory);
        },
        //设置对应类型产品展示样式
        setStyle: function($ele) {
                //主体内容外层包裹容器
            var $cExclusiveWarp = this.$cExclusiveWarp,
                //当前选择的对应的产品列表类型
                type = $ele.attr('data-type'),
                //当前选择的产品列表外层包裹容器$dom
                $productsWarp = $('.'+type),
                //其他产品类型Tab的$dom集合
                $Tab = this.$cExclusiveClassification.find('a[data-type!='+type+']');

            //取消其他产品类型的Tab高亮状态
            $Tab.removeClass(this.cCurrent);
            //隐藏其他类型下的产品列表
            $cExclusiveWarp.find('div[class*="content"]').not($productsWarp).addClass(this.cHide);
            //给当前选择的产品类型的Tab增加高亮状态
            $ele.addClass(this.cCurrent);
            //展示当前类型下的产品列表
            $productsWarp.removeClass(this.cHide);
        },
        //点击切换展示对应的类型推荐产品列表
        open: function(evt) {
            var self = this,
                $ele = $(evt.currentTarget),
                categoryId = $ele.attr('data-type').replace(/^[^\d]+(\d+)$/, '$1'),
                isCategory = this.isCategory(categoryId);
            
            //清除定时器
            if (this.timer) {                
                clearTimeout(this.timer);
            }
            
            //如果点击的是当前展示项则跳出
            if ($ele.hasClass(this.cCurrent)) {
                return;
            }

            //设置展示样式
            this.setStyle($ele);

            //拉取对应推荐类型产品列表数据
            if ($ele.attr('data-status') !== 'init') {
                this.loadData({
                    $ele: $ele,
                    categoryId: categoryId,
                    pageNum: 1
                });
            }

            //因为查看类目产品之后just for you的产品会
            //发生变化所以需要重新拉取初始化专区推荐产品
            if (!isCategory) {
                //标记需要重新渲染专区推荐产品
                this.again = true;
                //重置专区产品当前页数
                this.model.pageNum = 1;
                //重置专区产品内容
                this.renderResetRecommendProducts();
                //拉取数据
                this.loadData();
            }

            //标记初始化数据加载状态
            $ele.attr({'data-status': 'init'});
            //执行回调
            this.openCallback($ele);
        },
        //滑动分页
        paging: function() {
                //专区内容分类标签外层包裹容器$dom
            var $cExclusiveClassification = this.$cExclusiveClassification||$(this.cExclusiveClassification),
                //当前选择的分类标签$dom
                $ele = $cExclusiveClassification.find('a.'+this.cCurrent),
                //当前选择的产品类型外层包裹容器$dom
                $warp = $('.'+$ele.attr('data-type')),
                //类目Id
                categoryId = $ele.attr('data-type').replace(/^[^\d]+(\d+)$/, '$1'),
                //判断是否为类目推荐产品
                isCategory = this.isCategory(categoryId),
                //数据模型：ExclusiveRecommendModel
                model = this.model,
                //loading模板
                loading = this.tpl.loading.join(''),
                //当前页数
                pageNum = isCategory?1:model.pageNum,
                //总页数
                pageTotal = isCategory?model.get('categoryProducts')[categoryId+'-pageTotal']:model.pageTotal,
                //匹配当前选择的类目产品列表
                reg,
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
            if (bHeight-(tScrollHeight+wHeight) > (675+fHeight)) {
                return;
            }

            //避免重复执行，延迟100毫秒
            this.timer = setTimeout((function(self){
                return function() {
                    //查看当前是否为拉取数据或错误信息展示的状态
                    if ($warp.find(self.cLoading).length !== 0 || $warp.find(self.cProTip).length !== 0) {
                        return;
                    }

                    //计算类目推荐当前页数
                    if (isCategory) {
                        //遍历对应模型数据字段“categoryProducts”
                        reg = new RegExp('^'+categoryId+'-(\\d+)$');
                        $.each(model.get('categoryProducts'), function(index, products){
                            if (reg.test(index)) {
                                ++pageNum;
                            }
                        });
                    }

                    //查看是否达到最大页数
                    if (pageNum > pageTotal) {
                        return;
                    }

                    //拉取对应页数产品数据
                    self.loadData({
                        //当前选择的分类标签$dom
                        $ele: $ele,
                        //类目Id
                        categoryId: categoryId,
                        //当前页数
                        pageNum: pageNum
                    });

                    //修改为拉取数据的状态
                    $warp.append(loading);
                };
            }(this)), 100);
        }
    });

    return ExclusiveRecommendView;
});