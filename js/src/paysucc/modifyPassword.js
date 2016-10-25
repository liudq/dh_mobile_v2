/**
 * module src: paySucc/modifyPassword.js
 * 游客支付成功修改密码
**/
define('app/modifyPassword', ['common/config', 'checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,tip,dataErrorLog){
       //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        //接口文档地址：https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=24248348
        __params = {
            url: '/mobileApiWeb/user-Visitor-modify.do'
            //url: 'http://css.dhresource.com/mobile_v2/css/paymentsucc/html/user-Visitor-modify.do'
        };

    return {
        getParams: function(targetVal){
            var obj = {
                "newPassword":targetVal,
                "confirmPassword":targetVal,
                //通用接口参数
                client: 'wap',
                version: '0.1'
            };

            return obj;
        },
        get: function(targetVal) {
            var guestmode = $('.j-guestmode'),
                $autoLayerWarp = $('.j-auto-layer'),
                cHide = 'dhm-hide';

            //打开loading
            tip.events.trigger('popupTip:loading', true);

            $.ajax({
                type: 'POST',
                url:  CONFIG.wwwURL+__params.url,
                data: this.getParams(targetVal),
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        //关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，刷新页面】
                        tip.events.trigger('popupTip:autoTip',{message:'Password reset successful!',callback:function(){
                            $autoLayerWarp.removeClass(cHide).animate({opacity:1}, 500);
                            setTimeout(function(){
                                $autoLayerWarp.animate({opacity:0}, 500, function(){$autoLayerWarp.addClass(cHide);guestmode.hide();});
                            }, 3000);
                        }});
                    } else {
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，关闭提示】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:res.message});
                        //捕获异常
                        try{
                            throw('success(): data is wrong');
                        }catch(e){
                        //异常数据收集
                            dataErrorLog.events.trigger('save:dataErrorLog', {
                                message: e,
                                url: __params.url,
                                params: this.getParams(targetVal),
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
                    try{
                        throw('error(): request is wrong');
                    }catch(e){
                        //异常数据收集
                        dataErrorLog.events.trigger('save:dataErrorLog', {
                            message: e,
                            url: __params.url,
                            params: this.getParams(targetVal)
                        });
                    }
                }
            });
        }
    };
});
