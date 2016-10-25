/**
 * module src: common/mydhgate/order/shippedOrder.js
 * 完成订单模块
**/
define('mydhgate/order/shippedOrder',['common/config','lib/backbone','checkoutflow/popupTip','checkoutflow/dataErrorLog'],function(CONFIG,Backbone,tip,dataErrorLog){
    //model-完成订单
    var shippedOrderModel = Backbone.Model.extend({
        defaults: function() {
            return {
                //状态码
                code: -1
            }
        },
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                ajaxOptions: {
                    url: '/completeOrder.do',
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
        //设置生成模型的url
        urlRoot: function() {
            return this.ajaxOptions.url;
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
            //状态码
            obj.code = res.result==='1'?200:-1;
            return obj;
        }
    });
    
    //view-完成订单
    var shippedOrderView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .order-shipped': 'shippedOrderByRfid'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.oOrderType = this.options.oOrderType;
            this.cSelected = this.options.cSelected;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化事件
            this.initEvent();
        },
        //设置自定义配置
        setOptions: function(options){
            this.options = {
                //订单状态
                oOrderType:'.j-order-type',
                //当前选中项的className
                cSelected: 'selected',
                //数据模型
                model: new shippedOrderModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //拉取数据成功回调
        success: function(model,response,options) {
            var self = this;
                $autoLayerWarp = $('.j-auto-layer'),
                cHide = 'dhm-hide';

            if (model.get('code') === 200) {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //提示完成订单后刷新页面
                tip.events.trigger('popupTip:autoTip',{message:'Order received.',callback:function(){
                    $autoLayerWarp.removeClass(cHide).animate({opacity:1}, 500);
                    setTimeout(function(){
                        $autoLayerWarp.animate({opacity:0}, 500, function(){
                            $autoLayerWarp.addClass(cHide);
                            //刷新当前页
                            self.toCancelArea();
                        });
                    }, 1000);
                }});
            } else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:response.message||'Sorry, Order cannot be confirmed.'});
                //刷新当前页
                self.toCancelArea();
                //捕获异常
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
        },
        //拉取数据失败回调
        error: function() {
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，关闭提示】
            tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
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
        //获取订单id
        getRfid: function(evt) {
            var $ele = $(evt.target).parents('p');
            //订单id
            this.rfid = $ele.attr('rfid');
        },
        //完成订单
        shippedOrderByRfid: function(evt) {
            //确认是否收到订单
            if(confirm("Have you received your order and you are satistied with it?")) {
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                //获取订单信息
                this.getRfid(evt);
                //确认订单
                this.model.fetch({data:{rfid: this.rfid}});
            }
        },
        /**
         * 获取当前展示订单列表类型的索引值
         * [
         *     1: 待付款订单
         *     2: 待确认订单
         *     3: 待发货订单
         *     4: 已发货订单
         *     5: 已完成订单
         *     6: 纠纷状态订单
         *     7: 取消状态订单
         * ]
        **/
        getRft: function() {
            return $(this.oOrderType).find('.'+this.cSelected).index()+1;
        },
        //跳转地址处理
        handleUrl: function() {
            var url,
                hash = location.hash,
                href = window.location.href;
            //订单详情页直接刷新当前地址
            if (/orderdetail.html/i.test(href)) {
                url = href;
            //订单列表则需要改变当前地址中rft的值
            } else {
                url = href.replace(hash,'').replace(/(.+)(rft=[^&#]*)(.*)/i, '$1rft='+this.getRft()+'$3');
            }
            return url;
        },
        //刷新当前页面
        toCancelArea: function() {
            window.location.replace(this.handleUrl());
        }
    });
    
    return shippedOrderView;
});


