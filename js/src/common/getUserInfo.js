/**
 * module src: common/getUserInfo.js
 * 获取用户信息
**/
define('common/getUserInfo', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, tip, dataErrorLog){
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
        //初始化调用入口
        init: function(options) {
            //是否异步调用接口，默认为异步调用
            this.isAsync = options.isAsync===undefined?true:false;
            //是否以游客标示作为已登录状态的判断条件，默认为正常用户
            this.supportVisitors = options.supportVisitors||false;
            /**
             * isTip，默认值为true
             * 是否通过弹出层展示API数据接口异常信息；
             * ======================================
             * 如果依赖用户接口数据的功能模块不是业务
             * 核心模块，请务必将它的值设置为false；
             * ======================================
             * 反之，如果是业务核心或页面初始化正常展
             * 示所必须的功能模块依赖它的话，请务必将
             * 它的设置为true，它将展示具体异常原因并
             * 引导用户接下来的操作（此为默认操作）；
            **/
            this.isTip = options.isTip===undefined?true:false;
            //指定登录页，登录成功后跳转到的页面地址，默认跳转回当前页
            this.fixedURL = options.fixedURL||href;
            //拉取用户数据成功后执行后续逻辑的回调函数
            this.successCallback = options.successCallback;
            //指定未登录状态下去客户端app上登录需要传递的参数，主要为了登录成功之后返回给h5页面，默认为空。
            this.appLoginParam = options.appLoginParam||'';
            //拉取用户数据
            this.fetch();
        },
        //拉取用户信息
        fetch: function() {
            $.ajax({
                type: 'GET',
                url: __params.url,
                data: __params.data,
                async: this.isAsync,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state === '0x0000') {
                       this.parse(res);
                    } else {
                        if (this.isTip === true) {
                            //数据异常，关闭loading
                            tip.events.trigger('popupTip:loading', false);
                            //展示数据接口错误信息【点击ok，跳转到登录注册页】
                            tip.events.trigger('popupTip:dataErrorTip', {action:'custom',customUrl:'/login.do?returnURL='+href,message:res.message});
                        }
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
                    if (this.isTip === true) {
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，刷新页面】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Network anomaly.'});
                    }
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
         * http://192.168.76.42:8090/pages/viewpage.action?title=09+User+API&spaceKey=MOB
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
        parse: function(res) {
            var obj = {},
                //用户信息，正常用户登录可拿到
                user = res.data.user;

            //正常用户登录
            if (this.supportVisitors===false && user!==undefined) {
                obj.code = 200;
            //游客模式登录
            } else if (this.supportVisitors===true && (res.data.isVisitor===true||user!==undefined)) {
                obj.code = 200;
            //未登录
            } else {
                obj.code = -1;
            }

            //-1表示未登录状态，则跳转到登录注册页面
            if (obj.code === -1) {
                //未登录状态下，判断h5页面是调客户端的登录还是浏览器的登录
                try {
                    //ios APP
                    toLogin(this.appLoginParam);
                } catch(e) {
                    //andoird APP
                    if (window.order && window.order.toLogin) {
                        window.order.toLogin(this.appLoginParam);
                    //除此之外浏览器的打开方式
                    } else {
                        //浏览器
                        location.href = '/login.do?returnURL='+this.fixedURL;
                    }
                }
                return;
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
            this.successCallback&&this.successCallback(obj);
        }
    };
});
