/**
 * Created by liudongqing on 2015/12/15.
 */
/*
* module src: myFavorites/myFavorites.js
* 接口文档：https://dhgatemobile.atlassian.net/wiki/display/SMS/15+Favorite
* 收藏列表
* */
define('app/myFavoritesList',['common/config','lib/backbone', 'appTpl/myFavoritesListTpl','checkoutflow/popupTip','checkoutflow/dataErrorLog'],function(CONFIG,Backbone,tpl,tip,dataErrorLog){
    //model 收藏列表商品信息
    var myFavoritesModel = Backbone.Model.extend({
        //收藏商品初始化属性
        defaults:function(){
            return {
                //状态码
                code: 200,
                list: {
                    totalSize: '',
                    favoriteProductDTOList: [{
                        productno: '',//产品no 就是itemCode
                        productname: '',//产品名称
                        produrl: '', //产品链接
                        imgurl: '',//图片链接
                        minOrder: '',//最小成单量，拼接好的  5 Pieces
                        measure: '',//单位(多语言对应翻译后)
                        freeShipping: '', //是否包邮 (true-是 false-否)
                        state: '', //  0是sold out
                        finalPrice: '', //计算好最终的价格   US $5.31 - 6.98
                        promoType: '', //产品促销类型(0-折扣  10-直降)
                        discount:'',//折扣率
                        itemType:'',//产品促销类型  //1.原价  2.促销  3.移动专享非促销 4.移动专享&促销  5.vip , 6vip&促销 7移动专享+vip+促销， 8 vip+移动专享非促销（wap专用）
                        pageType:''
                    }]
                }
            }
        },
        initialize:function(){
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions:function(options){
            this.options = {
                ajaxOptions:{
                    url: '/mobileApiWeb/favorite-Favorite-getFavoriteList.do',//上线
                    //url: "/api.php?jsApiUrl=" + "http://m.dhgate.com/mobileApiWeb/favorite-Favorite-getFavoriteList.do",//张晓
                    //  url:'/mobile_v2/css/myFavorites/html/favList.do',//本地
                     data:{
                        client:'wap',
                        language:CONFIG.countryCur,//站点
                        pageSize:'20'//每条页数
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
            var obj = {};
            obj.code = (res.state==='0x0000'?200:-1);
            obj.list ={};
            obj.list.favoriteProductDTOList = [];
            if (obj.code !== -1) {
                //初始接口里面传过来的收藏商品list分类
                if(res.data.favoriteProductDTOList){
                    $.each(res.data.favoriteProductDTOList,function(index,pro){
                        var __obj = {};
                        __obj.productno = pro.productno;
                        __obj.productname = pro.productname;
                        __obj.produrl = pro.produrl;
                        __obj.imgurl = pro.imgurl;
                        __obj.minOrder = pro.minOrder;
                        __obj.measure = pro.measure;
                        __obj.freeShipping = pro.freeShipping;
                        __obj.state = pro.state;
                        __obj.finalPrice = pro.finalPrice;
                        __obj.promoType = pro.promoType;
                        __obj.discount = pro.discount;//折扣率
                        __obj.itemType = pro.itemType;
                        __obj.pageType = pro.pageType;
                        __obj.productUrl = CONFIG.wwwURL + pro.produrl + '#cpmfit-'+(index+1)+'-null';

                        obj.list.favoriteProductDTOList.push(__obj);
                    })
                    obj.list.totalSize = res.data.totalSize;
                }
            }
            return obj;
        }
    });
    //view 收藏列表商品初始化
    var myFavoritesView = Backbone.View.extend({
        //根节点
        el:'body',
        events: {
            'click .show-more': 'showMore'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.fMyFavWap = this.options.fMyFavWap;
            this.fTitle = this.options.fTitle;
            this.fShowMore = this.options.fShowMore;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.FastClick = this.options.FastClick;
            this.successCallback = this.options.successCallback;
            this.dataErrorLog = this.options.dataErrorLog;
            this.showMoreNum = this.options.showMoreNum;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$fMyFavWap = this.$fMyFavWap || $(this.fMyFavWap);
            this.$fTitle = this.$fTitle || $(this.fTitle);
            this.$fShowMore = $(this.fShowMore);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //收藏列表包裹容器
                fMyFavWap:'.j-myFav',
                //头部标题包裹容器
                fTitle:'.title',
                //show more 按钮
                fShowMore:'.show-more',
                showMoreNum: 1,
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new myFavoritesModel(),
                //success()对外成功时的回调
                successCallback: $.noop,
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: false,
                    //url: '/api.php?jsApiUrl=' + '/mobileApiWeb/biz-FeedBack-log.do'
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
            this.model.fetch({data:this.getParams({pageNum:1})});
            //当前页面标题
            this.renderTitle();
        },
        success:function(model,response,options){
            if(model.get('code') === 200){
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                this.render(model.attributes);
                this.successCallback(model);
                //判断页面中商品li标签数量是否没有展示完 如没展示完 显示 show more 否则 删除掉show more 按钮
                if(this.showMoreNum*20 < model.get('list').totalSize){
                    this.renderShowMore(this.model.data);
                }else{
                    this.$fShowMore.remove();
                }
            } else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，刷新页面】
                tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:response.message});
                //捕获异常
                try {
                    throw('success(): data is wrong');
                } catch(e) {
                    //异常数据收集
                    this.dataErrorLog.events.trigger('save:dataErrorLog', {
                        message: e,
                        url: this.model.__params.url,
                        params: this.model.__params.data
                    });
                }
            }
        },
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
            //数据可用则绘制页面
            if (data.code !== -1) {
                if(data.list.favoriteProductDTOList != '' || data.list.favoriteProductDTOList.length>0){
                    this.renderMyFavorites(data);
                } else {
                    this.renderNoItem(data);
                }
            } else {
                this.renderNoItem(data);
            }
        },
        //绘制无商品信息
        renderShowMore:function(data){
            var template = this.template,
                tpl = this.tpl,
                showMore = template(tpl.showMore.join(''))(data);
            this.$fMyFavWap.find('ul:last-child').append(showMore);
        },
        //绘制无商品信息
        renderNoItem:function(data){
            var template = this.template,
                tpl = this.tpl,
                noItem = template(tpl.noItem.join(''))(data);
            if(this.$fMyFavWap.find('ul').find('li').length<=0){
                this.$fMyFavWap.append(noItem);
            }

        },
        //绘制当前页面标题
        renderTitle:function(){
            var template = this.template,
            //模板
                tpl = this.tpl,
            //当前页面标题渲染
              favTitle =  template(tpl.favTitle.join(''));
            //页面绘制
            this.$fTitle.append(favTitle);
        },
        renderMyFavorites:function(data){
            var template = this.template,
                tpl = this.tpl,
                myFavorites = template(tpl.myFavorites.join(''))(data);
            this.$fMyFavWap.append(myFavorites);
        },
        //获取参数
        getParams:function(options){
            var pageNum = 1;
            return  $.extend(true, {}, {pageNum:pageNum},options);
        },
        showMore:function(e){
            tip.events.trigger('popupTip:loading', true);
            $($(e.target)[0]).remove();
            this.showMoreNum ++;
            this.model.fetch({data:this.getParams({pageNum:this.showMoreNum})});//再拉取一次数据
        }
    });
    return  myFavoritesView;

})

