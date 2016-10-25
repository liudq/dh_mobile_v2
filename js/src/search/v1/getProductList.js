/**
 * module src: search/getProductList.js
 * search列表初始化模块
**/
define('app/getProductList', ['common/config', 'lib/backbone', 'appTpl/getProductListTpl', 'tools/fastclick', 'checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG, Backbone, tpl, FastClick, tip,dataErrorLog){
    //model-search列表
    var GetProductListModel = Backbone.Model.extend({
        //search列表属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //运达地址
                list: [{
                    //产品编号
                    itemcode:'',
                    //产品图片Url
                    imageurl:'',
                    //产品标题
                    title: '',
                    //单价区间价格
                    price: '',
                    //单价区间价格单位
                    measure:'',
                    //产品连接地址
                    url:'',
                    //已售出数量
                    quantitysold:'',
                    //已评论数
                    quantityreviews:'',
                    //好评率
                    reviewslevel:'',    
                    //0 折扣 、10 直降、 20 vip普通 、30 vip折上折 、40 vip折上扣
                    promoType:'',
                    //是否免运费 1：免运费
                    freeShipping:'', 
                    //是否有coupon 1:有coupon
                    hasCoupon:'', 
                    //最小起订量（带单位）
                    minOrder:'',
                    //是否有移动专享价 1：有
                    hasMobilePrice:'',
                    //vip折扣率
                    vipDiscount:'',
                    //最低价
                    lowPrice:'',
                    //折扣额*100
                    discountRate:'',
                    //直降额
                    downOffCount:'',
                    //卖家名
                    sellerName:''
                }],
                //总记录数
                totalRecord:-1
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
                    url: 'http://css.dhresource.com/mobile_v2/css/search/html/wap-PageSearch-search.do',
                    //url: '/mobileApiWeb/wap-PageSearch-search.do',
                    data: {
                        pageSize:2,
                        pageNum:1,
                        version: 1.0,
                        language:'en',
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
            //return CONFIG.wwwURL + this.ajaxOptions.url;
            return this.ajaxOptions.url;
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
            var obj = {},self = this;
      
            obj.code = res.state==='0x0000'?200:-1;
            obj.list = [];
            if (obj.code !== -1) {
                $.each(res.resultList, function(index, pro){
                    var __obj = {};
                    __obj.itemcode = pro.itemcode;
                    __obj.imageurl = pro.imageurl;
                    __obj.title = pro.title;
                    __obj.price = pro.price;
                    __obj.measure = pro.measure;
                    __obj.url = pro.url;
                    //有已售出数量就显示，售出数量为空或者0的时候都不显示
                    if(pro.quantitysold&&pro.quantitysold!=='0'){
                       __obj.quantitysold = pro.quantitysold; 
                    }
                    //有评论数的时候显示评论，评论为空或者0的时候都不显示
                    if(pro.quantityreviews&&pro.quantityreviews!=='0'){
                        __obj.quantityreviews = pro.quantityreviews;
                        __obj.reviewslevel = pro.reviewslevel;
                    }
                    //0 折扣 、10 直降、 20 vip普通 、30 vip折上折 、40 vip折上扣
                    __obj.promoType = pro.promoType;
                    //是否免运费 1：免运费
                    __obj.freeShipping = pro.freeShipping;
                    //是否有coupon 1:有coupon
                    __obj.hasCoupon = pro.hasCoupon;
                    //最小起订量（带单位）
                    __obj.minOrder = pro.minOrder||'';
                    //是否有移动专享价 1：有
                    __obj.hasMobilePrice = pro.hasMobilePrice;

                    __obj.vipDiscount = pro.vipDiscount||'';
                    __obj.lowPrice = pro.lowPrice||'';
                    __obj.discountRate = pro.discountRate||'';
                    __obj.downOffCount = pro.downOffCount||'';
                    __obj.sellerName = pro.sellername||'';

                    obj.list.push(__obj);
                });
                obj.totalRecord = res.page.totalRecord;
            }
            /**文档地址：http://192.168.76.42:8090/pages/viewpage.action?pageId=1573625
             * 最终将其格式化为：
              {
                  code: 200,
                  list: [{
                    //产品编号
                    itemcode:'',
                    //产品图片Url
                    imageurl:'',
                    //产品标题
                    title: '',
                    //单价区间价格
                    price: '',
                    //单价区间价格单位
                    measure:'',
                    //产品连接地址
                    url:'',
                    //已售出数量
                    quantitysold:'',
                    //已评论数
                    quantityreviews:'',
                    //好评率
                    reviewslevel:'',    
                    //0 折扣 、10 直降、 20 vip普通 、30 vip折上折 、40 vip折上扣
                    promoType:'',
                    //是否免运费 1：免运费
                    freeShipping:'', 
                    //是否有coupon 1:有coupon
                    hasCoupon:'', 
                    //最小起订量（带单位）
                    minOrder:'',
                    //是否有移动专享价 1：有
                    hasMobilePrice:'',
                    //vip折扣率
                    vipDiscount:'',
                    //最低价
                    lowPrice:'',
                    //折扣额*100
                    discountRate:'',
                    //直降额
                    downOffCount:'',
                    //卖家名
                    sellerName:''
                }],
                "totalRecord":-1
             * }
            **/
           //console.log(obj)
            return obj;
        }
    });

    //view-mycoupon列表
    var GetProductListView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-showmore': 'showMore'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.loginFlag = this.options.loginFlag;
            this.cListWrap = this.options.cListWrap;
            this.dShowMoreBtn = this.options.dShowMoreBtn;
            this.cIsLoading = this.options.cIsLoading;
            this.cHide = this.options.cHide;
            this.cNote = this.options.cNote;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.FastClick = this.options.FastClick;
            this.dataErrorLog = this.options.dataErrorLog;
            this.pageNum = this.options.pageNum;
            this.pageTotalNum = this.options.pageTotalNum;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取产品数据
            //this.model.fetch();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cListWrap = this.$cListWrap||$(this.cListWrap);
            this.$cNote = $(this.cNote);
            this.$dShowMoreBtn = $(this.dShowMoreBtn);
            this.$cIsLoading = $(this.cIsLoading);
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
                //登录状态
                loginFlag: '',
                //列表外层包裹容器
                cListWrap: '#J_list',
                //展示更多btn
                dShowMoreBtn: '.j-showmore',
                //添加下拉刷新的loading按钮
                cIsLoading: '.j-isLoading',
                //控制整个区域显示隐藏的className
                cHide: 'dhm-hide',
                //显示当前页码
                pageNum: 1,
                //显示总页数
                pageTotalNum: -1,
                //错误提示语言
                cNote: '.j-note',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new GetProductListModel(),
                //阻止点透的函数
                FastClick: FastClick,
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //关闭loading
            this.$cIsLoading.hide();
            //绘制页面
            this.render(model.attributes);
            //捕获异常
            if (model.get('code') === -1) {
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:response.message});
                //捕获异常
                try{
                    throw('success(): data is wrong');
                }catch(e){
                    //异常数据收集
                    this.dataErrorLog.events.trigger('save:dataErrorLog', {
                        message: e,
                        url: this.model.__params.url,
                        params: this.model.__params.data,
                        result: response,
                        custom: {
                            loginFlag: this.loginFlag
                        }
                    });
                }
            }
        },
        //拉取数据失败回调
        error: function(model, response, options) {
            var dataNull;
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，关闭页面】
            tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Network anomaly.'});
            //捕获异常
            try{
                throw('error(): request is wrong');
            }catch(e){
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
        },
        //数据渲染
        render: function(data) {
        
            var warp = this.template(this.tpl.warp.join(''))(data),
                pageTotalNum = data.totalRecord;
                
     
            //打开show more按钮和tip提示
            this.$dShowMoreBtn.show();

            //页面绘制
            this.$cListWrap.find('ul').append(this.template(warp));
            if(this.pageNum*2>=pageTotalNum){
                this.$dShowMoreBtn.hide();
            }
            //增加页码数
            this.pageNum++;
            //初始化$dom对象
            this.initElement();
        },
        //下拉展示
        showMore:function(){
            //打开loading
            this.$cIsLoading.show();
            //隐藏more按钮
            this.$dShowMoreBtn.hide();
            //拉取产品数据
            this.model.fetch({data:{pageNum:this.pageNum}});
        }
    });

    return GetProductListView;
});
