/**
 * module src: common/detail/favorite
 * 初始化获取收藏数量，点击添加收藏和取消收藏功能模块
**/
define('common/detail/favorite', ['common/config', 'lib/backbone', 'tpl/detail/getFavoriteTpl','common/detail/getFavoriteState','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG, Backbone, tpl, getFavoriteState, tip,dataErrorLog){
    //model-获取收藏数量
    var FavoriteModel = Backbone.Model.extend({
        //获取收藏数量属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //获取收藏数据
                data: {
                   //收藏数量
                   count: '',
                   //初始化收藏状态"1":已收藏"0":未收藏
                   favorite: ''
                }
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
                    url: '/mobileApiWeb/favorite-Favorite-exists.do',
                    //url: '/api.php?jsApiUrl=http://m.dhgate.com/mobileApiWeb/favorite-Favorite-exists.do',
                    data: {
                        client:"wap",
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
           // return this.ajaxOptions.url;
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
            obj.data = {};
            if (obj.code !== -1) {
                obj.data.count = res.data.count;
                obj.data.favorite = res.data.favorite;
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     data: {
             *         count: '',
             *         favorite: ''
             *     }
             * }
            **/
            return obj;
        }
    });

    //view-获取收藏数量页面
    var FavoriteView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            //点击收藏
            'click .j-favBtn': 'changeFavState'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.cDetailSilder = this.options.cDetailSilder;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.FastClick = this.options.FastClick;
            this.dataErrorLog = this.options.dataErrorLog;
            this.itemCode = this.options.itemCode;
            this.productId = this.options.productId;
            this.addToFavParam = this.options.addToFavParam;
            this.addToFavParam.data.itemCode = this.itemCode;
            this.cancelToFavParam = this.options.cancelToFavParam;
            this.cancelToFavParam.data.itemCodes = this.itemCode;
            this.cFavNum = this.options.cFavNum;
            this.cFavStyle = this.options.cFavStyle;
            this.cBtoFav = this.options.cBtoFav;
            this.active = this.options.active;
            this.cBtoActive = this.options.cBtoActive;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //初始化获取收藏数量以及收藏状态
            this.model.fetch({data:{productId:this.productId}});
        },
        //$dom对象初始化
        initElement: function() {
            this.$cDetailSilder = $(this.options.cDetailSilder);
            this.$cFavNum = $(this.cFavNum);
            this.$cFavStyle  = $(this.cFavStyle);
            this.$cBtoFav = $(this.cBtoFav);
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //添加收藏的包裹容器
                cDetailSilder: '.j-detail-silder',
                //控制整个区域显示隐藏的className
                cHide: 'dhm-hide',
                //已经收藏的类名
                active: 'slider-icon2',
                //收藏数量
                cFavNum: '.j-num',
                //收藏样式容器
                cFavStyle: '.j-favStyle',
                //底部收藏容器
                cBtoFav: '.j-bto-fav',
                //底部收藏状态
                cBtoActive: 'layer-bottom-collection-hover',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new FavoriteModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                }),
                //添加收藏接口所需要的参数和url
                addToFavParam: {
                    data: {
                        pageType: "1",
                        itemCode: this.itemCode,
                        client:'wap',
                        version: '0.1'
                    },
                    url:'/mobileApiWeb/favorite-Favorite-favorite.do'
                    //url:'/api.php?jsApiUrl=http://m.dhgate.com/mobileApiWeb/favorite-Favorite-favorite.do'
                },
                //取消收藏接口所需要的参数和url
                cancelToFavParam: {
                    data: {
                        itemCodes: this.itemCode,
                        client:'wap',
                        version: '0.1'
                    },
                    url:'/mobileApiWeb/favorite-Favorite-unFavorite.do'
                    //url:'/api.php?jsApiUrl=http://m.dhgate.com/mobileApiWeb/favorite-Favorite-unFavorite.do'
                }
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            //绘制页面
            this.render(model.attributes);
            //捕获异常
            if (model.get('code') === -1) {
                //展示数据接口错误信息【点击ok，关闭提示】
                //tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
                //捕获异常
                try{
                    throw('success(): data is wrong');
                }catch(e){
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
        error: function(model, response, options) {
            //展示数据接口错误信息【点击ok，关闭页面】
            //tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
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
            var favData = this.template(this.tpl.join(''))(data);
            //页面绘制
            this.$cDetailSilder.append(favData);
            //初始化$dom对象
            this.initElement();
            //初始化控制悬浮添加收藏状态
            if(data.data.favorite==='1'){
                this.$cBtoFav.addClass(this.cBtoActive);
            }else{
                this.$cBtoFav.removeClass(this.cBtoActive); 
            }
        },
        //切换当前的收藏状态
        changeFavState:function(evt){
            var target = $(evt.currentTarget);
            //打开loading
            tip.events.trigger('popupTip:loading', true);
            //当前没有收藏
            if(!this.$cFavStyle.hasClass(this.active)||!this.$cBtoFav.hasClass(this.cBtoActive)){
                getFavoriteState.get(this.addToFavParam,this.addToFav(target));
            //当前已经收藏
            }else{
               getFavoriteState.get(this.cancelToFavParam,this.cancelToFav(target));
            }
        },
        //返回添加收藏的状态
        addToFav:function(target){
            var iNum = parseInt(this.$cFavNum.html());
            if(target.attr("data-style")!=="botFav"){
                this.calNum(target,'+');
            }else{
                iNum +=1;
                this.$cFavNum.html(iNum)
            }
            this.$cFavStyle.addClass(this.active);
            this.$cBtoFav.addClass(this.cBtoActive);
        },
        //返回取消收藏的状态
        cancelToFav:function(target){
            var iNum = parseInt(this.$cFavNum.html());
            if(target.attr("data-style")!=="botFav"){
                this.calNum(target,'-');  
            }else{
                iNum -=1;
                this.$cFavNum.html(iNum)
            }
            this.$cFavStyle.removeClass(this.active);
            this.$cBtoFav.removeClass(this.cBtoActive);
        },
        //收藏动画
        calNum:function(target,symbol){
            var self = this,
                $changeNum = $('#J_changeNum'),
                top = -20;
            //如果存在，先移除当前动画元素
            $changeNum.remove();
            //添加动画元素
            if(!$changeNum.length){
                target.append('<div id="J_changeNum" class="changeNum"><b>'+symbol+'1<\/b></\div>');
            }
            //重新获取
            $changeNum = $('#J_changeNum');
            //设置动画
            $changeNum.animate({
                top: top-10
            },{
                duration: 'slow',
                complete: function() {
                    $changeNum.remove();
                    var favVal = self.$cFavNum.text();
                    if(favVal===''){favVal='0';}
                    var Num = parseInt(favVal)
                    symbol==='+'?Num++:Num--;
                    if(Num<=0){
                        self.$cFavNum.text("");
                    }else{
                        self.$cFavNum.text(Num);
                    } 
                }
          });
        },
    });

    return FavoriteView;
});
