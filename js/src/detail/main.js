/**
 * module src: detail/main.js
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
                //老版最终页存放数据的dom:[h1]#J_proInfo
                $J_proInfo = $('#J_proInfo');

            //you my like
            YouMyLike.init({
                el: '.j-recommend-ymlike',
                title: 'You May Like',
                trackingPrefix: '#mymlpd-',
                api: {
                    param: {
                        //最新一个产品的底级类目号（新版最终页暂时拿不到）
                        category: $J_proInfo[0]?$J_proInfo.attr('data-catedispid'):'',
                        //itemcode-最终页传当前产品，首页和列表页传最近3个浏览过的产品
                        itemID: $J_proInfo[0]?$J_proInfo.attr('data-itemcode'):CONFIG.wwwPATHNAME.match(/(\d+).html/i)[1],
                        //页面类型
                        pageType: 'Item'
                    }
                }
            });
            
            //you viewed，且曾经浏览过至少一个产品
            if (itemcodes!=='') {
                YouViewed.init({
                    el: '.j-recommend-yviewed',
                    title: 'You Viewed',
                    trackingPrefix: '#mvdpd-',
                });
            }
        }());
    });
});