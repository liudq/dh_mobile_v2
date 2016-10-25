/**
 * module src: storeShop/main.js
 * 入口文件
**/
define('app/main', [
        'common/langLoader',
        'common/appSpread',
        'app/buyerUserInfo',
        'app/lazyload',
        'app/storeInfo',
        'app/storeList',
        'app/allProducts',
        'app/storeCoupon'
    ], function(
        langLoader,
        appSpread,
        BuyerUserInfo,
        Lazyload,
        storeInfo,
        storeList,
        allProducts,
        storeCoupon
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //提示下载app
        appSpread.init();
        //获取买家信息
        new BuyerUserInfo();

        //加载完基本信息成功之后再加载产品列表
        var store = new storeInfo({
            successCallback:function(){
                //店铺coupon
                new storeCoupon();
                new storeList({
                    lazyloadCallback:function(){
                        $(".store-list-img .lazy").lazyload();
                    },
                    successCallback:function(){
                        //如果store list商品为零 则请求 all products接口
                        if($('.j-store-list').find('ul').find('li').length <= 0){
                            $('.navs').addClass('hide');
                            new allProducts({
                                lazyloadCallback:function(){
                                    $(".store-list-img .lazy").lazyload();
                                },
                                successCallback:function(){
                                    $(".allContent").find(".loading").remove();
                                }
                            });
                        };
                    }
                })
            }
        });

        //GA
        (function(){
            try{
                var $el = $('body');
                $el.on('click', '.usable', function(){
                    ga&&ga('send', 'event','Store', 'SellerCoupon','click');
                });

            } catch(e) {
                console.log('GA：analytics.js: ' + e.message);
            }
         }());

    });
});


