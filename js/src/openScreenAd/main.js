/**
 * module src: openScreenAd/main.js
 * 入口文件
**/
define('app/main', [ 
        'openScreenAd/openScreenAd',
        'app/swiper'
    ], function(
        openScreenAd,
        Swiper
    ){
        //开屏广告的跳转
        openScreenAd.init();
        //多屏下的开屏banner图片切换
        if($('.j-multiScreen')[0]){
            (function(){
                var height = $(window).height();
                $('.js-bannerSilde').find('li').height(height);

                var swiper = new Swiper('.j-multiScreen', {
                     loop: false,
                    pagination: '.swiper-pagination',
                    paginationClickable: true,
                    onTransitionEnd:function(swiper){
                        if (swiper.activeIndex!==0 && swiper.activeIndex===swiper.previousIndex) {
                            openScreenAd.skipToHome('');
                        }
                    }
                });
               
            }());
        }
});
