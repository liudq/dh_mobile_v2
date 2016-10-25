/**
 * module src: common/detail/getFavoriteState.js
 * 获取当前点击收藏的状态
**/
define('common/detail/getFavoriteState', ['common/config', 'checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,tip,dataErrorLog){
       //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        });
    return {
        //获取当前收藏状态
        get: function(obj,callback) {
            $.ajax({
                type: 'GET',
                url:  CONFIG.wwwURL+obj.url,
                data: obj.data,
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        callback&&callback();
                    } else {
                        //展示数据接口错误信息【点击ok，关闭页面】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:res.message});
                        //捕获异常
                        try {
                            throw('success(): data is wrong');
                        } catch(e) {
                            //异常数据收集
                            dataErrorLog.events.trigger('save:dataErrorLog', {
                                message: e,
                                url: obj.url,
                                params: obj.data,
                                result: res
                            });
                        }
                    }
                },
                error: function(){
                    //关闭loading
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
                            url: obj.url,
                            params: obj.data
                        });
                    }
                }
            });
        }
    };
});
