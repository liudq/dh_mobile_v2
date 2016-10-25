/**
 * module src: cart/main.js
 * 入口文件
**/
define('app/main', [
		'common/langLoader',
		'app/cartList',
		'app/removeCart',
		'app/upDateCart',
		'app/cartSaveForLater',
		'app/checkOut',
		'app/saveForLater',
		'app/moveToCart',
		'app/delSaveForLater',
		'app/moreSaveForLater',
		'app/lazyload',
        'checkoutflow/thirdPartyCode'
	], function(
		langLoader,
		CartList,
		RemoveCart,
		UpDateCart,
		CartSaveForLater,
		CheckOut,
		SaveForLater,
		MoveToCart,
		DelSaveForLater,
		MoreSaveForLater,
		Lazyload,
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

        //查看购物车列表
        var cartList = new CartList({
            lazyloadCallback:function(){
                for(var i = 0; i < 4;i++){
                    var img = $(".j-od-imgcon"),
                        list =img[i],
                        originalSrc =$(list).find('img').attr('data-original');
                    $(list).find('img').attr('src',originalSrc);
                    $(list).find('img').removeAttr('data-original');
                }
                $(".j-wrap-order .lazy").lazyload();
                
            },
            //页面初始化绘制后的处理
            renderCallback: function(){
                //移除购物车列表模块
                new RemoveCart({
                    cartList: cartList,
                    moreSaveForLater: moreSaveForLater
                });
                //购物车列表点击增加 && 减少产品数量
                new UpDateCart({cartList: cartList});
                //购物车列表点击saveForLater按钮移除购物车到saveforLate列表模块
                new CartSaveForLater({
                    cartList: cartList,
                    saveForLaverList: saveForLaverList,
                    moreSaveForLater: moreSaveForLater
                });
                //checkout
                new CheckOut({cartList: cartList});
            }
        });

        //saveForLater
        var saveForLaverList = new SaveForLater({
            lazyloadCallback:function(){
                $(".j-saveForLater .lazy").lazyload();
            },
            //页面初始化绘制后的处理
            renderCallback: function(){
               //点击MoveToCart移到购物车
                new MoveToCart({
                    saveForLaverList: saveForLaverList,
                    cartList: cartList,
                    moreSaveForLater: moreSaveForLater
                });

                //saveForLater点击delete按钮移除到cart列表中
                new DelSaveForLater({
                    saveForLaverList: saveForLaverList,
                    moreSaveForLater: moreSaveForLater
                });
                
            }
        });

        //点击showMore
        var moreSaveForLater = new MoreSaveForLater({
            saveForLaverList: saveForLaverList
        });
       
        //GA：analytics.js
        (function(){
            try {
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

                ga('create', 'UA-425001-12', 'auto');
                ga('send', 'pageview', location.pathname + location.search + escape(location.hash));
            } catch(e) {
                console.log('GA：analytics.js: ' + e.message);
            }
        }());

        //D1：dhta.js
        thirdPartyCode.init({
            params: {
                page: 'cart'
            },
            parse: function(data) {
                var obj = {};
                //itemcode列表
                obj.picl = data.itemCodes||'';
                //价格列表
                obj.pril = data.prices||-1;
                //数量列表
                obj.pnl = data.quantitys||-1;
                return obj;
            },
            loadDataSuccess: function() {
                //从缓存中取得业务数据
                this.data = this.parse(this.getCache());
                //加载第三方入口脚本文件
                this.loadScript();
            },
            loadScriptUrl: '//www.dhresource.com/dhs/fob/js/common/track/dhta.js',
            isScriptCache: true,
            loadScriptSuccess: function() {
                //D1代码主体部分
                try{
                    _dhq.push(["setVar", "picl", this.data.picl ]);
                    _dhq.push(["setVar", "pril", this.data.pril ]);
                    _dhq.push(["setVar", "pnl", this.data.pnl ]);
                    _dhq.push(["setVar", "spcst", "" ]);
                    _dhq.push(["setVar", "pt", "cart"]);
                    _dhq.push(["event", "Public_S0003"]);
                } catch(e) {
                    console.log('D1: dhta.js: ' + e.message);
                }
            }
        });

        //Facebook Pixel Code
        thirdPartyCode.init({
            params: {
                page: 'cart'
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
                    fbq('track', 'AddToCart',{
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

        //criteo
        thirdPartyCode.init({
            params: {
                page: 'cart'
            },
            parse: function(data) {
                var obj = {},
                    itemCodes = data.itemCodes?data.itemCodes.split(','):[],
                    prices = data.prices?data.prices.split(','):[],
                    quantitys = data.quantitys?data.quantitys.split(','):[],
                    //criteo支持的所有国家和对应ID
                    criteos = [
                        {country: 'US', partnerId: '21841'},
                        {country: 'UK', partnerId: '21843'},
                        {country: 'SE', partnerId: '21844'},
                        {country: 'RU', partnerId: '21873'},
                        {country: 'NZ', partnerId: '21874'},
                        {country: 'NO', partnerId: '21875'},
                        {country: 'IT', partnerId: '21877'},
                        {country: 'FR', partnerId: '21878'},
                        {country: 'FI', partnerId: '21879'},
                        {country: 'ES', partnerId: '21880'},
                        {country: 'DK', partnerId: '21881'},
                        {country: 'DE', partnerId: '21882'},
                        {country: 'CL', partnerId: '21883'},
                        {country: 'CA', partnerId: '21884'},
                        {country: 'BR', partnerId: '21885'},
                        {country: 'NL', partnerId: '21886'},
                        {country: 'AU', partnerId: '21887'},
                        {country: 'AR', partnerId: '21888'}
                    ];

                //criteo国家ID，默认为美国ID
                obj.account = 21841;
                $.each(criteos, function(index, criteo){
                    if (data.countryId === criteo.country){
                        obj.account = criteo.partnerId;
                    }
                });
                /**
                 * 产品数据列表
                 * [{
                 *     //itemcode
                 *     id: '',
                 *     //价格
                 *     price: '',
                 *     //数量
                 *     quantity:''
                 * }]
                **/
                obj.item = [];

                //必须要有itemcode
                if (itemCodes.length > 0) {
                    $.each(itemCodes, function(index, itemcode){
                        var __obj = {};
                        __obj.id = itemcode;
                        __obj.price = prices[index]||-1;
                        __obj.quantity = quantitys[index]||-1;
                        obj.item.push(__obj);
                    });
                }
                return obj;
            },
            loadDataSuccess: function() {
                //从缓存中取得业务数据
                var data = this.parse(this.getCache());

                //criteo代码主体部分
                try{
                    window.criteo_q = window.criteo_q || [];
                    window.criteo_q.push(
                        { event: "setAccount", account: data.account },
                        { event: "setHashedEmail", email: "" },
                        { event: "setSiteType", type: "m" },
                        { event: "viewBasket" , item: data.item }
                    );
                } catch(e) {
                    console.log('criteo: ' + e.message);
                }

                //加载第三方入口脚本文件
                this.loadScript();
            },
            loadScriptUrl: '//static.criteo.net/js/ld/ld.js',
            isScriptCache: true
        });

        //Google Code for Smart Pixel List Remarketing List
        thirdPartyCode.init({
            params: {
                page: 'cart'
            },
            parse: function(data) {
                var obj = {};
                //itemcode列表
                obj.ProdID = data.itemCodes?data.itemCodes.split(','):'';
                //类目名称列表
                obj.SOPC = data.categorys?data.categorys.split(','):'';
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
                                ET: 'Shopping cart',
                                PageType: 'cart',
                                ProdID: data.ProdID,
                                SOPC: data.SOPC
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

        //Start of DoubleClick Floodlight Tag
        thirdPartyCode.init({
            params: {
                page: 'cart'
            },
            parse: function(data) {
                var obj = {};
                //itemcode列表
                obj.u1 = data.itemCodes||'';
                //页面类型
                obj.u2 = 'Cart';
                //一级类目名称列表
                obj.u5 = data.categorys||'';
                return obj;
            },
            loadDataSuccess: function() {
                //从缓存中取得业务数据
                var data = this.parse(this.getCache());

                //Start of DoubleClick Floodlight Tag代码主体部分
                try {
                    var axel = Math.random() + "";
                    var a = axel * 10000000000000;
                    $('body').append('<img src="https://ad.doubleclick.net/ddm/activity/src=4638323;type=invmedia;cat=k9jm9ios;u1='+data.u1+';u2='+data.u2+';u5='+data.u5+';ord=' + a + '?" width="1" height="1" alt=""/>');
                } catch(e) {
                   console.log('Start of DoubleClick Floodlight Tag: ' + e.message);
                }
            }
        });
    });
});

