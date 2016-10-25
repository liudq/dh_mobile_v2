/**
 * module src: common/detail/getShiptoCountryList.js
 * 获取目的国家列表
**/
define('common/detail/getShiptoCountryList', ['common/config', 'lib/backbone', 'tpl/detail/getShiptoCountryListTpl', 'checkoutflow/dataErrorLog', 'checkoutflow/popupTip', 'common/detail/getPopularCountryList'], function(CONFIG, Backbone, tpl, dataErrorLog, tip, getPopularCountryList){
    //model-目的国家列表
    var GetShiptoCountryListModel = Backbone.Model.extend({
        //目的国家列表初始化属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //热门国家列表
                popular: [{
                    //目的国家id
                    whitherCountryId: '',
                    //目的国家名称
                    whitherCountryName: ''
                }],
                //除热门国家外的其他国家列表
                all: {
                    //首字母
                    'A': [{
                        //目的国家id
                        whitherCountryId: '',
                        //目的国家名称
                        whitherCountryName: ''
                    }]
                },
                //当前选择的运达目的国家id
                currentWhitherCountryId: ''
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
                    url: '/mobileApiWeb/item-Item-whitherCountry.do',
                    //url: 'item-Item-whitherCountry.do',
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
             * /mobileApiWeb/item-Item-whitherCountry.do
             * 接口文档地址：http://192.168.76.42:8090/display/MOB/Item+page+ship+cost+and+way+API
             *
             * 原始数据结构
             * {
             *     "data": {
             *         "A": [{
             *             "countryId": "AF",
             *             "countryName": "Afghanistan",
             *             "letter": "A"
             *         }],
             *         "B": ...,
             *         "C": ...,
             *         ...
             *     },
             *     "message": "Success",
             *     "serverTime": 1467347940296,
             *     "state": "0x0000"
             * }
            **/
            var obj = {},
                popularStr;

            obj.code = (res.state==='0x0000'?200:-1);
            //主流目的国家列表
            obj.popular = getPopularCountryList.get();
            //主流目的国家id字符串形式：'US;RF;BR.;.;.'
            popularStr = this.getPopularWhitherCountryIdStr(obj.popular);
            //除主流目的国家之外的所有国家列表
            obj.all = {};
            if (obj.code !== -1) {
                $.each(res.data, function(letter, items){
                    obj.all[letter] = [];
                    $.each(items, function(name, item){
                        var _obj2 = {},
                            reg = new RegExp('\\b'+item.countryId+'\\b');
                        //排除主流目的国家
                        if (reg.test(popularStr)) {
                            return;
                        }
                        _obj2.whitherCountryId = item.countryId;
                        _obj2.whitherCountryName = item.countryName;
                        obj.all[letter].push(_obj2);
                    });
                });
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     popular: [{
             *         countryId: '',
             *         countryName: ''
             *     }],
             *     all: {
             *         'A': [{
             *             countryId: '',
             *             countryName: ''
             *         }],
             *         'B': ...,
             *         'C': ...,
             *         ...
             *     }
             * }
            **/
            return obj;
        },
        //返回一个主流目的国家id的字符串拼接
        getPopularWhitherCountryIdStr: function(data) {
            var arr = [];
            $.each(data, function(name, item){
                arr.push(item.whitherCountryId);
            });
            return arr.join(';');
        }
    });

    //view-目的国家列表
    var GetShiptoCountryListView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
           //展示目的国家列表弾层
           'click .j-whitherCountryBtn': 'loadCountryData',
           //隐藏目的国家列表弾层
           'click .j-shiptoCountryClose': 'hideShipToLayerLayer',
           //选择运达目的国家
           'click .j-shiptoCountryWarp li[data-whithercountryid]': 'selectShipToCountry'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cShiptoCountryWarp = this.options.cShiptoCountryWarp;
            this.cShiptoCountryContent = this.options.cShiptoCountryContent;
            this.cHide = this.options.cHide;
            this.cAnimateHide = this.options.cAnimateHide;
            this.cAnimateShow = this.options.cAnimateShow;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            this.getDefaultShipCostAndWayInstance = this.options.getDefaultShipCostAndWayInstance;
            this.getShipCostAndWayListInstance = this.options.getShipCostAndWayListInstance;
            
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
            this.$cShiptoCountryWarp = $(this.cShiptoCountryWarp);
            this.$cShiptoCountryContent = $(this.cShiptoCountryContent);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;
                
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
                    self.setCountryStyle();
                }, 500);
            });
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //运达目的国家列表弹出层包裹容器
                cShiptoCountryWarp: '.j-shiptoCountryWarp',
                //国家列表包裹容器
                cShiptoCountryContent: '.j-shiptoCountryContent',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //控制运费弹出层滑动隐藏展示的样式
                cAnimateHide: 'close-layer2',
                //控制运费弹出层滑动显示展示的样式
                cAnimateShow: 'open-layer2',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new GetShiptoCountryListModel({currentWhitherCountryId:options.currentWhitherCountryId}),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                }),
                //getDefaultShipCostAndWay的实例对象
                getDefaultShipCostAndWayInstance: null,
                //getShipCostAndWayList的实例对象
                getShipCostAndWayListInstance: null
            };
            $.extend(true, this.options, options||{});
        },
        //拉取运达目的国家列表
        loadCountryData: function() {
            //-1：数据模型缓存中没有默认运费数据
            if (this.model.get('code') === -1) {
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                //拉取业务数据
                this.model.fetch();
            //反之
            } else {
                //直接展示运达目的国家列表弹出层
                this.showShipToLayer();
            }
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                //渲染运达目的国家弹出层
                this.render(model.attributes);
                //重新初始化$dom对象
                this.initElement();
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示运达目的国家列表弹出层
                this.showShipToLayer();
                //设置运达目的国家列表样式
                this.setCountryStyle();
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
                //主体内容模板
                main = template(tpl.main.join(''))(data),
                //运达目的国家列表模板
                countryList = template(tpl.countryList.join(''))(data);

            main = main.replace(/\{\{main\}\}/, main)
                       .replace(/\{\{countryList\}\}/, countryList)
                       ;

            //页面绘制
            this.$body.append(main);
        },
        //展示运达目的国家列表弹出层
        showShipToLayer: function() {
            var $cShiptoCountryWarp = this.$cShiptoCountryWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;
        
            //设置运达目的国家列表弹出层展示时的页面样式
            //this.setPageStyle(true);
        
            //先设置display
            $cShiptoCountryWarp.removeClass(cHide);
        
            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $cShiptoCountryWarp.removeClass(cAnimateHide).addClass(cAnimateShow);
            }, 10);
        
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //隐藏运达目的国家列表弹出层
        hideShipToLayerLayer: function() {
            var $cShiptoCountryWarp = this.$cShiptoCountryWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;

            //设置运达目的国家列表弹出层展示时的页面样式
            //this.setPageStyle(false);
        
            //先滑动隐藏展示
            $cShiptoCountryWarp.removeClass(cAnimateShow).addClass(cAnimateHide);
        
            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                $cShiptoCountryWarp.addClass(cHide);
            }, 510);
        
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //设置运达目的国家列表样式
        setCountryStyle: function() {
            var $cShiptoCountryContent = this.$cShiptoCountryContent,
                $siblings,
                windowHeight = this.$window.height()*1,
                sumHeight = 0;
            
            //不存在则跳出
            if (!$cShiptoCountryContent[0]) {
                return;
            }
            
            //$cShiptoCountryContent同辈元素集合
            $siblings = $cShiptoCountryContent.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });
            
            $cShiptoCountryContent.css({height: windowHeight - sumHeight});
        },
        //选择运达目的国家
        selectShipToCountry: function(evt) {
            var $ele = $(evt.currentTarget),
                $eles = this.$cShiptoCountryWarp.find('li[data-whithercountryid]'),
                getDefaultShipCostAndWayInstance = this.getDefaultShipCostAndWayInstance,
                getShipCostAndWayListInstance = this.getShipCostAndWayListInstance;
            
            //如果当前国家已选中则跳出
            if ($ele.find('span')[0]) {
                //隐藏运达目的国家列表弹出层
                this.hideShipToLayerLayer();
                return;
            }
            
            //打开loading
            tip.events.trigger('popupTip:loading', true);
            
            //标志为自定义事件
            getDefaultShipCostAndWayInstance.flag = 'EVENT_1';
            //拉取该运达目的国家下的物流方式列表数据
            getShipCostAndWayListInstance.trigger('GetShipCostAndWayListView:loadShipcostListData', {
                //运达目的国家id
                whitherCountryId: $ele.attr('data-whitherCountryId')||'',
                //运达目的国家名称
                whitherCountryName: $ele.attr('data-whitherCountryName')||'',
                //物流方式列表更新回调
                updateCallback: $.proxy(function(options) {
                    /**========getShipCostAndWayList相关操作========**/
                    //重置物流方式选中项为第一项
                    this.getShipCostAndWayListInstance.trigger('GetShipCostAndWayListView:selectedExpress', 0);
                    
                    /**========getDefaultShipCostAndWay相关操作========**/
                    //重置getDefaultShipCostAndWay模型上所有数据
                    this.getDefaultShipCostAndWayInstance.model.trigger('GetDefaultShipCostAndWayModel:updateAll', $.extend({}, options.model2.get('list')[0],{
                        whitherCountryId: $ele.attr('data-whitherCountryId'),
                        whitherCountryName: $ele.attr('data-whitherCountryName')
                    }));
                    
                    /**========getShiptoCountryList相关操作========**/
                    //重置运达目的国家选择状态
                    $eles.find('span').remove();
                    //给当前选择的韵达目的国家添加选中状态
                    $ele.append('<span>');
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //隐藏运达目的国家列表弹出层
                    this.hideShipToLayerLayer();
                }, this)
            });
        }
    });

    return GetShiptoCountryListView;
});