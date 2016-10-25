/**
 * module src: payment/ideal.js
 * ideal支付方式模块
 * 支持的国家或区域：荷兰
**/
define('app/ideal', ['common/config', 'app/cardPayJump', 'checkoutflow/popupTip'], function(CONFIG, cardPayJump, tip){
    return {
        //初始化入口
        init: function(options) {
            //初始化配置对象
            this.setOptions(options);
            this.el = this.options.el;
            this.events = $({});
            this.countryid = this.options.countryid;
            this.orderNo = this.options.orderNo;
            this.PayModelParseObj = this.options.PayModelParseObj;
            
            //判断在placeOrder中的运输地址是否为荷兰
            this.isHolland();
        },
        //配置对象初始化
        setOptions: function(options) {
            this.options = {
                //根节点
                el: 'body',
                //placeOrder运输地址国家Id
                countryid: '',
                //订单号
                orderNo: '',
                //PayModel：parse()最终返回的对象
                PayModelParseObj: {}
            };
            $.extend(this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$el = $(this.options.el);
        },
        //事件初始化
        initEvent: function() {
            //绑定ideal支付事件
            this.$el.on('click', '.j-ideal', $.proxy(this.payForIdeal, this));
            //绑定ideal支付失败返回payment的错误提示事件
            this.events.on('ideal:payFailTip', $.proxy(this.payFailTip, this));
        },
        //判断运输地址是否为荷兰
        isHolland: function() {
            //如果是荷兰则进行初始化操作
            if (this.countryid === 'NL') {
                //初始化$dom对象
                this.initElement();
                //初始化事件
                this.initEvent();
                //更新PayModel模型数据中的isIdeal字段的值
                this.setPayModelIsIdeal();
            }
        },
        //修改PayMode中isIdeal为true
        setPayModelIsIdeal: function() {
            this.PayModelParseObj.isIdeal = true;
        },
        //获取ideal支付必须参数数据
        getIdealParams: function() {
            var obj = {};
            //订单号
            obj.orderNo = this.orderNo;
            //支付方式
            obj.payWay = 'ideal';
            return obj;
        },
        //ideal支付
        payForIdeal: function() {
            //打开loading
            tip.events.trigger('popupTip:loading', true);
            //直接去支付
            cardPayJump.init(this.getIdealParams());
        },
        //ideal支付失败返回payment页面时给出的提示信息
        payFailTip: function() {
            var data = arguments[1];
            if (this.countryid === 'NL' && data.message) {
                tip.events.trigger('popupTip:autoTip',{message:data.message});
            }
        }
    };
});