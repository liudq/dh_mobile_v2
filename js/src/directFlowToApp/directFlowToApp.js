/**
 * module src: directFlowToApp/directFlowToApp.js
 * wap-app切流引导页模块
 **/
define('app/directFlowToApp',['common/config', 'appTpl/directFlowToAppTpl'],function(CONFIG, tpl){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.dAppDownloadWarp = this.options.dAppDownloadWarp;
            this.dGoogle = this.options.dGoogle;
            this.dAndroidApk = this.options.dAndroidApk;
            this.dIos = this.options.dIos;
            this.dVisit = this.options.dVisit;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.clientType = this.options.clientType;
            this.androidApkL = this.options.androidApkL;
            this.androidApkR = this.options.androidApkR;
            this.androidStore = this.options.androidStore;
            this.iosStore = this.options.iosStore;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //渲染页面
            this.render();
        },
        //设置配置对象
        setOptions: function(options) {
            this.options = {
                //外层包裹容器
                dAppDownloadWarp: '.j_dhAppDownload',
                //android google play下载按钮
                dGoogle: '.google',
                //android 下载包按钮
                dAndroidApk: '.site',
                //ios store 下载按钮
                dIos: '.ios',
                //继续访问按钮
                dVisit: '.j-visit',
                //模版引擎
                template: _.template,
                //模版
                tpl: tpl,
                //判断手机设备是android还是ios
                clientType: CONFIG.isAndroid?'android':'ios',
                //android下载包
                androidApkL: 'https://app.appsflyer.com/com.dhgate.buyer-dhgate?pid=dhgate',
                androidApkR:'&af_r=http://www.dhresource.com/mobile/dhgate_buyer.apk',
                //android的google play下载链接
                androidStore: 'https://app.appsflyer.com/com.dhgate.buyer',
                //ios下载链接
                iosStore: 'https://app.appsflyer.com/id905869418'
            };
            $.extend(this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$dAppDownloadWarp = $(this.dAppDownloadWarp);
        },
        //事件初始化
        initEvent: function() {
            //绑定android store下载事件
            this.$dAppDownloadWarp.on('click', this.dGoogle, $.proxy(this.downAndroidStore, this));
            //绑定android APK下载事件
            this.$dAppDownloadWarp.on('click', this.dAndroidApk, $.proxy(this.downAndroidApk, this));
            //绑定ios store下载事件
            this.$dAppDownloadWarp.on('click', this.dIos, $.proxy(this.downIosStore, this));
            //绑定继续访问按钮的事件
            this.$dAppDownloadWarp.on('click', this.dVisit, $.proxy(this.continueVisit, this));
        },
        //android下载
        downAndroidStore: function(evt) {
            evt.target.href = this.getStoreLink(this.androidStore);
        },
        //android下载包
        downAndroidApk: function(evt) {
            evt.target.href = this.getAndroidApk();
        },
        //ios下载
        downIosStore: function(evt) {
            evt.target.href = this.getStoreLink(this.iosStore);
        },
        //继续访问
        continueVisit: function(evt) {
            evt.target.href = this.getVisitLink();
        },
        //渲染页面
        render: function() {
            var warp = this.template(this.tpl.warp.join(''))(),
                androidDownload = this.template(this.tpl.androidDownload.join(''))(),
                iosDownload = this.template(this.tpl.iosDownload.join(''))();
            this.$dAppDownloadWarp.append(this.template(warp));
            if (this.clientType == 'android') {
                $('.j-download').append(this.template(androidDownload));
            } else {
                $('.j-download').append(this.template(iosDownload));
            }
        },
        /*
         *
         获取链接类型 linkType
         linkType = '1' 代表从 my dhgate进来的链接
         linkType = '2' 代表从 my order进来的链接
         linkType = '3' 代表从 my message进来的链接
         linkType = '4' 代表从 my coupons进来的链接
         linkType = '5' 代表从 my favorites进来的链接
         *
        * */
        getLinkType: function() {
            var linkType = CONFIG.wwwSEARCH.match(/^(?:\?|&).*linkType=([^&#]+)/i);
            //当参数为空的时候默认为1
            return linkType!==null?linkType[1]:'1';
        },
        //因需要区分linkType,此方法为返回下载的完整连接地址
        getStoreLink: function(storeType) {
            //My Dhgate
            if(this.getLinkType() === '1') {
                return storeType + '?pid=WAP&c=Mydhgate';
            //My Order
            } else if(this.getLinkType() === '2') {
                return storeType + '?pid=WAP&c=Myorders';
            //My Message
            } else if(this.getLinkType() === '3') {
                return storeType + '?pid=WAP&c=Mymessage';
            //My Coupons
            } else if(this.getLinkType() === '4') {
                return storeType + '?pid=WAP&c=Mycoupons';
            //My Favorites
            } else if(this.getLinkType() === '5') {
                return storeType + '?pid=WAP&c=Myfavorite';
            } else {
                return storeType + '?pid=WAP&c=Mydhgate';
            }
        },
        //根据访问来源 得到继续访问的链接
        getVisitLink: function() {
            //My Dhgate
            if(this.getLinkType() === '1') {
                return '/vieworder.do';
            //My Order
            } else if(this.getLinkType() === '2') {
                return '/mydhgate/order/orderlist.html?rft=1';
            //My Message
            } else if(this.getLinkType() === '3') {
                return '/myinbox.do';
            //My Coupons
            } else if(this.getLinkType() === '4') {
                return '/mydhgate/coupon/mycoupons.html';
            //My Favorites
            } else if(this.getLinkType() === '5') {
                return '/myFavorites.html';
            } else {
                return '/vieworder.do';
            }
        },
        //根据访问来源，得到各个android安装包链接
        getAndroidApk: function() {
            //My Dhgate
            if(this.getLinkType() === '1') {
                return this.androidApkL + "c=Mydhgate" + this.androidApkR;
            //My Order
            } else if(this.getLinkType() === '2') {
                return this.androidApkL + "c=Myorder" + this.androidApkR;
            //My Message
            } else if(this.getLinkType() === '3') {
                return this.androidApkL + "c=Mymessage" + this.androidApkR;
            //My Coupons
            } else if(this.getLinkType() === '4') {
                return this.androidApkL + "c=Mycoupons" + this.androidApkR;
            //My Favorites
            } else if(this.getLinkType() === '5') {
                return this.androidApkL + "c=Myfavorites" + this.androidApkR;
            } else {
                return this.androidApkL + "c=Mydhgate" + this.androidApkR;
            }
        }
     }
})