/**
 * module src: payment/addCardAndPay.js
 * 新添加卡支付模块
**/
define('app/addCardAndPay', ['common/config', 'lib/backbone', 'appTpl/addCardAndPayTpl', 'checkoutflow/getCountrysData', 'checkoutflow/regexpConfig', 'checkoutflow/popupTip', 'app/addCardAndBillingAddress', 'app/cardPayJump', 'app/editBillingAddress'], function(CONFIG, Backbone, tpl, getCountrysAndStatesData, regexpConfig, tip, addCardAndBillingAddress, cardPayJump, EditBillingAddress){
    //model-新添加卡支付
    var AddCardAndPayModel = Backbone.Model.extend({
        //新添加卡支付初始化属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: 200,
                //账单地址
                billingAddress:[],
                //银行卡
                cards: [],
                //银行卡数量
                cardsCount: 0,
                //订单号
                orderNo: '',
                //应付金额
                shouldPay: 0,
                //本地币种支付数据
                localPays: [],
                //服务器时间戳
                serverTime: 0,
                //添加新卡时临时存储的银行卡id
                __cardId: '',
                //临时存储初始化时本地币种支付数据
                __localPays: []
            };
        },
        /**
         * 初始化入口
         * argument[0|1]:
         * 0: [attributes]
         * 1: [options]
        **/
        initialize: function() {
            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            this.on('change:cardNo', this.setCardNo, this);
            this.on('change:expireMonth', this.setCardExpireMonth, this);
            this.on('change:expireYear', this.setCardExpireYear, this);
            this.on('change:csc', this.setCardCsc, this);
            this.on('PayModel:editBillingAddress', this.editBillingAddress, this);
        },
        //使用amex卡时，只能使用美元进行支付，此时将清空本地币种支付数
        //据为“[]”，使用非amex卡时，如果有将使用临时数据“__localPays”，
        //恢复到带有本地币种支付数据的状态
        changeLocalPays: function(type) {
            //amex卡
            if (type.toLocaleUpperCase() === 'AMEX') {
                if (this.get('__localPays') && this.get('localPays').length>0) {
                    //提示本币切换
                    this.trigger('AddCardAndPayView:localPaysTip', 'American Express (AE) cards supports payments in USD only.');
                }
                this.set({localPays:[]});
            //非amex卡
            } else {
                //目前要求不展示提示内容
                //if (this.get('__localPays') && this.get('localPays').length===0) {
                //    //提示本币切换
                //    this.trigger('AddCardAndPayView:localPaysTip', '可以使用本地币种进行支付。');
                //}
                this.set({localPays: $.extend(true, [], this.get('__localPays'))});
            }
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
                    this.trigger('AddCardAndPayView:close:cardNoErrorTip');
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
                    this.trigger('AddCardAndPayView:close:expireMonthErrorTip');
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
                    this.trigger('AddCardAndPayView:close:expireYearErrorTip');
                }
            }

            //银行卡CSC认证码校验
            if (options.type === 'csc' || options.type === 'newCardPay') {
                //console.log('validate: csc');
                var field = options.type !== 'csc'?'csc':undefined;
                    res = this.validateCsc(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('AddCardAndPayView:close:setCardCscErrorTip');
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
            this.trigger('AddCardAndPayView:get:getCardNoElement', $.proxy(function($cardNo){
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
    
    //view-新添加卡支付
    var AddCardAndPayView = Backbone.View.extend({
        //根节点
        el: '.j-new-pay-warp',
        //backbone提供的事件集合
        events: {
            'click .j-card-header-back': 'close',
            'blur .j-new-cardnumInput': 'setCardNo',
            'change .j-new-cardMonth': 'setCardExpireMonth',
            'change .j-new-cardYear': 'setCardExpireYear',
            'blur .j-new-cscInput': 'setCardCsc',
            'click .j-new-payBtn': 'cardPay'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cHtml = this.options.cHtml;
            this.cNewPayWarp = this.options.cNewPayWarp;
            this.cPayWarp = this.options.cPayWarp;
            this.cPaySubconWarp = this.options.cPaySubconWarp;
            this.cCardBillAdressWarp = this.options.cCardBillAdressWarp;
            this.cPayBtnWarp = this.options.cPayBtnWarp;
            this.cHide = this.options.cHide;
            this.cAnimateHide = this.options.cAnimateHide;
            this.cAnimateShow = this.options.cAnimateShow;
            this.cardForms = this.options.cardForms;
            this.cErrorTip = this.options.cErrorTip;
            this.cErrorTipStyle = this.options.cErrorTipStyle;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.timer = null;
            
            //console.log('AddCardAndPayModel: ');
            //console.log(this.model.attributes);
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //渲染数据
            this.render(this.model.attributes);
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$window = this.$window||$(window);
            this.$cNewPayWarp = this.$cNewPayWarp||$(this.cNewPayWarp);
            this.$cPayWarp = this.$cPayWarp||$(this.cPayWarp);
            this.$cPaySubconWarp = $(this.cPaySubconWarp);
            this.$cCardBillAdressWarp = $(this.cCardBillAdressWarp);
            this.$cPayBtnWarp = this.$el.find(this.cPayBtnWarp);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;

            //监听账单地址数据变化
            this.listenTo(this.model, 'change:billingAddress', this.renderCardBillAdress);
            //监听银行卡id数据变化（临时数据）
            this.listenTo(this.model, 'change:__cardId', function(){cardPayJump.init(this.getCardPayParams());});
            //监听本地币种支付数据变化
            this.listenTo(this.model, 'change:localPays', this.renderLocalPay);
            //监听模型数据字段验证
            this.listenTo(this.model, 'invalid', this.matchErrorTip);
            //在model上绑定关闭银行卡号错误提示的事件
            this.model.on('AddCardAndPayView:close:cardNoErrorTip', this.setCardNoErrorTip, this);
            //在model上绑定关闭银行卡过期月份错误提示的事件
            this.model.on('AddCardAndPayView:close:expireMonthErrorTip', this.setCardExpireMonthErrorTip, this);
            //在model上绑定关闭银行卡过期年份错误提示的事件
            this.model.on('AddCardAndPayView:close:expireYearErrorTip', this.setCardExpireYearErrorTip, this);
            //在model上绑定关闭银行卡CSC认证码错误提示的事件
            this.model.on('AddCardAndPayView:close:setCardCscErrorTip', this.setCardCscErrorTip, this);
            //在model上绑定获取获取银行卡号表单项$dom对象的事件
            this.model.on('AddCardAndPayView:get:getCardNoElement', this.getCardNoElement, this);
            //在model上绑定本地币种切换提示
            this.model.on('AddCardAndPayView:localPaysTip', function(tipText){
                tip.events.trigger('popupTip:autoTip',{message:tipText});
            }, this);
            
            //屏幕旋转事件
            //添加新卡支付容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange, resize', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setCardPopupStyle();
                }, 500);
            });
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //html样式
                cHtml: 'dhm-htmlOverflow',
                //弹出层外层包裹容器
                cNewPayWarp: '.j-newpayWarp',
                //支付方式外层包裹容器
                cPayWarp: '.j-new-pay-warp',
                //添加银行卡支付外层包裹容器
                cPaySubconWarp: '.j-pay-subcon-warp',
                //银行卡账单地址外层包裹容器
                cCardBillAdressWarp: '.j-new-cardBillAdressWarp',
                //银行卡支付按钮外层包裹容器
                cPayBtnWarp: '.j-payBtn-warp',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //控制弹出层滑动隐藏展示的样式
                cAnimateHide: 'newpayWarp-close',
                //控制弹出层滑动显示展示的样式
                cAnimateShow: 'newpayWarp-open',
                //银行卡表单项
                cardForms: {
                    //银行卡号
                    cardNo: '.j-new-cardnumInput',
                    //银行卡过期月份
                    cardExpireMonth: '.j-new-cardMonth',
                    //银行卡过期年份
                    cardExpireYear: '.j-new-cardYear',
                    //银行卡认证码
                    cardCsc: '.j-new-cscInput'
                },
                //表单错误信息容器
                cErrorTip: '.new-error-tips',
                //表单错误信息输入框样式的className
                cErrorTipStyle: 'color-f00',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new AddCardAndPayModel(options.modelDefaults)
            };
            $.extend(true, this.options, options||{});
        },
        //从表单项上获取银行卡号的$dom对象
        getCardNoElement: function(callback) {
            //input
            var $cardNo = this.$cardNo = this.$cardNo||$(this.cardForms.cardNo);
            //CSC银行卡认证码校验
            callback&&callback($cardNo);
        },
        //判断是否为数据模型实例
        isModelInstance: function(obj) {
            return _.has(obj,'attributes');
        },
        //根据data的类型获取正确的模型数据
        getData: function(obj) {
            return this.isModelInstance(obj)?obj.attributes:obj;
        },
        //重置实例对象中cardForms下的所有$属性
        resetCardFormsDom: function() {
            var self = this,
                name;
            /**
             * 删除实例对象上以下属性：
             * {
             *     $cardNo: $dom,
             *     $cardExpireMonth: $dom,
             *     $cardExpireYear: $dom,
             *     $cardCsc: $dom
             * }
            **/
            $.each(this.cardForms, function(name, cardForms){
                name = '$'+name;
                if (self[name]) {
                    delete self[name];
                }
            });
        },
        //页面整体渲染
        render: function(data) {
            //数据可用则绘制页面
            if (data.code !== -1) {
                this.renderPayMain(data);
                
                //重置实例上的$dom表单项属性
                this.resetCardFormsDom();
                //重新初始化$dom对象
                this.initElement();
            }
        },
        //银行卡主体内容渲染
        renderPayMain: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //银行卡外层包裹容器模板
                cardWarp = template(tpl.cardWarp.join(''))(data),
                //银行卡弹出层顶部模板
                cardHeader = template(tpl.cardHeader.join(''))(data),
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

            cardWarp = cardWarp.replace(/\{\{cardHeader\}\}/, cardHeader)
                       .replace(/\{\{cardNum\}\}/, cardNum)
                       .replace(/\{\{cardExpDate\}\}/, cardExpDate)
                       .replace(/\{\{cardSecCode\}\}/, cardSecCode)
                       .replace(/\{\{cardBillAdress\}\}/, cardBillAdress)
                       .replace(/\{\{cardPayBtn\}\}/, cardPayBtn)
                       ;
            //页面绘制
            this.$cPayWarp.html(cardWarp).removeClass(this.cHide);
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
                //银行卡支付按钮模板
                cardPayBtn = template(tpl.cardPayBtn.join(''))(data);

            //页面绘制
            this.$cPayBtnWarp[0]&&this.$cPayBtnWarp.html(cardPayBtn);
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
         * 添加新卡并直接支付
         *
         * 说明：
         * 经过“第一关”和“第二关”的验证后说明页面展示状态
         * 和数据都已经准备妥当可以正常进行支付操作了，在
         * 银行卡支付这个过程中需要判断的情况如下：
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
                
            //需要完成的步骤：
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
            }
        },
        //设置添加银行卡弹出层样式
        setCardPopupStyle: function() {
            var $cPaySubconWarp = this.$cPaySubconWarp,
                $siblings,
                windowHeight = this.$window.height()*1,
                sumHeight = 0;
            
            //不存在则跳出
            if (!$cPaySubconWarp[0]) {
                return;
            }
            
            //$ul同辈元素集合
            $siblings = $cPaySubconWarp.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });
            
            $cPaySubconWarp.css({height: windowHeight - sumHeight});
        },
        //显示
        open: function() {
            var $cNewPayWarp = this.$cNewPayWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;
            
            //设置html/body样式
            this.$html.addClass(this.cHtml);
            
            //先设置display
            $cNewPayWarp.removeClass(cHide);
            
            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $cNewPayWarp.removeClass(cAnimateHide).addClass(cAnimateShow);
            }, 10);
            
            //设置添加银行卡弹出层样式
            this.setCardPopupStyle();
        },
        //隐藏
        close: function() {
            var $cNewPayWarp = this.$cNewPayWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;
            
            //html/body样式重置为默认样式
            this.$html.removeClass(this.cHtml);
            
            //先滑动隐藏展示
            $cNewPayWarp.removeClass(cAnimateShow).addClass(cAnimateHide);
            
            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                $cNewPayWarp.addClass(cHide);
            }, 510);
            
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        }
    });
    
    return AddCardAndPayView;
});


