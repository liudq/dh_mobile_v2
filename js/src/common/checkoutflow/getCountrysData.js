/**
 * module src: common/checkoutflow/getCountrysData.js
 * 获取国家地址列表模块
**/
define('checkoutflow/getCountrysData', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog', 'checkoutflow/getStatesData'], function(CONFIG, tip, dataErrorLog, getStatesData){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/biz-WordBook-countrylist.do',
            //url: 'biz-WordBook-countrylist.do',
            data: {
                //通用接口参数
                client: 'wap',
                version: '0.1'
            }
        };

        return {
            init: function(options) {
                //初始化配置对象
                this.setOptions(options);
                this.countryName = this.options.name.country;
                this.provinceName = this.options.name.province;
                this.countryid = this.options.id.country;
                this.provinceid = this.options.id.province;
                this.__callingcode = '';
                this.silent = this.options.silent;
                this.successCallback = this.options.successCallback;

                //判断是否有缓存，否则从服务端拉取国家列表数据
                if (!this.cache) {
                    //打开loading
                    tip.events.trigger('popupTip:loading', true);
                    //拉取数据
                    this.get();

                //有缓存的情况下，则直接从服务端拉取州省份列表数据
                } else {
                    this.fetchStatesData({
                        //当前选中的州省份名
                        name: this.provinceName,
                        //当前选中的州省份id
                        id: this.provinceid,
                        //国家地址列表
                        countrys: this.updateCountrysStatus(this.cache),
                        //当前选中的国家id
                        countryid: this.countryid,
                        //当前选中国家区号
                        __callingcode: this.__callingcode,
                        //成功回调
                        successCallback: this.successCallback,
                        //阻止事件回调函数的执行
                        silent: this.silent
                    });
                }
            },
            //配置对象初始化
            setOptions: function(options) {
                this.options = {
                    name: {
                        //国家名
                        country: '',
                        //州省份名
                        province: ''
                    },
                    id: {
                       //国家id
                       country: '77',
                       //州省份id
                       province: '77'
                    },
                    //阻止绑定在数据模型“countrys”和“steates”字段上的
                    //“change”事件，回调函数的执行，“false”为执行
                    silent: {
                        country: false,
                        province: false
                    },
                    //成功后的回调
                    successCallback: $.noop
                };
                $.extend(true, this.options, options||{});
            },
            //获取国家列表
            get: function() {
                $.ajax({
                    type: 'GET',
                    url: __params.url,
                    data: __params.data,
                    async: true,
                    cache: false,
                    dataType: 'json',
                    context: this,
                    success: function(res) {
                        //0x0000等于200成功状态
                        if (res.state==='0x0000') {
                            this.parse(res);
                        } else {
                            //数据异常，关闭loading
                            tip.events.trigger('popupTip:loading', false);
                            //展示数据接口错误信息【点击ok，关闭提示】
                            tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:res.message});
                            //捕获异常
                            try {
                                throw('success(): data is wrong');
                            } catch(e) {
                                //异常数据收集
                                dataErrorLog.events.trigger('save:dataErrorLog', {
                                    message: e,
                                    url: __params.url,
                                    params: __params.data,
                                    result: res
                                });
                            }
                        }
                    },
                    error: function(){
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，关闭提示】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
                        //捕获异常
                        try {
                            throw('error(): request is wrong');
                        } catch(e) {
                            //异常数据收集
                            dataErrorLog.events.trigger('save:dataErrorLog', {
                                message: e,
                                url: __params.url,
                                params: __params.data
                            });
                        }
                    }
                });
            },
            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * /mobileApiWeb/biz-WordBook-countrylist.do
             * 接口文档地址：
             * https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=15106096
             *
             * 原始数据结构
             * {
             *     "data":[{
             *         area":"N",
             *         callingcode":"93",
             *         chinaarea":"亚洲",
             *         countrycode":"004",
             *         countryid":"AF",
             *         currency":"AFN",
             *         description":"阿富汗",
             *         name":"Afghanistan",
             *         sortvalue":205,
             *         vaild":"1"
             *     }],
             *     "message":"Success",
             *     "serverTime":1446451501893,
             *     "state":"0x0000"
             * }
            **/
            parse: function(res) {
                /**
                 * 最终格式化为：
                 * {
                 *     code: 200,
                 *     countrys: [{
                 *         name: ''
                 *         countryid: ''
                 *         selected: false,
                 *         callingcode: ''
                 *     }]
                 * }
                **/
                var obj = {};
                obj.code = (res.state==='0x0000'?200:-1);

                if (obj.code !== -1) {
                    //更新国家列表数据
                    obj.countrys = this.updateCountrysStatus(res.data);

                    //拉取州省份数据
                    this.fetchStatesData({
                        //当前选中的州省份名
                        name: this.provinceName,
                        //当前选中的州省份id
                        id: this.provinceid,
                        //当前选中的国家id
                        countryid: this.countryid,
                        //国家地址列表
                        countrys: obj.countrys,
                        //当前选中国家区号
                        __callingcode: this.__callingcode,
                        //成功回调
                        successCallback: this.successCallback
                    });
                }
            },
            //更新国家列表状态
            updateCountrysStatus: function(list) {
                var self = this,
                    countrys = [],
                    countryid = this.countryid,
                    countryName = this.countryName,
                    //临时记录当前被选中的国家id索引
                    __index = -1;

                //没有缓存的情况下添加默认提示项数据
                if (!this.cache) {
                    countrys.push({
                        callingcode: '',
                        countryid: '77',
                        name: '--Choose a Country--',
                        selected: false
                    });
                }

                $.each(list, function(index, country){
                    var __obj = {};

                    __obj.name = country.name;
                    __obj.countryid = country.countryid;
                    __obj.callingcode = country.callingcode;

                    //查询是否选中selected:true
                    if (country.countryid !== countryid && country.name !== countryName) {
                        __obj.selected = false;
                    //反之
                    } else {
                        __index = index;
                        //临时存储当前选中国家区号
                        self.__callingcode = country.callingcode;
                        //设置选中项
                        __obj.selected = true;
                        //更新当前选中的国家id
                        self.countryid = country.countryid;
                    }

                    countrys.push(__obj);
                });

                //说明没有匹配到对应的国家
                if (__index < 0) {
                    //将国家区号设置为空（不可用）
                    this.__callingcode = '';
                    //将国家id设置为77（不可用）
                    this.countryid = '77';
                    //选中默认提示项
                    countrys[0].selected = true;
                }

                //将国家列表数据写入缓存
                this.cache = countrys;

                return countrys;
            },
            //拉取州省份数据
            fetchStatesData: function(options) {
                //拉取州省份数据
                getStatesData.init({
                    //当前选中的州省份名
                    name: options.name,
                    //当前选中的州省份id
                    id: options.id,
                    //当前选中的国家id
                    countryid: options.countryid,
                    //国家地址列表
                    countrys: options.countrys,
                    //当前选中国家区号
                    __callingcode: options.__callingcode,
                    //成功回调
                    successCallback: options.successCallback,
                    //阻止事件回调函数的执行
                    silent: this.silent
                });
            }
        };
});