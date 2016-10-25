/**
 * module src: search/v1/multiDimension/main.js
 * 入口文件
**/
define('app/multiDimension/main', [
        'common/config',
        'common/langLoader',
        'common/appSpread', 
        'common/header/buyerUserInfo', 
        'common/header/topMenuInit', 
        'common/header/topMenuOneCategories', 
        'common/header/turnToLanguagesWebsite', 
        'common/header/topSearch', 
        'common/sharesns',
        'app/addToFav',
        'app/lazyload',
        'app/gotoTop',
        'app/multiDimensuon/relateWord'
    ], function(
        CONFIG,
        langLoader,
        appSpread, 
        BuyerUserInfo, 
        TopMenuInit, 
        TopMenuOneCategories, 
        turnToLanguagesWebsite, 
        TopSearch, 
        sharesns,
        AddToFav,
        Lazyload,
        GotoTop,
        RelateWord
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //提示下载APP
        appSpread.init({
            gaCallback: function(){
                var cOpenBtn = $('.j-openApp');
                if(cOpenBtn.attr('des')){
                    ga('send', 'event', 'Checkout-product', 'TDCode', 'dload');
                }else{
                    //ga('send', 'event', 'mhp1509', 'dload'); 
                    ga('send', 'event', 'mhp1509', 'download');
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
        //添加收藏
        new AddToFav();
        //图片延迟加载
        $(".j-product-list .lazy").lazyload({
            threshold: '500'
        });
        //返回顶部
        new GotoTop();
        //Related searches显示的展开折叠
        RelateWord.init();
        // (function(){
        //     var relateWordCon= $('.j-relateWordCon'),
        //         pageBettercon = $('.j-pageBettercon');
        //     pageBettercon.prepend(relateWordCon);
        //     relateWordCon.removeClass('dhm-hide');
        // })()
        // $('body').on('click', '.j-moreLink',function(evt){
        //     var target = $(evt.currentTarget),
        //         hideDiv = target.siblings('.j-moreRelated'),
        //         cHide = 'dhm-hide';
        //     if(hideDiv.hasClass(cHide)){
        //         hideDiv.removeClass(cHide);
        //         target.html("- Fewer");
        //     }else{
        //         hideDiv.addClass(cHide);
        //         target.html("+ More");
        //     }
        // });
        
    });
});