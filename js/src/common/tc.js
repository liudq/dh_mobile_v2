/**
 * module src: common/tc.js
 * 加载第三方跟踪代码模块
**/
define('common/tc', ['common/config', 'checkoutflow/dataErrorLog'], function(CONFIG, dataErrorLog){
    //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        });
        
    var Tc = function(options) {
        //配置对象初始化
        this.setOptions(options);
        this.url = this.options.url;
        this.params = this.options.params;
        this.loadDataUrl = this.options.loadDataUrl;
        this.loadDataSuccess = this.options.loadDataSuccess;
        this.parse = this.options.parse;
        this.loadScriptUrl = this.options.loadScriptUrl;
        this.loadScriptSuccess = this.options.loadScriptSuccess;
        this.isScriptCache = this.options.isScriptCache;
        //请求业务数据异常的时候“dataErrorLog”会捕获“__params”
        this.__params = {
            //捕获的接口地址
            url: CONFIG.wwwURL + this.url,
            //捕获的接口参数
            data: {}
        };

        //带有接口地址时拉取基础业务数据
        this.url&&this.loadData($.proxy(this.loadDataSuccess, this));
    };

    //注册静态方法和属性
    $.extend(Tc, {
        //根节点
        $el: $('body'),
        //初始化入口
        init: function(options) {
            return new Tc(options);
        },
        //基础业务数据缓存
        cache: null,
        //标记是否已经拉取过业务数据
        flag: false
    });

    //注册原型方法
    $.extend(Tc.prototype, {
        //设置配置对象
        setOptions: function(options) {
            this.options = {
                //业务接口地址
                url: '',
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
            Tc.$el.queue('tc', func);
        },
        //执行队列
        run: function(name) {
            var $el = Tc.$el;
            if (!$el.queue(name).length) {
                return false;
            }
            $el.dequeue(name);
            this.run(name);
        },
        //设置缓存数据
        setCache: function(data) {
            Tc.cache = data;
        },
        //获取缓存数据
        getCache: function() {
            //返回数据副本
            return $.extend(true, {}, Tc.cache||{}).data;
        },
        //获取需要传递的参数数据
        getParams: function() {
            var obj = {};
            //通用接口参数
            obj.client = 'wap';
            obj.version = '0.1';

            //__params捕获传递过来的参数数据
            $.extend(this.__params.data, obj, this.params);

            return $.extend(obj, this.params);
        },
        //获取第三方业务数据
        loadData: function(successCallback) {
            //命中缓存数据则直接执行
            if (Tc.cache !== null) {
                successCallback();
            //否则添加到队列中，随后在ajax:success()中得到执行
            } else {
                this.add(successCallback);
            }

            //查看是否已经拉取过数据
            if (!Tc.flag) {
                $.ajax({
                    type: 'POST',
                    url: this.__params.url,
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
                            this.run('tc');
                        } else {
                            //捕获异常
                            try {
                                throw('success(): data is wrong');
                            } catch(e) {
                                //异常数据收集
                                dataErrorLog.events.trigger('save:dataErrorLog', {
                                    message: e,
                                    url: this.__params.url,
                                    params: this.__params.data,
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
                                url: this.__params.url,
                                params: this.__params.data
                            });
                        }
                    }
                });
            }

            //改变flag状态
            Tc.flag = true;
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

    return Tc;
});
