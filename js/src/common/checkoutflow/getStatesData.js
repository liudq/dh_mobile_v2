/**
 * module src: common/checkoutflow/getStatesData.js
 * 获取当前国家地址下的州省份地址列表模块
**/
define('checkoutflow/getStatesData', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, tip, dataErrorLog){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/biz-WordBook-provincelist.do',
            //url: 'biz-WordBook-provincelist.do',
            data: {}
        };

    return {
        init: function(options) {
            //初始化配置对象
            this.setOptions(options);
            this.provinceName = this.options.name;
            this.provinceid = this.options.id;
            this.countryid = this.options.countryid;
            this.countrys = this.options.countrys;
            this.__callingcode = this.options.__callingcode;
            this.silent = this.options.silent;
            this.successCallback = this.options.successCallback;
            //确保cahce对象在每次init的时候不会被重置
            this.cache = (typeof this.cache === 'object'?this.cache:{});

            //查看国家id是否为可用状态，此时州省份数据只能展示默认提示项
            if (this.countryid === '77') {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //返回国家、州省份数据
                this.returnCountrysAndStatesData({
                    countrys: this.countrys,
                    //默认提示项数据，并写入缓存
                    states: (this.cache[this.countrys] = [{
                        name: '--Choose a State/Province/Region--',
                        provinceid: '77',
                        selected: true
                    }]),
                    __callingcode: this.__callingcode,
                    silent: this.silent
                });
                return;
            }

            //判断是否有缓存，否则从服务端拉取州省份列表数据
            if (!this.cache[this.countryid]) {
                //打开loading
                tip.events.trigger('popupTip:loading', true);
                //拉取数据
                this.get();

            //有缓存的情况下，返回对应的数据
            } else {
                //返回国家、州省份数据
                this.returnCountrysAndStatesData({
                    countrys: this.countrys,
                    states: this.updateStatesStatus(this.cache[this.countryid]),
                    __callingcode: this.__callingcode,
                    silent: this.silent
                });
            }
        },
        //配置对象初始化
        setOptions: function(options) {
            this.options = {
                //州省份名
                name: '',
                //州省份id
                id: '',
                //当前选中的国家id
                countryid: '',
                //国家地址列表
                countrys: null,
                //当前选中国家区号
                __callingcode: '',
                //阻止绑定在数据模型“countrys”或“steates”字段上的
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
        //获取国家州省份接口参数数据
        getParams: function() {
            var obj = {
                //通用接口参数
                client: 'wap',
                version: '0.1',
                //当前选中国家id
                countryId: this.countryid
            };

            //__params捕获传递过来的参数数据
            $.extend(__params.data, obj);

            return obj;
        },
        //获取国家列表
        get: function() {
            $.ajax({
                type: 'GET',
                url: __params.url,
                data: this.getParams(),
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        //关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //数据格式化
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
         * /mobileApiWeb/biz-WordBook-provincelist.do
         * 接口文档地址：
         * https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=15106096
         *
         * 原始数据结构
         * {
         *     "data":[{
         *         "countryid":"AT",
         *         "name":"Burgenland",
         *         "provinceid":"AT1",
         *         "sortvalue":213
         *     }],
         *     "message":"Success",
         *     "serverTime":1446451742841,
         *     "state":"0x0000"
         * }
        **/
        parse: function(res) {
           /**
             * 最终格式化为：
             * {
             *     code: 200,
             *     states: [{
             *         name: ''
             *         provinceid: ''
             *         selected: false
             *     }]
             * }
            **/
            var obj = {};
            obj.code = (res.state==='0x0000'?200:-1);
            obj.states = [];

            if (obj.code !== -1) {
                //更新州省份列表数据
                obj.states = this.updateStatesStatus(res.data);

                //返回国家、州省份数据
                this.returnCountrysAndStatesData({
                    countrys: this.countrys,
                    states: obj.states,
                    __callingcode: this.__callingcode,
                    silent: this.silent
                });
            }
        },
        //更新州省份列表状态
        updateStatesStatus: function(list) {
            var states = [],
                provinceid = this.provinceid,
                provinceName = this.provinceName,
                //临时记录当前被选中的州省份id索引
                __index = -1;

            //没有缓存的情况下添加默认提示项数据
            if (!this.cache[this.countryid]) {
                states.push({
                    name: '--Choose a State/Province/Region--',
                    provinceid: '77',
                    selected: true
                });
            }

            $.each(list, function(index, state){
                var __obj = {};

                __obj.name = state.name;
                __obj.provinceid = state.provinceid;

                //查询是否选中selected:true
                if (state.provinceid !== provinceid && state.name !== provinceName) {
                    __obj.selected = false;
                //反之
                } else {
                    __index = index;
                    //设置选中项
                    __obj.selected = true;
                }

                states.push(__obj);
            });

            //说明没有匹配到对应的州省份，则默认选中州省份列表中的第一项
            if (__index < 0) {
                //设置选中项
                states[0].selected = true;
            }

            //将州省份数据写入缓存
            this.cache[this.countryid] = states;

            return states;
        },
        //返回国家、州省份列表数据
        returnCountrysAndStatesData: function(options) {
            //执行回调函数
            this.successCallback({
                countrys: options.countrys,
                states: options.states,
                __callingcode: options.__callingcode,
                silent: options.silent
            });
        }
    };
});
