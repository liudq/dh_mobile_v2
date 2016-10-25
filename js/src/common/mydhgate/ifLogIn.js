/**
 * module src: common/mydhgate/ifLogIn.js
 * 判断用户是否登录
**/
define('mydhgate/ifLogIn', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, tip, dataErrorLog){
    //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/buyerislogin.do',
            data: {}
        },
        href = window.location.href;

    return {
        get: function(callback, fixedURL) {
            $.ajax({
                type: 'GET',
                url: __params.url,
                async: false,
                cache: false,
                dataType: 'text',
                context: this,
                success: function(res) {
                    //已登录
                    if ($.trim(res)==='true') {
                        callback&&callback(this.parse(res,fixedURL));
                    //未登录
                    } else if($.trim(res)==='false') {
                        this.parse(res,fixedURL);
                    //异常情况
                    } else {
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，跳转到首页】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'gohome',message:res.message||'Failure'});
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
                    tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Network anomaly.'});
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
        //数据格式化
        parse: function(res, fixedURL) {
            var obj = res;
            //[true：已登录，false：未登录]
            if($.trim(obj) === 'false'){
                //href：当前浏览页面地址；
                //fixedURL：为指定跳转页面地址；
                location.href = '/login.do'+(typeof fixedURL==='undefined'?'?returnURL='+href:'?returnURL='+fixedURL);
            }
        }
    };
});
