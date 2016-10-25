/**
 * module src: common/detail/coupon/getStoreCouponList.js
 * 获取店铺优惠券列表
**/
define('common/coupon/getStoreCouponList', ['common/config','tpl/coupon/getStoreCouponListTpl','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,tpl,tip,dataErrorLog){
    //model-店铺优惠券列表
    var storeCouponModel = Backbone.Model.extend({
        //店铺优惠券列表初始化属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //货币类型
                currencyText: '',
                //获取店铺列表信息
                couponList: [{
                    //coupon编号
                    couponCode: '',
                    //coupon金额
                    couponAmount: -1,
                    //使用coupon的最小订单金额
                    minOrderAmount: -1,
                    //活动开始时间
                    startDate: -1,
                    //活动结束时间
                    endDate: -1,
                    //获取优惠券的人数控制(0:不控制；>0前几个买家可以获取)
                    totalNumber: -1,
                    //coupon已经被领取的个数
                    usedNumber: -1,
                    //当前用户是否已经领过该coupon
                    ifBuyerBind: false,
                    //优惠券有效期
                    validday: -1,
                    //是否是有效的活动 1：有效活动；0：已被删除活动
                    valid: -1
                }]
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
                    url: '/mobileApiWeb/coupon-Coupon-getSellerCoupon.do',
                    //url: 'getSellerCoupon.json',
                    data:{
                        version: '3.3',
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
            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * /mobileApiWeb/coupon-Coupon-getSellerCoupon.do
             * 接口文档地址：http://192.168.76.42:8090/pages/viewpage.action?pageId=1573175
             *
             * 原始数据结构
             * {
             *     "data":{
             *          //货币类型
             *         "currencyText":"US $",
             *         //获取店铺列表信息
             *         "resultList":[{
             *              //活动id
             *             "campaignId":"123123",
             *             //活动名称
             *             "campaignName":5.0,
             *             //coupon编号
             *             "couponCode":"123123",
             *             //coupon 金额
             *             "couponAmount":12,
             *             //使用coupon的最小订单金额
             *             "minOrderAmount":100,
             *             //活动开始时间
             *             "startDate":1123456454,
             *             //活动结束时间
             *             "endDate":321345646,
             *             //platform：使用平台
             *             //[
             *             //    0: 'all',
             *             //    1: 'PC',
             *             //    2: 'Mobile',
             *             //    3: 'App',
             *             //    4: 'Wap',
             *             //    5: '英文站专用',
             *             //    6: '俄文站专用',
             *             //    7: '法文站专用',
             *             //    8: '西班牙站专用',
             *             //    9: '葡萄牙站专用',
             *             //    10: '德文站专用',
             *             //    11: '意大利站专用'
             *             //]
             *             "platform":"all",
             *             //获取优惠券的人数控制(0:不控制；>0前几个买家可以获取)
             *             "totalNumber":200,
             *             //coupon已经被领取的个数
             *             "usedNumber":150,
             *             //当前用户是否已经领过该coupon
             *             "ifBuyerBind":true,
             *             //优惠券有效期
             *             "validday":7,
             *             //优惠券获赠时间
             *             "couponStartDate":1231546542,
             *             //优惠券到期时间
             *             "couponEndDate":12546561686,
             *             //是否是有效的活动 1：有效活动；0：已被删除活动
             *             "valid":"1"
             *         }]
             *     },
             *     "message":"Success",
             *     "serverTime":1454307909079,
             *     "state":"0x0000"
             * }
            */
            var obj = {},
                _self = this;
            obj.code = (res.state==='0x0000'?200:-1);
            obj.currencyText = '';
            obj.couponList =[];
            if (obj.code !== -1) {
                obj.currencyText = (res.data.currencyText).charAt(res.data.currencyText.length - 1);                
                $.each(res.data.resultList||[], function(index, pro){
                    var __obj1 = {};
                    __obj1.couponCode = pro.couponCode;
                    __obj1.couponAmount = pro.couponAmount;
                    __obj1.minOrderAmount = pro.minOrderAmount;
                    __obj1.startDate = pro.startDate;
                    __obj1.endDate = pro.endDate;
                    __obj1.totalNumber = pro.totalNumber;
                    __obj1.usedNumber = pro.usedNumber;
                    __obj1.ifBuyerBind = pro.ifBuyerBind;
                    __obj1.validday = pro.validday;
                    __obj1.expiresTime = _self.expiresTime(pro.endDate,pro.validday);
                    obj.couponList.push(__obj1);
                });
            }
            //console.log(obj);
            return obj;
        },
        //优惠券有效日期
        expiresTime:function(endtime,validity){
                //优惠券有效日期=活动结束日期+优惠券有效期xx天
            var time = endtime + validity*24*60*60*1000,
                year = new Date(time).getFullYear(),
                month = new Date(time).getMonth(),
                day = new Date(time).getDate(),
                monthArray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                timeDetail = monthArray[month]+'  '+day+', '+year;
            return timeDetail;
        }
    });

    //view-店铺优惠券列表
    var storeCouponView =Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-store-coupon-tit, .j-datail-storecoupon': 'loadDefaultShipcostData',
            'click .j-product-storeTitle-top':'closedStoreCouponLayer'
        },
        //初始化入口
        initialize: function(options){
            //配置对象初始化
            this.setOptions(options);
            this.cHtml = this.options.cHtml;
            this.cHide = this.options.cHide;
            this.cJDatailStoreCoupon = this.options.cJDatailStoreCoupon;
            this.cJDatailCouponBoxScroll = this.options.cJDatailCouponBoxScroll;
            this.cJStoreCouponNote = this.options.cJStoreCouponNote;
            this.cJStoreCouponLayer = this.options.cJStoreCouponLayer;
            this.cOpenLayer = this.options.cOpenLayer;
            this.cClosedLayer = this.options.cClosedLayer;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            this.bindStoreCouponInstance = this.options.bindStoreCouponInstance;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取店铺优惠卷数据
            this.model.fetch({data:{
                itemID: this.options.itemCode,
                supplierid: this.options.supplierid,
                language: CONFIG.countryCur
            }});
            //标记是否为页面初始化时拉取过店铺优惠卷数据
            this.isDefault = true;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //html样式
                cHtml: 'dhm-htmlOverflow',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //初始化获取店铺优惠券列表外层包裹容器
                cJDatailStoreCoupon:'.j-datail-store-coupon',
                //获取店铺优惠券列表外层包裹容器
                cJDatailCouponBoxScroll:'.j-datail-coupon-boxScroll',
                //获取店铺优惠券弹层note外层包裹容器
                cJStoreCouponNote:'.j-store-coupon-note',
                //弹层外层包裹容器
                cJStoreCouponLayer:'.j-storeCouponLayer',
                //控制店铺优惠券弹出层滑动显示展示样式
                cOpenLayer:'open-layer1',
                //控制店铺优惠券弹出层滑动隐藏展示样式
                cClosedLayer:'close-layer1',
                //产品编号
                itemCode: -1,
                //卖家id
                supplierid: '',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new storeCouponModel(options),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                }),
                //bindCouponView的实例化对象
                bindStoreCouponInstance: null
            };
            $.extend(true, this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$body = this.body||$('body');
            this.$window = this.$window||$(window);
            this.$cJDatailStoreCoupon = this.$cJDatailStoreCoupon||$(this.cJDatailStoreCoupon);
            this.$cJDatailCouponBoxScroll = $(this.cJDatailCouponBoxScroll);
            this.$cJStoreCouponNote = $(this.cJStoreCouponNote);
            this.$cJStoreCouponLayer = $(this.cJStoreCouponLayer);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;

            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //屏幕旋转事件
            //storeCoupon列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange, resize', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setStoreCouponStyle();
                }, 500);
            });
        },
        //拉取storeCoupon列表数据
        loadDefaultShipcostData: function() {
            //标记此时为非页面初始化调用
            this.isDefault = false;

            //-1：数据模型缓存中没有默认storeCoupon列表数据
            if (this.model.get('code') === -1) {
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                this.model.fetch({data:{
                    itemID: this.itemCode,
                    supplierid: this.supplierid,
                    language: CONFIG.countryCur
                }});
            //反之
            } else {
                //直接展示storeCoupon列表弹出层
                this.openStoreCouponLayer();
            }
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                //查看是否存在店铺优惠券
                if (model.get('couponList').length > 0) {
                    //渲染页面
                    this.render(model.attributes);
                }
                
                //如果url中带有couponCode则自动触发绑定店铺storeCoupon
                this.bindStoreCouponInstance.trigger('bindCouponView:autoBindCoupon');
                
                //非初始化处理
                if(this.isDefault === false) {
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //直接展示storeCoupon列表弹出层
                    this.openStoreCouponLayer();
                }
            }else {
                //非初始化处理
                if(this.isDefault === false) {
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //展示数据接口错误信息【点击ok，关闭提示】
                    tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
                }
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
            //非初始化处理
            if (this.isDefault === false) {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
            }

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
            if (data.code !== -1) {
                //模板引擎
                var template = this.template,
                    //模板
                    tpl = this.tpl,
                    //主体内容模板
                    main = template(tpl.main.join(''))(data),
                    //标题模板
                    title = template(tpl.title.join(''))(data),
                    //产品列表模板
                    products = template(tpl.products.join(''))(data),
                    //初始化获取店铺优惠券列表
                    storeCouponMain = template(tpl.storeCouponMain.join(''))(data),
                    //获取店铺优惠券弹层列表
                    storeCouponList = template(tpl.storeCouponList.join(''))(data);

                main = main.replace(/\{\{title\}\}/, title)
                        .replace(/\{\{products\}\}/, products);

                //获取店铺优惠券弹层列表
                storeCouponMain = storeCouponMain.replace(/\{\{storeCouponList\}\}/, storeCouponList);
                
               
                //页面绘制
                this.$cJDatailStoreCoupon.html(main).removeClass(this.cHide);
                //页面绘制获取店铺优惠券弹层列表
                this.$body.append(storeCouponMain);
                //重新初始化$dom对象
                this.initElement();
               
            }
        },
        //设置storeCoupon弹出层展示时的页面样式
        setStoreCouponPageStyle: function(flag) {
            var $html = this.$html,
                $body = this.$body,
                cHtml = this.cHtml;

            //展示时
            if (flag === true) {
                //临时记录页面垂直滚动条的距离顶部的距离
                this.__scrollY = parseInt(this.$window.scrollTop());
                $html.addClass(cHtml);
                $body.css({'margin-top':-this.__scrollY});
            //隐藏时
            } else {
                $html.removeClass(cHtml);
                $body.attr({style:''});
                window.scroll(0, this.__scrollY);
            }
        },
        //设置storeCoupon弹层列表样式
        setStoreCouponStyle: function(){
            var $cJDatailCouponBoxScroll = $(this.cJDatailCouponBoxScroll),
                $cJStoreCouponNote = $(this.cJStoreCouponNote),
                $siblings,
                windowHeight = this.$window.height()*1,
                noteHeigh = $cJStoreCouponNote.outerHeight()*1,
                paddingHeight = ($cJDatailCouponBoxScroll.outerHeight()-$cJDatailCouponBoxScroll.height())*1,
                sumHeight = 0;

            //$cJDatailCouponBoxScroll同辈元素集合
            $siblings = $cJDatailCouponBoxScroll.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });

            $cJDatailCouponBoxScroll.css({height:windowHeight - noteHeigh - sumHeight - paddingHeight});
        },
        //显示获取店铺优惠券列表弹层
        openStoreCouponLayer:function(){
            var $cJStoreCouponLayer = this.$cJStoreCouponLayer,
                cOpenLayer = this.cOpenLayer,
                cClosedLayer = this.cClosedLayer,
                cHide = this.cHide;

            //设置storeCoupon弹出层展示时的页面样式
            this.setStoreCouponPageStyle(true);

            //先设置display
            $cJStoreCouponLayer.removeClass(cHide);

            //设置storeCoupon弹层列表样式
            this.setStoreCouponStyle();

            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $cJStoreCouponLayer.removeClass(cClosedLayer).addClass(cOpenLayer);
            }, 10);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //关闭获取店铺优惠券列表弹层
        closedStoreCouponLayer:function(){
            var cJStoreCouponLayer = this.$cJStoreCouponLayer,
                cOpenLayer = this.cOpenLayer,
                cClosedLayer = this.cClosedLayer,
                cHide = this.cHide;

            //设置storeCoupon弹出层展示时的页面样式
            this.setStoreCouponPageStyle(false);

            //先滑动隐藏展示
            cJStoreCouponLayer.removeClass(cOpenLayer).addClass(cClosedLayer);

            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                cJStoreCouponLayer.addClass(cHide);
            }, 510);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        }
    });

    return storeCouponView;
});