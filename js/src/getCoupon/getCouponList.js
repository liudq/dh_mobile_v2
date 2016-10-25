/**
 * module src: getCoupon/getCouponList.js
 * 获取coupon列表模块
**/
define('app/getCouponList', ['common/config', 'lib/backbone', 'appTpl/getCouponTpl', 'tools/fastclick', 'checkoutflow/popupTip','app/bindCoupon','common/appopen'], function(CONFIG, Backbone, tpl, FastClick,tip,bindCoupon,Appopen){
    //model-获取coupon列表
    var GetCouponListModel = Backbone.Model.extend({
        //获取coupon列表属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //coupon列表
                couponList: [{
                   //coupon的id
                   couponcode:'',
                   //优惠券金额
                   amount: '',
                   //使用coupon的订单最小金额
                   orderAmo: '',
                   //结束日期
                   endDate: '',
                   //领取状态： 0：未领取  1：已领取  2：被领光
                   isreceived: '',
                   //总共可领取数量
                   totalNumber: '',
                   //已领取数量
                   usedNumber: ''
                }],
                //buyer是否登陆，true：登陆,默认状态是未登录
                islogin:false,
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
                    url: '/mobileApiWeb/coupon-Coupon-getPtAndAppCouponList.do',
                    //url: 'coupon-Coupon-getPtAndAppCouponList.do',
                    data: {
                        version: 1.0,
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
            var obj = {},
                monthArr=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

            obj.code = res.state==='0x0000'?200:-1;
            obj.couponList = [];

            if (obj.code !== -1) {
                $.each(res.data.couponList, function(index, pro){
                    var __obj = {},
                        date = new Date(parseInt(pro.endDate)+1000*60*60*24);

                    __obj.couponcode = pro.couponcode;
                    __obj.amount = pro.amount;
                    __obj.orderAmo = pro.orderAmo;
                    __obj.endDate = monthArr[date.getMonth()]+' '+date.getDate()+','+date.getFullYear();
                    __obj.isreceived = pro.isreceived;
                    __obj.totalNumber = pro.totalNumber;
                    __obj.usedNumber = pro.usedNumber;
                    obj.couponList.push(__obj);
                });

                obj.islogin = res.data.islogin;
            }

            /**
             * 接口文档地址
             * https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=30408782
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     couponList: [{
             *         couponcode:'',
             *         amount: '',
             *         orderAmo: '',
             *         endDate: '',
             *         isreceived: '',
             *         totalNumber: '',
             *         usedNumber: ''
             *     }],
             *     islogin:''
             * }
            **/

            return obj;
        }
    });

    //view-获取coupon列表模块
    var GetCouponListView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            /**
             * 通用型coupon领取：
             * [
             *     {
             *         name: coupon-20160223.html,
             *         type: wap,
             *         color: green,
             *         headfoot: true
             *     },
             *     {
             *         name: coupon-20160223-4.html,
             *         type: app,
             *         color: green,
             *         headfoot: false
             *     }
             * ]
            **/
            'click .j-couponWrap1 .j-couponbox': 'getBindCoupon',
            /**
             * 移动专享型coupon领取：
             * [
             *     {
             *         name: coupon-20160223-2.html,
             *         type: wap,
             *         color: mix,
             *         headfoot: true
             *     },
             *     {
             *         name: coupon-20160223-3.html,
             *         type: app,
             *         color: mix,
             *         headfoot: false
             *     }
             * ]
            **/
            'click .j-couponWrap2 .j-couponbox': 'getAppCoupon',
            'click .j-couponWrap3 .j-couponbox': 'getBindCoupon'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.cCouponContent = this.options.cCouponContent;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.FastClick = this.options.FastClick;
            this.bindCoupon = this.options.bindCoupon;
            this.cGetLogined = this.options.cGetLogined;
            this.Appopen = this.options.Appopen;
            this.params = this.options.params;
            this.wapLoginUrl = this.options.wapLoginUrl;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取coupon初始化数据
            this.model.fetch({data:this.getParams()});
        },
        //给model的异步请求data传递参数couponCodes和session
        getParams: function() {
            var obj = {},
                session1 = this.getUrlParam('session');

            obj.couponCodes = this.$cCouponContent.attr('data-couponcode');
            //app上session，存着的情况下代表当前页面是webview嵌入的页面，传递session给后端更新app上的登录状态。
            session1!==''?(obj.session1=session1):false;

            return obj;
        },
        //$dom对象初始化
        initElement: function() {
            this.$cCouponContent = $(this.cCouponContent);
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
                //coupon列表容器
                cCouponContent: '.j-couponContent',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new GetCouponListModel(),
                //阻止点透的函数
                FastClick: FastClick,
                //获取coupon方法
                bindCoupon: bindCoupon,
                //唤起app
                Appopen: Appopen,
                //通过wap唤起App上面对应的coupon领取页面所需参数
                params: {
                    //通用参数
                    "des":"webview",
                    //页面地址
                    "webUrl":"http://m.dhgate.com/activities/promotion/coupon-20160223-3.html"
                },
                //wap登录地址
                wapLoginUrl: '/login.do?returnURL=http://m.dhgate.com/activities/promotion/coupon-20160223.html'
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            //如果URL中不带有couponCode则说明初始化时不需要自动绑定coupon
            if (!this.getUrlParam('couponCode')) {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
            }
            //绘制页面
            this.render(model.attributes);
            //捕获异常
            if (model.get('code') === -1) {
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
            }
        },
        //拉取数据失败回调
        error: function(model, response, options) {
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，关闭页面】
            tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
        },
        //数据渲染
        render: function(data) {
            var warp = this.template(this.tpl.warp.join(''))(data);
            //页面绘制
            this.$cCouponContent.html(this.template(warp));
            //初始化绘制登录状态
            this.$cCouponContent.attr('data-login',data.islogin);
            //登录之后绑定已点击的Coupon
            this.setDefaultSelected();
        },
        //绑定当前选中的coupon
        getBindCoupon:function(evt){
            var target = $(evt.currentTarget),
                getLogined = this.$cCouponContent.attr('data-login'),
                currentcode = target.attr('data-currentcode');

            //已领取和已领光的不能点击。
            if (target.hasClass('outof2') || target.hasClass('outof')) {
                return;
            }

            //判断登录和未登录状态
            if(getLogined==='true'){
                this.bindCoupon.get(target);
            }else{
                try {
                    //ios APP
                    toLogin(currentcode);
                } catch(e) {
                    //andoird APP
                    if (window.order && window.order.toLogin) {
                        window.order.toLogin(currentcode);
                    //除此之外的打开方式
                    } else {
                        //浏览器
                        window.location.href=this.wapLoginUrl+'?couponCode='+currentcode;
                    }
                }
            }
        },
        //wap页面唤起App专享页面
        getAppCoupon:function(evt){
            var target = $(evt.currentTarget);
            //已领取和已领光的不能点击
            if (target.hasClass('outof2')||target.hasClass('outof')) {
                return;
            }
            //唤起app功能
            this.Appopen.init({'schemeUrl':'DHgate.Buyer://virtual?params='+JSON.stringify(this.params)});
        },
        //设置页面初始化绑定coupon的状态
        setDefaultSelected:function(){
            var couponbox = this.$cCouponContent.find('.j-couponbox'),
                currentCouponCode = this.getUrlParam('couponCode'),
                self = this;

            if(currentCouponCode!==''){
                $.each(couponbox, function(index, pro){
                    if(currentCouponCode===$(this).attr('data-currentcode')){
                        self.bindCoupon.get($(this));
                    }
                });
            }
        },
        //获取URl上面的参数
        getUrlParam:function(key){
            var url = location.href,
                paraString = url.substring(url.indexOf("?") + 1, url.length).split("&"),
                paraObj = {};

            for (var i = 0, j; j = paraString[i]; i++) {
               paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
            }
            //排除key=wedding+dresses#aa中#aa 把‘+’去掉
            var returnValue = paraObj[key.toLowerCase()];
            if (typeof (returnValue) == "undefined") {
               return "";
            } else {
               return returnValue.replace(/(.+)#.*/, '$1').replace(/\+/g, ' ');
            }
        }
    });

    return GetCouponListView;
});
