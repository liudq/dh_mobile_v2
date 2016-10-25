/**
 * module src: app/addCouponInfo.js
 * 点击Add a New Coupon按钮添加coupon信息请求
**/
define('app/addCouponInfo', ['common/config','app/getPlaceOrder','app/getCouponInfo', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG,getPlaceOrder, getCouponInfo, tip, dataErrorLog){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/order-Order-useCoupon.do',
            //url: 'addCoupon.json',
            data: {}
        };
    return {
        init: function(options) {
            //配置对象初始化
            this.placeOrder = options.placeOrder;
            this.orderId = options.orderId;
            //添加coupon
            this.save();
        },
        //获取需要存储的参数数据
        getParams: function() {
            var obj = {};
            //通用接口参数
            obj.client = 'wap';
            obj.version = '0.1';
            obj.couponSource = 'WAP_PlaceOrder';
            //orderId
            obj.orderId = this.orderId;
            //couponCode
            obj.couponCode = $('.j-coupon-input').val();

            //__params捕获传递过来的参数数据
            $.extend(__params.data, obj);

            return obj;
        },
        save: function() {
            $.ajax({
                type: 'GET',
                url: __params.url,
                data: this.getParams(this.couponCode),
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        this.parse(res);
                    }else {
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，关闭提示】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:res.message});
                        //捕获异常
                        try {
                            throw('success(): data is wrong');
                        } catch(e) {
                            //异常数据收集
                            dataErrorLog.events.trigger('save:dataErrorLog', {
                                message: e,
                                url: __params.url,
                                params: __params.data,
                                result: res,
                                custom: {
                                    buyerid: CONFIG.b2b_buyerid||'none',
                                    subtotal: $('.j-iTotalPrice').html()||0
                                }
                            });
                        }
                    }
                },
                error: function(){
                    //数据异常，关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //展示数据接口错误信息【点击ok，刷新页面】
                    tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
                    //捕获异常
                    try {
                        throw('error(): request is wrong');
                    } catch(e) {
                        //异常数据收集
                        dataErrorLog.events.trigger('save:dataErrorLog', {
                            message: e,
                            url: __params.url,
                            params: __params.data
                        });
                    }
                }
            });
        },
        /**
         * parse（数据格式化）
         *
         * 接口地址：
         * /mobileWebApi/order-Order-useCoupon.do
         * 接口文档地址：
         * http://m.dhgate.com/mobileWebApi/order-Order-useCoupon.do
         *
         * 说明：
         * 就目前WAP端业务而言并不会用到所有的字段信息
         *
         * 原始数据结构
         * {
         *     "data":{
         *         "buyerId": "ff80808134c16a2b0134c1a5951b000a",
         *         "couponCode": "506F4039CE12A9162D",
         *         "orderId": "300064698"
         *     },
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
        **/
        parse: function(res) {
            var obj = {};
            obj.code = (res.state==='0x0000'?200:-1);
            if (obj.code !== -1) {
                //调用初始化接口
                this.getPlaceOrder(this.placeOrder.model);
            }
            /**
             * 最终格式化为：
             * {
             *     code: 200,
             *     data:{
             *         buyerId: "ff80808134c16a2b0134c1a5951b000a",
             *         couponCode: "506F4039CE12A9162D",
             *         orderId: "300064698"
             *
             *     }
             * }
            **/
        },
        //调用初始化接口
        getPlaceOrder:function(model){
            getPlaceOrder.events.trigger('GetPlaceOrder:fetch', {
                //保存成功重置相关数据
                successCallback: $.proxy(function(res){
                    model.set({
                       orderSummary: $.extend(true, {}, model.get('orderSummary'), res.orderSummary),
                       orders: res.orders
                    });
                    //关闭coupon弹层
                    this.placeOrder.trigger('closeLayer');
                    //当前coupon信息绘制
                    this.placeOrder.trigger('placeOrderView:render:renderCoupon',res);
                }, this)
            });
        }
    };
});