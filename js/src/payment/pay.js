/**
 * module src: payment/pay.js
 * 支付页面信息模块
**/
define('app/pay', ['common/config', 'lib/backbone', 'appTpl/payTpl', 'tools/fastclick',  'app/getCardAndDhpayInfo', 'checkoutflow/regexpConfig', 'app/addCardAndBillingAddress', 'checkoutflow/popupTip', 'app/cardPayJump', 'checkoutflow/dataErrorLog','app/ideal', 'app/rbs', 'app/sofort', 'app/giropay'], function(CONFIG, Backbone, tpl, FastClick, getCardAndDhpayInfo, regexpConfig, addCardAndBillingAddress, tip, cardPayJump, dataErrorLog, ideal, rbs, sofort, giropay){
    //model-支付信息初始化
    var PayModel = Backbone.Model.extend({
        //支付信息初始化属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: 200,
                //账单地址
                billingAddress:[{
                    //名
                    firstName: '',
                    //姓
                    lastName: '',
                    //地址1
                    addressOne: '',
                    //地址2
                    addressTwo: '',
                    //城市
                    city: '',
                    //国家
                    country: '',
                    //国家id
                    countryid: '',
                    //州
                    state: '',
                    //邮政编码
                    zipCode: '',
                    //电话号码
                    telephone: '',
                    //税号（增值税）
                    vatnum: ''
                }],
                //黑名单用户
                inBlack: false,
                //是否有风险
                isHighRisk: false,
                //没有下过单的用户
                isNewBuyer: false,
                //是否支付过此交易
                isPaid: false,
                //银行卡
                cards: [{
                    //银行卡id
                    cardId: '',
                    //银行卡号
                    cardNo: '',
                    //银行卡类型
                    cardType: '',
                    //银行卡过期月份
                    expireMonth: '',
                    //银行卡过期年份
                    expireYear: '',
                    //银行卡认证码
                    csc: ''
                }],
                //本地币种支付数据
                localPays: [{
                    //本地币种支付金额
                    amount: 0,
                    //币种
                    currency: '',
                    //币种支付通道是否可用
                    status: ''
                }],
                //银行卡数量
                cardsCount: 0,
                //DHPAY虚拟账户信息,
                dhpay: {},
                //订单号
                orderNo: '',
                //总金额
                totalPay: 0,
                //应付金额
                shouldPay: 0,
                //是否可以使用ideal支付
                isIdeal: false,
                //是否可以使用银联国际卡（RBS）支付
                isRbs: false,
                //是否可以使用sofort支付
                isSofort: false,
                //是否可以使用giropay支付
                isGiropay: false,
                //是否展示PC收银台入口的标示
                isPcPay: false,
                //PC收银台入口地址
                pcPayUrl: '',
                //服务器时间戳
                serverTime: 0,
                //添加新卡时临时存储的银行卡id
                __cardId: '',
                //临时存储初始化时本地币种支付数据
                __localPays: [],
                //临时存储在有卡的情况下，默认展示是否为amex卡
                __defaultIsAmex: false
            };
        },
        /**
         * 初始化入口
         * argument[0|1]:
         * 0: [attributes]
         * 1: [options]
        **/
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;

            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            this.on('sort:cards', this.sortCards, this);
            this.on('change:cardNo', this.setCardNo, this);
            this.on('change:expireMonth', this.setCardExpireMonth, this);
            this.on('change:expireYear', this.setCardExpireYear, this);
            this.on('change:csc', this.setCardCsc, this);
            this.on('PayModel:editBillingAddress', this.editBillingAddress, this);
            this.on('PayModel:changeLocalPays', this.changeLocalPays, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: '/mobileApiWeb/pay-Audit-verify.do',
                    //url: 'pay-Audit-verify.do',
                    data: {
                        //通用接口参数
                        client: 'wap',
                        version: '0.1'
                    },
                    type: 'GET',
                    dataType: 'json',
                    async: true,
                    cache: false,
                    //发送到服务器的数据，将自动转换为请求字符串格式
                    //例如：{foo:["bar1", "bar2"]} 转换为 "&foo=bar1&foo=bar2"
                    //在此处显示告诉$.ajax()需要对象序列化，这样就不需要设置
                    //Backbone.emulateJSON = true
                    processData: true
                }
            };
            $.extend(true, this.options, options||{});
        },
        //设置生成模型的url
        urlRoot: function() {
            return CONFIG.wwwURL + this.ajaxOptions.url;
            //return this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            //请求异常的时候“dataErrorLog”会捕获“__params”
            this.__params = $.extend(true, {}, this.ajaxOptions, options||{});
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * /mobileApiWeb/pay-Audit-verify.do
             * 接口文档地址：https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?spaceKey=SMS&title=04+Pay+API
             *
             * 原始数据结构
             * {
             *     //业务数据
             *     "data":{
             *         //账单地址
             *         "billingAddress":[{
             *             //名
             *             "firstName":"12312312",
             *             //姓
             *             "lastName":"3123 sdfsdfsadf",
             *             //地址1
             *             "addressOne":"3123123",
             *             //地址2
             *             "addressTwo":"33123123123",
             *             //城市
             *             "city":"12312",
             *             //国家
             *             "countryName":"United States"
             *             //国家id
             *             "country":"US",
             *             //州
             *             "state":"New York",
             *             //邮政编码
             *             "zipCode":"1111111",
             *             //电话号码
             *             "telephone":"2121212121",
             *             //税号（增值税）
             *             vatnum: "888888888",
             *             //用户id
             *             "userId":"ff80808134c16a2b0134c1a5951b000a",
             *             //地址id
             *             "addressId":"4028cca8501295c0015012f72e33002b"
             *         }],
             *         //用户是否在黑名单
             *         "inBlack":false,
             *         //交易是否存在风险
             *         "isHighRisk":false,
             *         //是否是新用户（从来没有下过单的）
             *         "isNewBuyer":false,
             *         //是否已经支付过此交易
             *         "isPaid":false,
             *         //曾经支付成功的银行卡个数
             *         "cardsCount": 0,
             *         //订单号
             *         "orderNo":"300052711",
             *         //DHPAY虚拟账户信息
             *         "myDHPay":{
             *             //账户是否被激活
             *             "active":true,
             *             //账户总金额
             *             "balance":1192146.55,
             *             //现金余额
             *             "cashbalance":1192146.55,
             *             //折扣余额
             *             "rebatebalance":0,
             *             //用户id
             *             "userId":"ff80808134c16a2b0134c1a5951b000a"
             *         },
             *         //本币支付数据
             *         "localPays": [{
             *             //本币金额
             *             "amount": 3680.59,
             *             //币种
             *             "currency": "EUR",
             *             //汇率
             *             "exchangeRate": 0.9032994,
             *             //币种支付通道是否可用
             *             "status": true
             *         }],
             *         //当前可展示哪些第三方支付方式
             *         "localPays_Way": "unionpay(rbs),sofort,giropay",
             *         //是否展示PC收银台入口的标示
             *         "isDhpayCashier": false,
             *         //PC收银台入口地址
             *         "uri": "https://www.dhpay.com/gateway/cashier.do",
             *         //总金额
             *         "totalPay":225.41,
             *         //应付金额
             *         "shouldPay":215.41
             *     },
             *     //调用接口返回成功或错误的信息
             *     "message":"Success",
             *     //服务器时间
             *     "serverTime":1444460214692,
             *     //状态码
             *     "state":"0x0000"
             * }
            **/
            var obj = {},
                expireYear = (new Date(res.serverTime)).getFullYear().toString();
            obj.code = (res.state==='0x0000'?200:-1);
            obj.cards = [];
            obj.localPays = [];
            obj.__localPays = [];
            obj.billingAddress = [];
            obj.dhpay = {};

            if (obj.code !== -1) {
                //支付成功的银行卡数量
                obj.cardsCount = res.data.cardsCount*1;

                //使用本地币种支付数据
                $.each(res.data.localPays||[], function(index, localPay){
                    var __obj = {};
                    __obj.amount = localPay.amount;
                    __obj.currency = localPay.currency;
                    __obj.status = localPay.status;
                    obj.localPays.push(__obj);
                });
                //初始化使用临时变量记录时本地币种支付数据
                obj.localPays.length>0?$.extend(true, obj.__localPays, obj.localPays):obj.__localPays=null;

                //根据运输地址是否为荷兰来进行判断是否展示ideal支付方式
                ideal.init({
                    //placeOrder运输地址国家Id
                    countryid: res.data.billingAddress[0].country,
                    //订单号
                    orderNo: res.data.orderNo,
                    //PayModel：parse()最终返回的对象
                    PayModelParseObj: obj
                });
                
                //根据localPays_Way字段信息来判断是否展示银联国际卡（RBS）支付方式
                rbs.init({
                    //当前可展示哪些第三方支付方式
                    localPaysWay: res.data.localPays_Way||'',
                    //订单号
                    orderNo: res.data.orderNo,
                    //PayModel：parse()最终返回的对象
                    PayModelParseObj: obj
                });
                
                //根据localPays_Way字段信息来判断是否展示sofort支付方式
                sofort.init({
                    //当前可展示哪些第三方支付方式
                    localPaysWay: res.data.localPays_Way||'',
                    //订单号
                    orderNo: res.data.orderNo,
                    //PayModel：parse()最终返回的对象
                    PayModelParseObj: obj
                });
                
                //根据localPays_Way字段信息来判断是否展示giropay支付方式
                giropay.init({
                    //当前可展示哪些第三方支付方式
                    localPaysWay: res.data.localPays_Way||'',
                    //订单号
                    orderNo: res.data.orderNo,
                    //PayModel：parse()最终返回的对象
                    PayModelParseObj: obj
                });
                
                //这种情况下将从其他接口中拉取数据更新对应的字段
                //如果存有支付成功的卡信息，则默认展示的账单地址来自于
                //跟银行绑定的账单地址
                if (obj.cardsCount > 0) {
                    //更新cards、billingAddress和dhpay字段
                    this.setCardsAndDhpay();

                //如果没有支付成功的卡信息，默认展示的账单地址则是
                //place order页面用户填写的运输地址，并且默认设置
                //银行卡的过期时间为：“当前年的一月份”
                } else {
                    obj.cards[0] = {};
                    obj.cards[0].cardId = '';
                    obj.cards[0].cardNo = '';
                    obj.cards[0].cardType = '';
                    obj.cards[0].expireMonth = '01';
                    obj.cards[0].expireYear = expireYear.charAt(2) + expireYear.charAt(3);
                    obj.cards[0].csc = '';

                    $.each(res.data.billingAddress, function(index, billingAddress){
                        var __obj = {};
                        __obj.firstName = billingAddress.firstName;
                        __obj.lastName = billingAddress.lastName;
                        __obj.addressOne = billingAddress.addressOne;
                        __obj.addressTwo = billingAddress.addressTwo||'';
                        __obj.city = billingAddress.city;
                        __obj.country = billingAddress.countryName;
                        __obj.countryid = billingAddress.country;
                        __obj.state = billingAddress.state;
                        __obj.zipCode = billingAddress.zipCode;
                        __obj.telephone = billingAddress.telephone;
                        __obj.vatnum = billingAddress.vatnum||'';
                        obj.billingAddress.push(__obj);
                    });
                }
                
                //是否展示PC收银台入口的标示
                obj.isPcPay = res.data.isDhpayCashier||false;
                //PC收银台入口地址
                obj.pcPayUrl = res.data.uri||'';
                
                //初始接口里面传过来的DHPAY虚拟账户信息
                obj.dhpay.active = res.data.myDHPay.active;
                obj.dhpay.balance = res.data.myDHPay.balance*1;
                obj.dhpay.cashbalance = res.data.myDHPay.cashbalance*1;
                obj.dhpay.rebatebalance = res.data.myDHPay.rebatebalance*1;

                obj.inBlack = res.data.inBlack;
                obj.isHighRisk = res.data.isHighRisk;
                obj.isNewBuyer = res.data.isNewBuyer;
                obj.isPaid = res.data.isPaid;
                obj.orderNo = res.data.orderNo;
                obj.totalPay = res.data.totalPay*1;
                obj.shouldPay = res.data.shouldPay*1;
                obj.serverTime = res.serverTime*1;
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     billingAddress: [
             *         {
             *             firstName: '',
             *             lastName: '',
             *             addressOne: '',
             *             addressTwo: '',
             *             city: '',
             *             country: '',
             *             countryid: '',
			 *             state: '',
             *             zipCode: '',
             *             telephone: '',
             *             vatnum: ''
             *         },
             *         ...
             *     ],
             *     inBlack: false,
             *     isHighRisk: false,
             *     isNewBuyer: false,
             *     isPaid: false,
             *     cards: [
             *         {
             *             cardId: '',
             *             cardNo: '',
             *             cardType: '',
             *             expireMonth: '',
             *             expireYear: ''
             *         }
             *         ...
             *     ],
             *     cardsCount: '',
             *     dhpay: {
             *         "active":true,
             *         "balance":0,
             *         "cashbalance":0,
             *         "rebatebalance":0
             *     },
             *     orderNo: '',
             *     totalPay: 0,
             *     shouldPay: 0,
             *     isIdeal: false,
             *     isRbs: false,
             *     isSofort: false,
             *     isGiropay: false,
             *     isPcPay: false,
             *     pcPayUrl: '',
             *     serverTime: 0
             *
             * }
            **/
            return obj;
        },
        //使用amex卡时，只能使用美元进行支付，此时将清空本地币种支付数
        //据为“[]”，使用非amex卡时，如果有将使用临时数据“__localPays”，
        //恢复到带有本地币种支付数据的状态
        changeLocalPays: function(type, isTip) {
            //amex卡
            if (type.toLocaleUpperCase() === 'AMEX') {
                if (this.get('__localPays') && this.get('localPays').length>0 && isTip !== false) {
                    //提示本币切换
                    this.trigger('PayView:localPaysTip', 'American Express (AE) cards supports payments in USD only.');
                }
                this.set({localPays:[]});
            //非amex卡
            } else {
                //目前要求不展示提示内容
                //if (this.get('__localPays') && this.get('localPays').length===0 && isTip !== false) {
                //    //提示本币切换
                //    this.trigger('PayView:localPaysTip', '可以使用本地币种进行支付。');
                //}
                this.set({localPays: $.extend(true, [], this.get('__localPays'))});
            }
        },
        //查询当前可以使用的第三方支付方式的数量
        findPayTripartiteTotal: function() {
            var sum = 0;
            if (this.get('isIdeal')) {
                sum++;
            }
            if (this.get('isRbs')) {
                sum++;
            }
            if (this.get('isSofort')) {
                sum++;
            }
            if (this.get('isGiropay')) {
                sum++;
            }
            return sum;
        },
        //银行卡列表排序
        //说明：
        //将选择的银行卡放置到第一的位置，因为支付的时候读取的卡信
        //息始终是来自于第一张卡
        sortCards: function(cardId) {
            var index,
                cards = this.get('cards');

            //查找cardId在银行卡列表中的索引值
            $.each(cards, function(__index, card){
                if (card.cardId === cardId) {
                    index = __index;
                }
            });

            //先将这张卡数据删除，然后再将其添加到银行卡列表开头
            //特别注意：非set方式操作数据模型，不会触发“change”事件
            cards.unshift(cards.splice(index, 1)[0]);

            //改变绑定在这张卡上的账单地址索引值
            this.sortBillingAddress(index);
        },
        //账单地址列表排序
        //说明：
        //银行卡列表的索引发生变化，对应的账单地址顺序也需要做调整
        sortBillingAddress: function(index) {
            var billingAddress = this.get('billingAddress');
            //先将对应的账单地址数据删除，然后再将其添加到账单地址列表开头
            //特别注意：非set方式操作数据模型，不会触发“change”事件
            billingAddress.unshift(billingAddress.splice(index, 1)[0]);
        },
        //更新银行卡和虚拟账户信息
        setCardsAndDhpay: function() {
            getCardAndDhpayInfo.get(this);
        },
        //编辑账单地址
        editBillingAddress: function(value) {
            this.set({billingAddress: $.extend(true, [], value)});
        },
        //设置银行卡号
        setCardNo: function(value) {
            this.set({cards:$.extend(true, [], this.get('cards'), [{cardNo:$.trim(value)}])},{silent:true, validate:true, type:'cardNo'});
        },
        //设置银行卡过期月份
        setCardExpireMonth: function(value) {
            this.set({cards:$.extend(true, [], this.get('cards'), [{expireMonth:$.trim(value)}])},{silent:true, validate:true, type:'expireMonth'});
        },
        //设置银行卡过期年份
        setCardExpireYear: function(value) {
            this.set({cards:$.extend(true, [], this.get('cards'), [{expireYear:$.trim(value)}])},{silent:true, validate:true, type:'expireYear'});
        },
        //设置银行卡CSC认证码
        setCardCsc: function(value) {
            this.set({cards:$.extend(true, [], this.get('cards'), [{csc:$.trim(value)}])},{silent:true, validate:true, type:'csc'});
        },
        //验证表单字段
        validate: function(attrs, options) {
            //银行卡号校验
            if (options.type === 'cardNo' || options.type === 'newCardPay') {
                //console.log('validate: cardNo');
                var field = options.type !== 'cardNo'?'cardNo':undefined;
                    res = this.validateCardNo(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('PayView:close:cardNoErrorTip');
                }
            }

            //银行卡过期月份校验
            if (options.type === 'expireMonth' || options.type === 'newCardPay') {
                //console.log('validate: expireMonth');
                var field = options.type !== 'expireMonth'?'expireMonth':undefined;
                    res = this.validateExpireMonth(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('PayView:close:expireMonthErrorTip');
                }
            }

            //银行卡过期年份校验
            if (options.type === 'expireYear' || options.type === 'newCardPay') {
                //console.log('validate: expireYear');
                var field = options.type !== 'expireYear'?'expireYear':undefined;
                    res = this.validateExpireYear(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('PayView:close:expireYearErrorTip');
                }
            }

            //银行卡CSC认证码校验
            if (options.type === 'csc' || options.type === 'newCardPay'|| options.type === 'cardPay') {
                //console.log('validate: csc');
                var field = options.type !== 'csc'?'csc':undefined;
                    res = this.validateCsc(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('PayView:close:setCardCscErrorTip');
                }
            }
        },
        //验证银行卡号，目前只支持visa卡、master卡、amex卡
        validateCardNo: function(attrs) {
            //console.log('into validateCardNo');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.cards[0].cardNo;

            //由银行卡CSC认证码触发错误类型“enterCardNo”
            if (value === 'enterCardNo') {
                return !field?'enterCardNo':'enterCardNo-'+field;
            //由银行卡CSC认证码触发错误类型“selectCardNo”
            } else if (value === 'selectCardNo') {
                return !field?'selectCardNo':'selectCardNo-'+field;
            }

            //是否为visa卡
            if (regexpConfig.visaCardNo.test(value)) {
                validateResult = !field?'isVisa':'isVisa-'+field;
            //是否为master卡
            } else if (regexpConfig.masterCardNo.test(value)) {
                validateResult = !field?'isMaster':'isMaster-'+field;
            //是否为amex卡
            } else if (regexpConfig.amexCardNo.test(value)) {
                validateResult = !field?'isAmex':'isAmex-'+field;
            //其他类型的卡（不支持）
            } else {
                return !field?'isSupport':'isSupport-'+field;
            }

            //当输入卡号为amex卡则只能用美元进行支付（多币种收单逻辑）
            if (/^isAmex/i.test(validateResult)) {
                this.changeLocalPays('amex');
            //其他类型卡可以启用本币支付
            } else {
                this.changeLocalPays(validateResult);
            }

            //验证卡号的有效性（LUHN算法）
            if (!regexpConfig.luhuCheck(value)) {
                return validateResult;
            }
        },
        //验证银行卡有效期月份有效性
        validateExpireMonth: function(attrs) {
            //console.log('into validateExpireMonth');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.cards[0].expireMonth;
            //是否合法
            if (!regexpConfig.month.test(value)) {
                validateResult = !field?'isValidate':'isValidate-'+field;
            }

            //服务器返回年份如果和选择的年份相同，则需要判断所选
            //月份不能小于当前月份。例如：服务器返回时间为2015/12
            //选择的时间为2015/05，这种情况是无法通过验证的
            var expireYear = attrs.cards[0].expireYear,
                expireMonth = parseInt(attrs.cards[0].expireMonth)-1,
                serverTime = this.get('serverTime'),
                serverYear = (new Date(serverTime)).getFullYear().toString(),
                serverMonth = parseInt((new Date(serverTime)).getMonth());
            serverYear = serverYear.charAt(2) + serverYear.charAt(3);
            if (expireYear===serverYear && expireMonth<serverMonth) {
                validateResult = !field?'isMonth':'isMonth-'+field;
            }
            return validateResult;
        },
        //验证银行卡有效期年份有效性
        validateExpireYear: function(attrs) {
            //console.log('into validateExpireYear');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.cards[0].expireYear;
            //是否合法
            if (!regexpConfig.year.test(value)) {
                validateResult = !field?'isValidate':'isValidate-'+field;
            }
            return validateResult;
        },
        //验证银行卡CSC认证码有效性
        validateCsc: function(attrs) {
            //console.log('into validateCsc');
            //表单项类型
            var field = arguments[1],
                value = attrs.cards[0].csc;

            //设置validateCsc()返回值，默认为undefined
            this.validateCscReturnValue = undefined;

            //从$dom上取银行卡号
            this.trigger('PayView:get:getCardNoElement', $.proxy(function($cardNo){
                //银行卡号
                var domType = $cardNo[0].nodeName.toLowerCase()
                    cardNo = domType!=='option'?$.trim($cardNo.val()):$.trim($cardNo.text());
                //是否填写银行卡号
                if (cardNo === '') {
                    this.validateCscReturnValue = !field?'enterCardNo':'enterCardNo-'+field;
                //是否为添加新卡选项
                } else if (cardNo === '- Add new card -') {
                    this.validateCscReturnValue = !field?'selectCardNo':'selectCardNo-'+field;
                //填写有银行卡号
                } else {
                    //银行卡号输入框
                    if (domType !== 'option') {
                        //visa和Master卡的安全码是否合法（3位）
                        if ((regexpConfig.visaCardNo.test(cardNo)||regexpConfig.masterCardNo.test(cardNo)) && !regexpConfig.csc1.test(value)) {
                            this.validateCscReturnValue = !field?'isCsc3':'isCsc3-'+field;
                        //AE卡的安全码是否合法（3位或4位）
                        } else if (regexpConfig.amexCardNo.test(cardNo) && !regexpConfig.csc2.test(value)) {
                            this.validateCscReturnValue = !field?'isCsc3or4':'isCsc3or4-'+field;
                        //其他类型银行卡（不支持）
                        } else if (!(regexpConfig.visaCardNo.test(cardNo)||regexpConfig.masterCardNo.test(cardNo)||regexpConfig.amexCardNo.test(cardNo))) {
                            this.validateCscReturnValue = !field?'isSupport':'isSupport-'+field;
                        }
                    //银行卡号列表（粗校验：visaCardNo1、amexCardNo1、masterCardNo1）
                    } else {
                        //visa和Master卡的安全码是否合法（3位）
                        if ((regexpConfig.visaCardNo1.test(cardNo)||regexpConfig.masterCardNo1.test(cardNo)) && !regexpConfig.csc1.test(value)) {
                            this.validateCscReturnValue = !field?'isCsc3':'isCsc3-'+field;
                        //AE卡的安全码是否合法（3位或4位）
                        } else if (regexpConfig.amexCardNo1.test(cardNo) && !regexpConfig.csc2.test(value)) {
                            this.validateCscReturnValue = !field?'isCsc3or4':'isCsc3or4-'+field;
                        //其他类型银行卡（不支持）
                        } else if (!(regexpConfig.visaCardNo1.test(cardNo)||regexpConfig.masterCardNo1.test(cardNo)||regexpConfig.amexCardNo1.test(cardNo))) {
                            this.validateCscReturnValue = !field?'isSupport':'isSupport-'+field;
                        }
                    }
                }
            },this));

            return this.validateCscReturnValue;
        }
    });

    //view-支付信息初始化
    var PayView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-visaTipBtn': 'controlCardDefaultTip',
            'blur .j-cardnumInput': 'setCardNo',
            'change .j-cardMonth': 'setCardExpireMonth',
            'change .j-cardYear': 'setCardExpireYear',
            'blur .j-cscInput': 'setCardCsc',
            'click .j-payBtn': 'cardPay',
            'change .j-cardnum': 'selectCard'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.userInfo = this.options.userInfo;
            this.cProcessBarWarp = this.options.cProcessBarWarp;
            this.cOrderInfoWarp = this.options.cOrderInfoWarp;
            this.cPayWarp = this.options.cPayWarp;
            this.cCardListWarp = this.options.cCardListWarp;
            this.cCardBillAdressWarp = this.options.cCardBillAdressWarp;
            this.cPayBtnWarp = this.options.cPayBtnWarp;
            this.cHide = this.options.cHide;
            this.cTabActive = this.options.cTabActive;
            this.cVisaActive = this.options.cVisaActive;
            this.cardForms = this.options.cardForms;
            this.cVisaData = this.options.cVisaData;
            this.cErrorTip = this.options.cErrorTip;
            this.cErrorTipStyle = this.options.cErrorTipStyle;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.FastClick = this.options.FastClick;
            this.dataErrorLog = this.options.dataErrorLog;
            this.successCallback = this.options.successCallback;
            this.addNewCardCallback = this.options.addNewCardCallback;
            //console.log(this.model.attributes);

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //拉取业务数据
            this.model.fetch({data:{orderNo:this.getOrderNo()}});
        },
        //$dom对象初始化
        initElement: function() {
            this.$cProcessBarWarp = this.$cProcessBarWarp||$(this.cProcessBarWarp);
            this.$cOrderInfoWarp = this.$cOrderInfoWarp||$(this.cOrderInfoWarp);
            this.$cPayWarp = this.$cPayWarp||$(this.cPayWarp);
            this.$cCardListWarp = $(this.cCardListWarp);
            this.$cCardBillAdressWarp = $(this.cCardBillAdressWarp);
            this.$cVisaData = $(this.cVisaData);
            this.$cPayBtnWarp = $(this.cPayBtnWarp);
        },
        //事件初始化
        initEvent: function() {
            //监听银行卡数据变化
            this.listenTo(this.model, 'change:cards', this.renderCardList);
            //监听账单地址数据变化
            this.listenTo(this.model, 'change:billingAddress', this.renderCardBillAdress);
            //监听银行卡id数据变化（临时数据）
            this.listenTo(this.model, 'change:__cardId', function(){cardPayJump.init(this.getCardPayParams());});
            //监听本地币种支付数据变化
            this.listenTo(this.model, 'change:localPays', this.renderLocalPay);
            //监听在有卡的情况下默认展示的是否为amex卡
            this.listenTo(this.model, 'change:__defaultIsAmex', function(){
                //截获第三方支付返回数据
                var obj = this.getUrlSerializeData();
                //如果url中带有序列化数据，则说明有第三方支付结果返回，
                //此时优先展示第三方支付结果提示，默认不展示本币支付提示，
                //当选择的为amex卡则只能用美元进行支付（多币种收单逻辑）
                this.model.trigger('PayModel:changeLocalPays', 'AMEX', obj.message?false:true);
            });
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
            //监听模型数据字段验证
            this.listenTo(this.model, 'invalid', this.matchErrorTip);
            //在model上绑定关闭银行卡号错误提示的事件
            this.model.on('PayView:close:cardNoErrorTip', this.setCardNoErrorTip, this);
            //在model上绑定关闭银行卡过期月份错误提示的事件
            this.model.on('PayView:close:expireMonthErrorTip', this.setCardExpireMonthErrorTip, this);
            //在model上绑定关闭银行卡过期年份错误提示的事件
            this.model.on('PayView:close:expireYearErrorTip', this.setCardExpireYearErrorTip, this);
            //在model上绑定关闭银行卡CSC认证码错误提示的事件
            this.model.on('PayView:close:setCardCscErrorTip', this.setCardCscErrorTip, this);
            //在model上绑定获取获取银行卡号表单项$dom对象的事件
            this.model.on('PayView:get:getCardNoElement', this.getCardNoElement, this);
            //在model上绑定本地币种切换提示
            this.model.on('PayView:localPaysTip', function(tipText){
                tip.events.trigger('popupTip:autoTip',{message:tipText});
            }, this);
            //解决click事件的300毫秒延时
            //阻止大多数设备上的点透问题
            this.FastClick.attach(this.$el[0]);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //用户信息
                userInfo: null,
                //支付流程页面进度提示外层包裹容器
                cProcessBarWarp: '.j-processBar-warp',
                //支付订单、支付金额信息外层包裹容器
                cOrderInfoWarp: '.j-orderInfo-warp',
                //支付方式外层包裹容器
                cPayWarp: '.j-pay-warp',
                //银行卡列表外层包裹容器
                cCardListWarp: '.j-cardListWarp',
                //银行卡账单地址外层包裹容器
                cCardBillAdressWarp: '.j-cardBillAdressWarp',
                //银行卡支付按钮外层包裹容器
                cPayBtnWarp: '.j-payBtn-warp',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //支付方式Tab选择激活样式
                cTabActive: 'p-active',
                //控制银行卡默认提示信息展开和收起的className
                cVisaActive: 'visa-active',
                //银行卡表单项
                cardForms: {
                    //银行卡号
                    cardNo: '.j-cardnumInput',
                    //银行卡号列表
                    cardNoList: '.j-cardnum',
                    //银行卡过期月份
                    cardExpireMonth: '.j-cardMonth',
                    //银行卡过期年份
                    cardExpireYear: '.j-cardYear',
                    //银行卡认证码
                    cardCsc: '.j-cscInput'
                },
                //展示当前选择的银行卡过期时间容器
                cVisaData: '.j-visa-data',
                //表单错误信息容器
                cErrorTip: '.error-tips',
                //表单错误信息输入框样式的className
                cErrorTipStyle: 'color-f00',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new PayModel(),
                //阻止点透的函数
                FastClick: FastClick,
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                }),
                //success()对外成功时的回调
                successCallback: $.noop,
                //卡列表中选择添加新卡时的回调
                addNewCardCallback: $.noop
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                //没有银行卡的用户可以直接关闭loading
                if (model.get('cardsCount') === 0) {
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                }
                //初始化渲染页面
                this.render($.extend(model.attributes,{
                    //新增记录当前可使用的第三方支付方式数量的临时字段
                    __payTripartiteTotal: model.findPayTripartiteTotal()
                }));

                //拉取数据成功回调
                this.successCallback(model);
            } else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，跳转到首页】
                tip.events.trigger('popupTip:dataErrorTip', {action:'gohome',message:response.message});
                //捕获异常
                try {
                    throw('success(): data is wrong');
                } catch(e) {
                    //异常数据收集
                    this.dataErrorLog.events.trigger('save:dataErrorLog', {
                        message: e,
                        url: this.model.__params.url,
                        params: this.model.__params.data,
                        result: response,
                        custom: {
                            vid: $.cookie('vid')||'none',
                            B2BCookie: $.cookie('B2BCookie')||'none',
                            userAgent: navigator&&navigator.userAgent,
                            userInfo: this.userInfo
                        }
                    });
                }
            }
        },
        //拉取数据失败回调
        error: function() {
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，刷新页面】
            tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Network anomaly.'});
            //捕获异常
            try {
                throw('error(): request is wrong');
            } catch(e) {
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
        },
        //从表单项上获取银行卡号的$dom对象
        getCardNoElement: function(callback) {
            var $cardNo;
            //如果在有卡的情况下从“select”上找，反之在“input”上找
            if (this.model.get('cardsCount') === 0) {
                //input
                $cardNo = this.$cardNo = this.$cardNo||$(this.cardForms.cardNo);
            } else {
                //select
                $cardNo = (this.$cardNo=$(this.cardForms.cardNoList)).find('option:selected');
            }
            //CSC银行卡认证码校验
            callback&&callback($cardNo);
        },
        //通过url获取序列化数据
        getUrlSerializeData: function() {
            var obj = {},
                serializeObj = CONFIG.wwwSEARCH.match(/(?:\?|&)v=([^&#]+)/i);
            if (serializeObj !== null) {
                obj = JSON.parse(decodeURIComponent(serializeObj[1]));
            }
            return obj;
        },
        //通过页面url获取订单号
        //说明：
        //订单号是从place order页面通过get方法传过来的
        getOrderNo: function() {
            var orderNo = CONFIG.wwwSEARCH.match(/orderNo=([^&#]+)/i);
            return orderNo!==null?orderNo[1]:'';
        },
        //判断是否为数据模型实例
        isModelInstance: function(obj) {
            return _.has(obj,'attributes');
        },
        //根据data的类型获取正确的模型数据
        getData: function(obj) {
            return this.isModelInstance(obj)?obj.attributes:obj;
        },
        //页面整体渲染
        render: function(data) {
            //数据可用则绘制页面
            if (data.code !== -1) {
                this.renderPayProcess(data);
                this.renderOrderInfo(data);
                this.renderPayMain(data);

                //重新初始化$dom对象
                this.initElement();
            }
        },
        //支付流程页面进度提示渲染
        renderPayProcess: function(data) {
                //模板引擎
            var template = this.template,
                //支付流程页面进度提示模板
                payProcess = this.tpl.payProcess.join('');

            //页面绘制
            this.$cProcessBarWarp.html(template(payProcess)(data)).removeClass(this.cHide);
        },
        //支付订单、支付金额信息渲染
        renderOrderInfo: function(data) {
                //模板引擎
            var template = this.template,
                //支付订单、支付金额信息模板
                orderInfo = this.tpl.orderInfo.join('');

            //页面绘制
            this.$cOrderInfoWarp.html(template(orderInfo)(data)).removeClass(this.cHide);
        },
        //银行卡主体内容渲染
        renderPayMain: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //银行卡的主体内容模板
                payMain = template(tpl.payMain.join(''))(data),
                //银行卡外层包裹容器模板
                cardWarp = this.renderCardWarp(data);

            payMain = payMain.replace(/\{\{cardWarp\}\}/, cardWarp)
                      ;

            //页面绘制
            this.$cPayWarp.html(payMain).removeClass(this.cHide);
        },
        //银行卡外层包裹容器渲染
        renderCardWarp: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //银行卡外层包裹容器模板
                cardWarp = template(tpl.cardWarp.join(''))(data),
                //第三方支付方式模板
                cardSupportTypeTip = template(tpl.cardSupportTypeTip.join(''))(data),
                //银行卡默认提示信息模板
                cardDefaultTip = template(tpl.cardDefaultTip.join(''))(data),
                //银行卡列表模板
                cardList = this.renderCardList(data),
                //银行卡账号模板
                cardNum = template(tpl.cardNum.join(''))(data),
                //银行卡有效期模板
                cardExpDate = template(tpl.cardExpDate.join(''))(data),
                //银行卡账号安全码模板
                cardSecCode = template(tpl.cardSecCode.join(''))(data),
                //银行卡账单地址模板
                cardBillAdress = this.renderCardBillAdress(data),
                //银行卡支付按钮模板
                cardPayBtn = template(tpl.cardPayBtn.join(''))(data);

            cardWarp = cardWarp.replace(/\{\{cardSupportTypeTip\}\}/, cardSupportTypeTip)
                       .replace(/\{\{cardDefaultTip\}\}/, cardDefaultTip)
                       .replace(/\{\{cardList\}\}/, cardList)
                       .replace(/\{\{cardNum\}\}/, cardNum)
                       .replace(/\{\{cardExpDate\}\}/, cardExpDate)
                       .replace(/\{\{cardSecCode\}\}/, cardSecCode)
                       .replace(/\{\{cardBillAdress\}\}/, cardBillAdress)
                       .replace(/\{\{cardPayBtn\}\}/, cardPayBtn)
                       ;

            return cardWarp;
        },
        //银行卡列表渲染
        renderCardList: function(data) {
            var $cCardListWarp = this.$cCardListWarp,
                str = this.template(this.tpl.cardList.join(''))(this.getData(data));

            //如果data为数据模型实例，则直接绘制页面
            if (this.isModelInstance(data)) {
                $cCardListWarp[0]&&$cCardListWarp.html(str);

            //否则返回模板渲染数据
            } else {
                return str;
            }

            //重新初始化$dom对象
            this.initElement();
        },
        //银行卡账单地址渲染
        renderCardBillAdress: function(data) {
            var $cCardBillAdressWarp = this.$cCardBillAdressWarp,
                str = this.template(this.tpl.cardBillAdress.join(''))(this.getData(data));

            //如果data为数据模型实例，则直接绘制页面
            if (this.isModelInstance(data)) {
                $cCardBillAdressWarp[0]&&$cCardBillAdressWarp.html(str);

            //否则返回模板渲染数据
            } else {
                return str;
            }
        },
        //本地币种支付渲染
        renderLocalPay: function() {
                //模型数据
            var data = this.model.attributes,
                //模板引擎
                template = this.template,
                //模板
                tpl = this.tpl,
                //支付订单、支付金额信息模板
                orderInfo = template(tpl.orderInfo.join(''))(data),
                //银行卡支付按钮模板
                cardPayBtn = template(tpl.cardPayBtn.join(''))(data);

            //页面绘制
            this.$cOrderInfoWarp[0]&&this.$cOrderInfoWarp.html(orderInfo);
            this.$cPayBtnWarp[0]&&this.$cPayBtnWarp.html(cardPayBtn);
        },
        //控制银行卡默认提示信息展示和隐藏
        controlCardDefaultTip: function(evt) {
            var $cVisaTipBtnParent = this.$cVisaTipBtnParent = this.$cVisaTipBtnParent||(evt.target.nodeName.toUpperCase()==='A'?$(evt.target).parent():$(evt.target)),
                cVisaActive = this.cVisaActive;

            //展开
            if (!$cVisaTipBtnParent.hasClass(cVisaActive)) {
                $cVisaTipBtnParent.addClass(cVisaActive);
            //收起
            } else {
                $cVisaTipBtnParent.removeClass(cVisaActive);
            }
        },
        //设置银行卡号
        setCardNo: function(evt) {
            //console.log('view: setCardNo');
            var $cardNo;
            //$dom事件触发
            if (typeof evt !== 'string') {
                $cardNo = this.$cardNo = this.$cardNo||$(evt.target);
                this.model.trigger('change:cardNo', $cardNo.val());
            //setCardCscErrorTip()触发
            } else {
                this.model.trigger('change:cardNo', evt);
            }
        },
        //设置银行卡过期月份
        setCardExpireMonth: function(evt) {
            //console.log('view: setCardExpireMonth');
            var $cardExpireMonth,
                $target;
            //在年份改变的情况下会调用setCardExpireMonth()，
            //为的是验证在当前年下月份是否已经过期了
            if (typeof evt === 'undefined') {
                $target = $(this.cardForms.cardExpireMonth)
            } else {
                $target = this.$cardExpireMonth||$(evt.target);
            }
            $cardExpireMonth = this.$cardExpireMonth = this.$cardExpireMonth||$target;
            this.model.trigger('change:expireMonth', $cardExpireMonth.val());
        },
        //设置银行卡过期年份
        setCardExpireYear: function(evt) {
            //console.log('view: setCardExpireYear');
            var $cardExpireYear = this.$cardExpireYear = this.$cardExpireYear||$(evt.target);
            this.model.trigger('change:expireYear', $cardExpireYear.val());
            //设置月份
            this.setCardExpireMonth();
        },
        //设置银行卡CSC认证码
        setCardCsc: function(evt) {
            //console.log('into setCardCsc');
            var $cardCsc = this.$cardCsc = this.$cardCsc||$(evt.target);
            this.model.trigger('change:csc', $cardCsc.val());
        },
        //匹配错误提示
        matchErrorTip: function(model, error, options) {
            //console.log('init matchErrorTip');
            /**
             * 非validate事件逻辑：
             * 如果options不存在则说明非model上的validate事件调用
             * 此时的error包含的值为“错误类型—表单项类型”，例如：
             * error='isNull-firstName'，这里值由model上的验证方法
             * 返回，为保证下面逻辑运行正常，需对error/options的值
             * 重写
            **/
            var flag;
            if (!options) {
                options = {};
                //表单项类型
                options.type = error.replace(/.*\-(.+)/, '$1');
                //错误类型
                error = error.replace(/(.*)\-.+/, '$1');
                //增加3秒自动消失的错误提示
                flag = true;
            }

            //银行卡号
            if (options.type === 'cardNo') {
                this.setCardNoErrorTip(error, flag);
            //银行卡月份
            } else if (options.type === 'expireMonth') {
                this.setCardExpireMonthErrorTip(error, flag);
            //银行卡年份
            } else if (options.type === 'expireYear') {
                this.setCardExpireYearErrorTip(error, flag);
            //CSC认证码
            } else if (options.type === 'csc') {
                this.setCardCscErrorTip(error, flag);
            }
        },
        //控制错误提示内容和样式
        controlErrorStyle: function(options) {
                //标志是否展示
            var show = options.show,
                //表单元素$dom
                $formElement = options.formElement,
                //错误提示元素$dom
                $errorElement = options.errorElement,
                //错误提示文字
                errorText = options.errorText,
                //是否增加另外一种错误提示
                autoLayer = options.autoLayer;

            //展示
            if (options.show === true) {
                $formElement.addClass(this.cErrorTipStyle);
                $errorElement.html(errorText).show();
                //另外一种错误提示，展示3秒后自动消失
                if (autoLayer) {
                    tip.events.trigger('popupTip:autoTip',{message:errorText});
                }
            //隐藏
            } else {
                $formElement.removeClass(this.cErrorTipStyle);
                $errorElement.html(errorText).hide();
            }
        },
        //设置银行卡号错误提示
        setCardNoErrorTip: function(error) {
            //console.log('view: setCardNoErrorTip');
            var flag = arguments[1],
                $cardNo = this.$cardNo = this.$cardNo||$(this.cardForms.cardNo),
                $cErrorTip = $cardNo.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isVisa') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardNo,
                    errorElement: $cErrorTip,
                    errorText: 'Please input the right VISA Card Number.',
                    autoLayer: flag
                });
            } else if (error === 'isMaster') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardNo,
                    errorElement: $cErrorTip,
                    errorText: 'Please input the right MasterCard Card Number.',
                    autoLayer: flag
                });
             } else if (error === 'isAmex') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardNo,
                    errorElement: $cErrorTip,
                    errorText: 'Please input the right AMEX Card Number.',
                    autoLayer: flag
                });
            } else if (error === 'isSupport') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardNo,
                    errorElement: $cErrorTip,
                    errorText: 'Please input the right VISA or MasterCard or AMEX Card Number.',
                    autoLayer: flag
                });
            } else if (error === 'enterCardNo') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardNo,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter a valid Card Number.',
                    autoLayer: flag
                });
            } else if (error === 'selectCardNo') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardNo,
                    errorElement: $cErrorTip,
                    errorText: 'Please select a Card Number.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $cardNo,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置银行卡过期月份错误提示
        setCardExpireMonthErrorTip: function(error) {
            //console.log('view: setCardExpireMonthErrorTip');
            var flag = arguments[1],
                $cardExpireMonth = this.$cardExpireMonth = this.$cardExpireMonth||$(this.cardForms.cardExpireMonth),
                $cErrorTip = $cardExpireMonth.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isMonth') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardExpireMonth,
                    errorElement: $cErrorTip,
                    errorText: 'Please select the right month.',
                    autoLayer: flag
                });
            } else if (error === 'isValidate') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardExpireMonth,
                    errorElement: $cErrorTip,
                    errorText: 'Please select a valid month.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $cardExpireMonth,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置银行卡过期年份错误提示
        setCardExpireYearErrorTip: function(error) {
            //console.log('view: setCardExpireYearErrorTip');
            var flag = arguments[1],
                $cardExpireYear = this.$cardExpireYear = this.$cardExpireYear||$(this.cardForms.cardExpireYear),
                $cErrorTip = $cardExpireYear.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isValidate') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardExpireYear,
                    errorElement: $cErrorTip,
                    errorText: 'Please select the right year.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $cardExpireYear,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置银行卡CSC认证码错误提示
        setCardCscErrorTip: function(error) {
            //console.log('view: setCardCscErrorTip');
            var flag = arguments[1],
                $cardCsc = this.$cardCsc = this.$cardCsc||$(this.cardForms.cardCsc),
                $cErrorTip = $cardCsc.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isCsc3') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardCsc,
                    errorElement: $cErrorTip,
                    errorText: 'The length of VISA or MasterCard Card Verification Number must be 3 digits.',
                    autoLayer: flag
                });
            } else if (error === 'isCsc3or4') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardCsc,
                    errorElement: $cErrorTip,
                    errorText: 'The length of AMEX Card Verification Number must be 3 or 4 digits.',
                    autoLayer: flag
                });
            } else if (error === 'isSupport') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $cardCsc,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter a valid Card Verification.',
                    autoLayer: flag
                });
            //触发银行卡错误“enterCardNo”
            } else if (error === 'enterCardNo') {
                this.setCardNo('enterCardNo');
            //触发银行卡错误“selectCardNo”
            } else if (error === 'selectCardNo') {
                this.setCardNo('selectCardNo');
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $cardCsc,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //查找页面上是否展示了错误提示信息
        isErrorVisible: function() {
            return !!$(this.cErrorTip+':visible').length;
        },
        //选择银行卡
        selectCard: function(evt) {
            var $cardnumList = this.$cardnumList = this.$cardnumList||$(evt.target),
                $cardSelected = $cardnumList.find('option:selected'),
                value = $cardSelected.val(),
                expDate = $cardSelected.attr('expDate'),
                cardType = $cardSelected.attr('cardType');

            //判断是否为添加新卡支付的操作
            if (value !== 'addNewCard') {
                //同时更改这卡和绑定在上面的账单地址，
                //在数据模型中的银行卡、账单地址列表中
                //所处的索引值
                this.model.trigger('sort:cards', value);
                //关闭银行卡错误
                this.setCardNoErrorTip();
                //展示当前选择卡的过期时间
                this.$cVisaData.html(expDate).removeClass(this.cHide);
                //绘制账单地址
                this.renderCardBillAdress(this.model);
                //当选择的为amex卡则只能用美元进行支付（多币种收单逻辑）
                this.model.trigger('PayModel:changeLocalPays', cardType);

            //打开添加新添加卡支付的弹出层
            } else {
                //隐藏银行卡银行卡过期时间
                this.$cVisaData.html('').addClass(this.cHide);
                //新添加卡支付
                this.addNewCardCallback(this.model);
            }
        },
        //获取银行卡支付接口必须参数数据
        getCardPayParams: function() {
            var obj = {},
                localPays = this.model.get('localPays');
            obj.orderNo = this.model.get('orderNo');
            obj.cardId = this.model.get('cards')[0].cardId;
            obj.csc = this.model.get('cards')[0].csc;
            obj.currency = localPays&&localPays.length>0?localPays[0].currency:'USD';
            return obj;
        },
        /**
         * 银行卡支付
         *
         * 说明：
         * 经过“第一关”和“第二关”的验证后说明页面展示状态
         * 和数据都已经准备妥当可以正常进行支付操作了，在
         * 银行卡支付这个过程中需要判断三种情况：
         *
         * 第一种情况：没有银行卡成功支付的经验
         * 第二种情况：以前有用过银行卡成功支付
         * 第三种情况：添加新卡并直接支付，在“app/addCardAndPay”模块中实现
        **/
        cardPay: function(evt) {
            var $payBtn = this.$payBtn = this.$payBtn||$(evt.target),
                model = this.model,
                //错误类型
                errorType,
                //验证类型
                validateType = $payBtn.attr('data-validate');

            //第一关：
            //当前页面上展示有错误提示则跳出支付
            if (this.isErrorVisible()) {
                return;
            }

            //第二关：
            //如果当前页面上没有任何的错误提示展示，则
            //查找数据模型上的相关字段进行验证，验证不
            //通过跳出支付，并在页面上展示对应的错误提
            //示信息
            errorType = model.validate(_.clone(model.attributes), {type:validateType});
            if (typeof errorType === 'string') {
                this.matchErrorTip(model, errorType);
                return;
            }

            //如论那种情况首先打开loading
            tip.events.trigger('popupTip:loading', true);

            //第一种情况需要完成的步骤：
            //第一步：判断是否有银行卡id（对于添加银行卡成功但后续支付环节有问题的逻辑补充）
            //第二步：添加银行和账单地址获取银行卡id
            if (model.get('cardsCount') === 0) {
                //cardId已经成功取得
                if (model.get('cards')[0].cardId === '') {
                    addCardAndBillingAddress.init({
                        model: model,
                        cards: model.get('cards'),
                        billingAddress: model.get('billingAddress')
                    });
                //如果有cardId则直接去支付
                } else {
                    cardPayJump.init(this.getCardPayParams());
                }

            //第二种情况则直接去支付
            } else if (model.get('cardsCount') > 0) {
                cardPayJump.init(this.getCardPayParams());
            }
        }
    });

    return PayView;
});