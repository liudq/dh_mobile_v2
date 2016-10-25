/**
 * module src: payment/editBillingAddress.js
 * 编辑银行卡账单地址模块
**/
define('app/editBillingAddress', ['common/config', 'lib/backbone', 'appTpl/editBillingAddressTpl', 'checkoutflow/getCountrysData', 'checkoutflow/regexpConfig', 'checkoutflow/popupTip'], function(CONFIG, Backbone, tpl, getCountrysAndStatesData, regexpConfig, tip){
    //model-编辑账单地址
    var EditBillingAddressModel = Backbone.Model.extend({
        //账单地址初始化属性[attributes]
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
                //国家列表
                countrys: [{
                    //国家名
                    name: '',
                    //国家id
                    countryid: '',
                    //是否为当前选中国家
                    selected: false,
                    //国家区号
                    callingcode: ''
                }],
                //州省份列表
                states: [{
                    //州省份名
                    name: '',
                    //州省份id
                    provinceid: '',
                    //是否为当前选中州省份
                    selected: false
                }],
                //临时存储当前选中国家区号
                __callingcode: '',
                //临时存储当前国家税号
                __vatnum: ''
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
            this.on('change:firstName', this.setFirstName, this);
            this.on('change:lastName', this.setLastName, this);
            this.on('change:addressOne', this.setAddressOne, this);
            this.on('change:addressTwo', this.setAddressTwo, this);
            /**
             * this.setCountry();
             * this.setCountryid();
             * this.this.setState();
             * 由$dom“change”事件触发调用，估不在initEvent()中绑定“change”事件
             * this.on('change:country', this.setCountry, this);
             * this.on('change:countryid', this.setCountryid, this);
             * this.on('change:state', this.setState, this);
            **/
            this.on('change:city', this.setCity, this);
            this.on('change:zipcode', this.setZipcode, this);
            this.on('change:telephone', this.setTelephone, this);
            this.on('change:vatnum', this.setVatnum, this);
            //重置税号事件
            this.on('reset:resetVatnum', this.resetVatnum, this);
            //更新电话号码事件
            this.on('update:updateTelephone', this.updateTelephone, this);
            //获取国家、省州列表数据事件
            this.on('EditBillingAddressModel:getCountrysAndStates', this.getCountrysAndStates, this);
            //拷贝模型数据事件
            this.on('EditBillingAddressModel:deepCopyAttributes', this.deepCopyAttributes, this);
            //还原模型数据事件
            this.on('EditBillingAddressModel:returnToDeepCopyAttributes', this.returnToDeepCopyAttributes, this);
        },
        //在VIEW中init/edit/add/cancel/save等操作成功时，需要将当
        //前的模型数据深拷贝一份，并将模型数据上的临时数据字段清
        //空。这样做的原因是目前的表单项在校验通过后会直接修改当
        //前的模型数据，所以为了后续在任何情况下可以将模型数据恢
        //复到你想要的指定状态，估采取这种方式处理
        deepCopyAttributes: function() {
            this.__attributes__ = $.extend(true, {}, this.attributes, {__callingcode:'',__vatnum:''});
        },
        //将“deepCopyAttributes()”拷贝数据覆盖当前的模型数据
        returnToDeepCopyAttributes: function() {
            //非标准“set()”方式，不触发“change”事件
            $.extend(true, this.attributes, this.__attributes__);
        },
        //获取国家列表和州省份列表数据
        getCountrysAndStates: function(options) {
            //在set的时候控制国家、州省份是否需要校验
            var isValidate = options.isValidate;
            //拉取国家、州省份列表数据
            getCountrysAndStatesData.init($.extend(true, {}, {
                successCallback: $.proxy(function(options){
                    //国家列表
                    this.setCountrys(options.countrys,{silent:options.silent.country});
                    //州省份列表
                    this.setStates(options.states,{silent:options.silent.province});
                    //国家区号（临时数据）
                    this.setCallingCode(options.__callingcode);
                    //账单地址：国家
                    this.setCountry(this.getSelectedCountryAndStateNames().countryName, isValidate);
                    //账单地址：国家id
                    this.setCountryid(this.getSelectedCountryAndStateIds().countryId);
                    //账单地址：州省份
                    this.setSate(this.getSelectedCountryAndStateNames().stateName, isValidate);
                }, this)
            }, options||{}));
        },
        //设置国家列表
        setCountrys: function(countrys, options) {
            this.set({countrys:$.extend(true, [], this.get('countrys'), countrys)}, options);
        },
        //设置当前国家下的州省列表
        setStates: function(states, options) {
            this.set({states:$.extend(true, [], states)}, options);
        },
        //设置当前选中国家区号（临时数据）
        setCallingCode: function(callingcode) {
            this.set({__callingcode:callingcode});
        },
        //获取当前选中的国家、州省份的索引值
        getSelectedCountryAndStateIndexs: function() {
            var countrys = this.get('countrys'),
                states = this.get('states'),
                obj = {};

            //国家
            $.each(countrys, function(index, country){
                if (country.selected === true) {
                    obj.countryIndex = index;
                }
            });

            //州省份
            $.each(states, function(index, state){
                if (state.selected === true) {
                    obj.stateIndex = index;
                }
            });

            return obj;
        },
        //获取当前选中国家、州省份的Id
        getSelectedCountryAndStateIds: function() {
            var indexs = this.getSelectedCountryAndStateIndexs(),
                obj = {};

            //国家
            obj.countryId = this.get('countrys')[indexs.countryIndex].countryid;
            //州省份
            obj.stateId = this.get('states')[indexs.stateIndex].provinceid;
            
            return obj;
        },
        //获取当前选中国家、州省份的name
        getSelectedCountryAndStateNames: function() {
            var indexs = this.getSelectedCountryAndStateIndexs(),
                obj = {};

            //国家
            obj.countryName = this.get('countrys')[indexs.countryIndex].name;
            //州省份
            obj.stateName = this.get('states')[indexs.stateIndex].name;
            
            return obj;
        },
        //重置税号
        //在国家列表$dom的“change”事件触发时清空税号
        resetVatnum: function() {
            this.set({__vatnum: '', billingAddress: $.extend(true, [], this.get('billingAddress'), [{vatnum: ''}])});
        },
        /**
         * 更新电话号码
         * 电话号码标准格式：“国家区号-号码”或“号码”
         * 在国家列表$dom的“change”事件触发时更新电话号码
         *
         * 特别说明：
         * 以前的表单没有所谓的国家区号，都是用户手动填写，后续碰到这种
         * 将自动加上国家区号，也就说可能存在这种情况，当修改的时候用户
         * 之前填写的电话号码格式为“国家区号-号码”或“国家区号（连接符为
         * 除-之外的任意字符）号码”，前面一种格式没有问题，碰到后面这种
         * 情况，程序无法识别，将认为该号码之前没有写过国家区号，这种错
         * 误的场景只能通过用户手动修改（触发blur事件）。至于新添加的场
         * 景则没有任何问题。
        **/
        updateTelephone: function(callingcode) {
            var arr = [],
                telephone = this.get('billingAddress')[0].telephone;
            //电话号码不存在则退出
            if (telephone === '') {
                return;
            }
            //判断是否有国家区号
            if (callingcode !== '') {
                arr.push(callingcode);
            }
            //将电话号码中的国家区号清除
            arr.push(telephone.replace(/^\d[\d ]*\-(.*)/, '$1'));
            //以当前的国家区号来修改电话号码
            this.set({billingAddress: $.extend(true, [], this.get('billingAddress'), [{telephone: arr.join('-')}])});
        },
        //设置名
        setFirstName: function(value) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{firstName:$.trim(value)}])},{silent:true, validate:true, type:'firstName'});
        },
        //设置姓
        setLastName: function(value) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{lastName:$.trim(value)}])},{silent:true, validate:true, type:'lastName'});
        },
        //设置地址1
        setAddressOne: function(value) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{addressOne:$.trim(value)}])},{silent:true, validate:true, type:'addressOne'});
        },
        //设置地址2
        setAddressTwo: function(value) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{addressTwo:$.trim(value)}])},{silent:true, validate:true, type:'addressTwo'});
        },
        //设置城市
        setCity: function(value) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{city:$.trim(value)}])},{silent:true, validate:true, type:'city'});
        },
        //设置国家
        setCountry: function(value, isValidate) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{country:$.trim(value)}])},{silent:true, validate:isValidate, type:'country'});
        },
        //设置国家id
        setCountryid: function(value) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{countryid:$.trim(value)}])},{silent:true});
        },
        //设置州省份
        setSate: function(value, isValidate) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{state:$.trim(value)}])},{silent:true, validate:isValidate, type:'state'});
        },
        //设置邮编
        setZipcode: function(value) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{zipCode:$.trim(value)}])},{silent:true, validate:true, type:'zipcode'});
        },
        //设置电话号码
        setTelephone: function(value) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{telephone:$.trim(value)}])},{silent:true, validate:true, type:'telephone'});
        },
        //设置税号（增值税）
        setVatnum: function(value) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{vatnum:$.trim(value)}])},{silent:true, validate:true, type:'vatnum'});
        },
         //验证表单字段
        validate: function(attrs, options) {
            //名校验
            if (options.type === 'firstName' || options.type === 'save') {
                //console.log('validate: firstName');
                var field = options.type !== 'firstName'?'firstName':undefined;
                    res = this.validateFirstName(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('EditBillingAddressView:close:firstNameErrorTip');
                }
            }

            //姓校验
            if (options.type === 'lastName' || options.type === 'save') {
                //console.log('validate: lastName');
                var field = options.type !== 'lastName'?'lastName':undefined,
                    res = this.validatelLastName(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('EditBillingAddressView:close:lastNameErrorTip');
                }
            }

            //地址1
            if (options.type === 'addressOne' || options.type === 'save') {
                //console.log('validate: addressOne');
                var field = options.type !== 'addressOne'?'addressOne':undefined,
                    res = this.validatelAddress(attrs, 'addressOne', field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('EditBillingAddressView:close:addressOneErrorTip');
                }
            }

            //地址2
            if (options.type === 'addressTwo' || options.type === 'save') {
                //console.log('validate: addressTwo');
                var field = options.type !== 'addressTwo'?'addressTwo':undefined,
                    res = this.validatelAddress(attrs, 'addressTwo', field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('EditBillingAddressView:close:addressTwoErrorTip');
                }
            }

            //城市校验
            if (options.type === 'city' || options.type === 'save') {
                //console.log('validate: city');
                var field = options.type !== 'city'?'city':undefined,
                    res = this.validatelCity(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('EditBillingAddressView:close:cityErrorTip');
                }
            }
            
            //国家校验
            if (options.type === 'country' || options.type === 'save' || options.type === 'saveEmail') {
                //console.log('validate: country');
                var field = options.type !== 'country'?'country':undefined,
                    res = this.validatelCountry(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:countryErrorTip');
                }
            }
            
            //州省份校验
            if (options.type === 'state' || options.type === 'save' || options.type === 'saveEmail') {
                //console.log('validate: state');
                var field = options.type !== 'state'?'state':undefined,
                    res = this.validatelState(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:stateErrorTip');
                }
            }

            //邮编校验
            if (options.type === 'zipcode' || options.type === 'save') {
                //console.log('validate: zipcode');
                var field = options.type !== 'zipcode'?'zipcode':undefined,
                    res = this.validatelZipcode(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('EditBillingAddressView:close:zipcodeErrorTip');
                }
            }
            
            //电话号码校验
            if (options.type === 'telephone' || options.type === 'save') {
                //console.log('validate: telephone');
                var field = options.type !== 'telephone'?'telephone':undefined,
                    res = this.validatelTelephone(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('EditBillingAddressView:close:telephoneErrorTip');
                }
            }
            
            //税号（增值税）校验
            if (options.type === 'vatnum' || options.type === 'save') {
                //console.log('validate: vatnum');
                var field = options.type !== 'vatnum'?'vatnum':undefined,
                    res = this.validatelVatnum(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('EditBillingAddressView:close:vatnumErrorTip');
                }
            }
        },
        //验证是否为空
        isNull: function(value) {
            //console.log('into isNull');
            return value===''||regexpConfig.isNull.test(value);
        },
        //验证是否为纯数字
        isNumber: function(value) {
            //console.log('into isNumber');
            return regexpConfig.isNumber.test(value);
        },
        //验证是否包含非法字符
        isIllegalChar: function(value) {
            //console.log('into isIllegalChar');
            return regexpConfig.isIllegalChar.test(value);
        },
        //验证名的有效性
        validateFirstName: function(attrs) {
            //console.log('into validateFirstName');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.billingAddress[0].firstName;
            //是否包含非英文字符
            if (regexpConfig.chkHexStr(value)) {
                validateResult = !field?'isNotEn':'isNotEn-'+field;
            //是否为空
            } else if (this.isNull(value)) {
                validateResult = !field?'isNull':'isNull-'+field;
            //是否只包含数字
            } else if (this.isNumber(value)) {
                validateResult = !field?'isNumber':'isNumber-'+field;
            //是否包含非法字符
            } else if (this.isIllegalChar(value)) {
                validateResult = !field?'isIllegalChar':'isIllegalChar-'+field;
            //字符数是否超长
            } else if (!regexpConfig.firstName.test(value)) {
                validateResult = !field?'isLength':'isLength-'+field;
            }
            return validateResult;
        },
        //验证姓的有效性
        validatelLastName: function(attrs) {
            //console.log('into validatelLastName');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.billingAddress[0].lastName;
            //是否包含非英文字符
            if (regexpConfig.chkHexStr(value)) {
                validateResult = !field?'isNotEn':'isNotEn-'+field;
            //是否为空
            } else if (this.isNull(value)) {
                validateResult = !field?'isNull':'isNull-'+field;
            //是否只包含数字
            } else if (this.isNumber(value)) {
                validateResult = !field?'isNumber':'isNumber-'+field;
            //是否包含非法字符
            } else if (this.isIllegalChar(value)) {
                validateResult = !field?'isIllegalChar':'isIllegalChar-'+field;
            //字符数是否超长
            } else if (!regexpConfig.firstName.test(value)) {
                validateResult = !field?'isLength':'isLength-'+field;
            }
            return validateResult;
        },
        //验证地址的有效性
        validatelAddress: function(attrs, name) {
            //console.log('into validatelAddress');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[2],
                value = attrs.billingAddress[0][name];
            //是否包含非英文字符
            if (regexpConfig.chkHexStr(value)) {
                validateResult = !field?'isNotEn':'isNotEn-'+field;
            //是否为空（地址2为非必填项可以为空）
            } else if (this.isNull(value) && name!=='addressTwo') {
                validateResult = !field?'isNull':'isNull-'+field;
            //是否只包含数字
            } else if (this.isNumber(value)) {
                validateResult = !field?'isNumber':'isNumber-'+field;
            //是否包含非法字符
            } else if (this.isIllegalChar(value)) {
                validateResult = !field?'isIllegalChar':'isIllegalChar-'+field;
            //字符数是否超长
            } else if (name!=='addressTwo'?!regexpConfig.addressOne.test(value):!regexpConfig.addressTwo.test(value)) {
                validateResult = !field?'isLength':'isLength-'+field;
            }
            return validateResult;
        },
        //验证城市的有效性
        validatelCity: function(attrs) {
            //console.log('into validatelCity');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.billingAddress[0].city;
            //是否包含非英文字符
            if (regexpConfig.chkHexStr(value)) {
                validateResult = !field?'isNotEn':'isNotEn-'+field;
            //是否为空
            } else if (this.isNull(value)) {
                validateResult = !field?'isNull':'isNull-'+field;
            //是否只包含数字
            } else if (this.isNumber(value)) {
                validateResult = !field?'isNumber':'isNumber-'+field;
            //是否包含非法字符
            } else if (this.isIllegalChar(value)) {
                validateResult = !field?'isIllegalChar':'isIllegalChar-'+field;
            //字符数是否超长
            } else if (!regexpConfig.city.test(value)) {
                validateResult = !field?'isLength':'isLength-'+field;
            }
            return validateResult;
        },
        //验证国家名称的有效性
        validatelCountry: function(attrs) {
            //console.log('into validatelCountry');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.billingAddress[0].country;
            //是否为有效的国家名称
            if (regexpConfig.country_state_name.test(value)) {
                validateResult = !field?'isNull':'isNull-'+field;
            }
            return validateResult;
        },
        //验证州省份名称的有效性
        validatelState: function(attrs) {
            //console.log('into validatelState');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.billingAddress[0].state;
            //是否为有效的州省份名称
            if (regexpConfig.country_state_name.test(value)) {
                validateResult = !field?'isNull':'isNull-'+field;
            }
            return validateResult;
        },
        //验证邮编的有效性
        validatelZipcode: function(attrs) {
            //console.log('into validatelZipcode');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.billingAddress[0].zipCode,
                //当前选中的国家、州省份Id
                ids = this.getSelectedCountryAndStateIds();
            //是否包含非英文字符
            if (regexpConfig.chkHexStr(value)) {
                validateResult = !field?'isNotEn':'isNotEn-'+field;
            //是否为空
            } else if (this.isNull(value)) {
                validateResult = !field?'isNull':'isNull-'+field;
            //是否包含非法字符或数字
            } else if (this.isIllegalChar(value) || !regexpConfig.zipCodeChar.test(value) || !regexpConfig.hasNumber.test(value)) {
                validateResult = !field?'isIllegalChar':'isIllegalChar-'+field;
            //是否合法（非美国）
            } else if (!regexpConfig.zipCode.test(value) && ids.countryId !== 'US') {
                validateResult = !field?'isValidate':'isValidate-'+field;
            //是否合法（美国）
            } else if (!regexpConfig.usZipCode.test(value) && ids.countryId === 'US') {
                validateResult = !field?'isValidateUS':'isValidateUS-'+field;
            }
            return validateResult;
        },
        //验证电话号码的有效性
        //只校验：美国、加拿大、英国、澳大利亚
        validatelTelephone: function(attrs) {
            //console.log('into validatelTelephone');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                //电话号码校验的时候需要先去掉国家区号部分“^callingcode-”
                __callingcode = this.get('__callingcode'),
                callingcodeRegex = __callingcode!==''?new RegExp('^'+__callingcode+'-'):new RegExp(''),
                value = attrs.billingAddress[0].telephone.replace(callingcodeRegex, ''),
                //当前选中的国家、州省份Id
                ids = this.getSelectedCountryAndStateIds();
            //是否包含非英文字符
            if (regexpConfig.chkHexStr(value)) {
                validateResult = !field?'isNotEn':'isNotEn-'+field;
            //是否为空
            } else if (this.isNull(value)) {
                validateResult = !field?'isNull':'isNull-'+field;
            //是否包含除（数字, ,-,(,)）之外的字符
            } else if (!regexpConfig.telephone.test(value)) {
                validateResult = !field?'isIllegalChar':'isIllegalChar-'+field;
            //是否合法（美国、加拿大）
            } else if (!regexpConfig.telephone1.test(value) && (ids.countryId==='US'||ids.countryId==='CA')) {
                validateResult = !field?'isValidateUSCA':'isValidateUSCA-'+field;
            //是否合法（英国）
            } else if (!regexpConfig.telephone2.test(value) && ids.countryId==='UK') {
                validateResult = !field?'isValidateUK':'isValidateUK-'+field;
            //是否合法（澳大利亚）
            } else if (!regexpConfig.telephone3.test(value) && ids.countryId==='AU') {
                validateResult = !field?'isValidateAU':'isValidateAU-'+field;
            }
            return validateResult;
        },
        /**
         * 下列国家将进行税号校验：
         * VN, 越南
         * LB, 黎巴嫩
         * TR, 土耳其
         * EC, 厄瓜多尔
         * MX, 墨西哥
         * BR, 巴西
         * AR, 阿根廷
         * AO, 安哥拉
        **/
        validatelVatnum: function(attrs) {
            //console.log('into validatelVatnum');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.billingAddress[0].vatnum,
                //当前选中的国家、州省份Id
                ids = this.getSelectedCountryAndStateIds();
            //符合国家条件才进行验证
            if (/VN|LB|TR|EC|MX|BR|AR|AO/.test(ids.countryId)) {
                //是否包含非英文字符
                if (regexpConfig.chkHexStr(value)) {
                    validateResult = !field?'isNotEn':'isNotEn-'+field;
                //是否为空
                } else if (this.isNull(value)) {
                    validateResult = !field?'isNull':'isNull-'+field;
                //是否包含非法字符
                } else if (this.isIllegalChar(value)) {
                    validateResult = !field?'isIllegalChar':'isIllegalChar-'+field;
                }
            }
            return validateResult;
        }
    });

    //view-编辑账单地址
    var EditBillingAddressView = Backbone.View.extend({
        //根节点
        el: '.j-pay-warp',
        //backbone提供的事件集合
        events: {
            'click .j-editBillBtn': 'edit',
            'click .j-billEdit-cancel': 'close',
            'click .j-card-header-back': 'resetBillingAddressFormsDom',
            'click .j-saveBillBtn': 'update',
            'blur .j-billEdit-firstname': 'setFirstName',
            'blur .j-billEdit-lastname': 'setLastName',
            'blur .j-billEdit-address1': 'setAddressOne',
            'blur .j-billEdit-address2': 'setAddressTwo',
            'blur .j-billEdit-city': 'setCity',
            'change .j-billEdit-country': 'fetchCountrysAndStates',
            'change .j-billEdit-state': 'fetchCountrysAndStates',
            'blur .j-billEdit-zipcode': 'setZipcode',
            'blur .j-billEdit-telephone': 'setTelephone',
            'blur .j-billEdit-vatNumber': 'setVatnum'
        },
        //初始化入口
        initialize: function(options) {
            //初始化配置对象
            this.setOptions(options);
            this.cPayBtnWarp = this.options.cPayBtnWarp;
            this.cCardBillAdressContentWarp = this.options.cCardBillAdressContentWarp;
            this.cEditBillBtn = this.options.cEditBillBtn;
            this.cSaveBillBtn = this.options.cSaveBillBtn;
            this.cCloseBillBtn = this.options.cCloseBillBtn;
            this.cBillEditWarp = this.options.cBillEditWarp;
            this.cCountrysWarp = this.options.cCountrysWarp;
            this.cStatesWarp = this.options.cStatesWarp;
            this.cVatNumberWarp = this.options.cVatNumberWarp;
            this.billingAddressForms = this.options.billingAddressForms;
            this.cErrorTip = this.options.cErrorTip;
            this.cErrorTipStyle = this.options.cErrorTipStyle;
            this.cHide = this.options.cHide;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.payModel = this.options.payModel;
            this.resetElement = this.options.resetElement;
            this.indexs = {};
            this.ids = {};
            
            //console.log('EditBillingAddressView: ');
            //console.log(this);
            //初始化$dom对象
            this.initElement();
            //重置$el、$dom对象
            this.resetElement();
            //初始化事件
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cPayBtnWarp = this.$el.find(this.cPayBtnWarp);
            this.$cBillEditWarp = this.$el.find(this.cBillEditWarp);
            this.$cCardBillAdressContentWarp = this.$el.find(this.cCardBillAdressContentWarp);
            this.$cEditBillBtn = this.$el.find(this.cEditBillBtn);
            this.$cCloseBillBtn = this.$el.find(this.cCloseBillBtn);
            this.$cCountrysWarp = this.$el.find(this.cCountrysWarp);
            this.$cStatesWarp = this.$el.find(this.cStatesWarp);
            this.$cVatNumberWarp = this.$el.find(this.cVatNumberWarp);
            this.$cSaveBillBtn = this.$el.find(this.cSaveBillBtn);
        },
        //事件初始化
        initEvent: function() {
            //初始化拷贝模型数据
            this.model.trigger('EditBillingAddressModel:deepCopyAttributes');
            //监听国家列表数据变化
            this.listenTo(this.model, 'change:countrys', this.renderCountrys);
            //监听州省份列表数据变化
            this.listenTo(this.model, 'change:states', this.renderStates);
            //监听国家区号临时数据变化
            this.listenTo(this.model, 'change:__callingcode', this.setCallingcode);
            this.listenTo(this.model, 'change:__callingcode', this.controlVatnum);
            //监听模型数据字段验证
            this.listenTo(this.model, 'invalid', this.matchErrorTip);
            //在model上绑定关闭名错误提示的事件
            this.model.on('EditBillingAddressView:close:firstNameErrorTip', this.setFirstNameErrorTip, this);
            //在model上绑定关闭姓错误提示的事件
            this.model.on('EditBillingAddressView:close:lastNameErrorTip', this.setLastNameErrorTip, this);
            //在model上绑定关闭地址1误提示的事件
            this.model.on('EditBillingAddressView:close:addressOneErrorTip', this.setAddressOneErrorTip, this);
            //在model上绑定关闭地址2误提示的事件
            this.model.on('EditBillingAddressView:close:addressTwoErrorTip', this.setAddressTwoErrorTip, this);
            //在model上绑定关闭城市错误提示的事件
            this.model.on('EditBillingAddressView:close:cityErrorTip', this.setCityErrorTip, this);
            //在model上绑定关闭国家错误提示的事件
            this.model.on('editShipAddressView:close:countryErrorTip', this.setCountryErrorTip, this);
            //在model上绑定关闭州省份错误提示的事件
            this.model.on('editShipAddressView:close:stateErrorTip', this.setStateErrorTip, this);
            //在model上绑定关闭邮编错误提示的事件
            this.model.on('EditBillingAddressView:close:zipcodeErrorTip', this.setZipcodeErrorTip, this);
            //在model上绑定关闭电话号码错误提示的事件
            this.model.on('EditBillingAddressView:close:telephoneErrorTip', this.setTelephoneErrorTip, this);
            //在model上绑定关闭税号错误提示的事件
            this.model.on('EditBillingAddressView:close:vatnumErrorTip', this.setVatnumErrorTip, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //银行卡支付按钮外层包裹容器
                cPayBtnWarp: '.j-payBtn-warp',
                //银行卡账单地址内容包裹容器
                cCardBillAdressContentWarp: '.j-billSave',
                //账单地址编辑按钮
                cEditBillBtn: '.j-editBillBtn',
                //账单地址保存按钮
                cSaveBillBtn: '.j-saveBillBtn',
                //账单地址关闭按钮
                cCloseBillBtn: '.j-billEdit-cancel',
                //编辑账单地址外层包裹容器
                cBillEditWarp: '.j-billEdit',
                //国家列表外层包裹容器
                cCountrysWarp: '.j-countrys-warp',
                //州省份列表外层包裹容器
                cStatesWarp: '.j-states-warp',
                //税号（增值税）外层包裹容器
                cVatNumberWarp: '.j-billEdit-vatNumber-warp',
                //账单地址表单项
                billingAddressForms: {
                    //名
                    firstName: '.j-billEdit-firstname',
                    //姓
                    lastName: '.j-billEdit-lastname',
                    //地址1
                    addressOne: '.j-billEdit-address1',
                    //地址2
                    addressTwo: '.j-billEdit-address2',
                    //城市
                    city: '.j-billEdit-city',
                    //国家
                    country: '.j-billEdit-country',
                    //州省份
                    state: '.j-billEdit-state',
                    //邮政编码
                    zipcode: '.j-billEdit-zipcode',
                    //国家区号
                    callingcode: '.j-billEdit-areacode',
                    //电话号码
                    telephone: '.j-billEdit-telephone',
                    //税号（增值税）
                    vatnum: '.j-billEdit-vatNumber'
                },
                //表单错误信息容器
                cErrorTip: '.edit-error-tips',
                //表单错误信息输入框样式的className
                cErrorTipStyle: 'color-f00',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new EditBillingAddressModel(options.modelDefaults),
                //PayModel：支付信息初始化数据模型
                payModel: null,
                //$el、$dom对象重置
                resetElement: $.noop,
            };
            $.extend(true, this.options, options||{});
        },
        //从数据模型上获取当前选中国家、州省份索引值
        getIndexs: function() {
            return $.extend(true, this.indexs, this.model.getSelectedCountryAndStateIndexs());
        },
        //从数据模型上获取当前选中国家、州省份id
        getIds: function() {
            return $.extend(true, this.ids, this.model.getSelectedCountryAndStateIds());
        },
        //获取国家和州省份地址数据
        fetchCountrysAndStates: function(options) {
            var $target = options.target&&$(options.target);

            //判断是否为$dom：“change”事件调用
            if (options.type === 'change') {
                //选择国家
                if ($target.attr('data-type') === 'countrys') {
                    //拉取国家、州省份列表数据
                    this.model.trigger('EditBillingAddressModel:getCountrysAndStates', {
                        id: {
                            country: $target.val(),
                            province: ''
                        },
                        silent: {
                            //阻止国家列表绘制
                            country: true
                        },
                        isValidate: true
                    });
                    //国家变化，清空模型数据上的税号
                    this.model.trigger('reset:resetVatnum');
                    //国家区号变化，更新电话号码
                    this.model.trigger('update:updateTelephone', $target.find('option:selected').attr('data-callingcode'));
                //选择州省份
                } else if ($target.attr('data-type') === 'states') {
                    //获取当前选中国家、州省份的索引值
                    this.getIndexs();
                    //拉取国家、州省份列表数据
                    this.model.trigger('EditBillingAddressModel:getCountrysAndStates', {
                        id: {
                            country: this.model.get('countrys')[this.indexs.countryIndex].countryid,
                            province: $target.val()
                        },
                        silent: {
                            //阻止州省份列表绘制
                            province: true
                        },
                        isValidate: true
                    });
                }

            //反之
            } else {
                //拉取国家、州省份列表数据
                this.model.trigger('EditBillingAddressModel:getCountrysAndStates', options);
            }
        },
        //设置名
        setFirstName: function(evt) {
            //console.log('view: setFirstName');
            var $firstName = this.$firstName = this.$firstName||$(evt.target);
            this.model.trigger('change:firstName', $firstName.val());
        },
        //设置姓
        setLastName: function(evt) {
            //console.log('view: setLastName');
            var $lastName = this.$lastName = this.$lastName||$(evt.target);
            this.model.trigger('change:lastName', $lastName.val());
        },
        //设置地址1
        setAddressOne: function(evt) {
            //console.log('view: setAddressOne');
            var $addressOne = this.$addressOne = this.$addressOne||$(evt.target);
            this.model.trigger('change:addressOne', $addressOne.val());
        },
        //设置地址2
        setAddressTwo: function(evt) {
            //console.log('view: setAddressTwo');
            var $addressTwo = this.$addressTwo = this.$addressTwo||$(evt.target);
            this.model.trigger('change:addressTwo', $addressTwo.val());
        },
        //设置城市
        setCity: function(evt) {
            //console.log('view: setCity');
            var $city = this.$city = this.$city||$(evt.target);
            this.model.trigger('change:city', $city.val());
        },
        //设置邮编
        setZipcode: function(evt) {
            //console.log('view: setZipcode');
            var $zipcode = this.$zipcode = this.$zipcode||$(evt.target);
            this.model.trigger('change:zipcode', $zipcode.val());
        },
        //设置国家区号
        setCallingcode: function() {
            //console.log('view: setCallingcode');
            var $callingcode = this.$callingcode = this.$callingcode||this.$el.find(this.billingAddressForms.callingcode);
            $callingcode.attr({value:this.model.get('__callingcode')});
        },
        //设置电话号码
        setTelephone: function(evt) {
            //console.log('view: setTelephone');
            var $telephone = this.$telephone = this.$telephone||$(evt.target),
                callingcode = this.model.get('__callingcode'),
                telephone = $telephone.val();
            this.model.trigger('change:telephone', callingcode!==''?(callingcode+'-'+telephone):telephone);
        },
        //设置税号
        setVatnum: function(evt) {
            //console.log('view: setVatnum');
            var $vatnum = this.$vatnum = this.$vatnum||$(evt.target);
            this.model.trigger('change:vatnum', $vatnum.val());
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

            //名
            if (options.type === 'firstName') {
                this.setFirstNameErrorTip(error, flag);
            //姓
            } else if (options.type === 'lastName') {
                this.setLastNameErrorTip(error, flag);
            //地址1
            } else if (options.type === 'addressOne') {
                this.setAddressOneErrorTip(error, flag);
            //地址2
            } else if (options.type === 'addressTwo') {
                this.setAddressTwoErrorTip(error, flag);
            //城市
            } else if (options.type === 'city') {
                this.setCityErrorTip(error, flag);
            //国家
            } else if (options.type === 'country') {
                this.setCountryErrorTip(error, flag);
            //州省份
            } else if (options.type === 'state') {
                this.setStateErrorTip(error, flag);
            //邮编
            } else if (options.type === 'zipcode') {
                this.setZipcodeErrorTip(error, flag);
            //电话号码
            } else if (options.type === 'telephone') {
                this.setTelephoneErrorTip(error, flag);
            //税号
            } else if (options.type === 'vatnum') {
                this.setVatnumErrorTip(error, flag);
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
        //设置名错误提示
        setFirstNameErrorTip: function(error) {
            //console.log('view: setFirstNameErrorTip');
            var flag = arguments[1],
                $firstName = this.$firstName = this.$firstName||this.$el.find(this.billingAddressForms.firstName),
                $cErrorTip = $firstName.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isNotEn') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $firstName,
                    errorElement: $cErrorTip,
                    errorText: 'Please use numbers and English letters only.',
                    autoLayer: flag
                });
            } else if (error === 'isNumber') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $firstName,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter valid name entry using letters only.',
                    autoLayer: flag
                });
            } else if (error === 'isNull') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $firstName,
                    errorElement: $cErrorTip,
                    errorText: 'First name is required or delivery could fail.',
                    autoLayer: flag
                });
            } else if (error === 'isIllegalChar') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $firstName,
                    errorElement: $cErrorTip,
                    errorText: 'Please don\'t input illegal character.',
                    autoLayer: flag
                });
            } else if (error == 'isLength') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $firstName,
                    errorElement: $cErrorTip,
                    errorText: 'The length of First Name must less than 30.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $firstName,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置姓错误提示
        setLastNameErrorTip: function(error) {
            //console.log('view: setLastNameErrorTip');
            var flag = arguments[1],
                $lastName = this.$lastName = this.$lastName||this.$el.find(this.billingAddressForms.lastName),
                $cErrorTip = $lastName.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isNotEn') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $lastName,
                    errorElement: $cErrorTip,
                    errorText: 'Please use numbers and English letters only.',
                    autoLayer: flag
                });
            } else if (error === 'isNumber') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $lastName,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter valid name entry using letters only.',
                    autoLayer: flag
                });
            } else if (error === 'isNull') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $lastName,
                    errorElement: $cErrorTip,
                    errorText: 'Last name is required or delivery could fail.',
                    autoLayer: flag
                });
            } else if (error === 'isIllegalChar') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $lastName,
                    errorElement: $cErrorTip,
                    errorText: 'Please don\'t input illegal character.',
                    autoLayer: flag
                });
            } else if (error == 'isLength') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $lastName,
                    errorElement: $cErrorTip,
                    errorText: 'The length of Last Name must less than 20.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $lastName,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置地址1错误提示
        setAddressOneErrorTip: function(error) {
            //console.log('view: setAddressOneErrorTip');
            var flag = arguments[1],
                $addressOne = this.$addressOne = this.$addressOne||this.$el.find(this.billingAddressForms.addressOne),
                $cErrorTip = $addressOne.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isNotEn') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $addressOne,
                    errorElement: $cErrorTip,
                    errorText: 'Please use numbers and English letters only.',
                    autoLayer: flag
                });
            } else if (error === 'isNumber') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $addressOne,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter valid address using combination of letters and numbers.',
                    autoLayer: flag
                });
            } else if (error === 'isNull') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $addressOne,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter a valid Address Line1.',
                    autoLayer: flag
                });
            } else if (error === 'isIllegalChar') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $addressOne,
                    errorElement: $cErrorTip,
                    errorText: 'Please don\'t input illegal character.',
                    autoLayer: flag
                });
            } else if (error == 'isLength') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $addressOne,
                    errorElement: $cErrorTip,
                    errorText: 'The length of Address Line1 must less than 512.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $addressOne,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置地址2错误提示
        setAddressTwoErrorTip: function(error) {
            //console.log('view: setAddressTwoErrorTip');
            var flag = arguments[1],
                $addressTwo = this.$addressTwo = this.$addressTwo||this.$el.find(this.billingAddressForms.addressTwo),
                $cErrorTip = $addressTwo.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isNotEn') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $addressTwo,
                    errorElement: $cErrorTip,
                    errorText: 'Please use numbers and English letters only.',
                    autoLayer: flag
                });
            } else if (error === 'isNumber') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $addressTwo,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter valid address using combination of letters and numbers.',
                    autoLayer: flag
                });
            } else if (error === 'isIllegalChar') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $addressTwo,
                    errorElement: $cErrorTip,
                    errorText: 'Please don\'t input illegal character.',
                    autoLayer: flag
                });
            } else if (error == 'isLength') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $addressTwo,
                    errorElement: $cErrorTip,
                    errorText: 'The length of Address Line2 must less than 512.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $addressTwo,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置城市错误提示
        setCityErrorTip: function(error) {
            //console.log('view: setCityErrorTip');
            var flag = arguments[1],
                $city = this.$city = this.$city||this.$el.find(this.billingAddressForms.city),
                $cErrorTip = $city.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isNotEn') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $city,
                    errorElement: $cErrorTip,
                    errorText: 'Please use numbers and English letters only.',
                    autoLayer: flag
                });
            } else if (error === 'isNumber' || error === 'isNull') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $city,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter a valid city or town.',
                    autoLayer: flag
                });
            } else if (error === 'isIllegalChar') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $city,
                    errorElement: $cErrorTip,
                    errorText: 'Please don\'t input illegal character.',
                    autoLayer: flag
                });
            } else if (error == 'isLength') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $city,
                    errorElement: $cErrorTip,
                    errorText: 'Limited to 60 characters.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $city,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置国家错误提示
        setCountryErrorTip: function(error) {
            //console.log('view: setCountryErrorTip');
            var flag = arguments[1],
                $country = this.$country = this.$country||this.$el.find(this.billingAddressForms.country),
                $cErrorTip = $country.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isNull') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $country,
                    errorElement: $cErrorTip,
                    errorText: 'Please choose a Country.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $country,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置州省份错误提示
        setStateErrorTip: function(error) {
            //console.log('view: setStateErrorTip');
            var flag = arguments[1],
                $state = this.$state = this.$el.find(this.billingAddressForms.state),
                $cErrorTip = $state.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isNull') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $state,
                    errorElement: $cErrorTip,
                    errorText: 'Please choose a State/Province/Region.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $state,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置邮编错误提示
        setZipcodeErrorTip: function(error) {
            //console.log('view: setZipcodeErrorTip');
            var flag = arguments[1],
                $zipcode = this.$zipcode = this.$zipcode||this.$el.find(this.billingAddressForms.zipcode),
                $cErrorTip = $zipcode.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isNotEn') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $zipcode,
                    errorElement: $cErrorTip,
                    errorText: 'Please use numbers and English letters only.',
                    autoLayer: flag
                });
            } else if (error === 'isNull') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $zipcode,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter a valid Postal Code.',
                    autoLayer: flag
                });
            } else if (error === 'isIllegalChar') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $zipcode,
                    errorElement: $cErrorTip,
                    errorText: 'Please don\'t input illegal character.',
                    autoLayer: flag
                });
            } else if (error == 'isValidate') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $zipcode,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter a valid zip/postal code of between 4 and 10 characters.',
                    autoLayer: flag
                });
            } else if (error == 'isValidateUS') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $zipcode,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter a valid zip/postal code .5 or 9 characters.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $zipcode,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置电话号码错误提示
        setTelephoneErrorTip: function(error) {
            //console.log('view: setTelephoneErrorTip');
            var flag = arguments[1],
                $telephone = this.$telephone = this.$telephone||this.$el.find(this.billingAddressForms.telephone),
                $cErrorTip = $telephone.parents('.telephone').find(this.cErrorTip);
            //提示错误
            if (error === 'isNotEn') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $telephone,
                    errorElement: $cErrorTip,
                    errorText: 'Please use numbers and English letters only.',
                    autoLayer: flag
                });
            } else if (error === 'isNull') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $telephone,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter a valid Telephone.',
                    autoLayer: flag
                });
            } else if (error === 'isIllegalChar') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $telephone,
                    errorElement: $cErrorTip,
                    errorText: 'Only Numbers, "space", "-" and "()" is allowed.',
                    autoLayer: flag
                });
            } else if (error == 'isValidateUSCA') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $telephone,
                    errorElement: $cErrorTip,
                    errorText: 'The length of Telephone must 10.',
                    autoLayer: flag
                });
             } else if (error == 'isValidateUK') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $telephone,
                    errorElement: $cErrorTip,
                    errorText: 'The length of Telephone must between 7 and 11.',
                    autoLayer: flag
                });
             } else if (error == 'isValidateAU') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $telephone,
                    errorElement: $cErrorTip,
                    errorText: 'The length of Telephone must between 9 and 10.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $telephone,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置税号错误提示
        setVatnumErrorTip: function(error){
            //console.log('view: setVatnumErrorTip');
            var flag = arguments[1],
                $vatnum = this.$vatnum = this.$vatnum||this.$el.find(this.billingAddressForms.vatnum),
                $cErrorTip = $vatnum.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isNotEn') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $vatnum,
                    errorElement: $cErrorTip,
                    errorText: 'Please use numbers and English letters only.',
                    autoLayer: flag
                });
            } else if (error === 'isNull') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $vatnum,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter the VAT Number. It is required by the delivery country for goods\' customs clearance.',
                    autoLayer: flag
                });
            } else if (error === 'isIllegalChar') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $vatnum,
                    errorElement: $cErrorTip,
                    errorText: 'Please don\'t input illegal character.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $vatnum,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //编辑账单地址
        edit: function() {
            //数据渲染
            this.render(this.model.attributes);
            //拉取数据
            this.fetchCountrysAndStates({
                id : {
                    country: this.model.get('billingAddress')[0]['countryid']
                },
                name: {
                    province: this.model.get('billingAddress')[0]['state']
                },
                //初始化强制不校验国家和州省份数据
                isValidate: false
            });
        },
        /**
         * 控制修改编辑账单地址展示或隐藏
         * 说明：
         * 1、展示的情况下需要隐藏其他内容
         *    a：银行卡账单地址内容区域（.j-billSave）；
         *    b：支付按钮（.j-payBtn-warp）；
         *    c: 编辑按钮（.j-editBillBtn）；
         * 2、隐藏的情况下需要展示的其他内容：
         *    a：银行卡账单地址内容区域（.j-billSave）；
         *    b：支付按钮（.j-payBtn-warp）；
         *    c：编辑按钮（.j-editBillBtn）；
        **/
        controlEditBillingAddressStyle: function(flag) {
            var cHide = this.cHide;
            //编辑
            if (flag === true ) {
                //银行卡账单地址内容区域
                this.$cCardBillAdressContentWarp.addClass(cHide);
                //支付按钮
                this.$cPayBtnWarp.addClass(cHide);
                //编辑按钮
                this.$cEditBillBtn.addClass(cHide);
                //关闭按钮
                this.$cCloseBillBtn.removeClass(cHide),
                //编辑区域
                this.$cBillEditWarp.removeClass(cHide);

            //取消编辑或保存
            } else {
                //银行卡账单地址内容区域
                this.$cCardBillAdressContentWarp.removeClass(cHide);
                //支付按钮
                this.$cPayBtnWarp.removeClass(cHide);
                //编辑按钮
                this.$cEditBillBtn.removeClass(cHide);
                //关闭按钮
                this.$cCloseBillBtn.addClass(cHide),
                //编辑区域
                this.$cBillEditWarp.addClass(cHide);
            }
        },
        //重置实例对象中billingAddressForms下的所有$属性
        resetBillingAddressFormsDom: function() {
            var self = this,
                name;
            /**
             * 删除实例对象上以下属性：
             * {
             *     $firstName: $dom,
             *     $lastName: $dom,
             *     $addressOne: $dom,
             *     $addressTwo: $dom,
             *     $city: $dom,
             *     $country: $dom,
             *     $state: $dom,
             *     $zipcode: $dom,
             *     $callingcode: $dom,
             *     $telephone: $dom,
             *     $vatnum: $dom
             * }
            **/
            $.each(this.billingAddressForms, function(name, billingAddressForm){
                name = '$'+name;
                if (self[name]) {
                    delete self[name];
                }
            });
        },
        //判断是否为数据模型实例
        isModelInstance: function(obj) {
            return _.has(obj,'attributes');
        },
        //根据data的类型获取正确的模型数据
        getData: function(obj) {
            return this.isModelInstance(obj)?obj.attributes:obj;
        },
        //修改账单地址渲染
        render: function(data) {
               //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //账单地址数据
                billingAddressData = this.model.get('billingAddress')[0],
                //国家列表数据
                countrysData = this.model.get('countrys'),
                //州省份列表数据
                statesData = this.model.get('states'),
                //编辑账单地址的主体内容模板
                billEditMain = template(tpl.billEditMain.join(''))(billingAddressData),
                //联系人的姓名模板
                name = template(tpl.name.join(''))(billingAddressData),
                //地址1模板
                address1 = template(tpl.address1.join(''))(billingAddressData),
                //地址2模板
                address2 = template(tpl.address2.join(''))(billingAddressData),
                //城市模板
                city = template(tpl.city.join(''))(billingAddressData),
                //国家列表模板
                countrys = this.renderCountrys(data),
                //州省份列表模板
                states = this.renderStates(data),
                //邮政编码模板
                zipcode = template(tpl.zipcode.join(''))(billingAddressData),
                //电话号码模板
                telephone = template(tpl.telephone.join(''))(billingAddressData),
                //税号（增值税）模板
                vatNumber = template(tpl.vatNumber.join(''))(billingAddressData),
                //保存账单地址按钮模板
                save = template(tpl.save.join(''))(data);
            
            billEditMain = billEditMain.replace(/\{\{name\}\}/, name)
                           .replace(/\{\{address1\}\}/, address1)
                           .replace(/\{\{address2\}\}/, address2)
                           .replace(/\{\{city\}\}/, city)
                           .replace(/\{\{countrys\}\}/, countrys)
                           .replace(/\{\{states\}\}/, states)
                           .replace(/\{\{zipcode\}\}/, zipcode)
                           .replace(/\{\{telephone\}\}/, telephone)
                           .replace(/\{\{vatNumber\}\}/, vatNumber)
                           .replace(/\{\{save\}\}/, save)
                           ;
            //绘制
            this.$cBillEditWarp.html(billEditMain);
            //重新初始化$dom对象
            this.initElement();
            //展示
            this.controlEditBillingAddressStyle(true);
        },
        //国家列表渲染
        renderCountrys: function(data) {
            var $cCountrysWarp = this.$cCountrysWarp,
                str = this.template(this.tpl.countrys.join(''))(this.getData(data));

            //如果data为数据模型实例，则直接绘制页面
            if (this.isModelInstance(data)) {
                $cCountrysWarp[0]&&$cCountrysWarp.html(str);

            //否则返回模板渲染数据
            } else {
                return str;
            }
        },
        //州省份列表渲染
        renderStates: function(data) {
            var $cStatesWarp = this.$cStatesWarp,
                str = this.template(this.tpl.states.join(''))(this.getData(data));

            //如果data为数据模型实例，则直接绘制页面
            if (this.isModelInstance(data)) {
                $cStatesWarp[0]&&$cStatesWarp.html(str);

            //否则返回模板渲染数据
            } else {
                return str;
            }
        },
        //控制税号（增值税）区域的展示和隐藏
        controlVatnum: function() {
            var ids = this.getIds(),
                countryid = ids.countryId,
                $cVatNumberWarp = this.$cVatNumberWarp,
                $vatnum = $cVatNumberWarp.find('input'),
                $cErrorTip = $vatnum.siblings(this.cErrorTip),
                cHide = this.cHide;
            /**
             * 当选择国家为下面国家时，页面出现税号（必填-VAT Number)输入项
             * VN, 越南
             * LB, 黎巴嫩
             * TR, 土耳其
             * EC, 厄瓜多尔
             * MX, 墨西哥
             * BR, 巴西
             * AR, 阿根廷
             * AO, 安哥拉
            **/
            //展示
            if (/VN|LB|TR|EC|MX|BR|AR|AO/.test(countryid)) {
                //显示
                $cVatNumberWarp.removeClass(cHide);
                //重置错误状态
                this.controlErrorStyle({
                    show: false,
                    formElement: $vatnum,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            //隐藏
            } else {
                //重置输入内容
                $vatnum.val('');
                //关闭
                $cVatNumberWarp.addClass(cHide);
            }
        },
        //查找页面上是否展示了错误提示信息
        isErrorVisible: function() {
            return !!this.$el.find(this.cErrorTip+':visible').length;
        },
        //关闭编辑账单地址
        close: function() {
            //还原模型数据
            this.model.trigger('EditBillingAddressModel:returnToDeepCopyAttributes');
            //隐藏
            this.controlEditBillingAddressStyle(false);
            //重置实例上的$dom表单项属性
            this.resetBillingAddressFormsDom();
        },
        /**
         * 更新账单地址
        **/
        update: function(evt) {
            //console.log('view: update');
            
            var $saveBtn = this.$saveBtn = this.$saveBtn||$(evt.target),
                model = this.model,
                //错误类型
                errorType,
                //验证类型
                validateType = $saveBtn.attr('data-validate');
            
            //第一关：
            //当前页面上展示有错误提示则跳出更新账单地址
            if (this.isErrorVisible()) {
                return;
            }
            
            //第二关：
            //非触发model上的validate事件验证调用
            //如果当前页面上没有任何的错误提示展示，则
            //查找数据模型上的相关字段进行验证，验证不
            //通过跳出更新，并在页面上展示对应的错误提
            //示信息
            errorType = model.validate(_.clone(model.attributes), {type:validateType});
            if (typeof errorType === 'string') {
                this.matchErrorTip(model, errorType);
                return;
            }
            
            //拷贝模型数据
            model.trigger('EditBillingAddressModel:deepCopyAttributes');
            //还原模型数据
            model.trigger('EditBillingAddressModel:returnToDeepCopyAttributes');
            //隐藏
            this.controlEditBillingAddressStyle(false);
            //重置实例上的$dom表单项属性
            this.resetBillingAddressFormsDom();
            //更新PayModel数据模型上的账单地址数据
            this.payModel.trigger('PayModel:editBillingAddress', model.get('billingAddress'));
        }
    });

    return EditBillingAddressView;
});