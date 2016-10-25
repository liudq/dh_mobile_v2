/**
 * module src: landpage/main.js
 * 入口文件
 **/
define('app/main', [
    'common/langLoader',
    'common/appSpread',
    'app/buyerUserInfo', 
    'app/turnToLanguagesWebsite', 
    'app/swiper', 
    'app/lazyload',
    'app/landpage'
], function(
    langLoader,
    appSpread,
    BuyerUserInfo, 
    turnToLanguagesWebsite, 
    Swiper,
    Lazyload,
    landpage
){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //提示下载APP
        appSpread.init();

        //获取买家相关信息
        new BuyerUserInfo();
        
        //多语言入口跳转
        turnToLanguagesWebsite.init();
        
        //顶部可滑动的类目
        var mySwiper = new Swiper('.swiper-container',{
            paginationClickable: true,
            slidesPerView: 'auto'
        });
        
        //
        landpage.init();
        
        
    });
});
