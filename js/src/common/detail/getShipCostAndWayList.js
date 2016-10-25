/**
 * module src: common/detail/getShipCostAndWayList.js
 * 获取[运输方式|目的国家|备货地|运达时间]列表
**/
define('common/detail/getShipCostAndWayList', ['common/config', 'lib/backbone', 'tpl/detail/getShipCostAndWayListTpl', 'checkoutflow/dataErrorLog', 'checkoutflow/popupTip'], function(CONFIG, Backbone, tpl, dataErrorLog, tip){
    //model-运费列表相关内容
    var GetShipCostAndWayListModel = Backbone.Model.extend({
        //运费列表内容初始化属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //运费列表
                list: [{
                    //备货地所在国家id
                    stockCountryId: '',
                    //备货地所在国家名称
                    stockCountryName: '',
                    //物流方式
                    expressType: '',
                    //备货时间天数（工作日）
                    leadingTime: -1,
                    //运达时间范围
                    deliveryTime: '',
                    //最早运达日期
                    lowerDate: '',
                    //最晚运达日期
                    upperDate: '',
                    //运费
                    shipcost: -1
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
            this.getDefaultShipCostAndWayInstance = this.options.getDefaultShipCostAndWayInstance;
            
            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            //自定义查找当前选中物流相关数据
            this.on('GetShipCostAndWayListModel:findSelectedExpress', this.findSelectedExpress, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: '/mobileApiWeb/item-Item-shipCostAndWay.do',
                    //url: 'item-Item-shipCostAndWay.do',
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
                },
                //getDefaultShipCostAndWay的实例对象
                getDefaultShipCostAndWayInstance: {}
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
             * /mobileApiWeb/item-Item-shipCostAndWay.do
             * 接口文档地址：http://192.168.76.42:8090/display/MOB/Item+page+ship+cost+and+way+API
             *
             * 原始数据结构
             * {
             *     "data": [{
             *         //运达目的国家id
             *         "countryId": "US",
             *         //运达目的国家名称
             *         "countryName": "United States",
             *         //运达时间范围
             *         "deliveryTime": "2-4",
             *         //物流方式
             *         "expressType": "DHL",
             *         //备货时间天数（工作日）
             *         "leadingTime": 2,
             *         //最早运达日期
             *         "lowerDate": "Jul 06",
             *         //最晚运达日期
             *         "upperDate": "Jul 08",
             *         //最小运达天数
             *         "shipTimeMin": 2,
             *         //最大运达天数
             *         "shipTimeMax": 4,
             *         //运费
             *         "shipcost": 0,
             *         //备货地所在国家id
             *         "stockCountryId": "CN",
             *         //备货地所在国家名称
             *         "stockCountryName": "China"
             *     }],
             *     "message": "Success",
             *     "serverTime": 1467095847118,
             *     "state": "0x0000"
             * }
            **/
            var obj = {};
            obj.code = (res.state==='0x0000'?200:-1);
            obj.list = [];

            if (obj.code !== -1) {
                $.each(res.data||[], function(index, item){
                    var _obj = {};
                    _obj.stockCountryId = item.stockCountryId;
                    _obj.stockCountryName = item.stockCountryName;
                    _obj.expressType = item.expressType;
                    _obj.leadingTime = item.leadingTime;
                    _obj.deliveryTime = item.deliveryTime;
                    _obj.lowerDate = item.lowerDate;
                    _obj.upperDate = item.upperDate;
                    _obj.shipcost = item.shipcost;
                    //写入数据
                    obj.list.push(_obj);
                });
                
                //不可运达的情况
                if (obj.list.length < 1) {
                    obj.list.push({
                        stockCountryId: '',
                        stockCountryName: '',
                        expressType: '',
                        leadingTime: -1,
                        deliveryTime: '',
                        lowerDate: '',
                        upperDate: '',
                        shipcost: -1
                    });
                }
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     list: [{
             *         stockCountryId: '',
             *         stockCountryName: '',
             *         expressType: '',
             *         leadingTime: -1,
             *         lowerDate: '',
             *         upperDate: '',
             *         shipcost: -1
             *     }]
             * }
            **/
            return obj;
        },
        //查找当前选中的物流相关数据
        findSelectedExpress: function(index) {
            //更新物流相关数据
            this.getDefaultShipCostAndWayInstance.model.trigger('GetDefaultShipCostAndWayModel:updateExpress', this.get('list')[index]);
        }
    });

    //view-运费列表相关内容
    var GetShipCostAndWayListView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            //选择物流方式
            'click .j-expressTypeListContent .free-route-text': 'selectedExpress'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cExpressTypeListWarp = this.options.cExpressTypeListWarp;
            this.cExpressTypeListContent = this.options.cExpressTypeListContent;
            this.cSelectExpress = this.options.cSelectExpress;
            this.itemcode = this.options.itemcode;
            this.quantity = this.options.quantity;
            this.skuId = this.options.skuId;
            this.skuMd5 = this.options.skuMd5;
            this.whitherCountryId = this.options.whitherCountryId;
            this.whitherCountryName = this.options.whitherCountryName;
            this.stockCountryId = this.options.stockCountryId;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            this.updateCallback = this.options.updateCallback;
            this.getDefaultShipCostAndWayInstance = this.options.getDefaultShipCostAndWayInstance;
            this.timer = null;
            
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //初始化拉取业务数据
            this.loadShipcostListData();
        },
        //$dom对象初始化
        initElement: function() {
            this.$window = this.$window||$(window);
            this.$cExpressTypeListWarp = this.$cExpressTypeListWarp||$(this.cExpressTypeListWarp);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;
                
            //自定义更新运费列表事件
            this.on('GetShipCostAndWayListView:loadShipcostListData',this.loadShipcostListData, this);
            this.on('GetShipCostAndWayListView:selectedExpress',this.selectedExpress, this);
            //自定义设置运费列表样式
            this.on('GetShipCostAndWayListView:setShipCostStyle',this.setShipCostStyle, this);
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //屏幕旋转事件
            //运费列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange, resize', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setShipCostStyle();
                }, 500);
            });
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //运费列表外层包裹容器
                cExpressTypeListWarp: '.j-expressTypeListWarp',
                //运费列表包裹容器
                cExpressTypeListContent: '.j-expressTypeListContent',
                //当前选中的物流方式className
                cSelectExpress: 'free-current-frame',
                //产品编号
                itemcode: -1,
                //购买数量
                quantity: -1,
                //skuid
                skuId: '',
                //skumd5
                skuMd5: '',
                //运达目的国家id
                whitherCountryId: '',
                //运达目的国家名称: '',
                whitherCountryName: '',
                //备货地所在国家id
                stockCountryId: '',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new GetShipCostAndWayListModel(null, {getDefaultShipCostAndWayInstance:options.getDefaultShipCostAndWayInstance}),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                }),
                //更新运费列表时的回调
                updateCallback: $.noop,
                //getDefaultShipCostAndWay的实例对象
                getDefaultShipCostAndWayInstance: null
            };
            $.extend(true, this.options, options||{});
        },
        //获取运费列表接口所需参数
        getParam: function(options) {
            var obj = {};
            
            //检查options是否为一个配置对象
            if (_.isObject(options) === false) {
                options = {};
            }
            
            //产品编号
            obj.itemcode = this.itemcode;
            //购买数量
            if (options.quantity) {
                obj.quantity = this.quantity = options.quantity;
            } else {
                obj.quantity = this.quantity;
            }
            //运达目的国家id
            if (options.whitherCountryId) {
                obj.country = this.whitherCountryId = options.whitherCountryId;
            } else {
                obj.country = this.whitherCountryId;
            }
            //备货地所在国家id
            if (options.stockCountryId) {
                obj.stockCountry = this.stockCountryId = options.stockCountryId;
            } else {
                obj.stockCountry = this.stockCountryId;
            }
            //skuid
            if (options.skuId) {
                obj.skuId = this.skuId = options.skuId;
            } else {
                obj.skuId = this.skuId;
            }
            //skumd5
            if (options.skuMd5) {
                obj.skuMd5 = this.skuMd5 = options.skuMd5;
            } else {
                obj.skuMd5 = this.skuMd5;
            }
            
            //如果不存在skuId或skuMd5则删除这两个参数
            if (obj.skuId==='' || obj.skuMd5==='') {
                delete obj.skuId;
                delete obj.skuMd5;
            }
            
            return obj;
        },
        //拉取运费列表数据
        loadShipcostListData: function(options) {
            //更新运费列表时的回调
            if (options&&options.updateCallback) {
                this.updateCallback = options.updateCallback;
            }
            //更新运达目的国家名称
            if (options&&options.whitherCountryName) {
                this.whitherCountryName = options.whitherCountryName;
            }
            //拉取业务数据
            this.model.fetch({data:this.getParam(options)});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            //getDefaultShipCostAndWay的实例对象
            var getDefaultShipCostAndWayInstance = this.getDefaultShipCostAndWayInstance;
            if (model.get('code') === 200) {
                //渲染运费列表
                this.render(model.attributes);
                //DOM事件触发
                if (getDefaultShipCostAndWayInstance.flag === 'EVENT_0') {
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //展示运费弹出层
                    getDefaultShipCostAndWayInstance.trigger('GetDefaultShipCostAndWayView:showShipCostLayer');
                //自定事件触发
                } else if (getDefaultShipCostAndWayInstance.flag === 'EVENT_1') {
                    //更新物流相关数据
                    model.trigger('GetShipCostAndWayListModel:findSelectedExpress', (function(self){
                        var index,
                            $parent = $(self.cExpressTypeListContent),
                            $ele = $parent.find('.'+self.cSelectExpress),
                            index = $ele.index()>-1?$ele.index():0;
                        //选中对应的物流方式
                        self.selectedExpress(index);
                        //返回选中物流的索引值
                        return index;
                    }(this)));
                    //将getDefaultShipCostAndWay和getShipCostAndWayList的模型实例回传给外部依赖
                    this.updateCallback&&this.updateCallback({
                        model1: getDefaultShipCostAndWayInstance.model,
                        model2: model
                    });
                }
                //设置运费列表样式
                this.setShipCostStyle();
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
        //整体渲染
        render: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //getDefaultShipCostAndWay的实例对象
                getDefaultShipCostAndWayInstance = this.getDefaultShipCostAndWayInstance,
                //主体内容模板
                main = template(tpl.main.join(''))(data),
                //运费列表模板
                shipCostlist = template(tpl.shipCostlist.join(''))($.extend({}, data, {selectExpressType: getDefaultShipCostAndWayInstance.model.get('expressType')})),
                //提示不能运达模板
                noArrive = template(tpl.noArrive.join(''))($.extend({}, data, {whitherCountryName: this.whitherCountryName}));

            main = main.replace(/\{\{main\}\}/, main)
                       .replace(/\{\{shipCostlist\}\}/, shipCostlist)
                       .replace(/\{\{noArrive\}\}/, noArrive)
                       ;

            //页面绘制
            this.$cExpressTypeListWarp.html(main);
        },
        //选择物流方式
        selectedExpress: function(evt) {
            var $parent,
                $ele,
                $eles,
                cSelectExpress = this.cSelectExpress,
                model = this.model;

            //非dom事件调用，此时的evt为物流方式列表中将要被选中的物流索引值
            if (!evt.currentTarget) {
                //不可运达到当前目的国家则跳出
                if (model.get('list').length===1 && model.get('list')[0].shipcost===-1) {
                    return;
                }
                $parent = $(this.cExpressTypeListContent);
                $ele = $parent.find('.'+cSelectExpress);
                $eles = $parent.find('span[data-type]');
                //重置选择状态
                $ele.removeClass(cSelectExpress);
                //给第一项物流方式添加选中状态
                $($eles[evt]).addClass(cSelectExpress);
                return;
            }
            
            //DOM事件调用
            $ele = $(evt.currentTarget);
            //如果当前物流已选中则跳出
            if ($ele.hasClass(cSelectExpress)) {
                return;
            }
            //重置选择状态
            $ele.siblings().removeClass(cSelectExpress);
            //给当前选择物流添加选中状态
            $ele.addClass(cSelectExpress);
            //查找当前物流相关数据
            this.model.trigger('GetShipCostAndWayListModel:findSelectedExpress', $ele.index());
        },
        //设置运费列表样式
        setShipCostStyle: function() {
            var $cExpressTypeListContent = $(this.cExpressTypeListContent),
                $siblings,
                $parentSiblings,
                windowHeight = this.$window.height()*1,
                paddingHeight = ($cExpressTypeListContent.outerHeight()-$cExpressTypeListContent.height())*1,
                sumHeight = 0;
            //不存在则跳出
            if (!$cExpressTypeListContent[0]) {
                return;
            }
            
            //$cExpressTypeListContent同辈元素集合
            $siblings = $cExpressTypeListContent.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });
            
            //$cExpressTypeListWarp同辈元素集合
            $parentSiblings = $cExpressTypeListContent.parent().siblings();
            $.each($parentSiblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });
            $cExpressTypeListContent.css({height: windowHeight - sumHeight - paddingHeight});
        }
    });

    return GetShipCostAndWayListView;
});