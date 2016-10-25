/**
 * module src: payment/sofort.js
 * sofort支付方式模块
 * 支持的国家或区域：德国、奥地利、瑞士、比利时
**/
define('app/sofort', ['common/config', 'app/cardPayJump', 'checkoutflow/popupTip'], function(CONFIG, cardPayJump, tip){
    return {
        //初始化入口
        init: function(options) {
            //初始化配置对象
            this.setOptions(options);
            this.el = this.options.el;
            this.events = $({});
            this.localPaysWay = this.options.localPaysWay;
            this.orderNo = this.options.orderNo;
            this.PayModelParseObj = this.options.PayModelParseObj;
            
            //是否可以启用sofort支付方式
            this.isSofort();
        },
        //配置对象初始化
        setOptions: function(options) {
            this.options = {
                //根节点
                el: 'body',
                //第三方支付方式
                localPaysWay: '',
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
            //绑定sofort支付事件
            this.$el.on('click', '.j-sofort', $.proxy(this.payForSofort, this));
            //绑定sofort支付失败返回payment的错误提示事件
            this.events.on('sofort:payFailTip', $.proxy(this.payFailTip, this));
        },
        //判断是否可以使用sofort来进行支付
        isSofort: function() {
            var localPaysWay = this.localPaysWay&&this.localPaysWay.split(',');
            //查询是否支持sofort支付方式
            for (var i = 0; i < localPaysWay.length; i++) {
                //如果支持sofort支付方式则进行初始化操作
                if (localPaysWay[i] === 'sofort') {
                    //初始化$dom对象
                    this.initElement();
                    //初始化事件
                    this.initEvent();
                    //更新PayModel模型数据中的isSofort字段的值
                    this.setPayModelIsSofort();
                    //跳出查询
                    break;
                }
            }
        },
        //修改PayMode中isSofort为true
        setPayModelIsSofort: function() {
            this.PayModelParseObj.isSofort = true;
        },
        //获取sofort支付必须参数数据
        getSofortParams: function() {
            var obj = {};
            //订单号
            obj.orderNo = this.orderNo;
            //支付方式
            obj.payWay = 'sofort';
            return obj;
        },
        //sofort支付
        payForSofort: function() {
            //打开loading
            tip.events.trigger('popupTip:loading', true);
            //直接去支付
            cardPayJump.init(this.getSofortParams());
        },
        //sofort支付失败返回payment页面时给出的提示信息
        payFailTip: function() {
            var data = arguments[1];
            if (data.message) {
                tip.events.trigger('popupTip:autoTip',{message:data.message});
            }
        }
    };
});