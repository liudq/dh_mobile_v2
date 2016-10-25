/**
 * module src: common/detail/getDefaultShipCostAndWay.js
 * 获取默认展示的[运输方式|目的国家|备货地|运达时间]
**/
define('common/detail/getDefaultShipCostAndWay', ['common/config', 'lib/backbone', 'tpl/detail/getDefaultShipCostAndWayTpl', 'checkoutflow/dataErrorLog', 'checkoutflow/popupTip'], function(CONFIG, Backbone, tpl, dataErrorLog, tip){
    //model-默认展示的与运费相关内容
    var GetDefaultShipCostAndWayModel = Backbone.Model.extend({
        //默认展示运费相关内容初始化属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //运达目的国家id
                whitherCountryId: '',
                //运达目的国家名称
                whitherCountryName: '',
                //备货地所在国家id
                stockCountryId: '',
                //备货地所在国家名称
                stockCountryName: '',
                //物流方式
                expressType: '',
                //备货时间天数（工作日）
                leadingTime: -1,
                //最早运达日期
                lowerDate: '',
                //最晚运达日期
                upperDate: '',
                //运费
                shipcost: -1
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
            
            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            //自定义更新物流相关数据事件
            this.on('GetDefaultShipCostAndWayModel:updateExpress', this.updateExpress, this);
            //自定义更新所有数据事件
            this.on('GetDefaultShipCostAndWayModel:updateAll', this.updateAll, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: '/mobileApiWeb/item-Item-defaultShip.do',
                    //url: 'item-Item-defaultShip.do',
                    data: {
                        //通用接口参数
                        client: 'wap',
                        version: '0.1'
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
             * /mobileApiWeb/item-Item-defaultShip.do
             * 接口文档地址：http://192.168.76.42:8090/display/MOB/Item+page+ship+cost+and+way+API
             *
             * 原始数据结构
             * {
             *     "data": {
             *         //运费相关信息
             *         "shipCostAndWay": {
             *             //买家所在地国家id
             *             "countryId": "HK",
             *             //买家所在地国家名称
             *             "countryName": "Hong Kong",
             *             //物流方式
             *             "expressType": "EMS",
             *             //备货时间天数（工作日）
             *             "leadingTime": 3,
             *             //运达时间范围
             *             "deliveryTime": "3-16",
             *             //最小运达天数
             *             "shipTimeMin": 3,
             *             //最大运达天数
             *             "shipTimeMax": 16,
             *             //最早运达日期
             *             "lowerDate": "Jul 04",
             *             //最晚运达日期
             *             "upperDate": "Jul 17"
             *             //运费
             *             "shipcost": 10.43,
             *             //备货地所在国家id
             *             "stockCountryId": "CN",
             *             //备货地所在国家名称
             *             "stockCountryName": "China"
             *         },
             *         //运达目的国家id
             *         "whitherCountry": "HK",
             *         //运达目的国家名称
             *         "whitherCountryName": "Hong Kong"
             *     },
             *     "message": "Success",
             *     "serverTime": 1467095847118,
             *     "state": "0x0000"
             * }
            **/
            var obj = {},
                data = res.data||{},
                shipCostAndWay = data.shipCostAndWay||{};
            
            obj.code = (res.state==='0x0000'?200:-1);

            if (obj.code !== -1) {
                obj.whitherCountryId = data.whitherCountry||'';
                obj.whitherCountryName = data.whitherCountryName||'';
                obj.stockCountryId = shipCostAndWay.stockCountryId||'';
                obj.stockCountryName = shipCostAndWay.stockCountryName||'';
                obj.expressType = shipCostAndWay.expressType||'';
                obj.leadingTime = _.isNumber(shipCostAndWay.leadingTime)?shipCostAndWay.leadingTime:-1;
                obj.lowerDate = shipCostAndWay.lowerDate||'';
                obj.upperDate = shipCostAndWay.upperDate||'';
                obj.shipcost = _.isNumber(shipCostAndWay.shipcost)?shipCostAndWay.shipcost:-1;
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     whitherCountryId: '',
             *     whitherCountryName: '',
             *     stockCountryId: '',
             *     stockCountryName: '',
             *     expressType: '',
             *     leadingTime: -1,
             *     lowerDate: '',
             *     upperDate: '',
             *     shipcost: -1
             * }
            **/
            return obj;
        },
        //更新物流相关数据
        updateExpress: function(options) {
            this.set({
                stockCountryId: options.stockCountryId,
                stockCountryName: options.stockCountryName,
                expressType: options.expressType,
                leadingTime: options.leadingTime,
                lowerDate: options.lowerDate,
                upperDate: options.upperDate,
                shipcost: options.shipcost
            });
        },
        //切换运达目的国家时更新全部数据
        updateAll: function(options) {
            this.set({
                whitherCountryId: options.whitherCountryId,
                whitherCountryName: options.whitherCountryName,
                stockCountryId: options.stockCountryId,
                stockCountryName: options.stockCountryName,
                expressType: options.expressType,
                leadingTime: options.leadingTime,
                lowerDate: options.lowerDate,
                upperDate: options.upperDate,
                shipcost: options.shipcost
            });            
        }
    });

    //view-默认展示运费相关内容
    var GetDefaultShipCostAndWayView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            //展示运费弹层
            'click .j-shipcostBtn': 'loadDefaultShipcostData',
            //隐藏运费弾层
            'click .j-shipCostLayerClose': 'hideShipCostLayer'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cShipCostPageWarp = this.options.cShipCostPageWarp;
            this.cShipCostLayerWarp = this.options.cShipCostLayerWarp;
            this.cCurShipCostInfoWarp = this.options.cCurShipCostInfoWarp;
            this.cWhitherCountryWarp = this.options.cWhitherCountryWarp;
            this.cHtml = this.options.cHtml;
            this.cHide = this.options.cHide;
            this.cAnimateHide = this.options.cAnimateHide;
            this.cAnimateShow = this.options.cAnimateShow;
            this.itemcode = this.options.itemcode;
            this.quantity = this.options.quantity;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            this.successCallback = this.options.successCallback;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$body = this.body||$('body');
            this.$window = this.$window||$(window);
            this.$cShipCostPageWarp = this.$cShipCostPageWarp||$(this.cShipCostPageWarp);
            this.$cShipCostLayerWarp = $(this.cShipCostLayerWarp);
            this.$cCurShipCostInfoWarp = $(this.cCurShipCostInfoWarp);
            this.$cWhitherCountryWarp = $(this.cWhitherCountryWarp);
        },
        //事件初始化
        initEvent: function() {
            //自定义展示运费弹出层事件
            this.on('GetDefaultShipCostAndWayView:showShipCostLayer', this.loadDefaultShipcostData, this);
            //自定义在带有产品相关属性的情况下更新运费相关信息事件
            this.on('GetDefaultShipCostAndWayView:upadteShipCostInfo', this.upadteShipCostInfo, this);
            //监听运费数据的变化
            this.listenTo(this.model, 'change:shipcost', this.renderPageShipCostInfo);
            this.listenTo(this.model, 'change:shipcost', this.renderCurShipCostInfo);
            this.listenTo(this.model, 'change:shipcost', function(){
                //将当前选择运费同步到productAttrPopupModel
                this.productAttrPopupInstance&&this.productAttrPopupInstance.model.trigger('productAttrPopupModel:getShipCost', this.model.get('shipcost'));
            });
            //监听物流方式数据的变化
            this.listenTo(this.model, 'change:expressType', this.renderPageShipCostInfo);
            this.listenTo(this.model, 'change:expressType', this.renderCurShipCostInfo);
            //监听运达目的国家id数据的变化
            this.listenTo(this.model, 'change:whitherCountryId', this.renderPageShipCostInfo);
            this.listenTo(this.model, 'change:whitherCountryId', this.renderCurShipCostInfo);
            this.listenTo(this.model, 'change:whitherCountryId', this.renderCurWhitherCountry);
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //页面展示的运费相关信息外层包裹容器
                cShipCostPageWarp: '.j-shipcostBtn',
                //运费弹出层包裹容器
                cShipCostLayerWarp: '.j-shipCostLayerWarp',
                //当前运费详细信息包裹容器
                cCurShipCostInfoWarp: '.j-curShipCostInfoWarp',
                //当前运达国家包裹容器
                cWhitherCountryWarp: '.j-whitherCountryWarp',
                //html样式
                cHtml: 'dhm-htmlOverflow',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //控制运费弹出层滑动隐藏展示的样式
                cAnimateHide: 'close-layer1',
                //控制运费弹出层滑动显示展示的样式
                cAnimateShow: 'open-layer1',
                //产品编号
                itemcode: -1,
                //购买数量
                quantity: -1,
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new GetDefaultShipCostAndWayModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                }),
                //success()对外成功时的回调
                successCallback: $.noop
            };
            $.extend(true, this.options, options||{});
        },
        //拉取默认运费数据
        loadDefaultShipcostData: function() {
            //标志为DOM事件
            this.flag = 'EVENT_0';
            //-1：数据模型缓存中没有默认运费数据
            if (this.model.get('code') === -1) {
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                //拉取业务数据
                this.model.fetch({data:{
                    itemcode: this.itemcode,
                    quantity: this.quantity
                }});
            //反之
            } else {
                //直接展示运费弹出层
                this.showShipCostLayer();
                //重新设置运费列表样式
                this.getShipCostAndWayListInstance.trigger('GetShipCostAndWayListView:setShipCostStyle');
            }
        },
        //带有产品相关属性[quantity/skuId/skuMd5]的情况下更新运费相关数据
        upadteShipCostInfo: function(options) {
            //标志为自定义事件
            this.flag = 'EVENT_1';
            //检查options是否为一个配置对象
            if (_.isObject(options) === false) {
                options = {};
            }
            //购买数量
            this.quantity = options.quantity||this.options.quantity;
            //skuid
            this.skuId = options.skuId||'';
            //skumd5
            this.skuMd5 = options.skuMd5||'';
            //备货地所在国家id
            this.stockCountryId = options.stockCountryId||'',
            //更新运费相关数据成功时的回调
            this.updateCallback = options.updateCallback||$.noop;
            
            //-1：数据模型缓存中没有默认运费数据
            if (this.model.get('code') === -1) {
                //拉取业务数据
                this.model.fetch({data:{
                    itemcode: this.itemcode,
                    quantity: this.quantity
                }});
            //反之，更新运费
            } else {
                this.getShipCostAndWayListInstance.trigger('GetShipCostAndWayListView:loadShipcostListData',{
                    quantity: this.quantity,
                    skuId: this.skuId,
                    skuMd5: this.skuMd5,
                    stockCountryId: this.stockCountryId,
                    updateCallback: options.updateCallback||$.noop
                });
            }
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                //渲染页面展示的运费相关信息
                this.renderPageShipCostInfo(model.attributes);
                //渲染运费弹出层
                this.render(model.attributes);
                //重新初始化$dom对象
                this.initElement();
                //拉取数据成功回调
                this.successCallback(model);
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
        //判断是否为数据模型实例
        isModelInstance: function(obj) {
            return _.has(obj,'attributes');
        },
        //根据data的类型获取正确的模型数据
        getData: function(obj) {
            return this.isModelInstance(obj)?obj.attributes:obj;
        },
        //整体渲染
        render: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //主体内容模板
                main = template(tpl.main.join(''))(data),
                //当前运费详细信息模板
                curShipCostInfo = this.renderCurShipCostInfo(data),
                //当前运达目的国家模板
                curWhitherCountry = this.renderCurWhitherCountry(data);

            main = main.replace(/\{\{main\}\}/, main)
                       .replace(/\{\{curShipCostInfo\}\}/, curShipCostInfo)
                       .replace(/\{\{curWhitherCountry\}\}/, curWhitherCountry)
                       ;

            //页面绘制
            this.$body.append(main);
        },
        //当前运费详细信息渲染
        renderCurShipCostInfo: function(data) {
            var $cCurShipCostInfoWarp = this.$cCurShipCostInfoWarp,
                //模板引擎
                template = this.template,
                //模板
                tpl = this.tpl,
                //当前运费详细信息模板
                curShipCostInfo = template(tpl.curShipCostInfo.join(''))(this.getData(data));

            curShipCostInfo = curShipCostInfo.replace(/\{\{curShipCostInfo\}\}/, curShipCostInfo);

            //如果data为数据模型实例，则直接绘制页面
            if (this.isModelInstance(data)) {
                $cCurShipCostInfoWarp[0]&&$cCurShipCostInfoWarp.html(curShipCostInfo);

            //否则返回模板渲染数据
            } else {
                return curShipCostInfo;
            }
        },
        //当前运达目的国家渲染
        renderCurWhitherCountry: function(data) {
            var $cWhitherCountryWarp = this.$cWhitherCountryWarp,
                //模板引擎
                template = this.template,
                //模板
                tpl = this.tpl,
                //当前运费详细信息模板
                curWhitherCountry = template(tpl.curWhitherCountry.join(''))(this.getData(data));

            curWhitherCountry = curWhitherCountry.replace(/\{\{curWhitherCountry\}\}/, curWhitherCountry);

            //如果data为数据模型实例，则直接绘制页面
            if (this.isModelInstance(data)) {
                $cWhitherCountryWarp[0]&&$cWhitherCountryWarp.html(curWhitherCountry);

            //否则返回模板渲染数据
            } else {
                return curWhitherCountry;
            }
        },
        //页面展示的运费相关信息渲染
        renderPageShipCostInfo: function(data) {
            var $cShipCostPageWarp = this.$cShipCostPageWarp,
                //模板引擎
                template = this.template,
                //模板
                tpl = this.tpl,
                //当前运费详细信息模板
                pageShipCostInfo = template(tpl.pageShipCostInfo.join(''))(this.getData(data));

            pageShipCostInfo = pageShipCostInfo.replace(/\{\{pageShipCostInfo\}\}/, pageShipCostInfo);
            
            //页面绘制
            $cShipCostPageWarp[0]&&$cShipCostPageWarp.html(pageShipCostInfo);
        },
        //设置页面样式
        setPageStyle: function(flag) {
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
        //展示运费弹出层
        showShipCostLayer: function() {
            var $cShipCostLayerWarp = this.$cShipCostLayerWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;

            //设置运费弹出层展示时的页面样式
            this.setPageStyle(true);

            //先设置display
            $cShipCostLayerWarp.removeClass(cHide);

            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $cShipCostLayerWarp.removeClass(cAnimateHide).addClass(cAnimateShow);
            }, 10);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //隐藏运费弹出层
        hideShipCostLayer: function() {
            var $cShipCostLayerWarp = this.$cShipCostLayerWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;

            //设置运费弹出层隐藏时的页面样式
            this.setPageStyle(false);

            //先滑动隐藏展示
            $cShipCostLayerWarp.removeClass(cAnimateShow).addClass(cAnimateHide);

            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                $cShipCostLayerWarp.addClass(cHide);
            }, 510);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        }
    });

    return GetDefaultShipCostAndWayView;
});
