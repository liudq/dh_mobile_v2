/**
 * module src: mycoupon/addCoupon.js
 * 添加coupon模块
**/
define('app/addCoupon', ['common/config', 'lib/backbone', 'appTpl/addCouponTpl', 'tools/fastclick', 'checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG, Backbone, tpl, FastClick,tip,dataErrorLog){
    //model-添加coupon模块
    var AddCouponModel = Backbone.Model.extend({
        //添加coupon属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: '',
                //运达地址
                couponList: {
                   //sellerName
                   sellerName:'',
                   //coupon的金额
                   amount: -1,
                   //使用coupon的最小订单金额
                   orderAmo: -1,
                   //优惠活动类别：1和6是DHcoupon 其他都是seller coupon（1：dh；2：买就送新客户；3买就送老客户；4买就送新老客户；5：直接送；6：产品coupon 7 领取型sellercoupon）
                   couponType: '',
                   //0代表有类目限制， 1代表适合所有类目
                   allcategory: -1,
                   //活动开始时间
                   startDate: '',
                   //活动结束时间
                   endDate: '',
                   //优惠券使用平台
                   plateForm: '',
                   //时间类型，0：正常状态；1：快要开始；2：快要到期
                   timeState: -1,
                   //拒绝的coupon订单号
                   refundOrderId:'',
                   //优惠券使用站点
                   site:'',
                   //店铺id
                   supplierSeq:'',
                   //特殊产品
                   specialProduct:''
                }
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
                ajaxOptions: {
                    url: '/mobileApiWeb/coupon-Coupon-bindAllTypeCouponToBuyerByCouponCode.do',
                    //url: 'coupon-Coupon-bindAllTypeCouponToBuyerByCouponCode.do',
                    data: {
                        client: 'wap',
                        couponSource: 'WAP_Mycoupon'
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
            $.extend(true, this.options, options||{});
        },
        //设置生成模型的url
        urlRoot: function() {
            return CONFIG.wwwURL + this.ajaxOptions.url;
            //return this.ajaxOptions.url;
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
                pro = res.data;

            obj.code = res.state;   
            //obj.code = res.state==='0x0000'?200:-1;
            obj.couponList = {};
            if (obj.code === '0x0000') {
                
                    var __obj = {};
                    
                    if(pro.sellerName){
                       __obj.sellerName = pro.sellerName; 
                    }
                    __obj.amount = pro.amount;
                    __obj.orderAmo = pro.orderAmo;
                    __obj.couponType = pro.couponType;
                    __obj.allcategory = pro.allcategory;
                    __obj.startDate = this.parseDate(pro.startDate);
                    __obj.endDate = this.parseDate(pro.endDate);
                    __obj.plateForm = pro.plateForm;
                    __obj.timeState = pro.timeState;
                    if(pro.refundOrderId){
                        __obj.refundOrderId = pro.refundOrderId;
                    }
                    if(pro.supplierSeq){
                       __obj.supplierSeq = 'http://m.dhgate.com/store/'+pro.supplierSeq;
                    } 
                    //获取对应的站点
                    //获取对应的站点
                    if(parseInt(__obj.plateForm)>4){
                        if(pro.useSite){
                            __obj.site = pro.useSite; 
                        }
                    }
                    //特殊产品赋值
                    if(pro.couponType==="6"){
                        __obj.specialProduct='3';
                    }
                    //**优惠活动类别（1：dh；2：买就送新客户；3：买就送老客户；4：买就送新老客户；5：直接送；6：产品coupon 7：领取型sellercoupon）*/ 1，6：dhcoupon, 其他是sellercoupon.
                    //1、6代表dhcoupon，其他代表seller coupon
                    //重新定义couponType：0是Dhcoupon 1是seller coupon
                    if(__obj.couponType==="1"||__obj.couponType==="6"){
                        __obj.couponType='0'
                    }else{
                        __obj.couponType='1'
                    }
                    obj.couponList = __obj;
                    obj.totalRecord = res.totalRecord; 
            }
            /**文档地址：http://192.168.76.42:8090/pages/viewpage.action?pageId=1573625
             * 最终将其格式化为：
              {
                  code: 200,
                  couponList: {
                   sellerName:'',
                   amount: '',
                   orderAmo: '',
                   couponType: -1,
                   allcategory: -1,
                   startDate: '1123456454',
                   endDate: '321345646',
                   plateForm: -1,
                   timeState: -1,
                   refundOrderId:'',
                   //对应的站点
                   site:'',
                   //店铺id
                   supplierSeq:''
                }
             * }
            **/
            return obj;
        },
        //日期转化为：Jan 15,1970
        parseDate:function(date){
            var monthArr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                date = new Date(parseInt(date)*1);

            date = monthArr[date.getMonth()]+' '+date.getDate()+','+date.getFullYear();
            return date;
        }
    });

    //view-添加coupon模块
    var AddCouponView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-addCouponBtn': 'addCoupon'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.cCouponWrap = this.options.cCouponWrap;
            this.cCouponCode = this.options.cCouponCode;
            this.cHide = this.options.cHide;
            this.cAutoLayer = this.options.cAutoLayer;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.FastClick = this.options.FastClick;
            this.dataErrorLog = this.options.dataErrorLog;
            this.pageNum = this.options.pageNum;
            this.pageTotalNum = this.options.pageTotalNum;
            this.cNocouponList = this.options.cNocouponList;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cCouponWrap = this.$cCouponWrap||$(this.cCouponWrap);
            this.$cAutoLayer = $(this.cAutoLayer);
            this.$cCouponCode = $(this.cCouponCode);
            this.$cNocouponList = $(this.cNocouponList);
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
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //coupon列表外层包裹容器
                cCouponWrap: '.j-coupon-wrap',
                //展示更多btn
                cCouponCode: '.j-couponCode',
                //控制整个区域显示隐藏的className
                cHide: 'dhm-hide',
                //显示当前页码
                pageNum: 1,
                //显示总页数
                pageTotalNum: 20,
                //错误提示语言
                cAutoLayer: '.j-auto-layer',
                //没有coupon列表
                cNocouponList: '.j-nocouponList',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new AddCouponModel(),
                //阻止点透的函数
                FastClick: FastClick,
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //判断各种状态下的提示
            this.judgeState(model,response);
        },
        judgeState:function(model,response){
            var self = this,
                noCouponList = $('.j-nocouponList');

            if (model.get('code') === '0x0000') {
                //如果是没有coupon列表情况下隐藏coupon列表
                if(noCouponList.length){
                    noCouponList.hide();
                }
                //绘制页面
                this.render(model.attributes);
                //添加成功的提示，延迟500毫秒消失
                tip.events.trigger('popupTip:autoTip',{message: 'Coupon has been added!', timer: 500});
            }else{
                //添加失败接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
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
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，关闭页面】
            tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
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
        //数据渲染
        render: function(data) {
            var warp = this.template(this.tpl.warp.join(''))(data);

            //页面动画
            this.animateFun(this.template(warp));
            //初始化$dom对象
            this.initElement();
        },
        animateFun:function(data){
            //创建div，插入页面
            var $couponBox = $('<div class="coupon-box"></div>');
            //组合数据
            $couponBox.html(data);
            //添加到页面
            this.$cCouponWrap.prepend($couponBox);

            //将元素高度保存
            var iHeight = $couponBox.height(),
                alpah = count = 0,
                timer = null;
            //默认状态样式
            $couponBox.css({"opacity":"0","height":"0"}); 
            //设置coupon动画   
            timer = setInterval(function (){
                $couponBox.css({"opacity":"0","height":(count += 8) + "px"});
                if (count > iHeight)
                {
                    clearInterval(timer);
                    $couponBox.css("height", iHeight + "px");
                    $couponBox.css("opacity", (alpah += 10));
                }
            },15);

        },
        //添加coupon
        addCoupon:function(){
            var couponCode = this.$cCouponCode.val();
            //拉取产品数据
            this.model.fetch({data:{couponCode:couponCode}});
        }
    });

    return AddCouponView;
});
