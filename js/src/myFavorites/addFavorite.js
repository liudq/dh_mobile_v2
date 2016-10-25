/**
 * Created by liudongqing on 2015/12/15.
 */
/*
* module src: myFavorites/addFavorite.js
* 接口文档：https://dhgatemobile.atlassian.net/wiki/display/SMS/15+Favorite
* 收藏列表
* */
define('app/addFavorite',['common/config','lib/backbone','app/myFavoritesList','checkoutflow/popupTip','checkoutflow/dataErrorLog'],function(CONFIG,Backbone,myFavorites,tip,dataErrorLog){
    //model 收藏列表商品信息
    var addFavoriteModel = Backbone.Model.extend({
        //收藏商品初始化属性
        defaults:function(){
            return {
                //状态码
                code: -1,
                //dom事件对象
                evt: null,
                //需要撤销删除的itemId
                favItemId: '',
                //pageType
                pageType:'',
                //成功或失败提示语
                message:''
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
                    url:'/mobileApiWeb/favorite-Favorite-favorite.do',
                    //url: '/api.php?jsApiUrl=' + '/mobileApiWeb/favorite-Favorite-favorite.do',
                    data:{
                        //通用接口参数
                        client: 'wap'
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
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            return obj;
        }
    });
    //view undo时添加收藏
    var addFavoriteView = Backbone.View.extend({
        //根节点
        el:'body',
        events:{
            'click .undo': 'undoDelete'

        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);

            this.fFavItemLi = this.options.fFavItemLi;
            this.model = this.options.model;
            this.successCallback = this.options.successCallback;
            this.dataErrorLog = this.options.dataErrorLog;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取业务数据 data参数
            this.listenTo(this.model, 'change:favItemId', this.resetAjaxOptions);
            this.listenTo(this.model, 'change:pageType', this.resetAjaxOptions);
        },
        //$dom对象初始化
        initElement: function() {
            this.$fFavItemLi = this.$fFavItemLi || $(this.fFavItemLi);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                fFavItemLi:'.j-fav-item',
                //数据模型
                model: new addFavoriteModel(),
                //success()对外成功时的回调
                successCallback: $.noop,
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: false,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                    //url: '/api.php?jsApiUrl=' + CONFIG.wwwURL +'/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //监听itemCode
            this.listenTo(this.model, 'change:itemCode', this.getFavItemId);
            //监听pageType
            this.listenTo(this.model, 'change:pageType', this.getPageType);
        },
        success:function(model,response){
            if(model.get('code') === 200){
                //关闭loading
                tip.events.trigger('popupTip:loading', false);

                this.hideUndoArea(model.get('evt'));
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
                        params: this.model.__params.data
                    });
                }
            }
        },
        error: function(){
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
        //重置ajax()配置对象
        resetAjaxOptions: function(){
            this.model.initialize({
                ajaxOptions: {
                    data: {
                        cartItemId: this.model.get('favItemId'),
                        pageType: this.model.get('pageType')
                    }
                }
            });
        },
        //获取当前itemid
        getFavItemId:function(e){
            var favItemId = $(e.currentTarget).attr('favItemId');
            return  favItemId;
        },
        //获取pageType
        getPageType:function(e){
            var pageType = $(e.currentTarget).attr('pageType');
            return  pageType;
        },
        //点击undo撤销删除收藏商品
        undoDelete:function(e){
            //显示loading弹层
            tip.events.trigger('popupTip:loading', true);
            //拉取产品数据
            this.model.fetch({data:{itemCode: this.getFavItemId(e),pageType:this.getPageType(e)}});
            //获取favItemId
            this.model.set({evt: e, favItemId: this.getFavItemId(e)});
            //获取pageType
            this.model.set({evt: e, pageType: this.getPageType(e)});
        },
        //隐藏撤销后的状态 展示添加后原来状态
        hideUndoArea:function(e){
            var favLi = $(e.target).closest('li');
            var favItem = $(e.target);
            favLi.removeClass('un-do');
            favLi.find('a').show();
            favItem.closest('div').addClass('dhm-hide');
            favItem.next('div').addClass('dhm-hide');
        }
    });
    return addFavoriteView;

})

