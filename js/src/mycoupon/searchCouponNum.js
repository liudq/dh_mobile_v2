/**
 * module src: mycoupon/searchCouponNum.js
 * 获取used和过期coupon
**/
define('app/searchCouponNum', ['common/config', 'checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,tip,dataErrorLog){
       //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        //接口文档地址：http://192.168.76.42:8090/pages/viewpage.action?pageId=1573625
        __params = {
            url: '/mobileApiWeb/coupon-Coupon-getCouponCountOfUsedAndExpired.do'
        };

    return {
        init: function(options){
            this.get(options.loginFlag);
        },
        get: function(loginFlag) {
            var UsedExpiredNum = $('.j-UsedExpiredNum');

            $.ajax({
                type: 'POST',
                url:  CONFIG.wwwURL+__params.url,
                //url:'coupon-Coupon-getCouponCountOfUsedAndExpired.do',
                data:{'client':'wap'},
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        UsedExpiredNum.html(res.data.count);
                    } else {
                        //捕获异常
                        try{
                            throw('success(): data is wrong');
                        }catch(e){
                        //异常数据收集
                            dataErrorLog.events.trigger('save:dataErrorLog', {
                                message: e,
                                url: __params.url,
                                params: {'client':'wap'},
                                result: res,
                                custom: {
                                    loginFlag: loginFlag
                                }
                            });
                        }
                    }
                },
                error: function(){
                    //捕获异常
                    try{
                        throw('error(): request is wrong');
                    }catch(e){
                        //异常数据收集
                        dataErrorLog.events.trigger('save:dataErrorLog', {
                            message: e,
                            url: __params.url,
                            params:{'client':'wap'}
                        });
                    }
                }
            });
        }
    };
});
