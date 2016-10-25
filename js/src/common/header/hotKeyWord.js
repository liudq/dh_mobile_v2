/**
 * module src: common/header/hotKeyWord.js
 * 页面顶部搜索：热门关键词
**/
define('common/header/hotKeyWord', ['common/config', 'lib/backbone', 'tpl/header/hotKeyWordTpl','checkoutflow/dataErrorLog'], function(CONFIG, Backbone, tpl,dataErrorLog){
    //model-热门关键词数据
    var HotKeyWordModel = Backbone.Model.extend({
        //热门关键词默认属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //热门关键词列表
                list: []
            };
        },
        /**
         * 初始化入口
         * argument[0|1]:
         * 0: [attributes]
         * 1: [options]
        **/
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    //url: '/api.php?jsApiUrl=http://m.dhgate.com/getrelatedsearchwords.do',
                    url: '/getrelatedsearchwords.do',
                    type: 'GET',
                    async: true,
                    cache: false,
                    dataType: 'json',
                    //发送到服务器的数据，将自动转换为请求字符串格式
                    //例如：{foo:["bar1", "bar2"]} 转换为 "&foo=bar1&foo=bar2"
                    //在此处显示告诉$.ajax()需要对象序列化，这样就不需要设置
                    //Backbone.emulateJSON = true
                    processData: true
                }
            };
            $.extend(true, this.options, options||{});
        },
        //设置生成模型的url
        urlRoot: function() {
            return CONFIG.wwwURL + this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
             //请求异常的时候“dataErrorLog”会捕获“__params”
            this.__params = $.extend(true, {}, this.ajaxOptions, options||{});
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            return {
                code: res.code==='10001'?200:-1,
                list: res.data
            }
        }
    });

    //view-热门关键词
    var HotKeyWordView = Backbone.View.extend({
        //根节点
        el: '#J_searchList',
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.template = this.options.template;
            this.model = this.options.model;
            this.cActive = this.options.cActive;
            this.cHide = this.options.cHide;
            this.dataErrorLog = this.options.dataErrorLog;
            this.cache = null;
            
            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            this.on('render', this.load, this);
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //设置对应样式的className
                cActive: 'search-hot',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //模板
                template: _.template(tpl.join('')),
                //数据模型
                model: new HotKeyWordModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据模型
        load: function() {
            !this.cache?this.model.fetch():this.render();
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                this.render(this.tplRender());
            } else {
                //捕获异常
                try{
                    throw('success(): data is wrong');
                }catch(e){
                    //异常数据收集
                    this.dataErrorLog.events.trigger('save:dataErrorLog', {
                        message: e,
                        url: this.model.__params.url,
                        params: this.model.__params.data,
                        result: response
                    });
                }
            }
        },
        //拉取数据失败回调
        error: function(model, response, options) {
            //捕获异常
            try{
                throw('error(): request is wrong');
            }catch(e){
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
        },
        //模板渲染
        tplRender: function() {
            return (this.cache = this.template(this.model.attributes));
        },
        //页面渲染
        render: function(str) {
            this.$el.html(str||this.cache).addClass(this.cActive).removeClass(this.cHide);
        }
    });
    
    return HotKeyWordView;
});