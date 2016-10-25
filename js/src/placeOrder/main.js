/**
 * module src: placeOrder/main.js
 * 入口文件
**/
define('app/main', [
		'common/langLoader',
		'app/placeOrder',
		'app/shipAddress',
		'app/selectShipAddress',
		'app/editShipAddress',
		'app/email',
		'app/saveEditAddress',
		'app/placeOrderupDateCart',
        'app/shippingList',
		'app/couponList',
		'app/userVisitor',
		'app/lazyload',
		'checkoutflow/getUserInfo',
        'checkoutflow/thirdPartyCode'
	], function(
		langLoader,
		PlaceOrder,
		ShipAddress,
		SelectShipAddress,
		EditShipAddress,
		Email,
		SaveEditAddress,
		PlaceOrderupDateCart,
        ShippingList,
		CouponList,
		UserVisitor,
		Lazyload,
		getUserInfo,
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
            //placeOrder
	    	var placeOrder = new PlaceOrder({
                lazyloadCallback:function(){
                    for(var i = 0; i < 2;i++){
                        var img = $(".j-od-imgcon"),
                            list =img[i],
                            originalSrc =$(list).find('img').attr('data-original');
                        $(list).find('img').attr('src',originalSrc);
                        $(list).find('img').removeAttr('data-original');
                    }
                    $(".j-placeorder-wrap .lazy").lazyload();
                },
                //用户信息
                userInfo: userInfo,
	    		//页面初始化绘制后的处理
		    	renderCallback: function(){
		    		//点击更改运输地址信息
		    		var shipAddress = new ShipAddress({placeOrder: placeOrder});
                    //邮箱验证
		    		var email = new Email();
                    //编辑保存运输地址
		    		var saveEditAddress = new SaveEditAddress({placeOrder: placeOrder, shipAddress: shipAddress});
		    		//编辑运输地址
		    		new EditShipAddress({
                        //用户信息
                        userInfo: userInfo,
                        //运输地址列表实例
                        shipAddressInstance: shipAddress,
                        //邮箱有效性验证实例
                        emailInstance: email,
                        //保存运输地址实例
                        saveEditAddressInstance: saveEditAddress,
                        //placeOrder
                        placeOrder: placeOrder
                    });
		    		//选择地址
		    		new SelectShipAddress({placeOrder: placeOrder});
		    		//更改商品购物产品数量
		    		new PlaceOrderupDateCart({placeOrder: placeOrder});
                    //运输信息列表
		    		new ShippingList({placeOrder: placeOrder});
				    //coupon
				    new CouponList({placeOrder: placeOrder});
				   //游客自动注册登陆
				   new UserVisitor({placeOrder: placeOrder,userInfo:userInfo});
		    	}
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

            //D1：dhta.js
            thirdPartyCode.init({
                params: {
                    page: 'order'
                },
                parse: function(data) {
                    var obj = {};
                    //itemcode列表
                    obj.picl = data.itemCodes||'';
                    //价格列表
                    obj.pril = data.prices||-1;
                    //数量列表
                    obj.pnl = data.quantitys||-1;
                    //折扣优惠
                    obj.spcst = data.discount||0;
                    //运费
                    obj.wdc = data.shipCost||0;
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
                        _dhq.push(["setVar", "spcst", this.data.spcst ]);
                        _dhq.push(["setVar", "wdc", this.data.wdc ]);
                        _dhq.push(["setVar", "pt","plaord"]);
                        _dhq.push(["event", "Public_S0003"]);
                    } catch(e) {
                        console.log('D1: dhta.js: ' + e.message);
                    }
                }
            });

            //Google Code for Smart Pixel List Remarketing List
            thirdPartyCode.init({
                params: {
                    page: 'order'
                },
                parse: function(data) {
                    var obj = {};
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
                                    ET: 'Submit Order',
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

            //Facebook Pixel Code
            thirdPartyCode.init({
                params: {
                    page: 'order'
                },
                loadDataSuccess: function() {
                    //Facebook Pixel Code代码主体部分
                    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','//connect.facebook.net/en_US/fbevents.js');
                    try{
                        fbq('init', '601438189994555');
                        fbq('track', 'InitiateCheckout');
                    } catch(e) {
                        console.log('Facebook Pixel Code: ' + e.message);
                    }
                }
            });
            
            //Start of DoubleClick Floodlight Tag
            thirdPartyCode.init({
                params: {
                    page: 'order'
                },
                parse: function(data) {
                    var obj = {};
                    //itemcode列表
                    obj.u1 = data.itemCodes||'';
                    //页面类型
                    obj.u2 = 'placeorder';
                    //一级类目名称列表
                    obj.u6 = data.categorys||'';
                    return obj;
                },
                loadDataSuccess: function() {
                    //从缓存中取得业务数据
                    var data = this.parse(this.getCache());
                    
                    //Start of DoubleClick Floodlight Tag代码主体部分
                    try {
                        var axel = Math.random() + "";
                        var a = axel * 10000000000000;
                        $('body').append('<img src="https://ad.doubleclick.net/ddm/activity/src=4638323;type=invmedia;cat=k9jm9ios;u1='+data.u1+';u2='+data.u2+';u6='+data.u6+';ord=' + a + '?" width="1" height="1" alt=""/>');
                    } catch(e) {
                       console.log('Start of DoubleClick Floodlight Tag: ' + e.message);
                    }
                }
            });
        },"/");
    });
});

