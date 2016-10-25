/**
 * module src: search/addToFav.js
 * search页面的添加收藏模块
**/
define('app/addToFav', ['common/config', 'lib/backbone', 'checkoutflow/popupTip', 'tools/fastclick', 'checkoutflow/dataErrorLog'], function(CONFIG, Backbone, tip, FastClick, dataErrorLog){
    //model-添加收藏初始化
    var AddToFavModel = Backbone.Model.extend({
        //菜单默认属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1
            };
        }
    });

    //view-添加收藏
    var AddToFavView = Backbone.View.extend({
        //根节点
        el: '.j-product-list',
        //backbone提供的事件集合
        events: {
            'click .j-favorite': 'changeToFav'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cHide = this.options.cHide;
            this.cLoadingWarp = this.options.cLoadingWarp;
            this.tofavStyle = this.options.tofavStyle;
            this.hasfavorite = this.options.hasfavorite;
            this.addToFavUrl = this.options.addToFavUrl;
            this.cancelToFavUrl = this.options.cancelToFavUrl;
            this.cLoading = this.options.cLoading;
            this.dataErrorLog = this.options.dataErrorLog;
            //初始化$dom对象
            this.initElement();
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //控制菜单隐藏的样式
                cHide: 'dhm-hide',
                //loading层容器
                cLoadingWarp:'.j-loading-warp',
                //添加收藏Url 接口地址：https://dhgatemobile.atlassian.net/wiki/display/SMS/15+Favorite
                //addToFavUrl:'http://css.dhresource.com/mobile_v2/css/search/html/favorite-Favorite-favorite.do',
                addToFavUrl: '/mobileApiWeb/favorite-Favorite-favorite.do',
                //取消收藏Url 接口地址：https://dhgatemobile.atlassian.net/wiki/display/SMS/15+Favorite
                //cancelToFavUrl:'http://css.dhresource.com/mobile_v2/css/search/html/favorite-Favorite-unFavorite.do',
                cancelToFavUrl: '/mobileApiWeb/favorite-Favorite-unFavorite.do',
                //添加loading的样式
                tofavStyle: 'tofavStyle',
                //已添加收藏的class名
                hasfavorite: 'icon-hasfavorite',
                //loading层
                cLoading: '.j-loading',
                //阻止点透的函数
                FastClick: FastClick,
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(this.options,options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$cLoading = $(this.cLoading);
        },
        //loading层的加载展示样式
        setOpenstate:function(){
           
            //this.$cLoadingWarp.find('.j-mask').hide();
            //this.$cLoadingWarp.removeClass(this.cHide).addClass(this.tofavStyle);
            //开启loading
            //tip.events.trigger('popupTip:loading', true);
            this.$cLoading.removeClass(this.cHide);
        },
        //切换添加收藏和取消收藏功能
        changeToFav:function(evt){
            var target = $(evt.currentTarget),
                hasfavorite = target.find('var').hasClass(this.hasfavorite);

            try{
                ga('send', 'event', 'Searchlist', 'Favorite');
            }catch (e){}
            //处理一个请求还未完成时，多次点击发一堆请求的bug
            if(!target.attr('isLoading')){
                target.attr('isLoading','1');
            }else{
                return;
            }
            //设置打开的时候的样式
            this.setOpenstate();
            //如果当前元素没有hasfavorite这个类名，需添加收藏，否则取消收藏。
            if(!hasfavorite){
                this.addToFav(target);
            }else{
                this.cancelToFav(target);
            }
        },
        //获取需要传递的参数
        getParams:function(target){
            var obj = {},
                hasfavorite = target.find('var').hasClass(this.hasfavorite);
            if(!hasfavorite){
                obj.pageType = target.attr('data-pageType');
                obj.itemCode = target.attr('data-itemCode');
            }else{
                obj.itemCodes = target.attr('data-itemCode');
            }
            obj.client = 'wap';  
            return obj;
        },
        //添加收藏
        addToFav:function(target){
            $.ajax({
                type: 'GET',
                url: this.addToFavUrl,
                async: true,
                cache: false,
                dataType: 'json',
                data: this.getParams(target),
                context: this,
                success: function(res){
                    this.addToFavSucc(res,target);
                },
                error: function(){
                    this.error(target,this.addToFavUrl);
                }
            });
        },
        //添加成功处理
        addToFavSucc:function(data,target){
            //移除isLoading，保证下次可以正常添加收藏
            target.removeAttr('isLoading');
            //关闭loading
            this.$cLoading.addClass(this.cHide);
            if(data.state==='0x0000'){
                target.find('var').addClass(this.hasfavorite);
            }else{
                this.succError(data,target,this.addToFavUrl);
            }
        },
        //取消收藏
        cancelToFav:function(target){
            $.ajax({
                type: 'GET',
                url: this.cancelToFavUrl,
                async: true,
                cache: false,
                dataType: 'json',
                data: this.getParams(target),
                context: this,
                success: function(res){
                    this.cancelToFavSucc(res,target);
                },
                error: function(){
                    this.error(target,this.cancelToFavUrl);
                }
            });
        },
        //取消收藏成功处理
        cancelToFavSucc:function(data,target){
            //移除isLoading，保证下次可以正常取消收藏
            target.removeAttr('isLoading');
            //关闭loading
           this.$cLoading.addClass(this.cHide);
            
            if(data.state==='0x0000'){
                target.find('var').removeClass(this.hasfavorite);
            }else{
                this.succError(data,target,this.cancelToFavUrl);
            }
        },
        //异常处理
        error:function(target,url){
            //移除isLoading
            target.removeAttr('isLoading');
            //关闭loading
            this.$cLoading.addClass(this.cHide);
            //捕获异常
            try {
                throw('error(): request is wrong');
            } catch(e) {
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url:url,
                    params:this.getParams(target)
                });
            }
        },
        //异常处理
        succError:function(data,target,url){
            //移除isLoading
            target.removeAttr('isLoading');
            //关闭loading
            this.$cLoading.addClass(this.cHide);
            //捕获异常
            try {
                throw('success(): data is wrong');
            } catch(e) {
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url:url,
                    params:this.getParams(target),
                    result:data
                });
            }
        }
    });
    
    return AddToFavView;
});
