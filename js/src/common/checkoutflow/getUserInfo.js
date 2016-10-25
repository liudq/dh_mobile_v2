/**
 * module src: common/checkoutflow/getUserInfo.js
 * 支付流程获取用户信息的模块
**/
define('checkoutflow/getUserInfo', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, tip, dataErrorLog){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/user-User-auth.do',
            //url: 'user-User-auth.do',
            data: {
                //通用接口参数
                client: 'wap',
                version: '0.1'
            }
        },
        href = window.location.href;
    
    return {
        get: function(callback, fixedURL) {
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
                        callback&&callback(this.parse(res, fixedURL));
                    } else {
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，跳转到首页】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'gohome',message:res.message});
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
        /**
         * parse（数据格式化）
         * 接口地址：
         * /mobileApiWeb/user-User-auth.do
         * 接口文档地址：
         * https://dhgatemobile.atlassian.net/wiki/display/SMS/10+User+API
         *
         * 原始数据接口
         * {
         *     "data": {
         *         //是否为游客身份
         *         "isVisitor": false,
         *         //用户信息
         *         "user": {
         *             "buyer": true,
         *             "buyerid": "4028cca850a1f1040150a1f30a730009",
         *             "domainname": "eclipse8@163.com",
         *             "email": "eclipse8@163.com",
         *             "emailisvalid": "0",
         *             "nickname": "eclipse8",
         *             "systemuserid": "4028cca850a1f1040150a1f30a77000a",
         *             "usertype": 1
         *         }
         *     },
         *     "message": "Success",
         *     "serverTime": 1445829278080,
         *     "state": "0x0000"
         * }
        **/
        parse: function(res, fixedURL) {
            var obj = {},
                //用户信息，登录后可拿到
                user = res.data.user;
            
            //返回200则说明数据可用且已登录
            obj.code = (res.state==='0x0000'&&(res.data.isVisitor===true||user!==undefined)?200:-1);
            
            //-1表示异常，则跳转到登录注册页面
            if (obj.code === -1) {
                //href：当前浏览页面地址；
                //fixedURL：为指定跳转页面地址；
                location.href = '/login.do'+(typeof fixedURL==='undefined'?'?returnURL='+href:'?returnURL='+fixedURL);
                return obj;
            }
            
            //游客身份
            obj.isVisitor = res.data.isVisitor;
            //用户信息
            obj.buyer = user&&user.buyer||'';
            obj.buyerid = user&&user.buyerid||'';
            obj.domainname = user&&user.domainname||'';
            obj.email = user&&user.email||'';
            obj.emailisvalid = user&&user.emailisvalid||'';
            obj.nickname = user&&user.nickname||'';
            obj.systemuserid = user&&user.systemuserid||'';
            obj.usertype = user&&user.usertype*1||'';
            
            /**
             * 保存各个与用户信息相关的字段值，以便后续逻辑使用
             * 最终格式化为：
             * {
             *     code: 200,
             *     isVisitor: false,
             *     buyer: true,
             *     buyerid: '',
             *     domainname: '',
             *     email: '',
             *     emailisvalid: '',
             *     nickname: '',
             *     systemuserid: '',
             *     usertype: 0
             * }
            **/
            return obj;
        }
    };
});
