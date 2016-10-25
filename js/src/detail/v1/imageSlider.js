/**
 * module src: detail/v1/imageSlider.js
 * 首屏banner缩略图滑动功能
**/
define('app/imageSlider', ['common/config','lib/backbone', 'app/imgView', 'tools/swiper','appTpl/getViewImgTpl', 'lib/underscore'], function(CONFIG,Backbone,imgView,Swiper,tpl, _){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cHtml = this.options.cHtml;
            this.cDetailSilder = this.options.cDetailSilder;
            this.cThumbnailPagination = this.options.cThumbnailPagination;
            this.cImgViewMainCont = this.options.cImgViewMainCont;
            this.cHide = this.options.cHide;
            this.imgViewActive = this.options.imgViewActive;
            //原始图片数据
            this.cOriginalImgData = this.options.cOriginalImgData;
            this.template = this.options.template;
            this.timer = null;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$window = this.$window||$(window);
            this.$html = this.$html||$('html');
            this.$body = this.$body||$('body');
            this.$cDetailSilder = $(this.cDetailSilder);
            this.$cImgViewMainCont = $(this.cImgViewMainCont);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;
            //首屏banner缩略图初始化
            this.thumbnail();
            //点击首屏banner缩略图
            this.$body.on('click', '.j-detail-silder li', $.proxy(this.showImgView, this));
            //点击全屏缩略图back
            this.$body.on('click', '.j-viewImgBack', $.proxy(this.hideImgView, this));
            //屏幕旋转事件
            //链接入口列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    //重新设置首屏banner缩略图宽高
                    self.setEleStyle();
                    //重新设置全屏banner缩略图宽度
                    imgView.setEleStyle();
                }, 500);
            });    
        },
        setOptions: function(options) {
            this.options = {
                //html样式
                cHtml: 'dhm-htmlOverflow',
                //滑动元素的包裹容器
                cDetailSilder: '.j-detail-silder',
                //隐藏元素
                cHide: 'dhm-hide',
                //首屏缩略图导航
                cThumbnailPagination: '.j-thumbnail-pagination',
                //全屏大图展示层
                cImgViewMainCont: '.j-imgViewMainCont',
                //全屏大图的选中元素
                imgViewActive: '.swiper-slide-active',
                //全屏原始图片数据
                cOriginalImgData: [],
                //模板
                template: _.template
            };
            $.extend(true, this.options, options||{});
        },
        //设置首屏缩略图的样式
        setEleStyle:function(){
            var windowWidth = this.$window.width()*1,
                $aLi = this.$cDetailSilder.find('li');
            if(windowWidth>414){
                windowWidth=414;
            }
            $.each($aLi, function(index, ele){
                $(this).css('height',windowWidth+'px');
                $(this).css('lineHeight',windowWidth+'px');
                $(this).find('img').css('maxHeight',windowWidth+'px');
            });
        },
        //首屏缩略图的滑动实例化
        thumbnail:function(){
            //设置首屏缩略图的样式
            this.setEleStyle();
            this.thumbnail.swiperInstance = new Swiper(this.cDetailSilder, {
                pagination: this.cThumbnailPagination,
                paginationClickable: true,
                // Disable preloading of all images
                preloadImages: false,
                // Enable lazy loading
                lazyLoading: true,
                lazyLoadingInPrevNext : true,
                lazyLoadingInPrevNextAmount : 2
            });
        },
        //绘制全屏图片的html
        renderViewImg: function(){
            var data = this.template(tpl.join(''))(this.cOriginalImgData);
            //页面绘制
            this.$cImgViewMainCont.html(data);
            //展示全屏大图
            this.$cImgViewMainCont.removeClass(this.cHide);
            //设置html/body样式
            this.$html.addClass(this.cHtml);
        },
        //展示全屏大图
        showImgView:function(evt){
            var target = $(evt.currentTarget),
                targetParent = target.closest('ul'),
                currentIndex = target.index();
            //实例化一次
            if(!this.creat){
                //绘制页面大图的html
                this.renderViewImg();
                imgView.init({currentIndex:currentIndex,currentInstanceDom:targetParent});
                this.creat = "1";
            }else{
                imgView.sileToCurrentIndex(currentIndex);
                //展示全屏大图
                this.$cImgViewMainCont.removeClass(this.cHide);
                //设置html/body样式
                this.$html.addClass(this.cHtml);
            }    
        },
        //隐藏全屏大图
        hideImgView:function(){
            var index = this.$cImgViewMainCont.find('li.swiper-slide-active').index();
            //隐藏全屏大图
            this.$cImgViewMainCont.addClass(this.cHide);
            //设置html/body样式
            this.$html.removeClass(this.cHtml);
            //首屏缩略图切回当前元素
            this.thumbnail.swiperInstance.slideTo(index, 0, false);
        }
    };
});