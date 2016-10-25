/**
 * module src: common/checkoutflow/thirdPartyCode.js
 * 加载第三方跟踪代码模块
**/
define('checkoutflow/thirdPartyCode', ['common/config', 'checkoutflow/dataErrorLog'], function(CONFIG, dataErrorLog){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/order-Tracking-get.do',
            //url: 'order-Tracking-get.do',
            data: {}
        };

    var ThirdPartyCode = function(options) {
        //配置对象初始化
        this.setOptions(options);
        this.params = this.options.params;
        this.loadDataUrl = this.options.loadDataUrl;
        this.loadDataSuccess = this.options.loadDataSuccess;
        this.parse = this.options.parse;
        this.loadScriptUrl = this.options.loadScriptUrl;
        this.loadScriptSuccess = this.options.loadScriptSuccess;
        this.isScriptCache = this.options.isScriptCache;

        //拉取基础业务数据
        this.loadData($.proxy(this.loadDataSuccess, this));
    };

    //注册静态方法和属性
    $.extend(ThirdPartyCode, {
        //根节点
        $el: $('body'),
        //初始化入口
        init: function(options) {
            return new ThirdPartyCode(options);
        },
        //基础业务数据缓存
        cache: null,
        //标记是否已经拉取过业务数据
        flag: false
    });

    //注册原型方法
    $.extend(ThirdPartyCode.prototype, {
        //设置配置对象
        setOptions: function(options) {
            this.options = {
                //业务接口所需参数
                params: {},
                //基础业务数据接口地址
                loadDataUrl: '',
                //基础业务数据接口成功回调
                loadDataSuccess: $.noop,
                //数据格式化
                parse: $.noop,
                //第三方入口脚本文件地址
                loadScriptUrl: '',
                //第三方入口脚本文件重复请求时是否需要缓存
                isScriptCache: true,
                //第三方入口脚本文件成功回调
                loadScriptSuccess: $.noop
            };
            $.extend(true, this.options, options||{});
        },
        //添加队列
        add: function(func) {
            ThirdPartyCode.$el.queue('thirdPartyCode', func);
        },
        //执行队列
        run: function(name) {
            var $el = ThirdPartyCode.$el;
            if (!$el.queue(name).length) {
                return false;
            }
            $el.dequeue(name);
            this.run(name);
        },
        //设置缓存数据
        setCache: function(data) {
            ThirdPartyCode.cache = data;
        },
        //获取缓存数据
        getCache: function() {
            //返回数据副本
            return $.extend(true, {}, ThirdPartyCode.cache||{}).data;
        },
        //获取需要传递的参数数据
        getParams: function() {
            var obj = {};
            //通用接口参数
            obj.client = 'wap';
            obj.version = '0.1';

            //__params捕获传递过来的参数数据
            $.extend(__params.data, obj, this.params);

            return $.extend(obj, this.params);
        },
        //获取第三方业务数据
        loadData: function(successCallback) {
            //命中缓存数据则直接执行
            if (ThirdPartyCode.cache !== null) {
                successCallback();
            //否则添加到队列中，随后在ajax:success()中得到执行
            } else {
                this.add(successCallback);
            }

            //查看是否已经拉取过数据
            if (!ThirdPartyCode.flag) {
                /**
                 * 接口地址：
                 * /mobileApiWeb/order-Tracking-get.do
                 * 接口文档地址：
                 * https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=26607622
                 *
                 * 说明：
                 * 因为不同的第三方代码所需业务数据各不相同，故将该接口数据的parse()，设计为为用
                 * 户自定义接口，由用户自行实现parse()功能
                 *
                 * 原始数据结构
                 * {
                 *     "data":{
                 *         //类目id列表
                 *         "categoryIds":"100003004,107006",
                 *         //类目名称列表
                 *         "categorys":"Hoop & Huggie,Cosmetic Bags & Cases",
                 *         //国家id
                 *         "countryId":"US",
                 *         //ip地址
                 *         "ip":"127.0.0.1",
                 *         //itemcode列表
                 *         "itemCodes":"218616013,218617133",
                 *         //订单列表
                 *         "orders":"300057895,300057896",
                 *         //价格列表
                 *         "prices":"28.41,362.31",
                 *         //数量列表
                 *         "quantitys":"2,1",
                 *         //币种
                 *         currency: '',
                 *         //订单总花费
                 *         totalPrice: '',
                 *         //运费
                 *         shipCost: '',
                 *         //折扣优惠
                 *         discount: ''
                 *     },
                 *     "message":"Success",
                 *     "serverTime":1448863871040,
                 *     "state":"0x0000"
                 * }
                **/
                $.ajax({
                    type: 'POST',
                    url: __params.url,
                    data: this.getParams(),
                    async: true,
                    cache: false,
                    dataType: 'json',
                    context: this,
                    success: function(res) {
                        //0x0000等于200成功状态
                        if (res.state==='0x0000') {
                            //写入缓存
                            this.setCache(res);
                            //执行队列中的所有回调函数
                            this.run('thirdPartyCode');
                        } else {
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
                    error: function() {
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

            //改变flag状态
            ThirdPartyCode.flag = true;
        },
        //获取第三方入口文件地址
        getLoadScriptUrl: function() {
            var url,
                loadScriptUrl = this.loadScriptUrl;
            //缓存第三方入口脚本文件
            if (this.isScriptCache) {
                url = /\?/.test(loadScriptUrl)?loadScriptUrl+'&v='+CONFIG.version:loadScriptUrl+'?v='+CONFIG.version;
            //反之
            } else {
                url = /\?/.test(loadScriptUrl)?loadScriptUrl+'&v='+(new Date()).getTime():loadScriptUrl+'?v='+(new Date()).getTime();
            }
            return url;
        },
        //加载第三方入口脚本文件
        loadScript: function() {
            $.ajax({
                type: 'GET',
                url: this.getLoadScriptUrl(),
                context: this,
                async: true,
                cache: true,
                dataType: 'script',
                success: this.loadScriptSuccess
            });
        }
    });

    return ThirdPartyCode;
});
