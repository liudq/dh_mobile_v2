/**
 * module src: app/remark.js
 * 添加备注接口模块
**/
define('app/remark', ['common/config','lib/backbone','app/getPlaceOrder','app/placeOrderBtn','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,getPlaceOrder,placeOrderBtn,tip,dataErrorLog){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/order-Order-saveRemarks.do',
            //url: 'remark.json',
            data: {}
        };
    return {
        init: function(options) {
            //配置对象初始化
            this.placeOrder = options.placeOrder;
            this.cartItemId = options.cartItemId;
            this.remarks = options.remarks;
            //评论
            this.save();
        },
        //获取需要存储的参数数据
        getParams: function() {
            var obj = {};
            //通用接口参数
            obj.client = 'wap';
            obj.version = '0.1';
            //cartItemId
            obj.cartItemId = this.cartItemId;
            //备注文本值
            obj.remarks = this.remarks;

            //__params捕获传递过来的参数数据
            $.extend(__params.data, obj);

            return obj;
        },
        save: function() {
            $.ajax({
                type: 'post',
                url: __params.url,
                data: this.getParams(),
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
                                result: res
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
         * /mobileApiWeb/cart-Cart-saveRemarks.do
         * 接口文档地址：
         * http://m.dhgate.com//mobileApiWeb/cart-Cart-saveRemarks.do
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
                //显示loading
                tip.events.trigger('popupTip:loading', true);
                //拉取初始化接口数据成功之后可下单
                placeOrderBtn.get(this.placeOrder.model);
            }
            /**
             * 最终格式化为：
             * {
             *     code: 200,
             *     data:{
             *         buyerId: "ff80808134c16a2b0134c1a5951b000a",
             *         couponCode: "506F4039CE12A9162D",
             *         orderId: "300064698"
             *     }
             * }
            **/
        }
    };
});