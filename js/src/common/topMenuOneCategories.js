/**
 * module src: common/topMenuOneCategories.js
 * 顶部左侧菜单一级类目模块
**/
define('common/topMenuOneCategories', ['common/config', 'lib/backbone', 'tpl/topMenuOneCategoriesTpl', 'tools/fastclick'], function(CONFIG, Backbone, tpl, FastClick){
    //model-顶部左侧菜单一级类目
    var TopMenuOneCategoriesModel = Backbone.Model.extend({
        //一级类目默认属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //一级类目列表
                list: [
                    {
                        //名称
                        name:'',
                        //地址
                        url:''
                    }
                ]
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
                    url: '/menuCategories.html',
                    //url: '/mobile_v2/css/home/html/menuCategories.do',
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
            return res;
        }
    });
    

    //view-顶部左侧菜单一级类目
    var TopMenuOneCategoriesView = Backbone.View.extend({
        //根节点
        el: '.j-headerWarp',
        //backbone提供的事件集合
        events: {
            'click .j-categoryOneReturn': 'returnMainMenu',
            'click .j-categoryOneOpen': 'open',
            'click .j-categoryOneClose': 'close'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.topMenuInit = this.options.topMenuInit;
            this.cCategoryOneWarp = this.options.cCategoryOneWarp;
            this.cCategoryOneScroll = this.options.cCategoryOneScroll;
            this.cHide = this.options.cHide;
            this.cAnimateHide = this.options.cAnimateHide;
            this.cAnimateShow = this.options.cAnimateShow;
            this.cCategoryOneClose = this.options.cCategoryOneClose;
            this.cCategoryOneReturn = this.options.cCategoryOneReturn;
            this.model = this.options.model;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.FastClick = this.options.FastClick;
            this.timer = null;
            
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取一级类目数据
            this.model.fetch();
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //主菜单实例对象
                topMenuInit: $({}),
                //一级类目列表外部包裹容器
                cCategoryOneWarp: '.j-categoryOneWarp',
                //列表外层包裹容器
                cCategoryOneScroll: '.j-categoryOneScroll',
                //控制列表隐藏的样式
                cHide: 'dhm-hide',
                //控制列表滑动隐藏展示的样式
                cAnimateHide: 'categoryOneWarp-close',
                //控制列表滑动显示展示的样式
                cAnimateShow: 'categoryOneWarp-open',
                //列表关闭按钮
                cCategoryOneClose: '.j-categoryOneClose',
                //返回菜单按钮
                cCategoryOneReturn: '.j-categoryOneReturn',
                //数据模型
                model: new TopMenuOneCategoriesModel(),
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //阻止点透的函数
                FastClick: FastClick
            };
            $.extend(true, this.options, options||{});
        
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;
           
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            
            //屏幕旋转事件
            //一级类目列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setCategoryOneStyle();
                }, 500);
            });
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$window = this.$window||$(window);
            this.$cCategoryOneWarp = this.$cCategoryOneWarp||$(this.cCategoryOneWarp);
            this.$cCategoryOneScroll = $(this.cCategoryOneScroll);
            this.$cCategoryOneClose = $(this.cCategoryOneClose);
            this.$cCategoryOneReturn = $(this.cCategoryOneReturn);
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
        //设置一级类目列表样式
        setCategoryOneStyle: function() {
            var $cCategoryOneScroll = this.$cCategoryOneScroll,
                $siblings,
                $parentSiblings,
                windowHeight = this.$window.height()*1,
                sumHeight = 0;

            //不存在则跳出
            if (!$cCategoryOneScroll[0]) {
                return;
            }

            //$ul同辈元素集合
            $siblings = $cCategoryOneScroll.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });
            
            //$ul父节点同辈元素集合
            $parentSiblings = $cCategoryOneScroll.parent().siblings();
            $.each($parentSiblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });

            $cCategoryOneScroll.css({height: windowHeight - sumHeight});
        },
        //打开列表
        open: function() {
            
            var $cCategoryOneWarp = this.$cCategoryOneWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;

            //判断数据是否正常
            if (this.model.get('code') !== 200) {
                return;
            }

            //先设置display
            $cCategoryOneWarp.removeClass(cHide);

            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $cCategoryOneWarp.removeClass(cAnimateHide).addClass(cAnimateShow);
            }, 10);

            //设置一级类目列表样式
            this.setCategoryOneStyle();
            
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //关闭整个菜单
        close: function() {
            var self = this;
            
            //首先关闭主菜单
            this.topMenuInit.trigger('close:mainMenu');
            
            //然后关闭一级类目列表，在这里加上延时确保
            //动画执行顺序不会错乱
            setTimeout(function(){
                self.hide();
            },10);
        },
        //返回主菜单
        returnMainMenu: function() {
            //隐藏一级类目列表
            this.hide();
            
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //隐藏
        hide: function() {
            var $cCategoryOneWarp = this.$cCategoryOneWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;
            
            //先滑动隐藏展示
            $cCategoryOneWarp.removeClass(cAnimateShow).addClass(cAnimateHide);
            
            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                $cCategoryOneWarp.addClass(cHide);
            }, 510);
        },
        //数据渲染
        render: function(data) {
                //模板对象
            var tpl = this.tpl,
                //外层容器
                warp = tpl.warp.join(''),
                //返回、关闭按钮
                returnOrClose = this.template(tpl.returnOrClose.join(''))(data),
                //一级标题
                oneTitle = this.template(tpl.oneTitle.join(''))(data),
                //已登录状态
                oneCategories = this.template(tpl.oneCategories.join(''))(data);
            
            //数据组装
            warp = warp.replace(/\{\{returnOrClose\}\}/, returnOrClose)
                       .replace(/\{\{oneTitle\}\}/, oneTitle)
                       .replace(/\{\{oneCategories\}\}/, oneCategories)
                       ;
            
            //数据绘制
            this.$cCategoryOneWarp.html(warp);
            
            //重新初始化$dom对象
            this.initElement();

            //阻止关闭按钮点透
            this.$cCategoryOneClose[0]&&this.FastClick.attach(this.$cCategoryOneClose[0]);
            //阻止返回按钮点透
            this.$cCategoryOneReturn[0]&&this.FastClick.attach(this.$cCategoryOneReturn[0]);
        }
    });

    return TopMenuOneCategoriesView;
});
