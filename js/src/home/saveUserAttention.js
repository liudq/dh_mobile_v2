
/**
 * module src: home/saveUserAttention.js
 * 保存BC用户类型打标模块
 **/

define('app/saveUserAttention',['common/config', 'lib/backbone','tools/fastclick','checkoutflow/dataErrorLog'],function(CONFIG, Backbone, FastClick, dataErrorLog){
    //收集请求后端接口的异常
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
    //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/user-Attention-savaOrUpdateUserAtten.do',
            data: {}
        };
    return {
        init: function(options) {
            //保存用户类型
            this.save();
        },
        //获取参数
        getParams: function() {
            var obj = {};
            obj.client = 'wap';
            obj.userType = $('.choose').attr('user-type');

            //__params捕获传递过来的参数数据
            $.extend(__params.data,obj);

            return obj;
        },
        //保存用户类型
        save: function() {
            $.ajax({
                type: 'GET',
                url: __params.url,
                data: this.getParams(),
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        return;
                    }else {
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
        }
    }
});
