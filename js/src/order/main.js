/**
 * module src: order/main.js
 * 入口文件
**/
define('app/main', [
        'common/langLoader',
        'common/tc',
        'mydhgate/ifLogIn',
        'mydhgate/order/cancelOrder',
        'mydhgate/order/shippedOrder',
        'mydhgate/order/toPayOrder',
        'app/orderType',
        'app/orderList'
    ], function(
        langLoader,
        tc,
        ifLogIn,
        CancelOrder,
        ShippedOrder,
        toPayOrder,
        OrderType,
        OrderList
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
        //先判断是否登录
        ifLogIn.get(function(){
            new OrderType({
                successCallback:function(options){
                    new OrderList({
                        iscroll: options.iscroll
                    });
                    new CancelOrder();
                    new ShippedOrder();
                    new toPayOrder();
                }
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
                    //订单类型外层包裹容器
                    $cOrderTypeWarp = $('.j-order-type'),
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
                    //当前展示的订单类型索引值
                    getOrderTypeIndex = function() {
                        return $cOrderTypeWarp.find('.selected').index();
                    };
                
                //切换订单类型
                $el.on('click', '.j-order-type li', function(){
                    ga&&ga('send','event','My-Orders',orderType[getOrderTypeIndex()]);
                });
                //返回首页
                $el.on('click', '.det-home', function(){
                    ga&&ga('send','event','My-Orders',orderType[getOrderTypeIndex()],'Home');
                });
                //查看物流
                $el.on('click', '.track_item', function(){
                    ga&&ga('send','event','My-Orders',orderType[getOrderTypeIndex()],'TrackItem');
                });
                //站内信
                $el.on('click', '#J_dhMsg', function(){
                    ga&&ga('send','event','My-Orders','SendMessage');
                });
                //Ntalker
                $el.on('click', '#J_dhChat', function(evt){
                    ga&&ga('send','event','My-Orders',$(evt.currentTarget).attr('rfxstatusname'),'ContactSeller');
                });
                //订单支付
                $el.on('click', '.pay_topay', function(evt){
                    ga&&ga('send','event','My-Orders',orderType[getOrderTypeIndex()],'ProceedPay');
                });
                //取消订单
                $el.on('click', '.pay_cancel', function(evt){
                    ga&&ga('send','event','My-Orders',orderType[getOrderTypeIndex()],'CancelOrder');
                });
                //完成订单
                $el.on('click', '.order-shipped', function(evt){
                    ga&&ga('send','event','My-Orders',orderType[getOrderTypeIndex()],'OrderReceived');
                });
            }());
            
            //D1：dhta.js
            (function(){
                tc.init({
                    loadScriptUrl: 'http://www.dhresource.com/dhs/fob/js/common/track/dhta.js',
                    loadScriptSuccess: function() {
                        try{
                            _dhq.push(["setVar", "pt", "vord" ]);
                            _dhq.push(["event", "Public_S0003"]);
                        } catch(e){}
                    }
                }).loadScript();
            }());
        });
    });
});


