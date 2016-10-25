/**
 * module src: placeOrder/placeOrderBtn.js
 * 点击placeOrder按钮提交订单
**/
define('app/placeOrderBtn', ['common/config','lib/backbone','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,tip,dataErrorLog){
       //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/order-Order-submitToPayment.do',
            //url: 'placeOrderSubmit.json',
            data: {
                //通用接口参数
                client: 'wap',
                version: '0.1',
                needSplitOrder: 1
            }
        };
     return {
        get: function(model) {
            $.ajax({
                type: 'GET',
                url: __params.url,
                data: __params.data,
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        this.parse(res, model);
                    }else {
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
         * mobileApiWeb/order-Order-submitToPayment.do
         * 接口文档地址：
         * http://m.dhgate.com/mobileApiWeb/order-Order-submitToPayment.do
         *
         * 说明：
         * 就目前WAP端业务而言并不会用到所有的字段信息
         *
         * 原始数据结构
         * {
         *     "data": {
         *         //placeOrder金额信息
         *         "amount":"",
         *         "orderIds":""
         *     },
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
        **/
        parse: function(res, model) {
            var obj = {};
            obj.code = (res.state==='0x0000'?200:-1);
            if (obj.code !== -1) {
                var  orderNo =res.data.orderIds;
               //拉取数据成功跳转到payment页面
               location.replace('/payment/pay.html?orderNo='+orderNo);
            }
        }
    };
});