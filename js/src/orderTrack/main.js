/**
 * module src: storeShop/main.js
 * 入口文件
**/
define('app/main', [
        'common/langLoader',
        'common/config',
        'mydhgate/ifLogIn',
        'app/orderTrack',
    ], function(
        langLoader,
        CONFIG,
        ifLogIn,
        OrderTrack
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //初始化页面loading样式
        (function(){
            var loadingLang = $('.j-loading-lang'),
                loadingLayerWarp = $('.j-loading-layer-warp');

            loadingLang.html('Please wait.').removeClass('dhm-hide');
            loadingLayerWarp.css({'margin-top': -parseInt(loadingLayerWarp.outerHeight()*1/2)});
        }());

        //初始化页面data-error-tip国际化内容
        (function(){
            $('#errorSure').html('OK');
        }());
        //登录之后才能执行
        ifLogIn.get(function(){
            new OrderTrack();
        });

        //GA：analytics.js
        (function(){
            try {
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

                ga&&ga('create', 'UA-425001-12', 'auto');
                ga&&ga('send', 'pageview');
                ga&&ga('set', 'dimension1', '1');
            } catch(e) {
                console.log('GA：analytics.js: ' + e.message);
            }
            //根节点
            var $el = $('body'),
            //订单类型
                orderType = [
                    'AwaitPayment',
                    'PendConfirm',
                    'AwaitShip',
                    'Shipped',
                    'Completed',
                    'FefundDispute',
                    'Canceled'
                ],
                getOrderTypeIndex = function() {
                    //默认展示“待确认订单”
                    var rft = 1,
                    //从URL中获取rft
                        _rft = CONFIG.wwwSEARCH.match(/^(?:\?|&).*rft=([^&#]+)/i);

                    //如果URL中带有rft则重置它的值
                    if (_rft !== null && (_rft[1]>0&&_rft[1]<8)) {
                        rft = _rft[1];
                    }

                    return rft;
                };
            //点击home发送ga
            $el.on('click', '.det-hdtitle', function(){
                ga&&ga('send','event','My-Orders',orderType[getOrderTypeIndex()],'Home');
            });
            //点击reOrder发送ga
            $el.on('click', '.re_order', function(){
                ga&&ga('send','event','My-Orders',orderType[getOrderTypeIndex()],'Reorder');
            });
            //点击ContactSeller发送ga
            $el.on('click', '#J_dhChat', function(){
                ga&&ga('send','event','My-Orders',orderType[getOrderTypeIndex()],'ContactSeller');
            });
            //点击SendMessage发送ga
            $el.on('click', '#J_dhMsg', function(){
                ga&&ga('send','event','My-Orders',orderType[getOrderTypeIndex()],'SendMessage');
            });
        }());
    });
    
});


