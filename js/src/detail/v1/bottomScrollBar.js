/**
 * module src: common/bottomScrollBar.js
 * 页面底部漂浮工具条
**/
define('app/bottomScrollBar', ['common/config'], function(CONFIG){
    var BottomScrollBar = function(options) {
        //配置对象初始化
        this.setOptions(options);
        this.cDatailBtn = this.options.cDatailBtn;
        this.cLayerBottomWarp = this.options.cLayerBottomWarp;
        this.cHide = this.options.cHide;
        this.timer = null;
        
        //初始化$dom对象
        this.initElement();
        //初始化事件
        this.initEvent();
        //初始化时判断是否需要展示
        this.setStyle();
    };
    
    //注册静态方法和属性
    $.extend(BottomScrollBar,{
        //初始化入口
        init: function(options){
            return new BottomScrollBar(options);
        }
    });
    
    //注册原型方法和属性
    $.extend(BottomScrollBar.prototype,{
        //自定义配置对象
        setOptions: function(options) {
            this.options = {
                //页面主体部分添加购物车、立即购买按钮、soldout的外层包裹容器
                cDatailBtn: '.j-datail-btn',
                //工具条外层包裹容器
                cLayerBottomWarp: '.j-layer-bottom-cartWarp',
                //控制工具条展示和隐藏的className
                cHide: 'dhm-hide'
            };
            $.extend(this.options,options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$window = this.$window||$(window);
            this.$cDatailBtn = this.$cDatailBtn||$(this.cDatailBtn);
            this.$cLayerBottomWarp = this.$cLayerBottomWarp||$(this.cLayerBottomWarp);
        },
        //事件初始化
        initEvent: function() {
            //添加滚动事件
            this.$window.on('scroll', $.proxy(this.setStyle,this));
        },
        //控制工具条展示和隐藏的样式
        setStyle: function() {
            var $cDatailBtn = this.$cDatailBtn,
                $cLayerBottomWarp = this.$cLayerBottomWarp,
                $window = this.$window,
                cHide = this.cHide,
                //参考基准点距离顶部的高度
                pointY,
                //当前滚动条的位移
                scrollTopY;
            
            //清除定时器，阻止多次触发
            if (this.timer) {
                clearTimeout(this.timer);
            }
            
            //执行上增加50毫秒的延迟
            this.timer = setTimeout(function(){
                pointY = $cDatailBtn.offset().top + $cDatailBtn.outerHeight();
                scrollTopY = $window.scrollTop();
                //当滚动条滑动的距离大于等于参考基准点
                //距离顶部的高度时，将展示漂浮工具条
                if (scrollTopY >= pointY) {
                    $cLayerBottomWarp.removeClass(cHide);
                //反之，隐藏
                } else {
                    $cLayerBottomWarp.addClass(cHide);
                }
            }, 50);
        }
    });

    return BottomScrollBar;
});