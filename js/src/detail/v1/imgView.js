/**
 * module src: detail/v1/imgView.js
 * 全屏图片滑动和放大功能
**/
define('app/imgView', ['common/config','tools/swiper','app/pinchzoom'], function(CONFIG,Swiper,PinchZoom){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cImgViewCont = this.options.cImgViewCont;
            this.cImgViewContPagination = this.options.cImgViewContPagination;
            this.cPinchZoom = this.options.cPinchZoom;
            this.currentIndex = this.options.currentIndex;
            this.currentInstanceDom = this.options.currentInstanceDom;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$window = this.$window||$(window);
            this.$cImgViewCont = $(this.cImgViewCont);
            this.$cPinchZoom = $(this.cPinchZoom);
        },
        //事件初始化
        initEvent: function() {
            //缩写图初始化
            this.imgView();
        },
        setOptions: function(options) {
            this.options = {
                //全屏图片滑动元素的包裹容器
                cImgViewCont: '.j-imgViewCont',
                //全屏图片缩略图导航
                cImgViewContPagination: '.j-imgView-pagination',
                //全屏图片放大元素
                cPinchZoom: '.j-pinch-zoom',
                //当前需要实例的对象
                currentInstanceDom: null,
                //当前缩略图的索引值
                currentIndex: -1
            };
            $.extend(true, this.options, options||{});
        },
        //设置每一个滚动元素的高度以及图片的最大高度为屏幕的宽度，这样便于等比例的1:1图片能够充满屏幕。
        setEleStyle:function(){
            var windowHeight = this.$window.height()*1,
                $aLi = this.$cImgViewCont.find('li');
            
            $.each($aLi, function(index, ele){
                $(this).css('height',windowHeight+'px');
                $(this).find('img').css('maxHeight',windowHeight+'px');
            });
        },
        //实例化当前swiper以及设置放大缩小功能
        imgView:function(){
            var windowHeight = this.$window.height()*1;
            //设置滚动元素以及图片的宽高
            this.setEleStyle();
            //实例化当前swiper
            this.currentInstanceDom.swiperInstance = new Swiper(this.cImgViewCont, {
                pagination: this.cImgViewContPagination,
                paginationClickable: true,
                // Disable preloading of all images
                preloadImages: false,
                // Enable lazy loading
                lazyLoading: true,
                lazyLoadingInPrevNext : true,
                lazyLoadingInPrevNextAmount : 2
            });
           //展开全屏图时，需要跳转当前点击的元素
            this.currentInstanceDom.swiperInstance.slideTo(this.currentIndex, 0, false);
           //每一个元素的放大功能实例化
            this.$cPinchZoom.each(function () {
                new PinchZoom($(this), {});
                //设置放大元素的高度为屏幕的高度，便于当前元素居中显示
                $(this).parent().css("height", windowHeight + "px")
            });
        },
        //切换到当前元素
        sileToCurrentIndex: function(currentIndex){
            this.currentInstanceDom.swiperInstance.slideTo(currentIndex, 0, false);
        }
    };
});