/*
* module src:storeShop/store.js
* 店铺基本信息模块
* */
define('app/storeInfo',['common/config', 'lib/backbone', 'tools/fastclick','appTpl/storeShopTpl', 'app/contactSeller'],function(CONFIG, Backbone,FastClick, tpl, contactSeller){
    //model 店铺基本信息
  var storeModel = Backbone.Model.extend({
        //店铺基本信息初始化属性[attributes]
        defaults:function(){
            return {
                //状态码
                code: 200,
                sellerDto:{
                    supplierid:'',//卖家id
                    suppliername:'',//卖家名称
                    contactpersondomainname:'',//期望显示名称
                    levelId:'',//级别
                    systemuserid:'',
                    showpercentum:'',//好评百分比
                    cofirmorderAccumulated:'',//交易总量
                    year:'',//seller建设年份，默认是1 （去掉）
                    sponsor:'',//是否是收费会员//1金色 sponsor-gold 2蓝色sponsor 3白色ponsor-diamond
                    activityType:''//返回1,2,3,4，5和prd中的顺序依次对应 https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=24248327
                },
                //聊天信息
                ntalkerDto:{
                    //聊天拼接参数
                    bidSidPid:'',
                    //暂时默认都是false
                    isonLine:'',
                    //买家id
                    ntalkerBuyerid:'',
                    ntalkerJsUrl:'',
                    //卖家企业id
                    ntalkerSellerid:''
                }

            }
        },
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
     /*       //初始化事件
            this.initEvent();*/
        },
        //设置自定义配置
        setOptions:function(options){
            this.options = {
                ajaxOptions:{
                    url:'/mobileApiWeb/store-Store-getStoreInfo.do',
                    //url: '/api.php?jsApiUrl=' + 'http://m.dhgate.com/mobileApiWeb/store-Store-getStoreInfo.do',
                    data:{
                        //通用接口参数
                        client:'wap'
                    },
                    type:'GET',
                    dataType:'json',
                    async:true,
                    cache:false,
                    processData:true
                }
            };
            $.extend(true,this.options,options||{});
        },
        //设置生成模型的url
        urlRoot: function() {
            //return CONFIG.wwwURL + this.ajaxOptions.url;
            return CONFIG.wwwURL + this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {

            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * mobileApiWeb/store-Store-getStoreInfo.do
             * 接口文档地址：https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=24248327
             *
             * 原始数据结构
             *
             *
             {
                "data": {
                 "sellerDto": {
                        "cofirmorderAccumulated": 10096,
                        "contactpersondomainname": "dhgatc",
                        "ishaveStore": false,
                        "levelId": "P",
                        "servlevel": 0,
                        "showpercentum": "99.4",
                        "sponsor": "3",
                        "supplierid": "ff80808131e0c7410131f1a941891a69",
                        "suppliername": "Junhao business baby toys",
                        "systemuserid": "ff80808131e0c7410131f1a941891a6a",
                        "year": 5,
                        'activityType':'1'
                    },
                 "ntalkerDto": {
                        "bid_sid_pid": "ff8080814db95b2e014dd27b88c43947-DH-ff80808131e0c7410131f1a941891a69-DH-null",
                        "isonLine": false,
                        "ntalker_buyerid": "725683244",
                        "ntalker_js_url": "http://www.dhresource.com/dhs/thirdparty/ntalker/ntkfstat_en_us.js?v=20150126",
                        "ntalker_sellerid": "2077747670"
                    }

                },
                "message": "Success",
                "serverTime": 1447232879927,
                "state": "0x0000"
            }
             **/
            var obj = {},
                expireYear = (new Date(res.serverTime)).getFullYear().toString();
            obj.code = (res.state==='0x0000'?200:-1);
            obj.ntalkerDto = {};
            obj.sellerDto = {};
            if (obj.code !== -1) {
                if(res.data.ntalkerDto){
                    //初始接口里面传过来的ntalker聊天信息
                    obj.ntalkerDto.bidSidPid = res.data.ntalkerDto.bid_sid_pid;
                    obj.ntalkerDto.isonLine = res.data.ntalkerDto.isonLine;
                    obj.ntalkerDto.ntalkerBuyerid = res.data.ntalkerDto.ntalker_buyerid;
                    obj.ntalkerDto.ntalkerJsUrl = res.data.ntalkerDto.ntalker_js_url;
                    obj.ntalkerDto.ntalkerSellerid = res.data.ntalkerDto.ntalker_sellerid;
                }

                //初始接口里面传过来的seller店铺信息
                obj.sellerDto.cofirmorderAccumulated = res.data.sellerDto.cofirmorderAccumulated;
                obj.sellerDto.contactpersondomainname = res.data.sellerDto.contactpersondomainname;
                obj.sellerDto.ishaveStore = res.data.sellerDto.ishaveStore;
                obj.sellerDto.levelId = res.data.sellerDto.levelId;
                obj.sellerDto.servlevel = res.data.sellerDto.servlevel;
                obj.sellerDto.showpercentum = res.data.sellerDto.showpercentum;
                obj.sellerDto.sponsor = res.data.sellerDto.sponsor;
                obj.sellerDto.supplierid = res.data.sellerDto.supplierid;
                obj.sellerDto.suppliername = res.data.sellerDto.suppliername;
                obj.sellerDto.systemuserid = res.data.sellerDto.systemuserid;
                obj.sellerDto.year = res.data.sellerDto.year;
                obj.sellerDto.activityType = res.data.sellerDto.activityType;//活动类型，返回1,2,3,4，5 和prd中的顺序依次对应
                obj.serverTime = res.serverTime*1;
            }

            return obj;
        }
    });
    //view 店铺基本信息初始化
    var storeView = Backbone.View.extend({
        //根节点
        el:'body',
        events:{
            'click #J_dhChat':'chat'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.sDetailStoreWrap = this.options.sDetailStoreWrap;
            this.sMessageWrap = this.options.sMessageWrap;
            this.sAllContentWrap = this.options.sAllContentWrap;
            this.sbaseStore = this.options.sbaseStore;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;;
            this.FastClick = this.options.FastClick;
            this.successCallback = this.options.successCallback;
            this.uname = CONFIG.b2b_nick_n;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //点击回到顶部、第二屏类目浮顶
            this.scrolls();
            //拉取业务数据 data参数
            this.model.fetch({data:this.getParams()});
            //解决click事件的300毫秒延时
            //阻止大多数设备上的点透问题
            this.FastClick.attach(this.$el[0]);
        },
        //$dom对象初始化
        initElement: function() {
            this.$sDetailStoreWrap = this.$sDetailStoreWrap || $(this.sDetailStoreWrap);
            this.$sMessageWrap = this.$sMessageWrap || $(this.sMessageWrap);
            this.$sAllContentWrap = this.$sAllContentWrap || $(this.sAllContentWrap);
            this.$baseStore = this.$baseStore || $(this.sbaseStore);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                sDetailStoreWrap:'.detail-store',
                sMessageWrap:'.message-entrance',
                sAllContentWrap:'#j-all-content',
                sbaseStore:'.base-store',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new storeModel(),
                //阻止点透的函数
                FastClick: FastClick,
                //success()对外成功时的回调
                successCallback: $.noop
            };
            $.extend(true, this.options, options||{});
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //监听sellerDto数据的变化
            this.listenTo(this.model, 'change:sellerDto', this.addD1);
           //监听卖家名称suppliername
            this.listenTo(this.model,'change:sellerDto',this.addSeo);
        },
        success:function(model,response,options){
            if(model.get('code') === 200){
                this.render(model.attributes);
                this.successCallback(model);
            }
        },
        //获取参数
        getParams:function(options){
            var storeNo = window.location.pathname.match(/\d+/g)[0];
            return  $.extend(true, {}, {supplierseq:storeNo}, options);
        },
        //页面整体渲染
        render: function(data) {
            //数据可用则绘制页面
            if (data.code !== -1) {
                this.renderStoreInfo(data);
                //重新初始化$dom对象
                this.initElement();

            }
        },
        renderStoreInfo:function(data){
            var template = this.template,
                tpl = this.tpl,
                storeInfo =template(tpl.detailStore.join(''))(data),
                messageInfo = template(tpl.messageEntrance.join(''))(data),
                promotionBanner = template(tpl.promotionBanner.join(''))(data);
                this.$sDetailStoreWrap.html(storeInfo);
                this.$sMessageWrap.html(messageInfo);
                this.$sDetailStoreWrap.after(promotionBanner);
        },
        //回到顶部和类目悬浮
        scrolls:function(){
            $(window).scroll(function(){
                if($(window).scrollTop() > 190){
                    $('.goTop').css({'display':'block'});
                    if( $('.navs')){
                        $('.navs').addClass('j-navs')
                    }
                }else{
                    $('.goTop').css({'display':'none'});
                    if( $('.navs')){
                        $('.navs').removeClass('j-navs');
                    }
                }
            });
        },
        //D1
        addD1:function(){
            try{
                _dhq.push(["setVar", "pt", "st" ]);
                _dhq.push(["setVar", "supplierid", this.model.get('sellerDto').supplierid]);
                _dhq.push(["event", "Public_S0003"]);
            }catch(e){}
        },
        //获取头部seo
        addSeo:function(){
            var supplierName = this.model.get('sellerDto').suppliername;
            var seoStr=['<title>China Wholesale Store from ' + supplierName + ' | m.dhgate.com</title><meta name="keywords" content="' + supplierName + ', wholesale store, best china ' + supplierName + '"/><meta name="description" content="' + supplierName + ' online store on m.dhgate.com, the reliable store with quality service in China." />'];
            $('head').append(seoStr.join(""));
        },

        //chat
        chat:function(){
            var ntalkUrl = this.model.get('ntalkerDto').ntalkerJsUrl,
                ntalkSellerId = this.model.get('ntalkerDto').ntalkerSellerid,
                ntalkerBuyerid = this.model.get('ntalkerDto').ntalkerBuyerid;
                contactSeller.events.trigger('contactSeller:chat', {
                    uname: this.uname,
                    ntalkerBuyerid: ntalkerBuyerid ,
                    ntalkUrl: ntalkUrl,
                    ntalkUrl1: ntalkUrl.substring(0,ntalkUrl.lastIndexOf('/')),
                    ntalkSellerId: ntalkSellerId,
                    NTKF_PARAM: {
                        siteid:'dh_1000',                       //平台基础id
                        sellerid:'dh_'+ntalkSellerId,           //商户id，商家页面必须此参数，平台页面不传
                        settingid:'dh_'+ntalkSellerId+'_9999',  //Ntalker分配的缺省客服组id
                        uid:'dh_'+ntalkerBuyerid+'',            //用户id  buyerid   hashcode的绝对值的字符串，前面加dh_
                        uname:this.uname,                            //用户名    nickname获取cookie b2b_nick_n值
                        userlevel:'0'                           //用户级别，1为vip用户，0为普通用户
                    }
                });
        }
    });
    return storeView;
})