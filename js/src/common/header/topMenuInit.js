/**
 * module src: common/header/topMenuInit.js
 * 顶部左侧菜单初始化模块
**/
define('common/header/topMenuInit', ['common/config', 'lib/backbone', 'tpl/header/topMenuInitTpl', 'tools/fastclick'], function(CONFIG, Backbone, tpl, FastClick){
    //model-顶部左侧菜单初始化
    var TopMenuInitModel = Backbone.Model.extend({
        //菜单默认属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //相关数据清单列表
                list: {
                    //购入车数量
                    cartSum: 0,
                    //站内信数量
                    messageSum: 0,
                    //昵称
                    nickName: null,
                    //买家级别
                    buyerLevel: null,
                    //当前语种
                    lang: null
                }
            };
        }
    });

    //view-顶部左侧菜单初始化
    var TopMenuInitView = Backbone.View.extend({
        //根节点
        el: '.j-headerWarp',
        //backbone提供的事件集合
        events: {
            'click .j-headCategoryBtn': 'open',
            'click .j-menu-close': 'hide'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cHtml = this.options.cHtml;
            this.cCategoryWarp = this.options.cCategoryWarp;
            this.cMenuInitScroll = this.options.cMenuInitScroll;
            this.cHide = this.options.cHide;
            this.cAnimateHide = this.options.cAnimateHide;
            this.cAnimateShow = this.options.cAnimateShow;
            this.cMenuOpenBtn = this.options.cMenuOpenBtn;
            this.cMenuCloseBtn = this.options.cMenuCloseBtn;
            this.cLanguageBtn =  this.options.cLanguageBtn;
            this.cCategoryOneOpen = this.options.cCategoryOneOpen;
            this.nDataValue = this.options.nDataValue;
            this.cfixedShadow = this.options.cfixedShadow;
            this.model = this.options.model;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.FastClick = this.options.FastClick;
            this.timer = null;
            
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //html样式
                cHtml: 'dhm-htmlOverflow',
                //菜单内容外部包裹容器
                cCategoryWarp: '.j-categoryWarp',
                //链接入口列表外层包裹容器
                cMenuInitScroll: '.j-menuInitScroll',
                //控制菜单隐藏的样式
                cHide: 'dhm-hide',
                //控制菜单滑动隐藏展示的样式
                cAnimateHide: 'categoryWarp-close',
                //控制菜单滑动显示展示的样式
                cAnimateShow: 'categoryWarp-open',
                //菜单打开按钮
                cMenuOpenBtn: '.j-headCategoryBtn',
                //菜单关闭按钮
                cMenuCloseBtn: '.j-menu-close',
                //打开多语言切换按钮
                cLanguageBtn: '#J_language',
                //一级类目菜单打开按钮
                cCategoryOneOpen: '.j-categoryOneOpen',
                //存放数据的自定义属性名
                nDataValue: 'data-value',
                //遮盖其他定位为fixed的元素层
                cfixedShadow:'.j-fixedShadow',
                //数据模型
                model: new TopMenuInitModel(),
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //阻止点透的函数
                FastClick: FastClick
            };
            $.extend(this.options,options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$body = this.body||$('body');
            this.$window = this.$window||$(window);
            this.$cCategoryWarp = this.$cCategoryWarp||$(this.cCategoryWarp);
            this.$cMenuOpenBtn = this.$cMenuOpenBtn||$(this.cMenuOpenBtn);
            this.$cMenuInitScroll = $(this.cMenuInitScroll);
            this.$cMenuCloseBtn = $(this.cMenuCloseBtn);
            this.$cLanguageBtn = $(this.cLanguageBtn);
            this.$cCategoryOneOpen = $(this.cCategoryOneOpen);
            this.$cfixedShadow = $(this.cfixedShadow);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;
                
            //对外暴露的关闭事件
            this.on('close:mainMenu', this.hide, this);
            //监听数据写入
            this.listenTo(this.model, 'change', this.render);
            //阻止打开按钮点透
            this.$cMenuOpenBtn[0]&&this.FastClick.attach(this.$cMenuOpenBtn[0]);
            
            //屏幕旋转事件
            //链接入口列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setMenuInitStyle();
                }, 500);
            });
        },
        //设置链接入口列表样式
        setMenuInitStyle: function() {
            var $cMenuInitScroll = this.$cMenuInitScroll,
                $siblings,
                windowHeight = this.$window.height()*1,
                sumHeight = 0;
            
            //不存在则跳出
            if (!$cMenuInitScroll[0]) {
                return;
            }
            
            //$ul同辈元素集合
            $siblings = $cMenuInitScroll.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });
            
            $cMenuInitScroll.css({height: windowHeight - sumHeight});
        },
        //打开菜单
        open: function(ev) {
            //查看数据状态是否正确
            if (this.model.get('code') !== 200) {
                //写入数据
                this.setData(ev);
            
            //如果数据正常则直接展示
            } else {
                this.show();
            }
        },
        //获取数据
        getData: function($ele) {
            var obj = {};
            obj.code = 200;
            obj.list = JSON.parse(decodeURIComponent($ele.attr(this.nDataValue)));
            obj.list.lang = this.getLang();
            return obj;
        },
        //向数据模型中写入数据
        setData: function(ev) {
            this.model.set(this.getData($(ev.currentTarget)));
        },
        //获取当前站点语种
        getLang: function() {
            return CONFIG.countrys[CONFIG.countryCur].replace(/([^ ]+).*/, '$1');
        },
        //数据渲染
        render: function() {
                //模板对象
            var tpl = this.tpl,
                //模型数据
                data = this.model.attributes,
                //外层容器
                warp = tpl.warp.join(''),
                //关闭按钮
                close = this.template(tpl.close.join(''))(data),
                //未登录状态
                notLogin = this.template(tpl.notLogin.join(''))(data),
                //已登录状态
                isLogin = this.template(tpl.isLogin.join(''))(data),
                //首页&一级类目入口
                entranceOne = this.template(tpl.entranceOne.join(''))(data),
                //站内信、购物车、订单、优惠券等入口
                entranceTwo = this.template(tpl.entranceTwo.join(''))(data),
                //多语言&feedback入口
                entranceThree = this.template(tpl.entranceThree.join(''))(data),
                //遮罩层
                fixedShadow = tpl.fixedShadow.join('');
            
            //数据组装
            warp = warp.replace(/\{\{close\}\}/, close)
                       .replace(/\{\{notLogin\}\}/, notLogin)
                       .replace(/\{\{isLogin\}\}/, isLogin)
                       .replace(/\{\{entranceOne\}\}/, entranceOne)
                       .replace(/\{\{entranceTwo\}\}/, entranceTwo)
                       .replace(/\{\{entranceThree\}\}/, entranceThree)
                       ;
            
            //数据绘制
            this.$cCategoryWarp.html(warp);
            this.$body.append(fixedShadow);
            //重新初始化$dom对象
            this.initElement();
            
            //阻止关闭按钮点透
            this.$cMenuCloseBtn[0]&&this.FastClick.attach(this.$cMenuCloseBtn[0]);
            //阻止多语言列表打开按钮点透
            this.$cLanguageBtn[0]&&this.FastClick.attach(this.$cLanguageBtn[0]);
            //阻止一级类目菜单打开按钮点透
            this.$cCategoryOneOpen[0]&&this.FastClick.attach(this.$cCategoryOneOpen[0]);
            
            //动画显示展示
            this.show();
        },
        //显示
        show: function() {
            var $cCategoryWarp = this.$cCategoryWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow,
                self = this;
            
            //设置html/body样式
            this.$html.addClass(this.cHtml);
            
            //先设置display
            $cCategoryWarp.removeClass(cHide);
            
            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $cCategoryWarp.removeClass(cAnimateHide).addClass(cAnimateShow);
            }, 10);
            
            //设置链接入口列表样式
            this.setMenuInitStyle();

            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                self.$cfixedShadow.removeClass(cHide);
            }, 520);
        },
        //隐藏
        hide: function() {
            var $cCategoryWarp = this.$cCategoryWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;
            
            
            //html/body样式重置为默认样式
            this.$html.removeClass(this.cHtml);
            //隐藏遮盖其他fixed定位的遮罩层
            this.$cfixedShadow.addClass(cHide);
            //先滑动隐藏展示
            $cCategoryWarp.removeClass(cAnimateShow).addClass(cAnimateHide);
            
            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                $cCategoryWarp.addClass(cHide);
            }, 510);
            
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        }
    });
    
    return TopMenuInitView;
});
