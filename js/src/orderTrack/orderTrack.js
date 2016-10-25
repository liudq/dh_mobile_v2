/**
 * module src: orderTrack/orderTrack.js
 * 订单物流跟踪模块
 * */
define('app/orderTrack',['common/config','lib/backbone', 'appTpl/orderTrackTpl','checkoutflow/popupTip','checkoutflow/dataErrorLog'],function(CONFIG,Backbone,tpl,tip,dataErrorLog){
    //model-订单物流跟踪
    var orderTrackModel = Backbone.Model.extend({
        //订单物流跟踪初始化属性
        defaults:function(){
            return {
                code: -1,//状态码0x0000请求成功 其他请求异常或错误
                info: [{
                    //对应界面上的timeOfSubmission时间，由前端格式化
                    timeOfSubmission:'',
                    //运输方式
                    shippingMethod:'',
                    //运输、交付时间
                    deliveredTime:'',
                    //追踪码
                    trackingNumer:'',
                    //最后一个物流状态
                    recentStatus:'',
                    //如果trackable为true：untrackableStatus、untrackableDesc、hyperlinkName、hyperlinkSrc、recentStatus五个字段为一定为null，items字段一定不为null（有值或[]）;
                    //如果trackable为false：untrackableStatus和untrackableDesc一定有值，recentStatus和items一定为null，hyperlinkName和hyperlinkSrc不一定有值，这时需要按需求显示untrackableStatus和untrackableDesc，hyperlinkName和hyperlinkSrc在平台上会有这个超链接，和PM确认是否显示。
                    trackable:false,
                    untrackableDesc:'',
                    //链接名字
                    hyperlinkName:'',
                    //链接地址
                    hyperlinkSrc:'',
                    items:[{
                        //地址
                        address:'',
                        //时间
                        date:'',
                        //物流状态描述
                        desc:''
                    }]
                }]
            }
        },
        initialize:function(){
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions:function(options){
            this.options = {
                ajaxOptions:{
                    url: '/getTrackInfo.do',
                    type:'GET',
                    dataType:'json',
                    async:true,
                    cache:false,
                    //发送到服务器的数据，将自动转换为请求字符串格式
                    //例如：{foo:["bar1", "bar2"]} 转换为 "&foo=bar1&foo=bar2"
                    //在此处显示告诉$.ajax()需要对象序列化，这样就不需要设置
                    //Backbone.emulateJSON = true
                    processData:true
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
            //初始接口里面传过来的物流信息
            var obj = {},
                self = this;
            obj.code = (res.code==='0x0000'?200:-1);
            obj.info =[];
            if (obj.code === 200){
                if(res.info) {
                    $.each(res.info, function (index, pro) {
                        var __obj = {};
                        __obj.timeOfSubmission = pro.timeOfSubmission;
                        __obj.timeOfSubmission1 = self.orderTime(parseInt(pro.timeOfSubmission));
                        __obj.shippingMethod = pro.shippingMethod;
                        __obj.deliveredTime = pro.deliveredTime;
                        __obj.trackingNumer = pro.trackingNumer;
                        __obj.recentStatus = pro.recentStatus;
                        __obj.trackable = pro.trackable;

                        __obj.untrackableDesc = pro.untrackableDesc;
                        __obj.hyperlinkName = pro.hyperlinkName;
                        __obj.hyperlinkSrc = pro.hyperlinkSrc;
                        __obj.items = [];
                        $.each(pro.items, function (index, pro) {
                            var __obj2 = {};
                            __obj2.address = pro.address;
                            __obj2.date = pro.date;
                            __obj2.desc = pro.desc;
                            __obj.items.push(__obj2);
                        });
                        obj.info.push(__obj);
                    })
                }
            }
            return obj;
        },
        //详细物流时间
        orderTime: function(time) {
            var year = new Date(time).getFullYear(),
                month = new Date(time).getMonth(),
                day = new Date(time).getDate(),
                hours = new Date(time).getHours(),
                minutes = new Date(time).getMinutes(),
                monthArray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] ;
            return monthArray[month]+'  '+day+', '+year+' '+hours+':'+ (minutes<10 ? '0'+minutes:minutes);
        }
    });
    //view 订单物流跟踪初始化
    var orderTrackView = Backbone.View.extend({
        //根节点
        el:'body',
        events: {
            'click .track_head':'showMoreAddr'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.oOrderTrackHeader = this.options.oOrderTrackHeader;
            this.oOrderTrackWap = this.options.oOrderTrackWap;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //模型层拉取参数
            this.model.fetch({data:{rfx_id:this.getRfid()}});
        },
        //$dom对象初始化
        initElement: function() {
            this.$oOrderTrackHader = $(this.oOrderTrackHeader);
            this.$oOrderTrackWap = $(this.oOrderTrackWap);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                oOrderTrackHeader:'.j-orderTrack-header',
                //订单详情包裹容器
                oOrderTrackWap:'.j_track',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new orderTrackModel(),
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
            if(model.get('code') === 200){
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                this.render(model.attributes);
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
        error: function(){
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
            //数据可用则绘制页面
            var data = $.extend(true, {}, data, {rfid:this.getRfid()}),
                data = $.extend(true, {}, data, {rft:this.getRft()}),
                data = $.extend(true, {}, data, {rfer:this.getRfer()}),
                template = this.template,
                tpl = this.tpl,
                orderTrackHeader = template(tpl.orderTrackHeader.join(''))(data),
                orderTracks = template(tpl.orderTrack.join(''))(data);
            this.$oOrderTrackHader.append(orderTrackHeader);
            this.$oOrderTrackWap.append(orderTracks);
        },
    /*    //绘制无物流信息
        renderNoTrack:function(data){
            var
                template = this.template,
                tpl = this.tpl,
                noTrack = template(tpl.noTrack.join(''))(data);

            alert(data);
            this.$oOrderTrackWap.append(noTrack);
        },*/
        //显示更多物流信息
        showMoreAddr:function(e){
            var $closeHead = $(e.target).closest('.track_head');
            var $moreMenu = $(e.target).closest('.track_addr').siblings('.menu');
            if($closeHead.hasClass('down')){
                $closeHead.removeClass('down').addClass('up');
                $moreMenu.removeClass('dhm-hide');
            } else if($closeHead.hasClass('up')){
                $closeHead.removeClass('up').addClass('down');
                $moreMenu.addClass('dhm-hide');
            }
        },
        //获取订单Id
        getRfid: function() {
            var rfid = CONFIG.wwwSEARCH.match(/^(?:\?|&).*rfx_id=([^&#]+)/i);
            return rfid!==null?rfid[1]:'';
        },
        //获取订单状态类型
        getRft: function() {
            var rft = CONFIG.wwwSEARCH.match(/^(?:\?|&).*rft=([^&#]+)/i);
            return rft!==null?rft[1]:'';
        },
        //获取rfer参数
        getRfer: function() {
            var rfer = CONFIG.wwwSEARCH.match(/^(?:\?|&).*rfer=([^&#]+)/i);
            return rfer!==null?rfer[1]:'';
        }
    });
    return  orderTrackView;

})

