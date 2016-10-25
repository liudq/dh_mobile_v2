/**
 * module src: common/detail/buyItNow.js
 * 立即购买
**/
define('common/detail/buyItNow', ['common/config','common/getUserInfo','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,getUserInfo,tip,dataErrorLog){
       //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/order-Order-buyItNow.do',
            //url: 'buyItNow.json',
            data: {}
        };
     return {
        //获取需要传递的参数数据
        getParams: function(params) {
            var obj = {
                //通用参数
                client: 'wap',
                version: '3.0',
                //产品编号
                itemcode: params.submitData.itemCode,
                //产品id
                productId: params.submitData.productId,
                //卖家id
                supplierId: params.submitData.supplierid,
                //产品计量单位（单数）
                unit: params.submitData.unit,
                //skuMd5
                skuMd5: params.submitData.skuMd5,
                //skuId
                skuid: params.submitData.skuid,
                //库存国家
                stockIn: params.submitData.stockIn,
                //物流方式
                shipTypeId: params.submitData.shipTypeId,
                //购买的产品数量
                quantity: params.submitData.quantity,
                //url#号后面所传参数统计数据调用
                impressionInfo: params.submitData.impressionInfo
            };

            //__params捕获传递过来的参数数据
            $.extend(__params.data, obj);

            return obj;
        },
        //立即购买
        fetch: function(options) {
            $.ajax({
                type: 'GET',
                url: __params.url,
                data: this.getParams(options),
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
         * /mobileApiWeb/order-Order-buyItNow.do
         * 接口文档地址：
         * http://192.168.76.42:8090/display/MOB/11.+buyItNow
         *
         * 原始数据结构
         * {
         *     "data": {},
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
        **/
        parse: function(res, model) {
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //判断用户是否登陆
            getUserInfo.init({
                fixedURL: '/placeorder/placeOrder.html',
                successCallback: function(){
                    window.location.href = '/placeorder/placeOrder.html';
                }
            });
        }
    };
});