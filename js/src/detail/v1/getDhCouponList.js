/**
  * module src: detail/v1/getDhCouponList.js
 * 点击展示平台优惠卷列表
**/
define('app/getDhCouponList', ['common/config','common/getUserInfo','appTpl/getDhCouponListTpl','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,getUserInfo,tpl,tip,dataErrorLog){
    //model-coupon列表
    var dhCouponListModel = Backbone.Model.extend({
        //coupon列表初始化属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //货币类型
                currencyText: '',
                //coupon列表
                list:[{
                    //coupon过期时间
                    endDateFormat: '',
                    //coupon金额
                    amount: -1,
                    //使用coupon的最小订单金额
                    orderAmo: -1
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
                    url: CONFIG.wwwURL + '/mobileApiWeb/coupon-Coupon-getAvailableDHCouponList.do',
                    //url: 'dhCoupon.json',
                    data: {
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
             * /mobileApiWeb/coupon-Coupon-getAvailableDHCouponList.do
             * 接口文档地址：https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=29818888
             *
             * 原始数据结构
             *{
             *    "data":{
             *         //货币类型
             *        "currencyText":"US $",
             *        //获取店铺列表信息
             *        "resultList":[{
             *            //活动id  
             *            "campaignId":"123123", 
             *            //活动名称
             *            "campaignName":5.0, 
             *            //coupon编号  
             *            "couponCode":"123123",
             *            //买家id
             *            "couponBuyerId":"234234234",
             *            //coupon 金额  
             *            "amount":12, 
             *            //使用coupon的最小订单金额  
             *            "orderAmo":100,
             *            //格式化到期时间，"MMM d,yyyy"
             *            "endDateFormat":"Feb 25,2016",  
             *            //活动开始时间
             *            "startDate":1123456454,
             *            //活动结束时间     
             *            "endDate":321345646,
             *            //platform：使用平台
             *            //[
             *            //    0: 'all',
             *            //    1: 'PC',
             *            //    2: 'Mobile',
             *            //    3: 'App',
             *            //    4: 'Wap',
             *            //    5: '英文站专用',
             *            //    6: '俄文站专用',
             *            //    7: '法文站专用',
             *            //    8: '西班牙站专用',
             *            //    9: '葡萄牙站专用',
             *            //    10: '德文站专用',
             *            //    11: '意大利站专用'
             *            //]
             *            "platform":"all",
             *            //type：优惠活动类别
             *            //[
             *            //    1: 'dh',
             *            //    2: '买就送新客户',
             *            //    3: '买就送老客户',
             *            //    4: '买就送新老客户',
             *            //    5: '直接送',
             *            //    6: '产品coupon'
             *            //]
             *            "type":2,
             *            //优惠券有效期  
             *            "validday":"1"
             *        }]
             *    },
             *    "message":"Success",
             *    "serverTime":1454307909079,
             *    "state":"0x0000"
             *}
            */
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            obj.currencyText = '';
            obj.list = [];
            if (obj.code !== -1) {
                obj.currencyText = (res.currencyText).charAt(res.currencyText.length - 1);
                //dhCoupon列表信息
                $.each(res.data,function(index,pro){
                   var __obj = {};
                    __obj.amount = pro.amount;
                    __obj.endDateFormat = pro.endDateFormat;
                    __obj.orderAmo = pro.orderAmo;
                    obj.list.push(__obj);
                })
            }
            return obj;
        }
    });

	//view-coupon列表
	var dhCouponListView =Backbone.View.extend({
		//根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-datail-dhcoupon': 'loadDefaultShipcostData',
            'click .j-product-dhTitle-top':'closedDhCouponLayer'
        },
        //初始化入口
        initialize: function(options){
        	//配置对象初始化
            this.setOptions(options);
            this.cateDispId = this.options.syncData.cateDispId;
            this.itemCode = this.options.syncData.itemCode;
            this.cHtml = this.options.cHtml;
            this.cHide = this.options.cHide;
            this.cDhmHtmlOverflow = this.options.cDhmHtmlOverflow;
            this.cJDhCouponLayer = this.options.cJDhCouponLayer;
            this.cOpenLayer = this.options.cOpenLayer;
            this.cClosedLayer = this.options.cClosedLayer;
            this.cJStoreCouponNote = this.options.cJStoreCouponNote;
            this.cJDatailDhCouponBoxScroll = this.options.cJDatailDhCouponBoxScroll;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //设置自定义配置
        setOptions: function(options) {
        	this.options = {
                //展示类目id
                cateDispId: -1,
                //产品编号
                itemCode: -1,
                //html样式
                cHtml: 'dhm-htmlOverflow',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //html样式
                cDhmHtmlOverflow: 'dhm-htmlOverflow',
                //dhCoupon弹层外层包裹容器
                cJDhCouponLayer:'.j-dhCouponLayer',
                //控制dhCoupon弹出层滑动显示展示样式
                cOpenLayer:'open-layer1',
                //控制dhCoupon弹出层滑动隐藏展示样式
                cClosedLayer:'close-layer1',
                //获取dhCoupon弹层note外层包裹容器
                cJStoreCouponNote:'.j-store-coupon-note',
                //获取dhCoupon列表外层包裹容器
                cJDatailDhCouponBoxScroll:'.j-datail-dhCoupon-boxScroll',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new dhCouponListModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
        	};
            $.extend(true, this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$body = this.body||$('body');
            this.$window = this.$window||$(window);
            this.$cJDhCouponLayer = $(this.cJDhCouponLayer);
            this.$cJStoreCouponNote = $(this.cJStoreCouponNote);
            this.$cJDatailDhCouponBoxScroll = $(this.cJDatailDhCouponBoxScroll);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;
                
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //屏幕旋转事件
            //coupon列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange, resize', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setdhCouponStyle();
                }, 500);
            });
        },
        //拉取dhCoupon列表数据
        loadDefaultShipcostData: function() {
            //-1：数据模型缓存中没有默认dhCoupon列表数据
            if (this.model.get('code') === -1) {
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                //判断用户是否登陆
                getUserInfo.init({
                    successCallback: $.proxy(function(){
                        //拉取业务数据
                        this.model.fetch({data:{
                            cateDispId: this.cateDispId,
                            itemID: this.itemCode,
                            language: CONFIG.countryCur
                        }}); 
                    },this)
                });
            //反之
            } else {
                //直接展示dhCoupon列表弹出层
                this.openDhCouponLayer(); 
            }
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                //初始化渲染页面
                this.render(model.attributes);
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //打开dhCoupon列表弹层
                this.openDhCouponLayer();
            } else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
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
        //dhCoupon渲染
        render: function(data){
            var template = this.template,
                //模板
                tpl = this.tpl,
                //主体内容模板
                main =  template(tpl.main.join(''))(data),
                //标题模板
                title = template(tpl.title.join(''))(data),
                //coupon列表模板
                dhCouponList = template(tpl.dhCouponList.join(''))(data),

                main = main.replace(/\{\{title\}\}/, title)
                       .replace(/\{\{dhCouponList\}\}/, dhCouponList);
            //页面绘制
            this.$body.append(main);
            //重新初始化$dom对象
            this.initElement();
        },
        //设置dhCoupon弹出层展示时的页面样式
        setDhCouponPageStyle: function(flag) {
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
        //设置dhCoupon弹层列表样式
        setdhCouponStyle: function(){
            var $cJDatailDhCouponBoxScroll = $(this.cJDatailDhCouponBoxScroll),
                $cJStoreCouponNote = $(this.cJStoreCouponNote),
                $siblings,
                windowHeight = this.$window.height()*1,
                noteHeigh = $cJStoreCouponNote.outerHeight()*1,
                paddingHeight = ($cJDatailDhCouponBoxScroll.outerHeight()-$cJDatailDhCouponBoxScroll.height())*1,
                sumHeight = 0;
            
            //$cJDatailDhCouponBoxScroll同辈元素集合
            $siblings = $cJDatailDhCouponBoxScroll.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });

            $cJDatailDhCouponBoxScroll.css({height:windowHeight - noteHeigh - sumHeight -paddingHeight});
        },
        //显示获取店铺优惠券列表弹层
        openDhCouponLayer:function(){
            var $cJDhCouponLayer = this.$cJDhCouponLayer,
                cOpenLayer = this.cOpenLayer,
                cClosedLayer = this.cClosedLayer,
                cHide = this.cHide;

            //设置dhCoupon弹出层展示时的页面样式
            this.setDhCouponPageStyle(true);

            //先设置display
            $cJDhCouponLayer.removeClass(cHide);
            
            //设置dhCoupon弹层列表样式
            this.setdhCouponStyle();

            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $cJDhCouponLayer.removeClass(cClosedLayer).addClass(cOpenLayer);
            }, 10);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //关闭获取店铺优惠券列表弹层
        closedDhCouponLayer:function(){
            var $cJDhCouponLayer = this.$cJDhCouponLayer,
                cOpenLayer = this.cOpenLayer,
                cClosedLayer = this.cClosedLayer,
                cHide = this.cHide;

            //设置dhCoupon弹出层展示时的页面样式
            this.setDhCouponPageStyle(false);

            //先滑动隐藏展示
            $cJDhCouponLayer.removeClass(cOpenLayer).addClass(cClosedLayer);

            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                $cJDhCouponLayer.addClass(cHide);
            }, 510);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        }
	});
    
	return dhCouponListView;
});