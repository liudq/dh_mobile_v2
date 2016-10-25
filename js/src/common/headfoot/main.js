/**
 * module src: common/headfoot/main.js
 * 入口文件
**/
define('appHeadfoot/main', [
        'common/langLoader', 
        'common/appSpread', 
        'common/buyerUserInfo', 
        'common/topMenuInit', 
        'common/topMenuOneCategories', 
        'common/turnToLanguagesWebsite', 
        'common/topSearch', 
        'common/sharesns'
    ], function(
        langLoader, 
        appSpread, 
        BuyerUserInfo, 
        TopMenuInit, 
        TopMenuOneCategories, 
        turnToLanguagesWebsite, 
        TopSearch, 
        sharesns
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //提示下载APP
        appSpread.init({
            gaCallback: function(){
                var cOpenBtn = $('body');
                if(cOpenBtn.attr('data-pagetype')==='itemDetail'){
                    ga('send', 'event', 'Checkout-product', 'TDCode', 'dload');
                }else{
                   // _gaq.push(['_trackEvent','appdownload', 'wap']);
                }
                
            }
        });
        
        //获取买家相关信息，包含用户名、购物车、站内信的数量
        new BuyerUserInfo({
            //请求成功回调
            successAfter: function(){
                //左侧顶部菜单初始化，
                //依赖：购物车数量，站内信数量，昵称
                var topMenuInit = new TopMenuInit();
                
                //左侧顶部菜单一级类目
                new TopMenuOneCategories({topMenuInit: topMenuInit});
                
                //左侧顶部菜单多语言切换
                turnToLanguagesWebsite.init();
            }
        });

        //页面顶部搜索包含：最近搜索关键词、热门关键词、推荐搜索关键词
        new TopSearch();
    });
});
