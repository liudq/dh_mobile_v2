/**
 * module src: search/main.js
 * 入口文件
**/
define('app/main', [
        'common/config',
        'common/langLoader',
        'common/recommend/youMyLike', 
        'common/recommend/youViewed'
    ], function(
        CONFIG,
        langLoader,
        YouMyLike,
        YouViewed
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        (function(){
                //最近浏览产品的itemcode字符串列表
            var item_recentvisit = $.cookie('item_recentvisit'),
                //取得itemcode数组列表
                itemcodes = item_recentvisit?item_recentvisit.match(/[^,]+/g):'',
                //搜索关键词
                keyword = CONFIG.wwwSEARCH.match(/(?:\?|&)key=([^#&]+)/i);

            //you my like
            YouMyLike.init({
                el: '.j-recommend-ymlike',
                title: 'You May Like',
                trackingPrefix: '#msyml-',
                api: {
                    param: {
                        //搜索关键词
                        keyword: keyword?keyword[1]:'',
                        //页面类型
                        pageType: 'Srp'
                    }
                }
            });
            
            //you viewed，且曾经浏览过至少一个产品
            if (itemcodes!=='') {
                YouViewed.init({
                    el: '.j-recommend-yviewed',
                    title: 'You Viewed',
                    trackingPrefix: '#msviewed-',
                });
            }
        }());
    });
});