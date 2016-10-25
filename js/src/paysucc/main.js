/**
 * module src: paySucc/main.js
 * 入口文件
**/
define('app/main', [
        'common/config',
        'common/langLoader',
        'common/appopen',
        'checkoutflow/getUserInfo',
        'app/paySucc',
        'checkoutflow/thirdPartyCode'
    ], function(
        CONFIG,
        langLoader,
        appopen,
        getUserInfo,
        PaySucc,
        thirdPartyCode
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

        //用户访问状态验证，如果异常则跳转到登录页
        getUserInfo.get(function(userInfo){
            //PaySucc页面初始化
            new PaySucc({
                modelParams: {
                    isVisitor: userInfo.isVisitor,
                    email: userInfo.email
                }
            });
            //唤起app广告位
            $('body').on('click','.j-adbaner',function(){
                try {
                    ga('send', 'event', 'pay-banner', 'download');
                }catch(e){
                    console.log(e.message);
                }
                appopen.init({
                    entrance:'Paysuccess',
                    iOS:{storeUrl:'https://app.appsflyer.com/id905869418?pid=WAP&c=Paysuccess'},
                    schemeUrl:'DHgate.Buyer://virtual?params={"des":"home","d1code":"mpay"}'
                });
            });
            //GA：analytics.js
            (function(){
                try {
                    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

                    ga('create', 'UA-425001-12', 'auto');
                    ga('send', 'pageview');
                } catch(e) {
                    console.log('GA：analytics.js: ' + e.message);
                }
            }());

            var orderNo = CONFIG.wwwSEARCH.match(/orderNo=([^&#]+)/i);
            //D1：dhta.js
            thirdPartyCode.init({
                params: {
                    page: 'paySucess',
                    orderNos: orderNo!==null?orderNo[1]:''
                },
                loadDataSuccess: function() {
                    //从缓存中取得业务数据
                    this.data = this.parse(this.getCache());
                    //加载第三方入口脚本文件
                    this.loadScript();
                },
                parse: function(data) {
                    var obj = {};
                    //订单号列表
                    obj.rnl = data.orders||'';
                    return obj;
                },
                loadScriptUrl: '//www.dhresource.com/dhs/fob/js/common/track/dhta.js',
                isScriptCache: true,
                loadScriptSuccess: function() {
                    //D1代码主体部分
                    try{
                        _dhq.push(["setVar", "rnl", this.data.rnl]);
                        _dhq.push(["setVar", "pt", "succ" ]);
                        _dhq.push(["setVar", "channel", "wap"]);
                        _dhq.push(["event", " Public_S0003"]);
                    } catch(e) {
                        console.log('D1: dhta.js: ' + e.message);
                    }
                }
            });

            //Facebook Pixel Code
            thirdPartyCode.init({
                params: {
                    page: 'paySucess',
                    orderNos: orderNo!==null?orderNo[1]:''
                },
                parse: function(data) {
                    var obj = {};
                    //itemcode列表
                    obj.content_ids = data.itemCodes?data.itemCodes.split(','):'';
                    //总价
                    obj.value = data.totalPrice||-1;
                    //币种
                    obj.currency = data.currency||'USD';
                    return obj;
                },
                loadDataSuccess: function() {
                    //从缓存中取得业务数据
                    var data = this.parse(this.getCache());

                    //Facebook Pixel Code代码主体部分
                    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','//connect.facebook.net/en_US/fbevents.js');
                    try{
                        fbq('init', '601438189994555');
                        fbq('track', 'Purchase',{
                            content_ids: data.content_ids,
                            content_type: 'product',
                            value: data.value,
                            currency: data.currency
                        });
                    } catch(e) {
                        console.log('Facebook Pixel Code: ' + e.message);
                    }
                }
            });

            //BoostInsider Conversion Code For DHgate
            thirdPartyCode.init({
                params: {
                    page: 'paySucess',
                    orderNos: orderNo!==null?orderNo[1]:''
                },
                loadDataSuccess: function() {
                    //BoostInsider Conversion Code For DHgate代码主体部分
                    (function(){
                        try {
                            var _biq = window._biq || (window._biq = []);
                            if (!_biq.loaded) {
                                var bids = document.createElement('script');
                                bids.async = true;
                                bids.src = 'https://www.boostinsider.com/js/bids.js';
                                var s = document.getElementsByTagName('script')[0];
                                s.parentNode.insertBefore(bids, s);
                                _biq.loaded = true;
                            }
                            _biq.push(['addCampaignId', 'e4e6ed5a49945c90688e9f1f7839022f']);
                        } catch(e) {
                            console.log('BoostInsider Conversion Code For DHgate: ' + e.message);
                        }
                    })();

                    window._biq = window._biq || [];
                    //只在付款成功页添加，不填动态参数，就是静态码
                    window._biq.push(['track', 'e4e6ed5a49945c90688e9f1f7839022f', {'value':'0.00','currency':'USD'}]);
                }
            });

            //Google Code for Smart Pixel List Remarketing List
            thirdPartyCode.init({
                params: {
                    page: 'paySucess',
                    orderNos: orderNo!==null?orderNo[1]:''
                },
                parse: function(data) {
                    var obj = {};
                    //itemcode列表
                    obj.ProdID = data.itemCodes?data.itemCodes.split(','):'';
                    //类目名称列表
                    obj.PPC = data.categorys?data.categorys.split(','):'';
                    //总价
                    obj.SV = data.totalPrice||-1;
                    return obj;
                },
                loadDataSuccess: function() {
                    //从缓存中取得业务数据
                    var data = this.parse(this.getCache());

                    //Google Code for Smart Pixel List Remarketing List代码主体部分
                    (function(){
                        try{
                            var cDiv = document.createElement('div'),
                                cImg = document.createElement('img'),
                                RMKTParams = {
                                    ET: 'Pay',
                                    PageType: 'purchase',
                                    ProdID: data.ProdID,
                                    PPC: data.PPC,
                                    SV: data.SV
                                },
                                _random = '&random='+(new Date()).getTime(),
                                _data='';

                            for (var i in RMKTParams) {
                                _data +=i+'='+RMKTParams[i]+';';
                            };

                            _data = _data.replace(/\;*$/g,'');
                            cDiv.style.display = 'inline';
                            cImg.setAttribute('width','1px');
                            cImg.setAttribute('height','1px');
                            cImg.style.borderStyle = 'none';
                            cImg.src = '//googleads.g.doubleclick.net/pagead/viewthroughconversion/972936895/?value=1.000000&label=3Q1ACNGm3gIQv633zwM&guid=ON&script=0&hl=en&bg=666666&fmt=3&url='+encodeURIComponent(location.href)+'&data='+encodeURIComponent(_data)+_random;
                            cImg.onload = function(){return false;}
                            cDiv.appendChild(cImg);
                            document.getElementsByTagName('body')[0].appendChild(cDiv);
                        } catch(e) {
                            console.log('Google Code for Smart Pixel List Remarketing List: ' + e.message);
                        }
                    }());
                }
            });

            //CJ
            thirdPartyCode.init({
                params: {
                    page: 'paySucess',
                    orderNos: orderNo!==null?orderNo[1]:''
                },
                parse: function(data) {
                    var obj = {},
                        itemCodes = data.itemCodes?data.itemCodes.split(','):[],
                        prices = data.prices?data.prices.split(','):[],
                        quantitys = data.quantitys?data.quantitys.split(','):[];

                    //订单列表
                    obj.OID = data.orders||'';
                    //币种
                    obj.CURRENCY = data.currency||'USD';
                    /**
                     * 产品列表数据格式为：
                     * [{
                     *     //itemcode
                     *     ITEM: '',
                     *     //价格
                     *     AMT: '',
                     *     //数量
                     *     QTY : '',
                     *     //折扣
                     *     DCNT: ''
                     * }]
                    **/
                    obj.PRODUCTLIST = [];

                    //必须要有itemcode
                    if (itemCodes.length > 0) {
                        $.each(itemCodes, function(index, itemcode){
                            var __obj = {};
                            __obj.ITEM = itemcode;
                            __obj.AMT = prices[index]||-1;
                            __obj.QTY = quantitys[index]||-1;
                            __obj.DCNT = '0.00';
                            obj.PRODUCTLIST.push(__obj);
                        });
                    }
                    return obj;
                },
                loadDataSuccess: function() {
                    //从缓存中取得业务数据
                    var data = this.parse(this.getCache());

                    //CJ代码主体部分
                    MasterTmsUdo = {
                        'CJ' : {
                            'CID': '1527952',
                            'TYPE': '373813',
                            'OID': data.OID,
                            'CURRENCY': data.CURRENCY,
                            'COUPON': '',
                            'DISCOUNT': '0.00',
                            'FIRECJ': 'TRUE',
                            'PRODUCTLIST': data.PRODUCTLIST
                        }
                    };
                    (function(){
                        try{
                            (function(e){var t="1875",n=document,r,i,s={http:"http://cdn.mplxtms.com/s/MasterTMS.min.js",https:"https://secure-cdn.mplxtms.com/s/MasterTMS.min.js"},o=s[/\w+/.exec(window.location.protocol)[0]];i=n.createElement("script"),i.type="text/javascript",i.async=!0,i.src=o+"#"+t,r=n.getElementsByTagName("script")[0],r.parentNode.insertBefore(i,r),i.readyState?i.onreadystatechange=function(){if(i.readyState==="loaded"||i.readyState==="complete")i.onreadystatechange=null}:i.onload=function(){try{e()}catch(t){}}})(function(){});
                        } catch(e) {
                            console.log('CJ: ' + e.message);
                        }
                    }());
                }
            });

            //part1: Start of DoubleClick Floodlight Tag
            thirdPartyCode.init({
                params: {
                    page: 'paySucess',
                    orderNos: orderNo!==null?orderNo[1]:''
                },
                parse: function(data) {
                    var obj = {},
                        totalPrice = data.totalPrice?data.totalPrice*1:-1;
                    //itemcode列表
                    obj.u1 = data.itemCodes||'';
                    //页面类型
                    obj.u2 = 'paysuccessful';
                    //一级类目名称列表
                    obj.u7 = data.categorys||'';
                    //总价所处的区间值
                    if (totalPrice <= 100) {
                        obj.u8 = '0-100';
                    } else if (totalPrice>100 && totalPrice<=200) {
                        obj.u8 = '100-200';
                    } else if (totalPrice>200 && totalPrice<=300) {
                        obj.u8 = '200-300';
                    } else if (totalPrice>300 && totalPrice<=400) {
                        obj.u8 = '300-400';
                    } else if (totalPrice>400 && totalPrice<=500) {
                        obj.u8 = '400-500';
                    } else {
                        obj.u8 = '500';
                    }
                    return obj;
                },
                loadDataSuccess: function() {
                    //从缓存中取得业务数据
                    var data = this.parse(this.getCache());

                    //Start of DoubleClick Floodlight Tag代码主体部分
                    try {
                        var axel = Math.random() + "";
                        var a = axel * 10000000000000;
                        $('body').append('<img src="https://ad.doubleclick.net/ddm/activity/src=4638323;type=invmedia;cat=k9jm9ios;u1='+data.u1+';u2='+data.u2+';u7='+data.u7+';u8='+data.u8+';ord=' + a + '?" width="1" height="1" alt=""/>');
                    } catch(e) {
                       console.log('part1: Start of DoubleClick Floodlight Tag: ' + e.message);
                    }
                }
            });
            //part2: Start of DoubleClick Floodlight Tag
            thirdPartyCode.init({
                params: {
                    page: 'paySucess',
                    orderNos: orderNo!==null?orderNo[1]:''
                },
                loadDataSuccess: function() {
                    //Start of DoubleClick Floodlight Tag代码主体部分
                    try {
                        var axel = Math.random() + "";
                        var a = axel * 10000000000000;
                        $('body').append('<img src="https://ad.doubleclick.net/ddm/activity/src=4638323;type=invmedia;cat=svykyjaq;ord=' + a + '?" width="1" height="1" alt=""/>');
                    } catch(e) {
                       console.log('part2: Start of DoubleClick Floodlight Tag: ' + e.message);
                    }
                }
            });
        }, '/');
    });
});
