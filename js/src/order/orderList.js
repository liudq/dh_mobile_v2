/**
 * module src: order/orderList.js
 * 订单列表模块
 **/
 define('app/orderList',['common/config','lib/backbone', 'appTpl/orderListTpl','checkoutflow/popupTip','checkoutflow/dataErrorLog','mydhgate/contactSeller', 'ui/iscroll'],function(CONFIG,Backbone,tpl,tip,dataErrorLog,contactSeller,Iscroll){
    //model-订单列表
    var orderListModel = Backbone.Model.extend({
        //订单列表订单列表初始化属性
        defaults: function() {
            return {
                //状态码
                code: -1,
                //订单列表
                orders: [{
                    //卖家是否在线
                    isonLine: false,
                    //系统用户Id
                    systemuserid: '',
                    //买家Id
                    ntalker_buyerid: '',
                    //卖家id
                    ntalker_sellerid: '',
                    //ntalker第三方入口文件地址
                    ntalker_js_url: '',
                    //订单数据
                    tdrfx:{
                        //订单id
                        rfxid: '',
                        //订单号
                        rfxno: '',
                        //订单状态
                        rfxstatusname: '',
                        //订单状态id
                        rfxstatusid: '',
                        //订单总价
                        ordertotal: '',
                        //订单详情页地址
                        orderDetailUrl: '',
                        //下单时间
                        starteddate: '',
                        //是否已填写过运单号
                        trackInfoFilled: false
                    },
                    //订单产品数据
                    proList: [{
                        //产品名称
                        productname: '',
                        //图片地址
                        imageurl: ''
                    }]
                }]
            }
        },
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
            this.pageNum = this.options.pageNum;
            this.pageSize = this.options.pageSize;
            this.pageTotal = this.options.pageTotal;
            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            //提供给orderListView的增加订单列表当前页数事件
            this.on('orderListModel:addPageNum', this.addPageNum, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                ajaxOptions:{
                    url: '/viewOrderListByStatus.do',
                    type: 'GET',
                    dataType: 'json',
                    async: true,
                    cache: false,
                    //发送到服务器的数据，将自动转换为请求字符串格式
                    //例如：{foo:["bar1", "bar2"]} 转换为 "&foo=bar1&foo=bar2"
                    //在此处显示告诉$.ajax()需要对象序列化，这样就不需要设置
                    //Backbone.emulateJSON = true
                    processData: true
                },
                //当前页数
                pageNum: 1,
                //每页订单数量
                pageSize: 5,
                //总页数
                pageTotal: 1
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
                self = this;

            //状态码
            obj.code = res.result==='1'?200:-1;
            //订单列表
            obj.orders = [];

            if (obj.code !== -1) {
                $.each(res.orders.list, function(index, order){
                    var __obj = {};
                    __obj.isonLine = order.ntalker.isonLine;
                    __obj.systemuserid = order.supplier.systemuserid;
                    __obj.ntalker_buyerid = order.ntalker.ntalker_buyerid;
                    __obj.ntalker_sellerid = order.ntalker.ntalker_sellerid;
                    __obj.ntalker_js_url = order.ntalker.ntalker_js_url;

                    __obj.tdrfx = {};
                    __obj.tdrfx.rfxid = order.tdrfx.rfxid;
                    __obj.tdrfx.rfxno = order.tdrfx.rfxno;
                    __obj.tdrfx.rfxstatusname = order.tdrfx.rfxstatusname;
                    __obj.tdrfx.rfxstatusid = order.tdrfx.rfxstatusid;
                    __obj.tdrfx.ordertotal = order.tdrfx.ordertotal;
                    __obj.tdrfx.orderDetailUrl = CONFIG.wwwURL + "/mydhgate/order/orderdetail.html?rfid=" + order.tdrfx.rfxid;
                    __obj.tdrfx.starteddate = self.orderTime(order.tdrfx.starteddate.time);
                    __obj.tdrfx.trackInfoFilled = order.trackInfoFilled;

                    __obj.proList = [];
                    $.each(order.proList, function(index, pro){
                        var __obj2 = {};
                        __obj2.rImageUrl = "http://www.dhresource.com/" + pro.r_image;
                        __obj2.productname = pro.productname;
                        __obj.proList.push(__obj2);
                    });

                    obj.orders.push(__obj);
                })
            }
            return obj;
        },
        //格式化下单时间
        orderTime: function(time) {
            var date = new Date(time),
                year = date.getFullYear(),
                month = date.getMonth(),
                day = date.getDate(),
                hours = date.getHours(),
                minutes = date.getMinutes(),
                monthArray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

            return monthArray[month] + ' ' + day + ', ' + year + ' ' + hours + ':' + (minutes<10?'0'+minutes:minutes);
        },
        //订单列表增加当前页数
        addPageNum: function() {
            var pageNum = this.pageNum,
                pageTotal = this.pageTotal;
            //判断当前页数是否大于总页数，否则增加当前页数
            this.pageNum = pageNum <= pageTotal ? ++pageNum : pageNum;
        }
    });

    //view 订单列表初始化
    var orderListView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-dhChat': 'chat',
            'click .j-order-type li': 'loadOrderByType'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.oOrderType = this.options.oOrderType;
            this.cLoading = this.options.cLoading;
            this.cLoadingGlobal = this.options.cLoadingGlobal;
            this.cNoOrder = this.options.cNoOrder;
            this.cSelected = this.options.cSelected;
            this.cHide = this.options.cHide;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            this.iscroll = this.options.iscroll;
            this.timer = null;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取对应类型订单初始化列表，默认拉取第一页数据
            this.model.fetch({data:{pagenum:1,rft:this.getRft()}});
        },
        //$dom对象初始化
        initElement: function() {
            this.$window = this.$window||$(window);
            this.$body = this.$body||$('body');
            this.$oOrderType = $(this.oOrderType);
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //绑定分页事件
            this.$window.on('scroll', $.proxy(this.paging, this));
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //订单状态
                oOrderType:'.j-order-type',
                //loading外层包裹容器的className
                cLoading: '.j-pro-load',
                //带遮罩层的loading外层包裹容器的className
                cLoadingGlobal: '.j-loading-warp',
                //没有订单时的外层包裹容器
                cNoOrder: '.j-order-no',
                //当前选中项的className
                cSelected: 'selected',
                //控制展示隐藏的className
                cHide: 'dhm-hide',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new orderListModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                }),
                //Iscroll实例
                iscroll: null
            };
            $.extend(this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model,response,options) {
            if (model.get('code') === 200) {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //数据渲染
                this.render(model.attributes);
                //增加选择类型下的订单列表当前页数
                this.model.trigger('orderListModel:addPageNum');
                //在dom上记录下当前页数
                this.recordPageNum(this.model.pageNum);
                //更新分页数据
                this.getPage();
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
        //页面整体渲染
        render: function(data) {
            if(data.orders != '' || data.orders.length>0){
                this.renderMyOrders(data);
            } else {
                this.renderNoItem(data);
            }
        },
        //在没有订单数据的情况下的渲染
        renderNoItem: function(data) {
            var data = $.extend(true, {}, data, {orderTypeTitle: this.getOrderTypeTitle()}),
                template = this.template,
                tpl = this.tpl,
                noOrder = template(tpl.noOrder.join(''))(data),
                $warp = $('#j_order_'+this.getRft()),
                cHide = this.cHide;

            //页面绘制
            $warp.removeClass(cHide).append(noOrder);
        },
        //订单数据渲染
        renderMyOrders: function(data) {
            var data = $.extend(true, {}, data, {rft: this.getRft()}),
                template = this.template,
                tpl = this.tpl,
                myOrders = template(tpl.orderList.join(''))(data),
                $warp = $('#j_order_'+this.getRft()),
                cLoading = this.cLoading,
                cHide = this.cHide;

            //移除loading状态
            $warp.find(cLoading).remove();
            //页面绘制
            $warp.removeClass(cHide).append(myOrders);
        },
        //获取当前选中订单类型的标题
        getOrderTypeTitle: function() {
            return this.findTabSelected().find('h3').html();
        },
        //查找当前订单类型Tab上选择的$dom
        findTabSelected: function() {
            return this.$oOrderType.find('.'+this.cSelected)
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
            return this.findTabSelected().index()+1;
        },
        //记录当前页数
        recordPageNum: function(value) {
            this.findTabSelected().attr({pageNum: value});
        },
        //获取当前展示订单类型列表的当前页数和总页数
        getPage: function() {
            var $ele = this.findTabSelected();
            //当前页数
            this.model.pageNum = $ele.attr('pageNum')*1;
            //总页数
            this.model.pageTotal = $ele.attr('totalpage')*1;
        },
        //切换订单列表类型
        loadOrderByType: function(evt) {
            var $ele = $(evt.currentTarget);

            //为了维持数据的正确性，在有任何数据拉取的情况下禁止切换订单类型
            if (this.$el.find(this.cLoading).length > 0) {
                return;
            }
            
            //清除定时器
            if (this.timer) {
                clearTimeout(this.timer);
            }
            
            //如果点击是当前展示项则退出
            if ($ele.hasClass(this.cSelected)) {
                return;
            //否则修改为展示状态
            } else {
                //之前选中项的样式处理
                $('#j_order_'+this.getRft()).addClass(this.cHide);
                $ele.siblings().removeClass(this.cSelected);
                //当前选中项的样式处理
                $ele.addClass(this.cSelected);
                $('#j_order_'+this.getRft()).removeClass(this.cHide);

                //更新分页数据
                this.getPage();
            }

            //如果没有拉取过初始化数据，则进行相关初始化操作
            if ($ele.attr('init') !== 'y') {
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                //给当前项添加初始化的标志
                $ele.attr({init:'y'});
                //拉取对应订单列表类型数据，默认拉取第一页数据
                this.model.fetch({data:{pagenum:1,rft:this.getRft()}});
            }
            //滚动到对应选择的订单类型tab
            this.iscroll.scrollToElement($ele[0], null, true);
            //返回顶部
            window.scroll(0,0);
        },
        //分页
        paging: function() {
                //当前选择的订单类型外层包裹容器$dom
            var $warp = $('#j_order_'+this.getRft()),
                //数据模型：orderListModel
                model = this.model,
                //loading模板
                loading = this.tpl.loading.join(''),
                //当前页数
                pageNum = model.pageNum,
                //总页数
                pageTotal = model.pageTotal,
                //可视区域的高度
                wHeight = this.$window.height(),
                //滚动条距离顶部的高度
                tScrollHeight = this.$window.scrollTop(),
                //页面高度
                bHeight = this.$body.height();

            //清除定时器
            if (this.timer) {
                clearTimeout(this.timer);
            }
            
            //控制是否进行翻页
            if (bHeight-(tScrollHeight+wHeight) > 400) {
                return;
            }

            //避免重复执行，延迟50毫秒
            this.timer = setTimeout((function(self){
                return function() {
                    //查看当前是否为拉取数据或无数据展示的状态
                    if (
                        //分页的loading
                        $warp.find(self.cLoading).length !== 0 || 
                        //无数据提示
                        $warp.find(self.cNoOrder).length !== 0 || 
                        //全局带遮罩层的loading
                        !self.$el.find(self.cLoadingGlobal).hasClass(self.cHide)
                    ) {
                        return;
                    }

                    //查看是否达到最大页数
                    if (pageNum > pageTotal) {
                        return;
                    }

                    //拉取对应页数订单列表类型数据
                    self.model.fetch({data:{pagenum:pageNum,rft:self.getRft()}});

                    //修改为拉取数据的状态
                    $warp.append(loading);
                };
            }(this)), 50);
        },
        //Ntalker
        chat: function(evt) {
            var $ele = $(evt.currentTarget),
                //Ntalker第三方入口文件
                ntalkUrl = $ele.attr('ntalker_js_url'),
                //卖家Id
                ntalkSellerId = $ele.attr('ntalker_sellerid'),
                //买家Id
                ntalkerBuyerid = $ele.attr('ntalker_buyerid');

            //调用IM
            contactSeller.events.trigger('contactSeller:chat', {
                NTKF_PARAM: {
                    //Ntalker的js入口文件地址
                    ntalkUrl: ntalkUrl.substring(0, ntalkUrl.lastIndexOf('/')),
                    //商户id，商家页面必须此参数，平台页面不传
                    sellerid: ntalkSellerId,
                    //Ntalker分配的缺省客服组id
                    settingid: ntalkSellerId,
                    //买家id
                    uid: ntalkerBuyerid

                }
            });
        }
    });

    return orderListView;
});
