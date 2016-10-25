/**
 * module src: payment/cardPayJump.js
 * 银行卡支付跳转，支持3D模式的模块
**/
define('app/cardPayJump', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, tip, dataErrorLog){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/pay-CardPay-payment.do',
            //url: 'pay-CardPay-payment.do',
            data: {}
        };
    
    return {
        init: function(options) {
            this.pay(options);
        },
        //获取需要传递的参数数据
        getParams: function(params) {
            var obj = {
                //通用接口参数
                client: 'wap',
                version: '0.1',
                //订单No
                orderNo: params.orderNo,
                //银行卡Id
                cardId: params.cardId||'',
                //银行卡csc认证码
                token: params.csc||'',
                //支付币种
                currency: params.currency||'',
                //支付方式（目前只支持ideal）
                payWay: params.payWay||''
            };
            
            //__params捕获传递过来的参数数据
            $.extend(__params.data, obj);
            
            return obj;
        },
        //发起银行卡支付
        pay: function(options) {
            $.ajax({
                type: 'POST',
                url: __params.url,
                data: this.getParams(options),
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        this.jump(this.parse(res));
                    } else {
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，刷新页面】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:res.message});
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
                    //展示数据接口错误信息【点击ok，关闭提示】
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
         * /mobileApiWeb/pay-CardPay-payment.do
         * 接口文档地址：
         * https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?spaceKey=SMS&title=04+Pay+API
         *
         * 原始数据结构；
         * {
         *     "data":{
         *         //是否为3D模式
         *         "3D":true,
         *         //订单信息
         *         "orders":[
         *             {
         *                 //订单Id目前已经废弃，返回的值将与订单No相同
         *                 "orderId":"4028cca84f6361c9014f6374b897006b",
         *                 //订单No
         *                 "orderNo":"1531158845"
         *             }
         *         ],
         *         //3D模式的跳转地址
         *         "url":"https://www.dhpay.com/gateway/api.do?act=nextStep&bank_code=ADYEN&dhpay_order_id=20150825140507_169213"
         *     },
         *     "message":"pay.3d.jump",
         *     "serverTime":1440482711477,
         *     "state":"0x0000"
         * }
        **/
        parse: function(res) {
            var obj = {};
            obj.code = (res.state==='0x0000'?200:-1);
            obj.orderNo = [];

            if (obj.code !== -1) {
                $.each(res.data.orders, function(index, order){
                    obj.orderNo.push(order.orderNo);
                });

                obj['3d'] = res.data['3D'];
                obj['url'] = res.data['url'];
            }
            /**
             * 最终格式化为：
             * {
             *     code: 200,
             *     orderNo: [],
             *     3d: false,
             *     url: ''
             * }
            **/
            return obj;
        },
        //跳转页面
        jump: function(data) {
            //3D模式跳转
            if (data['url']) {
                location.replace(data.url);
            //非3D模式跳转
            } else {
                location.replace('/payment/paySucc.html?orderNo='+data.orderNo.join(','));
            }
        }
    };
});
