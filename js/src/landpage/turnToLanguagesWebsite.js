/**
 * module src: landpage/turnToLanguagesWebsite.js
 * 获取当前页面url，根据选择的语言，跳转到对应的多语言站点页面
**/
define('app/turnToLanguagesWebsite', ['common/config', 'appTpl/turnToLanguagesWebsiteTpl'], function(CONFIG, tpl){
    return {
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.wwwURL = this.options.wwwURL;
            this.wwwPATHNAME = this.options.wwwPATHNAME;
            this.wwwHASH = this.options.wwwHASH;
            this.wwwSEARCH = this.options.wwwSEARCH;
            this.template = this.options.template;
            this.dRoot = this.options.dRoot;
            this.cCurrentClass = this.options.cCurrentClass;
            this.cLanguageWarp = this.options.cLanguageWarp;
            this.cLanguageContWarp = this.options.cLanguageContWarp;
            this.cLanguages = this.options.cLanguages;
            this.cLanguageBtn = this.options.cLanguageBtn;
            this.cLanguageCancel = this.options.cLanguageCancel;
            this.cLanguageShadow = this.options.cLanguageShadow;

            //初始化数据写入
            this.initElement();
            this.render(this.setDefaultItem(this.template));
            //事件初始化
            this.initEvent();
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
                //模板
                template: tpl.join(''),
                //根节点
                dRoot: 'body',
                //当前默认选中项的className
                cCurrentClass: 'active',
                //最外层包裹容器
                cLanguageWarp: '.j-languageWarp',
                //列表外层包裹容器
                cLanguageContWarp: '#J_languageCont',
                //国家列表
                cLanguages: '#J_languageCont li[data-name]',
                //打开按钮
                cLanguageBtn: '#J_language',
                //关闭按钮
                cLanguageCancel: '.j-languageCancel',
                //遮罩层
                cLanguageShadow: '#J_shadow'
            };
            $.extend(this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$dRoot = this.$dRoot||$(this.dRoot);
            this.$cLanguageWarp = this.$cLanguageWarp||$(this.cLanguageWarp);
            this.$cLanguageContWarp = $(this.cLanguageContWarp);
            this.$cLanguageShadow = $(this.cLanguageShadow);
            this.$cLanguageCancel = $(this.cLanguageCancel);
        },
        //事件初始化
        initEvent: function() {
            this.$dRoot.on(this.eType(), this.cLanguageBtn, $.proxy(this.show, this));
            this.$dRoot.on(this.eType(), this.cLanguageCancel, $.proxy(this.hide, this));
            this.$dRoot.on(this.eType(), this.cLanguages, $.proxy(this.setSelected, this));
        },
        //判断手机是否支持touch事件
        eType:function(){
            var isSupportTouch="ontouchend" in document?true:false;
            if(isSupportTouch){
                return 'touchend';
            }else{
                return 'click';
            }
        },
        //设置当前于域名下的默认选项
        setDefaultItem: function(str) {
            var wwwURL = this.wwwURL,
                template = this.template,
                cCurrentClass = this.cCurrentClass,
                reg = new RegExp('<li data-name="([^"]+)"><a href="' + wwwURL, 'i');
            
            //根据当前域名来匹配默认选项
            if (reg.test(str)) {
                str = str.replace(reg, '<li class="'+cCurrentClass+'" data-name="$1"><a href="');
            
            //本地开发或匹配其他情况来设置默认选项
            } else {
                str = str.replace(/<li data-name="([^"]+)"><a href="[^"]+/, '<li class="'+cCurrentClass+'" data-name="$1"><a href="');
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
        render: function(str) {
            this.$cLanguageWarp.html(str);
            //重新初始化$dom对象
            this.initElement();

        },
        //展示下拉列表
        show: function(ev) {
            this.$cLanguageContWarp.show();
            this.$cLanguageShadow.show();
        },
        //隐藏下拉列表
        hide: function(ev) {
            this.$cLanguageContWarp.hide();
            this.$cLanguageShadow.hide();
            ev.preventDefault();
        },
        //设置当前选中状态
        setSelected: function(ev) {
            var $target= $(ev.currentTarget),
                cCurrentClass = this.cCurrentClass,
                cCurrentClassFull = '.' + cCurrentClass;
                
            $target.addClass(cCurrentClass).siblings(cCurrentClassFull).removeClass(cCurrentClass);
        }
    };
});