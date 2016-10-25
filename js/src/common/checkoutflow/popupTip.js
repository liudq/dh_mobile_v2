/**
 * module src: common/checkoutflow/popupTip.js
 * 支付流程loading，data-error的界面提示处理模块
**/
define('checkoutflow/popupTip', ['common/config'], function(CONFIG){
        //tip类是“单例模式”
    var tip = function() {
        //缓存的实例
        var instance = this;

        //初始化配置对象
        this.setOptions();
        this.el = this.options.el;
        this.loadingWarp = this.options.loadingWarp;
        this.dataErrorTipWarp = this.options.dataErrorTipWarp;
        this.dataErrorTipLayerWarp = this.options.dataErrorTipLayerWarp;
        this.dataErrorTip = this.options.dataErrorTip;
        this.cOrderInfoWarp = this.options.cOrderInfoWarp;
        this.dataErrorSureBtn = this.options.dataErrorSureBtn;
        this.mask = this.options.mask;
        this.autoLayerWarp = this.options.autoLayerWarp;
        this.cHide = this.options.cHide;
        this.events = $({});
        
        //初始化调用
        this.init();

        //重写构造函数
        tip = function() {
            return instance;
        };
    };
    
    $.extend(tip.prototype, {
        //初始化入口
        init: function() {
            this.initElement();
            this.initEvent();
        },
        //配置对象初始化
        setOptions: function() {
            this.options = {
                //根节点
                el: document,
                //loading外层包裹容器
                loadingWarp: '.j-loading-warp',
                //data-error-tip外层包裹容器
                dataErrorTipWarp: '.j-popup-warp',
                //data-error-tip内容包裹容器
                dataErrorTipLayerWarp: '.j-popup-layer-warp',
                //data-error-tip错误信息外层包裹容器
                dataErrorTip: '.j-errorText',
                //data-error-tip错误信息确定按钮
                dataErrorSureBtn: '#errorSure',
                //遮罩层
                mask: '.j-mask',
                //自动消失层的外层包裹容器
                autoLayerWarp: '.j-auto-layer',
                //控制显示隐藏的className
                cHide: 'dhm-hide'
            };
        },
        //$dom对象初始化
        initElement: function() {
            this.$el = $(this.el);
            this.$loadingWarp = $(this.loadingWarp);
            this.$dataErrorTipWarp = $(this.dataErrorTipWarp);
            this.$dataErrorTipLayerWarp = $(this.dataErrorTipLayerWarp);
            this.$dataErrorTip = $(this.dataErrorTip);
            this.$autoLayerWarp = $(this.autoLayerWarp);
        },
        //事件初始化
        initEvent: function() {
            //对外暴露的自定义事件
            this.events.on('popupTip:loading', $.proxy(this.controlLoadingLayer, this));
            this.events.on('popupTip:dataErrorTip', $.proxy(this.setDataErrorTip, this));
            this.events.on('popupTip:autoTip', $.proxy(this.setAutoTip, this));
            //$dom事件
            this.$el.on('click', this.dataErrorSureBtn, $.proxy(this.hiddenDataErrorTip, this));
        },
        //设置遮罩层样式（先暂时这样，TODO：有优化空间）
        setMaskStyle: function() {
            this.$loadingWarp.find(this.mask).css({width:this.$el.width(), height:this.$el.height()});
            this.$dataErrorTipWarp.find(this.mask).css({width:this.$el.width(), height:this.$el.height()});
        },
        //控制loading的展示与隐藏
        controlLoadingLayer: function(evt, flag) {
            flag===true?(this.setMaskStyle(), this.$loadingWarp.removeClass(this.cHide)):this.$loadingWarp.addClass(this.cHide);
        },
        //控制data-error-tip的展示与隐藏
        controlDataErrorTipLayer: function(flag) {
            flag===true?(this.setMaskStyle(), this.$dataErrorTipWarp.removeClass(this.cHide)):this.$dataErrorTipWarp.addClass(this.cHide);
        },
        //设置data-error-tip样式
        setDataErrorStyle: function() {
            this.$dataErrorTipLayerWarp.css({'margin-top': -parseInt(this.$dataErrorTipLayerWarp.outerHeight()*1/2)});
        },
        //设置data-error-tip的错误信息内容
        setDataErrorTip: function(evt, options) {
            //信息写入
            this.$dataErrorTip.attr({'action':options.action}).find('span').html(options.message);
            //展示错误信息
            this.controlDataErrorTipLayer(true);
            //样式调整
            this.setDataErrorStyle();
        },
        /**
         * 隐藏data-error-tip
         *
         * 说明：
         * 按照问题级别来指导用户点击【ok】将要做的事情，
         * 等级数越大说明错误的级别越高
         *
         * 等级一：
         * 非阻断性的错误，关闭提示可继续接下来的操作，
         * “action”的值为“close”；
         *
         * 等级二：
         * 未完成本次操作无法进行接下来的操作，为阻断性
         * 的错误，“action”的值为“refresh”；
         *
         * 等级三：
         * 不可抗拒因素的错误，例如网络延迟等问题，没有
         * 可能完成接下来的所有操作，“action”的值为“gohome”；
         *  
         * 特殊情况：
         * 除以上三种情况外的指定跳转地址
        **/
        hiddenDataErrorTip: function() {
            var action = this.$dataErrorTip.attr('action'),
                customUrl = this.$dataErrorTip.attr('customUrl');
            //隐藏
            if (action === 'close') {
                this.controlDataErrorTipLayer(false);
            //刷新页面
            } else if (action === 'refresh') {
                location.reload();
            //跳转到首页
            } else if (action === 'gohome') {
                location.href = CONFIG.wwwURL;
            //自定义跳转
            } else if (action==='custom') {
                location.href = customUrl||'/';
            }
        },
        //控制auto-layer-tip的展示与隐藏
        controlAutoTipLayer: function(options) {
            var timer = options.timer,
                callback = options.callback,
                $autoLayerWarp = this.$autoLayerWarp,
                cHide = this.cHide;
            
            //如果没有自定义回调执行默认动画
            if (!callback) {
                $autoLayerWarp.removeClass(cHide).animate({opacity:1}, 500);
                setTimeout(function(){
                    $autoLayerWarp.animate({opacity:0}, 500, function(){$autoLayerWarp.addClass(cHide);});
                }, timer);
            //反之
            } else {
                callback();
            }
        },
        //设置auto-layer样式
        setAutoLayerStyle: function() {
            this.$autoLayerWarp.css({'margin-top': -parseInt(this.$autoLayerWarp.outerHeight()*1/2)});
        },
        /**
         * 设置自动提示的内容
         * 默认配置说明：
         * options = {
         *     //提示文字
         *     message: '',
         *     //延迟消失，默认为3000毫秒
         *     timer: 3000,
         *     //回调函数（自定义使用）
         *     callback: function(){}
         * }
        **/
        setAutoTip: function(evt, options) {
            //信息写入
            this.$autoLayerWarp.html(options.message);
            //展示控制
            this.controlAutoTipLayer({
                timer: options.timer||3000,
                callback: options.callback
            });
            //样式调整
            this.setAutoLayerStyle();
        }
    });
    
    return new tip(); 
});



