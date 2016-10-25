/**
 * module src: common/header/turnToLanguagesWebsite.js
 * 获取当前页面url，根据选择的语言，跳转到对应的多语言站点页面
 **/
define('common/header/turnToLanguagesWebsite', ['common/config', 'lib/underscore', 'tpl/header/turnToLanguagesWebsiteTpl', 'tools/fastclick'], function(CONFIG, _, tpl, FastClick){
    return {
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.wwwURL = this.options.wwwURL;
            this.wwwPATHNAME = this.options.wwwPATHNAME;
            this.wwwHASH = this.options.wwwHASH;
            this.wwwSEARCH = this.options.wwwSEARCH;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.cHide = this.options.cHide;
            this.cAnimateHide = this.options.cAnimateHide;
            this.cAnimateShow = this.options.cAnimateShow;
            this.dRoot = this.options.dRoot;
            this.cLanguageWarp = this.options.cLanguageWarp;
            this.cLanguages = this.options.cLanguages;
            this.cLanguageBtn = this.options.cLanguageBtn;
            this.cLanguageCancel = this.options.cLanguageCancel;
            this.cLanguageShadow = this.options.cLanguageShadow;
            this.FastClick = this.options.FastClick;
            
            //初始化$dom对象
            this.initElement();
            //事件初始化
            this.initEvent();
            //数据渲染
            this.render();
        },
        setOptions: function(options) {
            this.options = {
                //站点域名
                wwwURL: CONFIG.wwwURL,
                //路径名
                wwwPATHNAME: CONFIG.wwwPATHNAME,
                //锚点
                wwwHASH: CONFIG.wwwHASH,
                //查询部分
                wwwSEARCH: CONFIG.wwwSEARCH,
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //根节点
                dRoot: '.j-headerWarp',
                //控制列表隐藏的样式
                cHide: 'dhm-hide',
                //控制语言列表滑动隐藏展示的样式
                cAnimateHide: 'languageWarp-close',
                //控制语言列表滑动显示展示的样式
                cAnimateShow: 'languageWarp-open',
                //最外层包裹容器
                cLanguageWarp: '.j-languageWarp',
                //国家列表
                cLanguages: '#J_languageCont ul li',
                //打开按钮
                cLanguageBtn: '#J_language',
                //关闭按钮
                cLanguageCancel: '.j-languageCancel',
                //遮罩层
                cLanguageShadow: '#J_shadow',
                //阻止点透的函数
                FastClick: FastClick
            };
            $.extend(this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$body = this.body||$('body');
            this.$dRoot = this.$dRoot||$(this.dRoot);
            this.$cLanguageWarp = this.$cLanguageWarp||$(this.cLanguageWarp);
            this.$cLanguageShadow = $(this.cLanguageShadow);
            this.$cLanguageCancel = $(this.cLanguageCancel);
        },
        //事件初始化
        initEvent: function() {
            this.$dRoot.on('click', this.cLanguageBtn, $.proxy(this.show, this));
            this.$dRoot.on('click', this.cLanguageCancel, $.proxy(this.hide, this));
            this.$dRoot.on('click', this.cLanguages, $.proxy(this.setSelected, this));
            
            //根节点外的事件代理
            //说明：
            //点击遮罩层也可以关闭语言列表
            this.$body.on('click', this.cLanguageShadow, $.proxy(this.hide, this));
        },
        //设置当前于域名下的默认选项
        setDefaultItem: function(str) {
            var wwwURL = this.wwwURL,
                reg = new RegExp('<li><a href="' + wwwURL, 'i');
            
            //根据当前域名来匹配默认选项
            if (reg.test(str)) {
                str = str.replace(reg, '<li data-flag="y"><span></span><a href="');
            
            //本地开发或匹配其他情况来设置默认选项
            } else {
                str = str.replace(/<li><a href="[^"]+/, '<li data-flag="y"><span></span><a href="');
            }

            return str;
        },
        //根据当前页面url来设置其他域名入口地址
        setUrl: function(str) {
            var wwwPATHNAME = this.wwwPATHNAME,
                wwwSEARCH = this.wwwSEARCH,
                wwwHASH = this.wwwHASH;
            
            str = str.replace(/href="(?:http|https)([^"]+)/gi, function($0){
                return ($0 + wwwPATHNAME + wwwSEARCH + wwwHASH);
            });

            return str;
        },
        //数据渲染
        render: function() {
               //模板对象
            var tpl = this.tpl,
                //外层容器
                warp = this.template(tpl.warp.join(''))({}),
                //多语言入口列表
                list = this.setUrl(this.setDefaultItem(tpl.list.join(''))),
                //遮罩层
                shadow = tpl.shadow.join('');
            
            //数据组装
            warp = warp.replace(/\{\{list\}\}/, list);
            
            //数据绘制
            this.$cLanguageWarp.html(warp);
            this.$body.append(shadow);
            
            //重新初始化$dom对象
            this.initElement();
            
            //阻止关闭按钮、遮罩层点透
            this.$cLanguageCancel[0]&&this.FastClick.attach(this.$cLanguageCancel[0]);
            this.$cLanguageShadow[0]&&this.FastClick.attach(this.$cLanguageShadow[0]);
        },
        //展示下拉列表
        show: function(ev) {
            var $cLanguageWarp = this.$cLanguageWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;
                
            //打开遮罩层
            this.$cLanguageShadow.removeClass(cHide);
            
            //先设置display
            $cLanguageWarp.removeClass(cHide);
            
            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $cLanguageWarp.removeClass(cAnimateHide).addClass(cAnimateShow);
            }, 10);
            
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //隐藏下拉列表
        hide: function() {
            var $cLanguageWarp = this.$cLanguageWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;
            
            //关闭遮罩层
            this.$cLanguageShadow.addClass(cHide);
            
            //先滑动隐藏展示
            $cLanguageWarp.removeClass(cAnimateShow).addClass(cAnimateHide);
            
            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                $cLanguageWarp.addClass(cHide);
            }, 510);
            
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //设置当前选中状态
        setSelected: function(ev) {
            var $target = $(ev.currentTarget),
                //根据data-flag来查找当前选中项
                $sibling = $target.siblings('[data-flag="y"]');
            
            $sibling.find('span').remove();
            $target.attr('data-flag', 'y').append('<span></span>');
            
            //跳转到对应的多语言站点页面
            this.jump($target.find('a').attr('href'));
        },
        //跳转页面
        jump: function(url) {
            location.href = url;
        }
    };
});