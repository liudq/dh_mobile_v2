/**
 * module src: openScreenAd/openScreenAd.js
 *开屏广告
**/
define('openScreenAd/openScreenAd', [], function(){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cMultiScreen = this.options.cMultiScreen;
            this.cSigleScreen = this.options.cSigleScreen;
            this.dSkip = this.options.dSkip;
            this.dboxBtn = this.options.dboxBtn;
            this.dExperienceBtn = this.options.dExperienceBtn;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },     
        //设置配置对象
        setOptions: function(options) {
            this.options = {
                //多屏banner包裹容器
                cMultiScreen: '.j-multiScreen',
                //单屏包裹容器
                cSigleScreen: '.j-sigleScreen',
                //skip button
                dSkip: '.j-skip a',
                //跳转按钮
                dboxBtn: '.j-boxBtn a',
                //立即体验按钮
                dExperienceBtn: '.j-experienceBtn a'
            };
            $.extend(this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$body = this.$body||$('body');
            this.$cMultiScreen =  $(this.cMultiScreen);
            this.$cSigleScreen = $(this.cSigleScreen);
            this.$dSkip = $(this.dSkip);
            this.$dboxBtn = $(this.dboxBtn);
            this.$dExperienceBtn = $(this.dExperienceBtn);
        },
        //事件初始化
        initEvent: function() {
            //单屏的开屏广告
            if(this.$cSigleScreen[0]){
                //如果是单图的开屏广告，那么三秒钟跳转到app首页
                this.threeSecondsAway();
                //点击图片上按钮跳转到相应的页面
                this.$cSigleScreen.on('click', this.dboxBtn, $.proxy(this.skipToPage,this));
            }
            //多屏的开屏广告
            //点击skip或者立即体验按钮跳转app首页
            this.$body.on('click', this.dSkip, $.proxy(this.toSkip, this));
            this.$cMultiScreen.on('click', this.dExperienceBtn, $.proxy(this.toExperience, this));  
        },
        //如果是单图的开屏广告，那么三秒钟跳转到app首页
        threeSecondsAway:function(){
            var timer = null,
                self = this;
            timer = setTimeout(function(){
              self.skipToHome('');
            },5000);
        },
        //多屏或者单屏下点击skip按钮
        toSkip:function(){
            this.skipToHome('skip');
        },
        //跳转app首页
        skipToHome:function(linktype){
            try {
                //ios APP
                webClose('kp',linktype);
            } catch(e) {
                //andoird APP
                if (window.order && window.order.webClose) {
                    window.order.webClose('kp',linktype);  
                //除此之外的打开方式
                } else {
                //浏览器
                }
            }
        },
        //点击多屏下Experience按钮跳转app首页
        toExperience:function(){
            this.skipToHome('expstart');
        },
        //点击图片上按钮跳转到相应的页面
        skipToPage:function(){
            var pageType = this.$cSigleScreen.attr('data-pagetype'),
                pageUrl = this.$cSigleScreen.attr('data-pageUrl'),
                pageTitle = this.$cSigleScreen.attr('data-pagetitle');
          

            try {
                //ios APP
                webLink(pageType,pageUrl,pageTitle);
            } catch(e) {
                //andoird APP
                if (window.order && window.order.webLink) {
                    window.order.webLink(pageType,pageUrl,pageTitle);
                //除此之外的打开方式
                } else {
                //浏览器
                }
            }
        }
    };
});


