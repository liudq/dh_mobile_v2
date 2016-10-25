/**
 * module src: payment/main.js
 * 入口文件
**/
define('app/main', [
        'common/config',
        'common/langLoader',
        'checkoutflow/getUserInfo',
        'app/pay',
        'app/editBillingAddress',
        'app/addCardAndPay',
        'checkoutflow/thirdPartyCode',
        'app/ideal',
        'app/rbs',
        'app/sofort',
        'app/giropay'
    ], function(
        CONFIG,
        langLoader,
        getUserInfo,
        Pay,
        EditBillingAddress,
        AddCardAndPay,
        thirdPartyCode,
        ideal,
        rbs,
        sofort,
        giropay
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
            //payment页面初始化
            new Pay({
                //用户信息
                userInfo: userInfo,
                //拉取数据成功后的处理
                successCallback: function(model) {
                    //没有银行卡的情况下可以修改账单地址
                    if (model.get('cardsCount') === 0) {
                        //PayModel的账单地址作为EditBillingAddressModel的defaults
                        new EditBillingAddress({
                            modelDefaults: $.extend(true, {}, {
                                code: 200,
                                billingAddress: model.get('billingAddress')
                            }),
                            payModel: model
                        });
                    }

                    //触发ideal支付失败时返回页面的错误提示事件
                    model.get('isIdeal')&&ideal.events.trigger('ideal:payFailTip', this.getUrlSerializeData());
                    //触发RBS支付失败时返回页面的错误提示事件
                    model.get('isRbs')&&rbs.events.trigger('rbs:payFailTip', this.getUrlSerializeData());
                    //触发sofort支付失败时返回页面的错误提示事件
                    model.get('isSofort')&&sofort.events.trigger('sofort:payFailTip', this.getUrlSerializeData());
                    //触发giropay支付失败时返回页面的错误提示事件
                    model.get('isGiropay')&&giropay.events.trigger('giropay:payFailTip', this.getUrlSerializeData());
                },
                //卡列表中选择添加新卡的处理
                addNewCardCallback: function(model) {
                    //在有银行卡的情况下可以添加新卡支付
                    if (model.get('cardsCount') > 0) {
                        var serverTime = model.get('serverTime'),
                            expireYear = (new Date(serverTime)).getFullYear().toString();

                        //第一次打开需要实例化“AddCardAndPay()”
                        if (!this.addCardAndPay) {
                            //新添加卡支付
                            this.addCardAndPay = new AddCardAndPay({
                                //设置“AddCardAndPayModel”数据模型的“defaults”
                                modelDefaults: $.extend(true, {}, {
                                    code: 200,
                                    billingAddress: [
                                        $.extend(true, {}, model.get('billingAddress')[0])
                                    ],
                                    cards: [{
                                        cardId: '',
                                        cardNo: '',
                                        cardType: '',
                                        expireMonth: '01',
                                        expireYear: expireYear.charAt(2) + expireYear.charAt(3)
                                    }],
                                    cardsCount: 0,
                                    orderNo: model.get('orderNo'),
                                    shouldPay: model.get('shouldPay'),
                                    localPays: $.extend(true, [], model.get('__localPays')),
                                    __localPays: model.get('__localPays')?$.extend(true, [], model.get('__localPays')):null,
                                    serverTime: serverTime
                                })
                            });
                            //修改账单地址
                            this.editBillingAddress = new EditBillingAddress({
                                //重置“EditBillingAddressView”上的$el、$dom对象
                                //特别说明：
                                //为了能够重用“app/editBillingAddress”模块，必须
                                //通过“setElement()”来改变$el对象，并重置$dom对象
                                resetElement: function() {
                                    this.setElement('.j-new-pay-warp').initElement();
                                },
                                //设置“EditBillingAddressModel”数据模型的“defaults”
                                modelDefaults: $.extend(true, {}, {
                                    code: 200,
                                    billingAddress: model.get('billingAddress')
                                }),
                                payModel: this.addCardAndPay.model
                            });

                        //反之
                        } else {
                            //重置“AddCardAndPayModel”的模型数据，并重新绘制
                            this.addCardAndPay.render($.extend(this.addCardAndPay.model.attributes, {
                                code: 200,
                                billingAddress: [$.extend(true, {}, model.get('billingAddress')[0])],
                                cards: [{
                                    cardId: '',
                                    cardNo: '',
                                    cardType: '',
                                    expireMonth: '01',
                                    expireYear: expireYear.charAt(2) + expireYear.charAt(3)
                                }],
                                cardsCount: 0,
                                orderNo: model.get('orderNo'),
                                shouldPay: model.get('shouldPay'),
                                localPays: $.extend(true, [], model.get('__localPays')),
                                __localPays: model.get('__localPays')?$.extend(true, [], model.get('__localPays')):null,
                                serverTime: serverTime,
                                __cardId: ''
                            }));
                            //更新“EditBillingAddressModel”上的模型数据
                            $.extend(this.editBillingAddress.model.attributes, {
                                code: 200,
                                billingAddress: [
                                    $.extend(true, {}, model.get('billingAddress')[0])
                                ]
                            });
                            //重置“EditBillingAddressView”上的$dom对象
                            this.editBillingAddress.initElement();
                        }

                        //显示新添加卡支付弹出层
                        this.addCardAndPay.open();
                    }
                }
            });

            //GA：analytics.js
            (function(){
                try {
                    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

                    ga('create', 'UA-425001-12', 'auto');
                    ga('send', 'pageview');
                } catch(e) {
                    //console.log('GA：analytics.js: ' + e.message);
                }

                var $body = $('body');
                //ideal支付方式埋点
                $body.on('click', '.j-ideal', function(){
                    ga&&ga('send','event','Payment','ideal','click');
                });
            }());

            var orderNo = CONFIG.wwwSEARCH.match(/orderNo=([^&#]+)/i);
            //D1：dhta.js
            thirdPartyCode.init({
                params: {
                    page: 'pay',
                    orderNos: orderNo!==null?orderNo[1]:''
                },
                parse: function(data) {
                    var obj = {};
                    //订单号列表
                    obj.rnl = data.orders||'';
                    //总价
                    obj.ttp = data.totalPrice||-1;
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
                        _dhq.push(["setVar", "rnl", this.data.rnl]);
                        _dhq.push(["setVar", "pnl", '']);
                        _dhq.push(["setVar", "ttp", this.data.ttp]);
                        _dhq.push(["setVar", "pt", "payord"]);
                        _dhq.push(["setVar", "channel", "wap"]);
                        _dhq.push(["event", "Public_S0003"]);
                    } catch(e) {
                        //console.log('D1: dhta.js: ' + e.message);
                    }
                }
            });

            //Google Code for Smart Pixel List Remarketing List
            thirdPartyCode.init({
                params: {
                    page: 'pay',
                    orderNos: orderNo!==null?orderNo[1]:''
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
                            //console.log('Google Code for Smart Pixel List Remarketing List: ' + e.message);
                        }
                    }());
                }
            });

            //criteo
            thirdPartyCode.init({
                params: {
                    page: 'pay',
                    orderNos: orderNo!==null?orderNo[1]:''
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
                    //订单号列表
                    obj.id = data.orders||'';
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
                            { event: "trackTransaction" , id: data.id, item: data.item }
                        );
                    } catch(e) {
                        //console.log('criteo: ' + e.message);
                    }

                    //加载第三方入口脚本文件
                    this.loadScript();
                },
                loadScriptUrl: '//static.criteo.net/js/ld/ld.js',
                isScriptCache: true
            });
            
            //cybs
            (function(){
                var $body = $('body');
                $body.append(
                    $('<div></div>')
                        .attr({id: 'fingerprint_capture'})
                        .addClass('dhm-hide')
                        .html([
                            '<p style="background:url(https://h.online-metrix.net/fp/clear.png?org_id=k8vif92e&amp;session_id=dhgate241460506&amp;m=1)"></p>',
                            '<img src="https://h.online-metrix.net/fp/clear.png?org_id=k8vif92e&amp;session_id=dhgate241460506&amp;m=2" alt="" />',
                            ' <object type="application/x-shockwave-flash" data="https://h.online-metrix.net/fp/fp.swf?org_id=k8vif92e&amp;session_id=dhgate241460506" width="1" height="1" id="thm_fp"><param name="movie" value="https://h.online-metrix.net/fp/fp.swf?org_id=k8vif92e&amp;session_id=dhgate241460506"/></object>'
                        ].join(''))
                );
                
                thirdPartyCode.init({
                    loadScriptUrl: 'https://h.online-metrix.net/fp/check.js?org_id=k8vif92e&amp;session_id=dhgate241460506',
                    isScriptCache: true,
                    loadScriptSuccess: function() {
                        window.fingerprintCapture = function(){
                            var fingerprint_c = function() {
                                var fingerprint, div, body;
                                div = document.createElement('div');
                                body = document.body;
                                fingerprint = document.getElementById('fingerprint_capture');
                                div.innerHTML = fingerprint.innerHTML;
                                body.appendChild(div);
                            }
                            var fingerprint_w = window.onload;
                            window.onload = function() {
                                fingerprint_c();
                                if ( fingerprint_w ) {
                                    fingerprint_w();
                                }
                            }
                        }();
                    }
                });
            }());
        }, '/');
    });
});
