/**
 * module src: home/recommend/dailyDeals.js
 * 每日优惠商品模块
**/
define('app/recommend/dailyDeals', ['common/config', 'lib/backbone', 'common/serverTime', 'appTpl/recommend/dailyDealsTpl'], function(CONFIG, Backbone, serverTime, tpl){
    //model-每日优惠商品
    var DailyDealsModel = Backbone.Model.extend({
        //每日优惠商品属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //每日优惠商品列表
                list: [{
                    //产品图片
                    imageurl: '',
                    //产品链接
                    producturl: '',
                    //计量单位
                    measurename: '',
                    //折扣价
                    discountPrice: 0,
                    //产品原价
                    price: 0,
					//折扣
					discount: 0
                }],
                //服务器时间
                serverTime: 0,
                //本次促销结束时间
                endTime: 0,
                //倒计时时间
                countdown: {
                    hh: 0,
                    mm: 0,
                    ss: 0
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
            
            //设置服务器时间
            this.setServerTime();
            //计算活动截止日期
            this.on('DailyDealsModel:setEndTime', this.setEndTime, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: 'http://cms.dhgate.com/cmsapi/cmsdailydeals/get_products_ajax.do',
                    data: {
                        isblank: 'true',
                        site: 'www',
                        pageNo: '1',
                        sortField: 'itemsSold',
                        sortType: 'desc',
                        categoryId: '',
                        language: CONFIG.countryCur
                    },
                    type: 'GET',
                    dataType: 'jsonp',
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
            return this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            /**
             * cms.dhgate.com/cmsapi/edmdailydeals/get_products_ajax.do
             * 这个接口支持跨域调用，共返回36条数据，支持国际化调用。
             * 首页的每日优惠模块规定只显示12条数据，且业务逻辑展示也没
             * 那么复杂，并不需要用到所有的字段，在此对原始数据进行转化
             * 去除多余的字段和部分数据格式化，方便后续模板使用
            **/
            var obj = {},
                //当前站点国家
                countryCur = CONFIG.countryCur==='en'?'':'_'+CONFIG.countryCur;
            
            obj.code = typeof res==='object'?200:-1;
            obj.list = [];
            if (obj.code !== -1) {
                $.each(res, function(index, pro){
                    // 只取前12条数据
                    // if (index > 11) {
                    //     return;
                    // }
                    var __obj = {};
                    __obj.imageurl = pro.imageShowUrl;
                    __obj.producturl = pro.productShowUrl.replace(/http:\/\/www.dhgate.com/, CONFIG.wwwURL) + '#mhp1509-daily-' + (index+1);
                    __obj.measurename = pro.measureNameMap['measurename'+countryCur];
                    __obj.discountPrice = pro.discountPrice;
                    __obj.price = pro.price;
					__obj.discount = parseInt((1-(pro.discountRate*1))*100);
                    obj.list.push(__obj);
                });
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: 200
             *     list: [
             *         {
             *             imageurl: '',
             *             productname: '',
             *             producturl: '',
             *             measurename: '',
             *             discountPrice: '',
             *             price: '',
			 *             discount: 0
             *         },
             *         ...
             *     ],
             *     serverTime: 0,
             *     endTime: 0,
             *     countdown: {
             *         hh: 0,
             *         mm: 0,
             *         ss: 0
             *     }
             * }
            **/
            return obj;
        },
        //设置服务器当前时间
        setServerTime: function() {
            serverTime.get($.proxy(function(data){
                //更新服务器时间
                this.set({serverTime: data.time*1});
                //更新活动结束时间
                this.trigger('DailyDealsModel:setEndTime');
            }, this));
        },
        //根据第一次访问服务器返回的时间，来计算活
        //动结束时间，每天的11:59:59结束本次活动
        setEndTime: function() {
            var endTime,
                serverTime = new Date(this.get('serverTime')),
                year = serverTime.getFullYear(),
                month = serverTime.getMonth(),
                date = serverTime.getDate(),
                hour = serverTime.getHours();
            
            //如果超过12点，则增加活动结束日期
            date = hour>=12?++date:date;

            /**
             * 如果大于当前月份天数，则增加活动结束月份
             *
             * 获取当月的天数实例（From Internet）:
             * var d = new Date();
             * //d.getMonth()+1代表下个月，月份索引从0开始，即当前月为6月时，getMonth()返回值为5，创建日期时同理
             * //此处构造的日期为下个月的第0天，天数索引从1开始，第0天即代表上个月的最后一天
             * var curMonthDays = new Date(d.getFullYear(), (d.getMonth()+1), 0).getDate();
             * alert("本月共有 "+ curMonthDays +" 天"); 
            **/
            month = date>new Date((month===11?year+1:year),(month===11?0:month),0).getDate()?(date=1,month+1):month;
            
            //如果大于总月数，则增加活动结束年份
            year = month>11?(month=1,year+1):year;

            //设置截止时间
            this.set({endTime: new Date(year, month, date, 11, 59, 59).getTime()});
        }
    });
    
    //view-每日优惠
    var DailyDealsView = Backbone.View.extend({
        //根节点
        el: '.j-dailyDeals',
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.cDailyTimeWarp = this.options.cDailyTimeWarp;
            this.cHide = this.options.cHide;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.animateCallback = this.options.animateCallback;
            this.timer = null;

            //初始化事件
            this.initEvent();
            //拉取每日优惠产品数据
            this.model.fetch();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cDailyTimeWarp = $(this.cDailyTimeWarp);
        },
        //事件初始化
        initEvent: function() {
            //监听服务器时间变化
            this.listenTo(this.model, 'change:serverTime', this.runTime);
            //监听倒计时变化
            this.listenTo(this.model, 'change:countdown', this.render);
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //倒计时外层包裹容器
                cDailyTimeWarp: '.j-daily-time',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new DailyDealsModel(),
                //UI动画接口
                animateCallback: $.noop
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                //此处不需要调用render()，通过事件监听的方式来处理
            } else {
                try{throw('success(): data is wrong');}catch(e){}
            }
        },
        //拉取数据失败回调
        error: function() {
            try{throw('error(): request is wrong');}catch(e){}
        },
        //自动运行时间
        runTime: function() {
            var model = this.model,
                serverTime = model.get('serverTime'),
                self = this;
                
            //清除定时器
            if (this.timer) {
                clearTimeout(this.timer);
            }
            
            this.timer = setTimeout(function(){
                //计算倒计时
                self.countDown(model.get('serverTime'), model.get('endTime'));
                //更新服务器当前时间
                model.set({serverTime: (serverTime*1+1000)});
            }, 1000);
        },
        //倒计时
        countDown: function(start, end) {
                //时间差
            var difference = end - start,
                //剩余小时
                hour = parseInt(difference/(1000*60*60)%24),
                //剩余分钟
                minute = parseInt(difference/(1000*60)%60),
                //剩余秒
                second = parseInt(difference/(1000)%60);

            //如果本次活动结束则不再更新倒计时
            if (difference < 0) {
                //产品状态设置为-1，表示该活动过期
                this.model.set({code: -1});
                return;
            }
            
            //当小时、分钟、秒小于十添加前导零
            hour = hour<10?'0'+hour:''+hour;
            minute = minute<10?'0'+minute:''+minute;
            second = second<10?'0'+second:''+second;
            
            //倒计时渲染
            this.model.set({countdown:{hh:hour,mm:minute,ss:second}});
        },
        //初始化数据渲染
        render: function() {
                //数据模型
            var data = this.model.attributes,
                //产品数据状态
                code = data.code,
                //外层包裹容器模板
                warp = this.template(this.tpl.warp.join(''))(data),
                //产品列表数据
                list = data.list,
                //倒计时数据
                countdown = data.countdown,
                //产品列表模板渲染后的数据
                listData,
                //倒计时模板渲染后的数据
                countDownData;

            //如果数据准备完毕
            if (data.code === 200 && data.list.length > 0) {
                countDownData = this.renderCountDown(countdown);
                listData = this.renderList(list);
                warp = warp.replace(/\{\{countdown\}\}/, countDownData)
                           .replace(/\{\{list\}\}/, listData)
                           ;

                //页面绘制并展示
                this.$el.html(warp).removeClass(this.cHide);
                
                //更改产品状态为304接下来倒计时的
                //过程中，产品列表不需要再重新绘制
                this.model.set({code: 304});
                
                //初始化$dom对象
                this.initElement();
                //添加动画效果
                this.animateCallback();
                
            //更新倒计时
            } else if (data.code === 304) {
                this.$cDailyTimeWarp.html(this.renderCountDown(countdown));
            }
        },
        //倒计时渲染
        renderCountDown: function(data) {
            return this.template(this.tpl.countdown.join(''))(data);
        },
        //商品列表渲染
        renderList: function(data) {
            return this.template(this.tpl.list.join(''))(data);
        }
        
    });
    
    return DailyDealsView;
});
