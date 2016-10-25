/**
 * module src: placeOrder/editShipAddress.js
 * 编辑&保存运输地址信息
**/
define('app/editShipAddress', ['common/config','lib/backbone','appTpl/editshipAddressTpl','checkoutflow/getCountrysData', 'checkoutflow/regexpConfig', 'checkoutflow/popupTip'], function(CONFIG,Backbone,tpl,getCountrysAndStatesData, regexpConfig, tip){
    //model-编辑运输地址
    var editShipAddressModel = Backbone.Model.extend({
        //运输地址初始化属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: 200,
                //运输地址
                billingAddress:[{
                    //邮箱地址
                    email: '',
                    //运输地址id
                    shippingInfoId: '',
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
                __vatnum: '',
                //临时存储操作类型（edit：编辑，add：新建）
                __action: '',
                //临时存储用户访问类型（false：常规用户，true：游客）
                __usertype: ''
            };
        },
        /**
         * 初始化入口
         * argument[0|1]:
         * 0: [attributes]
         * 1: [options]
        **/
        initialize: function() {
            //拷贝初始化数据状态
            this.deepCopyDefaults();
            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            this.on('change:firstName', this.setFirstName, this);
            this.on('change:lastName', this.setLastName, this);
            this.on('change:email', this.setEmail, this);
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
            this.on('editShipAddressModel:getCountrysAndStates', this.getCountrysAndStates, this);
            //初始化运输地址数据事件
            this.on('editShipAddressModel:initShippingAddress', this.initShippingAddress, this);
            //重置模型数据事件
            this.on('editShipAddressModel:resetModel', this.resetModel, this);
        },
        //初始化运输地址的数据
        initShippingAddress: function(data) {
            this.set({billingAddress: $.extend([], this.get('billingAddress'), data)},{silent:true});
        },
        //重置模型数据
        resetModel: function() {
            $.extend(true, this.attributes, this.deepCopyDefaults());
        },
        //深拷贝defaults数据
        deepCopyDefaults: function() {
            return this.copyDefaults=this.copyDefaults||$.extend(true, {}, this.attributes);
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
                    //运输地址：国家
                    this.setCountry(this.getSelectedCountryAndStateNames().countryName, isValidate);
                    //运输地址：国家id
                    this.setCountryid(this.getSelectedCountryAndStateIds().countryId);
                    //运输地址：州省份
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
        //设置邮箱
        setEmail: function(value) {
            this.set({billingAddress:$.extend(true, [], this.get('billingAddress'), [{email:$.trim(value)}])},{silent:true, validate:true, type:'email'});
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
            if (options.type === 'firstName' || options.type === 'save' || options.type === 'saveEmail') {
                //console.log('validate: firstName');
                var field = options.type !== 'firstName'?'firstName':undefined;
                    res = this.validateFirstName(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:firstNameErrorTip');
                }
            }

            //姓校验
            if (options.type === 'lastName' || options.type === 'save' || options.type === 'saveEmail') {
                //console.log('validate: lastName');
                var field = options.type !== 'lastName'?'lastName':undefined,
                    res = this.validatelLastName(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:lastNameErrorTip');
                }
            }

            //邮箱校验（游客身份时需要校验）
            if (options.type === 'email' || options.type === 'saveEmail') {
                //console.log('validate: email');
                var field = options.type !== 'email'?'email':undefined,
                    res = this.validatelEmail(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:emailErrorTip');
                }
            }

            //地址1
            if (options.type === 'addressOne' || options.type === 'save' || options.type === 'saveEmail') {
                //console.log('validate: addressOne');
                var field = options.type !== 'addressOne'?'addressOne':undefined,
                    res = this.validatelAddress(attrs, 'addressOne', field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:addressOneErrorTip');
                }
            }

            //地址2
            if (options.type === 'addressTwo' || options.type === 'save' || options.type === 'saveEmail') {
                //console.log('validate: addressTwo');
                var field = options.type !== 'addressTwo'?'addressTwo':undefined,
                    res = this.validatelAddress(attrs, 'addressTwo', field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:addressTwoErrorTip');
                }
            }

            //城市校验
            if (options.type === 'city' || options.type === 'save' || options.type === 'saveEmail') {
                //console.log('validate: city');
                var field = options.type !== 'city'?'city':undefined,
                    res = this.validatelCity(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:cityErrorTip');
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
            if (options.type === 'zipcode' || options.type === 'save' || options.type === 'saveEmail') {
                //console.log('validate: zipcode');
                var field = options.type !== 'zipcode'?'zipcode':undefined,
                    res = this.validatelZipcode(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:zipcodeErrorTip');
                }
            }

            //电话号码校验
            if (options.type === 'telephone' || options.type === 'save' || options.type === 'saveEmail') {
                //console.log('validate: telephone');
                var field = options.type !== 'telephone'?'telephone':undefined,
                    res = this.validatelTelephone(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:telephoneErrorTip');
                }
            }

            //税号（增值税）校验
            if (options.type === 'vatnum' || options.type === 'save' || options.type === 'saveEmail') {
                //console.log('validate: vatnum');
                var field = options.type !== 'vatnum'?'vatnum':undefined,
                    res = this.validatelVatnum(attrs, field);
                //输入合法性校验
                if (typeof res === 'string') {
                    return res;
                //关闭错误提示
                } else {
                    this.trigger('editShipAddressView:close:vatnumErrorTip');
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
        //验证邮箱地址的有效性
        validatelEmail: function(attrs) {
            //console.log('into validatelEmail');
                //验证返回值
            var validateResult,
                //表单项类型
                field = arguments[1],
                value = attrs.billingAddress[0].email;
            //是否为空
            if (this.isNull(value)) {
                validateResult = !field?'isNull':'isNull-'+field;
            //是否合法
            } else if (!regexpConfig.email.test(value)) {
                validateResult = !field?'isValidate':'isValidate-'+field;
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

    //view-编辑运输地址信息
    var editShipAddressView =Backbone.View.extend({
        //根节点
        el: '.mainBox',
        //backbone提供的事件集合
        events: {
            'click .j-addNewAddress a': 'headerChange',
            'click .j-shipAddress-edit': 'openLayer',
            'click .j-editShipAddress-back': 'closeLayer',
            'click .j-ship-addresscon': 'newShippingAddress',
            'click .j-newShipAddress-back': 'newShippingAddressBack',
            'click .j-saveBillBtn': 'update',
            'blur .j-billEdit-firstname': 'setFirstName',
            'blur .j-billEdit-lastname': 'setLastName',
            'blur .j-email-value': 'setEmail',
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
        initialize: function(options){
            //配置对象初始化
            this.setOptions(options);
            this.cHtml = this.options.cHtml;
            this.cJShipAdressWarp = this.options.cJShipAdressWarp;
            this.cEditShipAdressOpen = this.options.cEditShipAdressOpen;
            this.cEditShipAdressClose = this.options.cEditShipAdressClose;
            this.cJEditHeader = this.options.cJEditHeader;
            this.cEshippAddressWarpClose = this.options.cEshippAddressWarpClose;
            this.cJEshippAddressWarp = this.options.cJEshippAddressWarp;
            this.cJEditShipAdressWarp = this.options.cJEditShipAdressWarp;
            this.cJEditShipAddress = this.options.cJEditShipAddress;
            this.cJEditShipAddressBack = this.options.cJEditShipAddressBack;
            this.cJNewShipAddressBack = this.options.cJNewShipAddressBack;
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
            this.shipAddressInstance = this.options.shipAddressInstance;
            this.emailInstance = this.options.emailInstance;
            this.saveEditAddressInstance = this.options.saveEditAddressInstance;
            this.placeOrder = this.options.placeOrder;
            this.userInfo = this.options.userInfo;
            this.indexs = {};
            this.ids = {};

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //html样式
                cHtml: 'htmlOverflow',
                //显示浮层外层包裹容器
                cEditShipAdressOpen:'editshipAdress-open',
                //关闭浮层外层包裹容器
                cEditShipAdressClose:'editshipAdress-close',
                //头部外层包裹容器
                cJEditHeader:'.j-edit-header',
                //关闭运输列表地址浮沉的classname
                cEshippAddressWarpClose:'shipAdress-close',
                //运输地址列表外层包裹容器
                cJEshippAddressWarp: '.j-shipAdressWarp',
                //编辑运输地址外层包裹容器
                cJEditShipAdressWarp:'.j-editshipAdressWarp',
                //编辑运输地址内容外层包裹容器
                cJEditShipAddress:'.j-editShipAddress',
                //编辑地址back外层包裹容器
                cJEditShipAddressBack:'.j-editShipAddress-back',
                //新建地址back外层包裹容器
                cJNewShipAddressBack:'j-newShipAddress-back',
                //国家列表外层包裹容器
                cCountrysWarp: '.j-countrys-warp',
                //州省份列表外层包裹容器
                cStatesWarp: '.j-states-warp',
                //税号（增值税）外层包裹容器
                cVatNumberWarp: '.j-billEdit-vatNumber-warp',
                //运输地址表单项
                billingAddressForms: {
                    //名
                    firstName: '.j-billEdit-firstname',
                    //姓
                    lastName: '.j-billEdit-lastname',
                    //邮箱
                    email: '.j-email-value',
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
                model: new editShipAddressModel(),
                //运输地址列表实例
                shipAddressInstance: null,
                //邮箱有效性验证实例
                emailInstance: null,
                //保存运输地址实例
                saveEditAddressInstance: null,
                //placeOrder
                placeOrder: null,
                //用户信息
                userInfo: null

            };
            $.extend(true, this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$window = this.$window || $(window);
            this.$cEditShipAdressOpen = $(this.cEditShipAdressOpen);
            this.$cEditShipAdressClose = $(this.cEditShipAdressClose);
            this.$cJEditHeader = $(this.cJEditHeader);
            this.$cJEshippAddressWarp = $(this.cJEshippAddressWarp);
            this.$cJEditShipAdressWarp = $(this.cJEditShipAdressWarp);
            this.$cJEditShipAddress = $(this.cJEditShipAddress);
            this.$cJEditShipAddressBack = $(this.cJEditShipAddressBack);
            this.$cCountrysWarp = $(this.cCountrysWarp);
            this.$cStatesWarp = $(this.cStatesWarp);
            this.$cVatNumberWarp = $(this.cVatNumberWarp);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;
            //在placeOrder上绑定关闭编辑运输地址弹层事件
            this.placeOrder.on('closeLayer', this.closeLayer, this);
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
            this.model.on('editShipAddressView:close:firstNameErrorTip', this.setFirstNameErrorTip, this);
            //在model上绑定关闭姓错误提示的事件
            this.model.on('editShipAddressView:close:lastNameErrorTip', this.setLastNameErrorTip, this);
            //在model上绑定关闭邮箱错误提示的事件
            this.model.on('editShipAddressView:close:emailErrorTip', this.setEmailErrorTip, this);
            //在model上绑定关闭地址1误提示的事件
            this.model.on('editShipAddressView:close:addressOneErrorTip', this.setAddressOneErrorTip, this);
            //在model上绑定关闭地址2误提示的事件
            this.model.on('editShipAddressView:close:addressTwoErrorTip', this.setAddressTwoErrorTip, this);
            //在model上绑定关闭城市错误提示的事件
            this.model.on('editShipAddressView:close:cityErrorTip', this.setCityErrorTip, this);
            //在model上绑定关闭国家错误提示的事件
            this.model.on('editShipAddressView:close:countryErrorTip', this.setCountryErrorTip, this);
            //在model上绑定关闭州省份错误提示的事件
            this.model.on('editShipAddressView:close:stateErrorTip', this.setStateErrorTip, this);
            //在model上绑定关闭邮编错误提示的事件
            this.model.on('editShipAddressView:close:zipcodeErrorTip', this.setZipcodeErrorTip, this);
            //在model上绑定关闭电话号码错误提示的事件
            this.model.on('editShipAddressView:close:telephoneErrorTip', this.setTelephoneErrorTip, this);
            //在model上绑定关闭税号错误提示的事件
            this.model.on('editShipAddressView:close:vatnumErrorTip', this.setVatnumErrorTip, this);

            //屏幕旋转事件
            //链接入口列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange, resize', function() {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function() {
                    self.setShipPopupStyle();
                }, 500);
            });
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
                    this.model.trigger('editShipAddressModel:getCountrysAndStates', {
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
                    this.model.trigger('editShipAddressModel:getCountrysAndStates', {
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
                this.model.trigger('editShipAddressModel:getCountrysAndStates', options);
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
        //设置邮箱地址
        setEmail: function(evt) {
            //console.log('view: setEmail');
            var $email = this.$email = this.$email||$(evt.target);
            this.model.trigger('change:email', $email.val());
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
            var $callingcode = this.$callingcode = this.$callingcode||$(this.billingAddressForms.callingcode);
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
            //邮箱
            } else if (options.type === 'email') {
                this.setEmailErrorTip(error, flag);
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
                $firstName = this.$firstName = this.$firstName||$(this.billingAddressForms.firstName),
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
                $lastName = this.$lastName = this.$lastName||$(this.billingAddressForms.lastName),
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
        //设置邮箱错误提示
        setEmailErrorTip: function(error) {
            //console.log('view: setEmailErrorTip');
            var flag = arguments[1],
                $email = this.$email = this.$email||$(this.billingAddressForms.email),
                $cErrorTip = $email.siblings(this.cErrorTip);
            //提示错误
            if (error === 'isNull') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $email,
                    errorElement: $cErrorTip,
                    errorText: 'Please enter a valid Email.',
                    autoLayer: flag
                });
            } else if (error == 'isValidate') {
                this.controlErrorStyle({
                    show: true,
                    formElement: $email,
                    errorElement: $cErrorTip,
                    errorText: 'Email is not valid.',
                    autoLayer: flag
                });
            //关闭提示
            } else {
                this.controlErrorStyle({
                    show: false,
                    formElement: $email,
                    errorElement: $cErrorTip,
                    errorText: ''
                });
            }
        },
        //设置地址1错误提示
        setAddressOneErrorTip: function(error) {
            //console.log('view: setAddressOneErrorTip');
            var flag = arguments[1],
                $addressOne = this.$addressOne = this.$addressOne||$(this.billingAddressForms.addressOne),
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
                $addressTwo = this.$addressTwo = this.$addressTwo||$(this.billingAddressForms.addressTwo),
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
                $city = this.$city = this.$city||$(this.billingAddressForms.city),
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
                $country = this.$country = this.$country||$(this.billingAddressForms.country),
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
                $state = this.$state = $(this.billingAddressForms.state),
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
                $zipcode = this.$zipcode = this.$zipcode||$(this.billingAddressForms.zipcode),
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
                $telephone = this.$telephone = this.$telephone||$(this.billingAddressForms.telephone),
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
                $vatnum = this.$vatnum = this.$vatnum||$(this.billingAddressForms.vatnum),
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
        //重置实例对象中billingAddressForms下的所有$属性
        resetBillingAddressFormsDom: function() {
            var self = this,
                name;
            /**
             * 删除实例对象上以下属性：
             * {
             *     $firstName: $dom,
             *     $lastName: $dom,
             *     $emial: $dom,
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
        //选择运输地址列表渲染
        render:function(data){
            //运输地址列表头部渲染
            this.headerBack();
            //编辑运输地址
            this.renderEditShippingAddressWarp(data);
            //重新初始化$dom对象
            this.initElement();
            //展示
            this.setStyle(true);
        },
        //运输地址列表头部渲染
        headerBack:function(){
            var template = this.template,
                //模板
                tpl = this.tpl,
               //运输地址列表渲染
               header = template(this.tpl.header.join(''));
            //页面绘制
            this.$cJEditHeader.html(header);
        },
        //编辑运输地址渲染
        renderEditShippingAddressWarp:function(data){
               //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //运输地址数据
                billingAddressData = this.model.get('billingAddress')[0],
                //国家列表数据
                countrysData = this.model.get('countrys'),
                //州省份列表数据
                statesData = this.model.get('states'),
                //编辑运输地址的主体内容模板
                shippingAddressEditMain = template(tpl.shippingAddressEditMain.join(''))(billingAddressData),
                //联系人的姓名模板
                name = template(tpl.name.join(''))(billingAddressData),
                //邮箱地址模板
                email = template(tpl.email.join(''))(data),
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
                //保存运输地址按钮模板
                save = template(tpl.save.join(''))(data);

            shippingAddressEditMain = shippingAddressEditMain.replace(/\{\{name\}\}/, name)
                                      .replace(/\{\{email\}\}/, email)
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
            this.$cJEditShipAddress.html(shippingAddressEditMain);
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
            return !!$(this.cErrorTip+':visible').length;
        },
        //打开浮层
        openLayer: function(e){
            //获取当前需要编辑的运输地址
            this.shipAddressInstance.model.trigger('shipAddressModel:getShippingAddress', {
                callback: $.proxy(function(shippingAddress){
                    //标记操作行为和用户访问类型
                    if (typeof e !== 'undefined') {
                        this.model.set({__action: 'edit'});
                    } else {
                        //只有在添加运输地址的时候确认是否为游客，
                        //这里需要考虑是userInfo中是否带有email
                        //数据，如果带有则肯定为注册过的用户
                        this.model.set({__action: 'add', __usertype: this.userInfo.isVisitor&&!this.userInfo.email});
                    }
                    //运输地址数据初始化
                    this.model.trigger('editShipAddressModel:initShippingAddress', shippingAddress);
                    //页面渲染
                    this.render(this.model.attributes);
                    //拉取数据
                    this.fetchCountrysAndStates({
                        id: {
                            country: this.model.get('billingAddress')[0]['countryid']
                        },
                        name: {
                            province: this.model.get('billingAddress')[0]['state']
                        },
                        //初始化强制不校验国家和州省份数据
                        isValidate: false
                    });
                }, this),
                shippingInfoId: this.getShippingInfoId(typeof e!=='undefined'?$(e.currentTarget):undefined)
            });
            //设置添加运输地址列表弹出层样式
            this.setShipPopupStyle();
        },
        //获取shippingInfoId
        getShippingInfoId: function(ele) {
            return ele!==undefined?JSON.parse(decodeURIComponent(ele.siblings('div[data-info]').attr('data-info'))).shippingInfoId:'';
        },
        headerChange:function(){
            //重置模型数据
            this.model.trigger('editShipAddressModel:resetModel');
            //展示浮层
            this.openLayer();
            $(this.cJEditShipAddressBack).next('.det-hdtitle').html("Add new Address");
        },
        //设置浮层展示样式
        setStyle: function(flag){
            if(flag){
                //显示浮层
                this.showLayer();
            }
        },
        //设置添加运输地址列表弹出层样式
        setShipPopupStyle: function() {
            var $shipAddressLayerScroll = $('.shipAddress-layer-scroll'),
                $siblings,
                windowHeight = $(window).height() * 1,
                sumHeight = 0;

            //不存在则跳出
            if (!$shipAddressLayerScroll[0]) {
                return;
            }

            //$ul同辈元素集合
            $siblings = $shipAddressLayerScroll.siblings();
            $.each($siblings, function(index, ele) {
                sumHeight += $(ele).outerHeight() * 1;
            });

            $shipAddressLayerScroll.css({
                height: windowHeight - sumHeight
            });
        },
        //显示浮层
        showLayer:function(){
            var $html = this.$html,
                $cJEditShipAdressWarp = this.$cJEditShipAdressWarp,
                cHtml = this.cHtml,
                cEditShipAdressOpen = this.cEditShipAdressOpen,
                cEditShipAdressClose = this.cEditShipAdressClose;

            //设置html/body样式
            $html.addClass(cHtml);
            $cJEditShipAdressWarp.show();

            //延时一段时间，然后再滑动显示展示
            setTimeout(function() {
                $cJEditShipAdressWarp.removeClass(cEditShipAdressClose).addClass(cEditShipAdressOpen);
            }, 10);
        },
        //关闭浮层
        closeLayer:function(){
            var $cJEditShipAdressWarp = this.$cJEditShipAdressWarp,
                cEditShipAdressOpen = this.cEditShipAdressOpen,
                cEditShipAdressClose = this.cEditShipAdressClose;

            //重置模型数据
            this.model.trigger('editShipAddressModel:resetModel');
            //重置实例上的$dom表单项属性
            this.resetBillingAddressFormsDom();

            $cJEditShipAdressWarp.removeClass(cEditShipAdressOpen).addClass(cEditShipAdressClose);

            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function() {
                $cJEditShipAdressWarp.hide();
            }, 510);
        },
        /**
         * 更新运输地址
        **/
        update: function(evt) {
            //console.log('view: update');
            var $saveBtn = $(evt.target),
                model = this.model,
                //错误类型
                errorType,
                //验证类型
                validateType = $saveBtn.attr('data-validate');

            //第一关：
            //当前页面上展示有错误提示则跳出更新运输地址
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

            //打开loading
            tip.events.trigger('popupTip:loading', true);

            //需要去服务端验证邮箱是否可用（saveEmail：为游客）
            if (validateType === 'saveEmail') {
                this.emailInstance.trigger('emailView:email', {
                    email: (this.$email||$(this.billingAddressForms.email)).val(),
                    //邮箱验证成功后才能执行保存的操作
                    successCallback: $.proxy(function(){
                        //请求服务端保存运输地址数据
                        this.saveEditAddressInstance.trigger('saveEditAddressView:saveEditAddress', {
                            data: $.extend(true, {}, this.model.get('billingAddress')[0]),
                            //保存成功重置相关数据
                            successCallback: $.proxy(function(){
                                //重置模型数据
                                this.model.trigger('editShipAddressModel:resetModel');
                                //重置实例上的$dom表单项属性
                                this.resetBillingAddressFormsDom();
                                //查看运输地址列表弹出层的展示状态来决定对$html的操作
                                this.$cJEshippAddressWarp.hasClass(this.cEshippAddressWarpClose)?this.$html.removeClass(this.cHtml):this.$html.addClass(this.cHtml);
                            },this)
                        });
                    }, this)
                });
            //反之直接执行保存操作
            } else {
                //请求服务端保存运输地址数据
                this.saveEditAddressInstance.trigger('saveEditAddressView:saveEditAddress', {
                    data: $.extend(true, {}, this.model.get('billingAddress')[0]),
                    //保存成功重置相关数据
                    successCallback: $.proxy(function(){
                        //重置模型数据
                        this.model.trigger('editShipAddressModel:resetModel');
                        //重置实例上的$dom表单项属性
                        this.resetBillingAddressFormsDom();
                        //查看运输地址列表弹出层的展示状态来决定对$html的操作
                        this.$cJEshippAddressWarp.hasClass(this.cEshippAddressWarpClose)?this.$html.removeClass(this.cHtml):this.$html.addClass(this.cHtml);
                    },this)
                });
            }
        },
        //新建运输地址
        newShippingAddress:function(){
            this.headerChange();
            this.$cJEditShipAddressBack.addClass(this.cJNewShipAddressBack);
        },
         //新建地址按返回按钮去掉htmlOverflow样式
         newShippingAddressBack:function(){
            this.$html.removeClass(this.cHtml);
         }
    });

    return editShipAddressView;
});