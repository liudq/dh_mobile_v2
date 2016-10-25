/**
 * module src: common/appSpread.js
 * 在android或iphone访问时提示下载对应APP的模块
**/
define('common/appSpread', ['common/config', 'tools/jquery.cookie', 'tpl/appSpreadTpl', 'tools/fastclick', 'common/appopen', 'lib/underscore'], function(CONFIG, $cookie, tpl, FastClick, Appopen, _){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.dRoot = this.options.dRoot;
            this.cDhApp = this.options.cDhApp;
            this.androidStore = this.options.androidStore;
            this.iosStore = this.options.iosStore;
            this.cHide = this.options.cHide;
            this.cOpenBtn = this.options.cOpenBtn;
            this.cCloseBtn = this.options.cCloseBtn;
            this.tpl = this.options.tpl;
            this.cookieName = this.options.cookieName;
            this.localName = this.options.localName;
            this.FastClick = this.options.FastClick;
            this.Appopen = this.options.Appopen;
            this.gaCallback = this.options.gaCallback;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //数据渲染
            this.render();
            //首页App常驻下载入口处理
            this.addHomeAppLink();
        },
        //设置配置对象
        setOptions: function(options) {
            this.options = {
                //根节点
                dRoot: '#J_appBanner',
                //首页app常驻下载入口按钮
                cDhApp: '.j-dhApp',
                //android APP下载地址
                androidStore: 'http://download.dhgate.com/mobile/dhgate_buyer.apk',
                //ios APP下载地址
                iosStore: 'https://itunes.apple.com/us/app/dhgate-shop-smart-shop-direct/id905869418?l=zh&ls=1&mt=8',
                //控制APP下载提示显示隐藏的样式
                cHide: 'dhm-hide',
                //打开app的按钮
                cOpenBtn: '.j-openApp',
                //关闭下载APP提示的按钮
                cCloseBtn: '.j-closeApp',
                //模板
                tpl: _.template(tpl.join(''))({}),
                //cookie名称
                cookieName: 'DHMAppSpreadBanner',
                //本地数据名称
                localName: 'DHMAppBannerNew',
                //阻止点透的函数
                FastClick: FastClick,
                //唤起app
                Appopen: Appopen,
                //GA
                gaCallback: $.noop
            };
            $.extend(this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$dRoot = this.$dRoot||$(this.dRoot);
            this.$cDhApp = this.$cDhApp||$(this.cDhApp);
            this.$cCloseBtn = $(this.cCloseBtn);
            this.$cOpenBtn = $(this.cOpenBtn);
            this.$body = this.$body||$('body');
        },
        //事件初始化
        initEvent: function() {
            this.$body.on('click', this.cOpenBtn, $.proxy(this.openApp, this));
            this.$body.on('click', this.cCloseBtn, $.proxy(this.closeTip, this));
        },
        //首页添加app下载链接
        addHomeAppLink: function() {
                //设备类型
            var type = this.isIphoneOrAndroid();
            
            //判断是否在首页
            if (!this.$cDhApp[0]) {
                return;
            }
           
            if (type === 'android') {
                this.$cDhApp.attr('href', this.androidStore);
            } else if (type === 'iphone') {
                this.$cDhApp.attr('href', this.iosStore);
            } else {
                try{throw('openApp(): is not correct type');}catch(e){}
            }
        },
        //判读是Iphone还是Android系统（旧有判断逻辑）
        isIphoneOrAndroid: function() {
            var userAgent = navigator.userAgent;
            //Android
            if (/(A|a)ndroid/i.test(userAgent)) {
                return 'android';

            //iphone
            } else if (/i(P|p)hone/i.test(userAgent)) {
                return 'iphone';

            //neither
            } else {
                return false;
            }
        },
        //设置cookie[session]
        //session：关闭页面立即失效
        setCookie: function(value) {
            $.cookie(this.cookieName, value);
        },
        //读取cookie
        getCookie: function() {
            return $.cookie(this.cookieName);
        },
        //设置本地存储数据
        setItem: function(value) {
            //判断是否支持localStorage
            if (CONFIG.isLocalStorageNameSupported()){
                localStorage.setItem(this.localName, value);
            }
        },
        //读取本地存储数据
        getItem: function() {
            return localStorage.getItem(this.localName);
        },
        //打开APP下载
        openApp: function(evt) {
            var type = this.isIphoneOrAndroid(),
                entrance = $(evt.currentTarget).attr('data-entrance')||'';
            
            // if (type === 'android') {
            //     this.jump(this.androidStore);
            // } else if (type === 'iphone') {
            //     this.jump(this.iosStore);
            // } else {
            //     try{throw('openApp(): is not correct type');}catch(e){}
            // }
            this.Appopen.init({entrance:entrance});
            //GA跟踪代码
            this.gaCallback();
        },
        //关闭APP下载提示
        closeTip: function() {
            //关闭提示
            this.$dRoot.addClass(this.cHide);
            //更新本地存储数据
            this.setItem(1);
            
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //跳转到对应的APP下载地址
        jump: function(url) {
            window.location = url;
        },
        //获取访问次数
        getAccessTimes: function() {
            var accessTimes = this.getItem();

            //初次访问
            if (!accessTimes) {
                accessTimes = 4;
                this.setItem('4');
            }
            
            //如果没有cookie，则向cookie中写入值，
            //确保在没有关闭浏览器的情况下不会再
            //改变访问次数
            if (!this.getCookie()) {
                //更新本地存储数据
                this.setItem(accessTimes<3?++accessTimes:4);
                //设置cookie
                this.setCookie('1');
            }
            
            return accessTimes;
        },
        /**
         * 数据渲染
         *
         * 此处是否渲染并非根据是否有cookie值来进行
         * 判断，而是根据本地存储的用户访问次数是否
         * 达到上限值来决定是否进行展示，最大上限值
         * 为：“3”
         * 
         * 说明：
         * 每次关闭浏览器cookie将自动删除，在不存在
         * cookie的情况下访问次数将累计增加，在达到
         * 上限值之后，进行页面展示
         * 
         * 在用户关闭提示之后，并在第三次重新打开浏
         * 览器的时候进行APP下载提示
        **/
        render: function() {
            //必须是在指定设备上达到访问次数上限才渲染
            if (!this.isIphoneOrAndroid() || this.getAccessTimes() < 4) {
                return;
            }
            
            //页面绘制并展示
            this.$dRoot.html(this.tpl).removeClass(this.cHide);
            
            //重新初始化$dom对象
            this.initElement();
            
            //阻止打开按钮点透
            this.$cOpenBtn[0]&&this.FastClick.attach(this.$cOpenBtn[0]);
            //阻止关闭按钮点透
            this.$cCloseBtn[0]&&this.FastClick.attach(this.$cCloseBtn[0]);
        }
    };
});

