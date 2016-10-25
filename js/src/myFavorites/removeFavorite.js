/**
 * Created by liudongqing on 2015/12/15.
 */
/*
* module src: removeFavorite/removeFavorite.js
* 接口文档：https://dhgatemobile.atlassian.net/wiki/display/SMS/15+Favorite
* 收藏列表
* */
define('app/removeFavorite',['common/config','lib/backbone','app/myFavoritesList','checkoutflow/popupTip','checkoutflow/dataErrorLog'],function(CONFIG,Backbone,myFavoritesList,tip,dataErrorLog){
    //model 收藏列表商品信息
    var removeFavoriteModel = Backbone.Model.extend({
        //收藏商品初始化属性
        defaults:function(){
            return {
                //状态码
                code: -1,
                //dom事件对象
                evt: null,
                //需要删除的itemId
                favItemId: '',
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
                    url:'/mobileApiWeb/favorite-Favorite-unFavorite.do',
                    //url:'/api.php?jsApiUrl='  + 'http://m.dhgate.com/mobileApiWeb/favorite-Favorite-unFavorite.do',
                    data:{
                        //通用接口参数
                        client: 'wap',
                        pageType:'1'
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
    //view 收藏列表商品初始化
    var removeFavoriteView = Backbone.View.extend({
        //根节点
        el:'body',
        events: {
            'click .j-delete-fav': 'deleteFav'
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
                model: new removeFavoriteModel(),
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
            //监听itemCodes
            this.listenTo(this.model, 'change:itemCodes', this.getFavItemId);
        },
        success:function(model,response,options){
            if(model.get('code') === 200){
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //删除当前操作的产品
                this.toUndoArea(model.get('evt'));
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
                        cartItemId: this.model.get('favItemId')
                    }
                }
            });
        },
        //获取当前itemid
        getFavItemId:function(e){
            var favItemId = $(e.currentTarget).attr('favItemId');
            return  favItemId;
        },
        //删除收藏商品
        deleteFav:function(e){
            //显示loading弹层
            tip.events.trigger('popupTip:loading', true);
            //拉取产品数据
            this.model.fetch({data:{itemCodes: this.getFavItemId(e)}});
            //获取CartItemId
            this.model.set({evt: e, favItemId: this.getFavItemId(e)});
        },
        //删除成功之后的节点操作
        toUndoArea:function(e){
            var favLi = $(e.target).closest('li');
            var favItem = $(e.target);
            if(favLi.hasClass('sold-out')){
                favLi.remove();
            }
            favLi.addClass('un-do');
            favItem.hide();
            favItem.prev('a').hide();
            favItem.next('div').removeClass('dhm-hide');
        }
    });
    return removeFavoriteView;

})

