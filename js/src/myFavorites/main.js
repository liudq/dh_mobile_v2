/**
 * module src: myFavorites/main.js
 * 入口文件
 **/
define('app/main', [
    'common/langLoader',
    'checkoutflow/dataErrorLog',
    'checkoutflow/popupTip',
    'app/lazyload',
    'app/myFavoritesList',
    'app/removeFavorite',
    'app/addFavorite'
], function(
    langLoader,
    dataErrorLog,
    tip,
    Lazyload,
    MyFavoritesList,
    RemoveFavorite,
    AddFavorite
){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //初始化页面loading样式
        (function(){
            var loadingLang = $('.j-loading-lang'),
                loadingLayerWarp = $('.j-loading-layer-warp');

            loadingLang.html($.lang["please_wait"]).removeClass('dhm-hide');
            loadingLayerWarp.css({'margin-top': -parseInt(loadingLayerWarp.outerHeight()*1/2)});
        }());
        //初始化页面data-error-tip国际化内容
        (function(){
            $('#errorSure').html($.lang["ok"]);
        }());

        //判断是否登录  必须要请求一次后台判断用户是否登录，不能用页面上的参数，因为用户可能在另外一个页面已经退出了登录
        (function(){
            $.ajax({
                url:'/buyerislogin.do',
                type:'GET',
                dataType:'text',
                async:true,
                cache:false,
                context: this,
                success: function(data){//登录成功之后加载收藏列表
                    var href;
                    if(data != undefined && data.trim()=="true"){//登录
                        //关闭loading
                        tip.events.trigger('popupTip:loading', false);

                        //渲染收藏列表数据
                        new MyFavoritesList({
                            successCallback:function(){
                                $(".title").addClass('tBorder')
                                $(".j-myFav").removeClass("defaultHeight");
                                $(".list-img .lazy").lazyload();
                            }
                        });
                        new RemoveFavorite({});
                        new AddFavorite({});
                    }else{//未登录
                        href = window.location.href;
                        window.location.href = '/login.do?returnURL='+href;
                    }
                },
                error: function(){
                    //数据异常，关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //展示数据接口错误信息【点击ok，刷新页面】
                    tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Network anomaly.'});
                    //捕获异常
                    try {
                        throw('error(): request is wrong');
                    } catch(e) {
                        //异常数据收集
                        dataErrorLog.events.trigger('save:dataErrorLog', {
                            message: e,
                            url: __params.url,
                            params: __params.data
                        });
                    }
                }
            });
        }())
    });
});
