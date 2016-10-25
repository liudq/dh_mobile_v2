/**
 * module src: landpage/landpage.js
 * 
**/
define('app/landpage', ['common/config'], function(CONFIG){
    return {
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.el = this.options.el;
            this.cCategoryIcon = this.options.cCategoryIcon;
            this.cSlideMask = this.options.cSlideMask;
            this.cAllBox = this.options.cAllBox;
            this.cFh = this.options.cFh;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        setOptions: function(options) {
            this.options = {
                //根节点
                el: 'body',
                //选择类目按钮
                cCategoryIcon: '.j-category-icon',
                //遮罩层
                cSlideMask: '.j-slide-mask',
                //弹层类目
                cAllBox: '.j-all-box',
                //弹层返回按钮
                cFh: '.j-fh'
            };
            $.extend(this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$el = $(this.el);
            this.$cCategoryIcon = $(this.cCategoryIcon);
            this.$cSlideMask = $(this.cSlideMask);
            this.$cAllBox = $(this.cAllBox);
            this.$cFh = $(this.cFh);
        },
        //事件初始化
        initEvent: function() {
           this.$el.on(this.eType(), this.cCategoryIcon,$.proxy(this.openAllCates, this));
           this.$el.on(this.eType(), this.cFh, $.proxy(this.CloseCates, this));
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
        openAllCates: function() {
            var allHeight = this.$el.height();
            this.$cSlideMask.css('height', allHeight).show();
            this.$cAllBox.css('height',allHeight).addClass('moved');
        },
        CloseCates:function(){
            this.$cSlideMask.hide();
            this.$cAllBox.removeClass('moved');
        }
    };
});





