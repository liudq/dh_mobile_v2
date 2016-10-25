/**
 * module src: detail/v1/reviewImgView.js
 * reviews中点击缩略图展示大图
**/
define('app/reviewImgView', ['common/config','lib/backbone', 'app/imgView', 'tools/swiper','appTpl/getReviewsViewImgTpl', 'lib/underscore'], function(CONFIG,Backbone,imgView,Swiper,tpl, _){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cDetailSilder = this.options.cDetailSilder;
            this.cReviewPagination = this.options.cReviewPagination;
            this.cImgViewMainCont = this.options.cImgViewMainCont;
            this.cHide = this.options.cHide;
            this.imgViewActive = this.options.imgViewActive;
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
            //设置数据初始化
            this.imgArrData = [];
            //点击reviews缩略图
            this.$body.on('click', '.j-reviewImgBtn a', $.proxy(this.showImgView, this));
            //点击reviews全屏图back
            this.$body.on('click', '.j-reviewViewImgBack', $.proxy(this.hideImgView, this));

            //屏幕旋转事件
            //链接入口列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    imgView.setEleStyle();
                }, 500);
            });    
        },
        setOptions: function(options) {
            this.options = {
                //隐藏元素
                cHide: 'dhm-hide',
                //reviews全屏图导航
                cReviewPagination: '.j-review-pagination',
                //reviews全屏图展示层
                cImgViewMainCont: '.j-reviewViewImgCont',
                //reviews全屏图的选中元素
                imgViewActive: '.swiper-slide-active',
                //模板
                template: _.template
            };
            $.extend(true, this.options, options||{});
        },
        //绘制reviews全屏图的html
        renderViewImg: function(data){
            var data = this.template(tpl.join(''))(data);
            //页面绘制
            this.$cImgViewMainCont.html(data);
            //展示全屏图
            this.$cImgViewMainCont.removeClass(this.cHide);
        },
        //展示reviews全屏图
        showImgView:function(evt){
            var target = $(evt.currentTarget),
                targetLi = target.closest('li'),
                aAll = target.closest('li').find('a'),
                self = this,
                currentIndex = target.index();
            
            //当前元素是否有已经点击完的属性isClick=true
            //没有isClick=true属性的情况
            if(!targetLi.attr('isClick')){
                //前一个实例元素如果存在，销毁前一个实例对象并且重新给this.$prevClickDom赋值为当前实例对象
                if(this.$prevClickDom){
                    //如果前一个实例存在，清空数据
                    this.imgArrData = [];
                    //把前一个实例元素设置为没有点击过的状态
                    this.$prevClickDom.attr('isClick','');
                    //销毁前一个实例对象
                    this.$prevClickDom.swiperInstance.destroy();
                }
                //数据拼装
                $.each(aAll,function(){
                    var reviewViewImg = $(this).attr('data-reviewViewImg');
                    self.imgArrData.push(reviewViewImg);
                });
               //当前已经点击isClick属性设置为true
                targetLi.attr({'isClick':true});
                //绘制页面大图的html
                this.renderViewImg(this.imgArrData);
                //实例化reviews全屏图
                imgView.init({
                    currentInstanceDom: targetLi,
                    cImgViewCont: '.j-reviewViewImg',
                    cImgViewContPagination: this.cReviewPagination,
                    currentIndex: currentIndex,
                    cPinchZoom: ".j-review-pinch-zoom"
                });
                //重新给当前实例对象赋值
                this.$prevClickDom = targetLi;
                //切换到当前元素
                this.$prevClickDom.swiperInstance.slideTo(currentIndex);
            //有isClick=true属性的情况
            }else{
                //切换到当前元素
                this.$prevClickDom.swiperInstance.slideTo(currentIndex);
            }
            //展示全屏图
            this.$cImgViewMainCont.removeClass(this.cHide);
        },
        //点击reviews全屏图back
        hideImgView:function(){
            //隐藏全屏图
            this.$cImgViewMainCont.addClass(this.cHide);
        }
    };
});