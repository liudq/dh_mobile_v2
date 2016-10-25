/**
 * module src: order/orderType.js
 * 获取不同状态的订单数模块
 **/
define('app/orderType',['common/config','lib/backbone', 'appTpl/orderListTpl','checkoutflow/popupTip','checkoutflow/dataErrorLog','tools/fastclick', 'ui/iscroll'],function(CONFIG,Backbone,tpl,tip,dataErrorLog,FastClick,Iscroll){
    //model-获取不同状态的订单数
    var orderTypeModel = Backbone.Model.extend({
        //获取不同状态的订单数初始化属性
        defaults: function() {
            return {
                //状态码
                code: -1,
                //待付款订单总数
                awaitingpaycount: {
                    //总记录数
                    sum: 0,
                    //总页数
                    totalPage: 0
                },
                //待确认订单总数
                pendingConfirmationcount: {
                    //总记录数
                    sum: 0,
                    //总页数
                    totalPage: 0
                },
                //待发货订单总数
                awaitingShipmentcount: {
                    //总记录数
                    sum: 0,
                    //总页数
                    totalPage: 0
                },
                //已发货订单总数
                shippedcount: {
                    //总记录数
                    sum: 0,
                    //总页数
                    totalPage: 0
                },
                //已完成订单总数
                completedcount: {
                    //总记录数
                    sum: 0,
                    //总页数
                    totalPage: 0
                },
                //纠纷状态订单总数
                refundcount: {
                    //总记录数
                    sum: 0,
                    //总页数
                    totalPage: 0
                },
                //取消状态订单总数
                canceledcount: {
                    //总记录数
                    sum: 0,
                    //总页数
                    totalPage: 0
                }
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
                ajaxOptions:{
                    url: '/getOrdersCountByStatus.do',
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
            var obj = {},
                ordersCount;
            //状态码
            obj.code = res.result==='1'?200:-1;

            if (obj.code !== -1) {
                //不同类型下的订单数量集合
                ordersCount = res.ordersCount;

                //待付款订单
                if (ordersCount.awaitingpaycount) {
                    obj.awaitingpaycount = {};
                    obj.awaitingpaycount.sum = ordersCount.awaitingpaycount<100?ordersCount.awaitingpaycount:'99+';
                    obj.awaitingpaycount.totalPage = Math.ceil(ordersCount.awaitingpaycount/5);
                }
                //待确认订单总数
                if (ordersCount.pendingConfirmationcount) {
                    obj.pendingConfirmationcount = {};
                    obj.pendingConfirmationcount.sum = ordersCount.pendingConfirmationcount<100?ordersCount.pendingConfirmationcount:'99+';
                    obj.pendingConfirmationcount.totalPage = Math.ceil(ordersCount.pendingConfirmationcount/5);
                }
                //待发货订单总数
                if (ordersCount.awaitingShipmentcount) {
                    obj.awaitingShipmentcount = {};
                    obj.awaitingShipmentcount.sum = ordersCount.awaitingShipmentcount<100?ordersCount.awaitingShipmentcount:'99+';
                    obj.awaitingShipmentcount.totalPage = Math.ceil(ordersCount.awaitingShipmentcount/5);
                }
                //已发货订单总数
                if (ordersCount.shippedcount) {
                    obj.shippedcount = {};
                    obj.shippedcount.sum = ordersCount.shippedcount<100?ordersCount.shippedcount:'99+';
                    obj.shippedcount.totalPage = Math.ceil(ordersCount.shippedcount/5);
                }
                //已完成订单总数
                if (ordersCount.completedcount) {
                    obj.completedcount = {};
                    obj.completedcount.sum = ordersCount.completedcount<100?ordersCount.completedcount:'99+';
                    obj.completedcount.totalPage = Math.ceil(ordersCount.completedcount/5);
                }
                //纠纷状态订单总数
                if (ordersCount.refundcount) {
                    obj.refundcount = {};
                    obj.refundcount.sum = ordersCount.refundcount<100?ordersCount.refundcount:'99+';
                    obj.refundcount.totalPage = Math.ceil(ordersCount.refundcount/5);
                }
                //取消状态订单总数
                if (ordersCount.canceledcount) {
                    obj.canceledcount = {};
                    obj.canceledcount.sum = ordersCount.canceledcount<100?ordersCount.canceledcount:'99+';
                    obj.canceledcount.totalPage = Math.ceil(ordersCount.canceledcount/5);
                }
            }

            return obj;
        }
    });
    
    //view-获取不同状态的订单数
    var orderTypeView = Backbone.View.extend({
        //根节点
        el: 'body',
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cOrderHeader = this.options.cOrderHeader;
            this.oOrderTypeWap = this.options.oOrderTypeWap;
            this.oOrderListWap = this.options.oOrderListWap;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.successCallback = this.options.successCallback;
            this.dataErrorLog = this.options.dataErrorLog;
            this.FastClick = this.options.FastClick;
            
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取数据
            this.model.fetch();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cOrderHeader = $(this.cOrderHeader);
            this.$oOrderTypeWap = $(this.oOrderTypeWap);
            this.$oOrderListWap = $(this.oOrderListWap);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //订单头部外层包裹容器
                cOrderHeader: '.j-order-header',
                //订单类型包裹容器
                oOrderTypeWap: '.j-order-type',
                //订单列表包裹容器
                oOrderListWap:'.j-order-list',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new orderTypeModel(),
                //success()对外成功时的回调
                successCallback: $.noop,
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                }),
                //阻止点透的函数
                FastClick: FastClick
            };
            $.extend(true, this.options, options||{});
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //解决click事件的300毫秒延时
            //阻止大多数设备上的点透问题
            this.FastClick.attach(this.$el[0]);
        },
        //拉取数据成功回调
        success: function(model,response,options) {
            if (model.get('code') === 200) {
                //数据渲染
                this.render(model.attributes);
                //执行回调
                this.successCallback({
                    //确保后续模块共用同一个Iscroll实例
                    iscroll: this.iscroll
                });

            } else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，刷新页面】
                tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:response.message||'Failure'});
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
            //展示数据接口错误信息【点击ok，刷新页面】
            tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Network anomaly.'});
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
        //数据渲染
        render: function(data) {
            var template = this.template,
                tpl = this.tpl,
                orderHeader = template(tpl.orderHeader.join(''))(data),
                myOrders = template(tpl.orderType.join(''))(data),
                orderTypeList = template(tpl.orderTypeList.join(''))(data);

            //页面绘制
            this.$cOrderHeader.html(orderHeader);
            this.$oOrderTypeWap.html(myOrders);
            this.$oOrderListWap.html(orderTypeList);
            //设置默认展示项
            this.currentTab(this.setOrderStatusTab());
            //定位当前订单类型
            this.scrollTab();
        },
        //定位当前的订单类型tab
        scrollTab: function() {
            //等页面渲染完找到选中的tab
            var tabSelect = this.$oOrderTypeWap.find('li.selected'),
                //Iscroll实例
                tabIscroll = this.iscroll = new Iscroll('.ordersStatus', {click:this.iScrollClick(), scrollX: true, scrollY: false});
            //滚动到对应选择的订单类型
            tabIscroll.scrollToElement(tabSelect[0], null, true);
        },
        //判断设备是不是安卓4.4+ 如果是的话增加点击事件 解决安卓4.4以上版本无法点击
        //http://www.bkjia.com/HTML5/905892.html
        iScrollClick: function() {
            if (/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) return false;
            if (/Chrome/i.test(navigator.userAgent)) return (/Android/i.test(navigator.userAgent));
            if (/Silk/i.test(navigator.userAgent)) return false;
            if (/Android/i.test(navigator.userAgent)) {
                var s=navigator.userAgent.substr(navigator.userAgent.indexOf('Android')+8,3);
                return parseFloat(s[0]+s[3]) < 44 ? false : true
            }
        },
        /**
         * 设置当前需要展示的订单状态标签，分别有一下几种类型：
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
        setOrderStatusTab: function() {
                //默认展示“待确认订单”
            var rft = 1,
                //从URL中获取rft
                _rft = CONFIG.wwwSEARCH.match(/^(?:\?|&).*rft=([^&#]+)/i);

            //如果URL中带有rft则重置它的值
            if (_rft !== null && (_rft[1]>0&&_rft[1]<8)) {
               rft = _rft[1];
            }

            return rft;
        },
        //设置默认展示项
        currentTab: function(index) {
            $(this.$oOrderTypeWap.find('li')[index-1]).addClass('selected').attr({init:'y'});
        }
    });

    return  orderTypeView;
});
