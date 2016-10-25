/*
 * module src: orderDetail/orderDetail.js
 * 订单详情模块
 * */
define('app/orderDetail',['common/config','lib/backbone', 'appTpl/orderDetailTpl','checkoutflow/popupTip','checkoutflow/dataErrorLog','mydhgate/contactSeller'],function(CONFIG,Backbone,tpl,tip,dataErrorLog,contactSeller){
    //model-订单详情信息
    var orderDetailModel = Backbone.Model.extend({
        //订单详情初始化属性
        defaults:function(){
            return {
                //状态码
                code: -1,
                //卖家是否在线
                isonLine:false,
                //卖家id
                ntalker_sellerid:'',
                //买家id
                ntalker_buyerid:'',
                ntalker_js_url:'',
                //卖家systemuserid，发送站内信需要此参数
                systemuserid:'',
                //重新下单进入购物车中需要的参数
                vid:'',
                b2bCartSid:'',
                //shipping地址信息
                shippingInfo:{
                    //运输地址1
                    addressline1:'',
                    //运输地址2
                    addressline2:'',
                    //运输城市
                    city:'',
                    //运输地区
                    state:'',
                    //运输国家
                    countryname:'',
                    //邮编号
                    postalcode:'',
                    //名字
                    firstname:'',
                    //姓
                    lastname:'',
                    //电话
                    tel:''
                },
                //订单对象
                tdrfxvo:{
                    //订单id
                    rfid:'',
                    //是否已填写过运单号
                    trackInfoFilled:'',
                    //订单状态
                    rfxstatusname:'',
                    //订单状态码
                    rfxstatusid:'',
                    //订单id
                    rfxid:'',
                    //订单号
                    rfxno:'',
                    //总退款金额
                    totalrefund:'',
                    //产品退款金额
                    rfxrefund:'',
                    //运费退款金额
                    shipcostrefund:'',
                    //追加的payment
                    fillsection:'',
                    //折扣
                    rfxsave:'',
                    //卖家coupon
                    couponofseller:'',
                    //Coupon折扣
                    coupondiscount:'',
                    //运费折扣
                    shipcostsave:'',
                    //开始事件
                    starteddate:'',
                    //用户下单时选的运输方式
                    shippingtype:''
                },
                //买家摘要信息
                summarybuyerto:{
                    //产品总价
                    subtotal:'',
                    //货运费
                    shippingtotal:'',
                    //总折扣
                    wholesalediscount:'',
                    //订单总价
                    totalprice:''
                },
                //产品对象列表
                productlist:[{
                    //产品的url链接
                    productUrl:'',
                    //商品编码
                    itemcode:'',
                    //图片地址
                    r_image:'',
                    //产品名称
                    productname:'',
                    //产品单价
                    targetprice:'',
                    //购买单元，unit
                    measurename:'',
                    //购买数量
                    quantity:''
                }]
            }
        },
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                ajaxOptions:{
                    url: '/viewOrderDetail.do',
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
             //初始接口里面传过来的订单详情
            var obj = {},
                self = this;
            obj.code = (res.result==='1'?200:-1);
            obj.productlist = [];
            obj.vid = CONFIG.vid;
            obj.b2bCartSid = CONFIG.b2b_cart_sid;
            if (obj.code !== -1) {
                obj.shippingInfo = {};
                obj.shippingInfo.addressline1 = res.order.orderDetail.shippingvTdRfxContactinfo.addressline1;
                obj.shippingInfo.addressline2 = res.order.orderDetail.shippingvTdRfxContactinfo.addressline2;
                obj.shippingInfo.city = res.order.orderDetail.shippingvTdRfxContactinfo.city;
                obj.shippingInfo.state = res.order.orderDetail.shippingvTdRfxContactinfo.state;
                obj.shippingInfo.countryname = res.order.orderDetail.shippingvTdRfxContactinfo.countryname;
                obj.shippingInfo.postalcode = res.order.orderDetail.shippingvTdRfxContactinfo.postalcode;
                obj.shippingInfo.firstname = res.order.orderDetail.shippingvTdRfxContactinfo.firstname;
                obj.shippingInfo.lastname = res.order.orderDetail.shippingvTdRfxContactinfo.lastname;
                obj.shippingInfo.tel = res.order.orderDetail.shippingvTdRfxContactinfo.tel;

                obj.tdrfxvo = {};
                obj.tdrfxvo.rfxstatusname = res.order.orderDetail.rfxstatusname;
                obj.tdrfxvo.trackInfoFilled =res.order.trackInfoFilled;
                obj.tdrfxvo.rfxstatusid = res.order.orderDetail.tdrfxvo.rfxstatusid;
                obj.tdrfxvo.rfxid = res.order.orderDetail.tdrfxvo.rfxid;
                obj.tdrfxvo.rfxno = res.order.orderDetail.tdrfxvo.rfxno;
                obj.tdrfxvo.totalrefund = res.order.orderDetail.tdrfxvo.totalrefund;
                obj.tdrfxvo.rfxrefund = res.order.orderDetail.tdrfxvo.rfxrefund;
                obj.tdrfxvo.shipcostrefund = res.order.orderDetail.tdrfxvo.shipcostrefund;
                obj.tdrfxvo.fillsection = res.order.orderDetail.tdrfxvo.fillsection;
                obj.tdrfxvo.rfxsave = res.order.orderDetail.tdrfxvo.rfxsave;
                obj.tdrfxvo.couponofseller = res.order.orderDetail.tdrfxvo.couponofseller;
                obj.tdrfxvo.coupondiscount = res.order.orderDetail.tdrfxvo.coupondiscount;
                obj.tdrfxvo.shipcostsave = res.order.orderDetail.tdrfxvo.shipcostsave;
                obj.tdrfxvo.shippingtype = res.order.orderDetail.tdrfxvo.shippingtype;
                obj.tdrfxvo.starteddate = self.orderTime(res.order.orderDetail.tdrfxvo.starteddate.time);

                obj.summarybuyerto = {};
                obj.summarybuyerto.subtotal = res.order.orderDetail.summarybuyerto.subtotal;
                obj.summarybuyerto.shippingtotal = res.order.orderDetail.summarybuyerto.shippingtotal;
                obj.summarybuyerto.wholesalediscount = res.order.orderDetail.summarybuyerto.wholesalediscount;
                obj.summarybuyerto.totalprice = res.order.orderDetail.summarybuyerto.totalprice;

                $.each(res.order.orderDetail.tdrfxproductlist,function(index,pro){
                    var __obj = {};
                    //图片链接的代码为：<img src="http://www.dhresource.com/${r_image?if_exists}${pro.r_image}" alt="dhgate" /></a>
                    __obj.rImage1 ="http://www.dhresource.com/" + pro.r_image;
                    //商品链接的代码为： <a href="${mobilehost}/product/${pro.productUrl}/${pro.itemcode}.html">
                    __obj.productUrl1 = CONFIG.wwwURL + '/' + pro.productUrl + "/" + pro.itemcode + ".html";
                    __obj.productname = pro.productname;
                    __obj.targetprice = pro.targetprice;
                    __obj.measurename = pro.measurename;
                    __obj.quantity = pro.quantity;

                    obj.productlist.push(__obj);
                });
                obj.isonLine = res.order.ntalker.isonLine;
                obj.ntalkerBuyerid = res.order.ntalker.ntalker_buyerid;
                obj.ntalkerJsUrl = res.order.ntalker.ntalker_js_url;
                obj.ntalkerSellerid = res.order.ntalker.ntalker_sellerid;
                obj.systemuserid = res.order.supplier.systemuserid;
            }
            return obj;
        },
        //详细订单时间
        orderTime:function(time){
            var year = new Date(time).getFullYear(),
                month = new Date(time).getMonth(),
                day = new Date(time).getDate(),
                hours = new Date(time).getHours(),
                minutes = new Date(time).getMinutes(),
                monthArray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] ;
            return monthArray[month]+'  '+day+', '+year+' '+hours+':'+ (minutes<10 ? '0'+minutes:minutes);
        }
    });

    //view 订单详情初始化
    var orderDetailView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click #J_dhChat': 'chat'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.oOrderDetailHeaderWrap = this.options.oOrderDetailHeaderWrap;
            this.oOrderDetailWap = this.options.oOrderDetailWap;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            this.uname = CONFIG.b2b_nick_n;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //模型层拉取参数
            this.model.fetch({data:{rfid:this.getRfid()}});
        },
        //$dom对象初始化
        initElement: function(){
            this.$oOrderDetailWap = $(this.oOrderDetailWap);
            this.$oOrderDetailHeaderWrap = $(this.oOrderDetailHeaderWrap);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //订单详情页header包裹容器
                oOrderDetailHeaderWrap: '.j-orderDetail-header',
                //订单详情包裹容器
                oOrderDetailWap: '.j_order_detail',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new orderDetailModel(),
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
                tip.events.trigger('popupTip:dataErrorTip', {
                    action: 'refresh',
                    message: response.message || 'Failure'
                });
                //捕获异常
                try {
                    throw('success(): data is wrong');
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
            var data = $.extend(true, {}, data, {rft:this.getRft()}),
                template = this.template,
                tpl = this.tpl,
                orderDetailHeader = template(tpl.orderDetailHeader.join(''))(data),
                orderDetails = template(tpl.orderDetails.join(''))(data);
            this.$oOrderDetailHeaderWrap.append(orderDetailHeader);
            this.$oOrderDetailWap.append(orderDetails);
        },
        //获取订单Id
        getRfid: function() {
            var rfid = CONFIG.wwwSEARCH.match(/^(?:\?|&).*rfid=([^&#]+)/i);
            return rfid!==null?rfid[1]:'';
        },
        //获取订单状态类型
        getRft: function() {
            var rft = CONFIG.wwwSEARCH.match(/^(?:\?|&).*rft=([^&#]+)/i);
            return rft!==null?rft[1]:'';
        },
        //ntalker
        chat: function(evt) {
            var $ele = $(evt.currentTarget),
                //Ntalker第三方入口文件
                ntalkUrl = $ele.attr('ntalker_js_url'),
                //卖家Id
                ntalkSellerId = $ele.attr('ntalker_sellerid'),
                //买家Id
                ntalkerBuyerid = $ele.attr('ntalker_buyerid');

            //调用IM
            contactSeller.events.trigger('contactSeller:chat', {
                NTKF_PARAM: {
                    //Ntalker的js入口文件地址
                    ntalkUrl: ntalkUrl.substring(0,ntalkUrl.lastIndexOf("/")),
                    //商户id，商家页面必须此参数，平台页面不传
                    sellerid: ntalkSellerId,
                    //Ntalker分配的缺省客服组id
                    settingid: ntalkSellerId,
                    //买家id
                    uid: ntalkerBuyerid
                }
            });
        }
    });
    return  orderDetailView;
})

