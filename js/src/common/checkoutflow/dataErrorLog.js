/**
 * module src: common/checkoutflow/dataErrorLog.js
 * 收集请求后端接口数据异常的日志模块
**/
define('checkoutflow/dataErrorLog', ['common/config'], function(CONFIG){
    var dataErrorLog = function(options) {
        //初始化配置对象
        this.setOptions(options);
        this.setOptions(options);
        this.el = this.options.el;
        this.div = this.options.div;
        this.img = this.options.img;
        this.flag = this.options.flag;
        this.url = this.options.url;
        this.events = $({});
        
        //初始化调用
        this.init();
    };
    
    $.extend(dataErrorLog.prototype, {
        init: function() {
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //自定义配置对象
        setOptions: function(options) {
            this.options = {
                //根节点
                el: 'body',
                //日志图片外层包裹容器
                div: '<div>',
                //日志图片
                img: '<img>',
                //独立开关控制
                flag: false,
                //接收日志的后台接口地址
                url: ''
            };
            $.extend(this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$el = this.$el||$(this.options.el);
            this.$div = $(this.div);
            this.$img = $(this.img);
        },
        //事件初始化
        initEvent: function() {
            this.events.on('save:dataErrorLog', $.proxy(this.save, this));
        },
        //获取浏览器上一次浏览的页面地址
        getReferrerUrl: function() {
            return document.referrer;
        },
        //获取浏览器当前页面地址
        getUrl: function() {
            return location.href;
        },
        //获取当地时间戳
        getLocalTime: function() {
            return (new Date()).getTime();
        },
        //获取需要存储的日志数据
        getParams: function(data) {
            var obj = {};
            //try-catch抛出的错误信息
            obj.message = data.message;
            //页面相关地址
            obj.url = {};
            //当前地址
            obj.url.u1 = this.getUrl();
            //上一个页面地址
            obj.url.u2 = this.getReferrerUrl()||'';
            //数据接口地址
            obj.url.u3 = data.url;
            //请求数据接口所带的参数
            obj.params = (data.params&&$.extend(true, {}, data.params))||{};
            //请求数据接口所返回的错误数据
            obj.result = (data.result&&$.extend(true, {}, data.result))||{};
            //当地时间
            obj.localTime = this.getLocalTime();
            //自定义错误信息
            obj.custom = (data.custom&&$.extend(true, {}, data.custom))||{};
            
            /**
             * 返回的对象结构基本如下
             * {
             *     message: '',
             *     url {
             *         u1: '',
             *         u2: '',
             *         u3: ''
             *     },
             *     params: {
             *         client: '',
             *         version: '',
             *         orderNo: ''
             *         ...
             *     },
             *     result: {
             *         ...
             *     },
             *     localTime: 0
             *     custom: {
             *         ...
             *     }
             * }
            **/
            return obj;
        },
        //保存日志数据
        save: function(evt, data) {
            //开关控制，是否需要保存日志数据
            if (!this.flag || this.url === '') {
                return;
            }

            //确保HTML不会在页面上展示
            this.$div.css({
                display: 'none'
            });
            
            //设置日志图片属性
            this.$img.css({
                width: 1,
                height: 1,
                borderStyle: 'none'
            }).attr({
                src: this.url+'?client=wap&v='+encodeURIComponent(JSON.stringify(this.getParams(data)))
            });

            //发送日志数据
            this.$el.append(this.$div.append(this.$img));
            
            //重新初始化$dom对象
            this.initElement();
        }
    });
    
    return dataErrorLog;
});