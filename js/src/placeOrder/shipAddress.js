/**
 * module src: placeOrder/shipAddress.js
 * 点击展示运输地址列表信息
 **/
define('app/shipAddress', ['common/config', 'lib/backbone', 'appTpl/shipAddressTpl', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, Backbone, tpl, tip, dataErrorLog) {
    var shipAddressModel = Backbone.Model.extend({
        //展示运输地址列表信息
        defaults: function() {
            return {
                //状态码
                code: -1,
                //dom事件对象
                evt: null,
                list: [{
                    //邮箱地址
                    email: '',
                    //运输地址id
                    shippingInfoId: "",
                    //名
                    firstname: "",
                    //姓
                    lastname: "",
                    //邮政编码
                    zipCode: "",
                    //国家名
                    country: "",
                    //国家id
                    countryid: "",
                    //州
                    state: "",
                    //电话号码
                    telephone: "",
                    //地址1
                    addressline1: "",
                    //地址2
                    addressline2: "",
                    //城市
                    city: "",
                    //税号
                    vatnum: ""
                }],
                //成功或失败提示语
                message: ''
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
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: CONFIG.wwwURL + '/mobileApiWeb/user-Shipping-getShippingAddressList.do',
                    //url: 'getShippingAddressList.json',
                    data: {
                        version: 3.3,
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
            $.extend(true, this.options, options || {});
        },
        //事件初始化
        initEvent: function() {
            //获取指定的运费地址
            this.on('shipAddressModel:getShippingAddress', this.getShippingAddress, this);

        },
        //设置生成模型的url
        urlRoot: function() {
            //return CONFIG.wwwURL + this.ajaxOptions.url;
            return this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            //请求异常的时候“dataErrorLog”会捕获“__params”
            this.__params = $.extend(true, {}, this.ajaxOptions, options || {});
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {
                url: this.url()
            }, options));
        },
        /**
         * parse（数据格式化）
         *
         * 接口地址：
         * /mobileApiWeb/user-Shipping-getShippingAddressList.do
         * 接口文档地址：
         * http://m.dhgate.com/mobileApiWeb/user-Shipping-getShippingAddressList.do
         *
         * 说明：
         * 就目前WAP端业务而言并不会用到所有的字段信息
         *
         * 原始数据结构
         * {
         *     "data":[{
         *           "addressline1": "us",
         *           "addressline2": "us",
         *           "callingcode": "1",
         *           "city": "US",
         *           "country": "US",
         *           "countryname": "United States",
         *           "firstname": "us",
         *           "lastname": "us",
         *           "postalcode": "11111",
         *           "shippingInfoId": "65a6e33d-335c-4efe-b0b9-40e4d27b0ada",
         *           "state": "New York",
         *           "tel": "001-2121212121",
         *           "email": "strong@gmail.com"
         *       }],
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
         **/
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            var obj = {};
            obj.list = [];
            obj.code = res.state === '0x0000' ? 200 : -1;
            if (obj.code !== -1) {
                //运输地址列表信息
                $.each(res.data, function(index, pro) {
                    var __obj = {};
                    __obj.email = pro.email || '';
                    __obj.shippingInfoId = pro.shippingInfoId;
                    __obj.firstname = pro.firstname;
                    __obj.lastname = pro.lastname;
                    __obj.zipCode = pro.postalcode;
                    __obj.country = pro.countryname;
                    __obj.countryid = pro.country;
                    __obj.state = pro.state;
                    __obj.telephone = pro.tel;
                    __obj.addressline1 = pro.addressline1;
                    __obj.addressline2 = pro.addressline2 || '';
                    __obj.city = pro.city;
                    __obj.vatnum = pro.vatNumber || '';
                    obj.list.push(__obj);
                });
            }
            return obj;
        },
        //根据指定的shippingInfoId返回对应的运费地址
        getShippingAddress: function(options) {
            var callback = options.callback,
                shippingInfoId = options.shippingInfoId,
                obj = [];
            $.each(this.get('list'), function(index, shippingAddress) {
                //查找对应的shippingInfoId
                if (shippingInfoId!=='' && shippingInfoId===shippingAddress.shippingInfoId) {
                    var __obj = {};
                    __obj.email = shippingAddress.email || '';
                    __obj.shippingInfoId = shippingAddress.shippingInfoId;
                    __obj.firstName = shippingAddress.firstname;
                    __obj.lastName = shippingAddress.lastname;
                    __obj.addressOne = shippingAddress.addressline1;
                    __obj.addressTwo = shippingAddress.addressline2 || '';
                    __obj.city = shippingAddress.city;
                    __obj.country = shippingAddress.country;
                    __obj.countryid = shippingAddress.countryid;
                    __obj.state = shippingAddress.state;
                    __obj.zipCode = shippingAddress.zipCode;
                    __obj.telephone = shippingAddress.telephone;
                    __obj.vatnum = shippingAddress.vatnum || '';
                    obj.push(__obj);
                }
            });

            //执行回调
            callback && callback(obj)
        }
    });

    //view-运输地址信息列表
    var shipAddressView = Backbone.View.extend({
        //根节点
        el: '.mainBox',
        //backbone提供的事件集合
        events: {
            'click .j-ship-hasaddress': 'shipAdressopenLayer',
            'click .j-det-back': 'shipAdresscloseLayer'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.placeOrder = this.options.placeOrder;
            this.cHtml = this.options.cHtml;
            this.cJShipAdressWarp = this.options.cJShipAdressWarp;
            this.cShipAdressOpen = this.options.cShipAdressOpen;
            this.cShipAdressClose = this.options.cShipAdressClose;
            this.cJHeaderBack = this.options.cJHeaderBack;
            this.cJShipAdrList = this.options.cJShipAdrList;
            this.cJShipAdressDetail = this.options.cJShipAdressDetail;
            this.cJAddNewAddress = this.options.cJAddNewAddress;
            this.hasSelect = this.options.hasSelect;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            this.timer = null;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html || $('html');
            this.$window = this.$window || $(window);
            this.$cJShipAdressWarp = $(this.cJShipAdressWarp);
            this.$cShipAdressOpen = $(this.cShipAdressOpen);
            this.$cShipAdressClose = $(this.cShipAdressClose);
            this.$cJHeaderBack = $(this.cJHeaderBack);
            this.$cJShipAdrList = $(this.cJShipAdrList);
            this.$cJShipAdressDetail = $(this.cJShipAdressDetail);
            this.$cJAddNewAddress = $(this.cJAddNewAddress);
            this.$hasSelect = $(this.hasSelect);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;

            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);

            //运输地址弹出层渲染
            this.placeOrder.on('shipAdresscloseLayer', this.shipAdresscloseLayer, this);

            //运输地址列表信息渲染
            this.placeOrder.on('shipAddressView:render:shippingAddressList', this.shippingAddressList, this);

            //展示当前默认运输地址
            this.placeOrder.on('showAddress', this.showAddress, this);

            //添加运输地址按钮渲染
            this.placeOrder.on("addNewAddress:render:addNewAddress", this.addNewAddress, this);

            //屏幕旋转事件
            //链接入口列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange, resize', function() {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function() {
                    self.setShipPopupStyle();
                }, 500);
            });
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //html样式
                cHtml: 'htmlOverflow',
                //弹层外层包裹容器
                cJShipAdressWarp: '.j-shipAdressWarp',
                //显示浮层外层包裹容器
                cShipAdressOpen: 'shipAdress-open',
                //关闭浮层外层包裹容器
                cShipAdressClose: 'shipAdress-close',
                //头部外层包裹容器
                cJHeaderBack: '.j-header-back',
                //运输地址列表外层包裹容器
                cJShipAdrList: '.j-shipAdrList',
                //运输地址信息外层包裹容器
                cJShipAdressDetail: '.j-shipAdress-detail',
                //添加运输地址信息按钮外层包裹容器
                cJAddNewAddress: '.j-addNewAddress',
                //当前选中运输地址样式
                hasSelect: 'hasSelect',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new shipAddressModel(),
                //placeOrder实例对象
                placeOrder: $({}),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options || {});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {

                //展示浮层
                this.setStyle(true);

                //关闭loading
                tip.events.trigger('popupTip:loading', false);

                //渲染页面
                this.render(model.attributes);

                //设置添加运输地址列表弹出层样式
                this.setShipPopupStyle();

                //展示当前默认运输地址
                this.showAddress();
            } else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
                //捕获异常
                try {
                    throw ('success(): data is wrong');
                } catch (e) {
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
            //关闭loadding
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，关闭提示】
            tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
            //捕获异常
            try {
                throw ('error(): request is wrong');
            } catch (e) {
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
        },
        //选择运输地址列表渲染
        render: function(data) {
            //运输地址列表头部渲染
            this.headerBack();
            //运输地址列表渲染
            this.shippingAddressList(data);
            //添加运输地址按钮
            this.addNewAddress(data);
        },
        //运输地址列表头部渲染
        headerBack: function() {
            var template = this.template,
                //模板
                tpl = this.tpl,
                //运输地址列表渲染
                header = template(this.tpl.header.join(''));

            //页面绘制
            this.$cJHeaderBack.html(header);
        },
        //运输地址列表渲染
        shippingAddressList: function(data) {
            var template = this.template,
                //模板
                tpl = this.tpl,
                //运输地址列表包裹容器
                shippingAddressList = template(this.tpl.shippingAddressList.join(''))(data);

            //页面绘制
            this.$cJShipAdrList.html(shippingAddressList);

            //运输地址超出10个隐藏addNewAddress按钮
            this.addNewAddressNo(data);
        },
        //添加运输地址按钮渲染
        addNewAddress: function(data) {
            var template = this.template,
                //模板
                tpl = this.tpl,
                //运输地址列表包裹容器
                addNewAddress = template(this.tpl.addNewAddress.join(''))(data);

            //页面绘制
            this.$cJAddNewAddress.html(addNewAddress);
        },
        //设置添加运输地址列表弹出层样式
        setShipPopupStyle: function() {
            var $shipAddressLayerScroll = $('.shipAddress-layer-scroll'),
                $siblings,
                windowHeight = $(window).height() * 1,
                sumHeight = 0;

            //不存在则跳出
            if (!$shipAddressLayerScroll[0]) {
                return;
            }

            //$ul同辈元素集合
            $siblings = $shipAddressLayerScroll.siblings();
            $.each($siblings, function(index, ele) {
                sumHeight += $(ele).outerHeight() * 1;
            });

            $shipAddressLayerScroll.css({
                height: windowHeight - sumHeight
            });
        },
        //打开浮层
        shipAdressopenLayer: function(e) {
            //显示loadding
            tip.events.trigger('popupTip:loading', true);
            
            //拉取产品数据
            this.model.fetch();
        },
        //设置浮层展示样式
        setStyle: function(flag) {
            if (!flag) {
                //设置html/body样式
                this.$html.removeClass(this.cHtml);
            }
            //显示浮层
            else {
                this.shipAdressshowLayer();
            }
        },
        //显示浮层
        shipAdressshowLayer: function() {
            var $html = this.$html,
                $cJShipAdressWarp = this.$cJShipAdressWarp,
                cHtml = this.cHtml,
                cShipAdressOpen = this.cShipAdressOpen,
                cShipAdressClose = this.cShipAdressClose;

            //设置html/body样式
            $html.addClass(cHtml);

            $cJShipAdressWarp.show();

            //延时一段时间，然后再滑动显示展示
            setTimeout(function() {
                $cJShipAdressWarp.removeClass(cShipAdressClose).addClass(cShipAdressOpen);
            }, 10);
        },
        //关闭浮层
        shipAdresscloseLayer: function() {
            var $cJShipAdressWarp = this.$cJShipAdressWarp,
                cShipAdressOpen = this.cShipAdressOpen,
                cShipAdressClose = this.cShipAdressClose;

            this.setStyle(false);

            //设置html/body样式
            $cJShipAdressWarp.removeClass(cShipAdressOpen).addClass(cShipAdressClose);

            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function() {
                $cJShipAdressWarp.hide();
            }, 510);
        },
        //展示当前默认运输地址
        showAddress: function() {
            var cJShipAdressDetail = this.cJShipAdressDetail,
                $d = $($(cJShipAdressDetail).get(0)),
                hasSelect = this.hasSelect;
            $d.addClass(hasSelect);
        },
        //运输地址超出10个隐藏addNewAddress按钮
        addNewAddressNo:function(data){
            var cJAddNewAddress = this.$cJAddNewAddress,
                len = data.list.length;
            if(len >= 10){
                cJAddNewAddress.remove();
            }
        }
    });
    return shipAddressView;
});