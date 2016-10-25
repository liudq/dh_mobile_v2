
/**
 * module src: home/userAttention.js
 * 查询BC用户类型打标模块
 **/

define('app/userAttention',['common/config', 'lib/backbone','app/saveUserAttention', 'appTpl/userAttentionTpl','checkoutflow/dataErrorLog'],function(CONFIG, Backbone,saveUserAttention, tpl, dataErrorLog){
    //model-查询用户类型
    var userAttentionModel = Backbone.Model.extend({
        //查询用户类型属性[attributes]
        defaults: function() {
            return {
                //状态码
                code:-1,
                //用户类型
                buyerType:'C'
            }
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
                ajaxOptions: {
                    url: '/mobileApiWeb/user-Attention-getUserAttention.do',
                    //url: '/mobile_v2/css/home/html/getUserAttention.do',
                    data: {
                        client: 'wap'
                    },
                    type: 'GET',
                    dataType: 'json',
                    async: true,
                    cache: false,
                    //发送到服务器的数据，将自动转换为请求字符串格式
                    //例如：{foo:["bar1", "bar2"]} 转换为 "&foo=bar1&foo=bar2"
                    //在此处显示告诉$.ajax()需要对象序列化，这样就不需要设置
                    //Backbone.emulateJSON = true
                    processData: true
                }
            };
            $.extend(true,this.options,options||{});
        },
        //设置生成模型url
        urlRoot: function() {
            return CONFIG.wwwURL + this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            //请求异常的时候“dataErrorLog”会捕获“__params”
            this.__params = $.extend(true, {}, this.ajaxOptions, options||{});
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            var obj = {};
            //接口请求成功时
            if(res.state === '0x0000') {
                obj.code = 200;
            //未登录时接口的状态
            } else if(res.state === '0x0002') {
                obj.code = 201;
            } else {
            //接口请求失败或其他情况
                obj.code = -1;
            }
            obj.buyerType = (res.data && res.data.userAttention && res.data.userAttention.buyerType)?res.data.userAttention.buyerType:'';
            return obj;
        }
    });
    //view- 查询是否为已打标用户
    var userAttentionView = Backbone.View.extend({
        //根节点
        el: 'body',
        events: {
            'click .atten': 'chooseAttention',
            'click .done': 'saveAttention'
        },
        //初始化入口
        initialize: function (options) {
            //配置对象初始化
            this.setOptions(options);
            this.userAttentionWarp = this.options.userAttentionWarp;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取产品数据
            this.model.fetch();
        },
        //$dom对象初始化
        initElement: function() {
            this.$userAttentionWarp = $(this.userAttentionWarp);
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //bc打标弹层包裹外层
                userAttentionWarp:'.j-userAttention',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new userAttentionModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        success: function(model,response,options) {
            if(model.get('code') === 200 && model.get('buyerType')==='') {
                this.render(model.attributes);
            } else {
                //捕获异常
                if(model.get('code') === -1){
                    try {
                        throw('success(): data is wrong');
                    } catch(e) {
                        //异常数据收集
                        this.dataErrorLog.events.trigger('save:dataErrorLog', {
                            message: e,
                            url: this.model.__params.url,
                            params: this.model.__params.data,
                            result: response
                        });
                    }
                }

            }
        },
        error: function() {
            //捕获异常
            try {
                throw('error(): request is wrong');
            } catch(e) {
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
        },
        render: function(data) {
            //数据成功则绘制页面
            this.renderUserAttention(data);
        },
        //渲染打标页面
        renderUserAttention: function(data) {
            var template = this.template,
                tpl = this.tpl,
                userAttention = template(tpl.userAttention.join(''))(data);
            this.$userAttentionWarp.append(userAttention);
        },
        //选择B类或者C类用户类型的交互
        chooseAttention: function(evt) {
            var target = $(evt.target).closest('.atten'),
                otherTarget = target.siblings('.atten'),
                done = $('.done');
            if(target.hasClass('choose')) {
                target.removeClass('choose');
                otherTarget.removeClass('choose');
                done.addClass('default');
            } else {
                target.addClass('choose');
                otherTarget.removeClass('choose');
                done.removeClass('default');
            }
        },
        //点击done按钮之后的操作
        saveAttention: function() {
            var done = $('.done');
            //调用保存用户类型的方法
            if(done.hasClass('default')) {
                return;
            } else {
                saveUserAttention.init();
                this.closeLayer();
            }
        },
        //关闭弹层
        closeLayer: function() {
            var layer = $('.j-userAttention');
            layer.css('display','none');
        }
    })
    return userAttentionView;
})
