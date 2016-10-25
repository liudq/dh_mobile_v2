/**
 * module src: payment/addCardAndBillingAddress.js
 * 向后台添加银行卡和账单地址的模块
**/
define('app/addCardAndBillingAddress', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, tip, dataErrorLog){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/pay-Card-add.do',
            //url: 'pay-Card-add.do',
            data: {}
        };

    return {
        init: function(options) {
            //初始化配置对象
            this.model = options.model;
            this.cards = options.cards;
            this.billingAddress = options.billingAddress;
            
            //保存银行卡和账单地址
            this.save(this.model);
        },
        //获取需要传递的参数数据
        getParams: function(cards, billingAddress) {
            var obj = {};
            //通用接口参数
            obj.client = 'wap';
            obj.version = '0.1';
            //银行卡
            obj.cardNo = cards[0].cardNo;
            obj.expireYear = cards[0].expireYear;
            obj.expireMonth = cards[0].expireMonth;
            //账单地址
            obj.firstName = billingAddress[0].firstName;
            obj.lastName = billingAddress[0].lastName;
            obj.addressOne = billingAddress[0].addressOne;
            obj.addressTwo = billingAddress[0].addressTwo;
            obj.city = billingAddress[0].city;
            obj.country = billingAddress[0].countryid;
            obj.state = billingAddress[0].state;
            obj.zipCode = billingAddress[0].zipCode;
            obj.telephone = billingAddress[0].telephone;
            obj.vatnum = billingAddress[0].vatnum;

            //__params捕获传递过来的参数数据
            $.extend(__params.data, obj);
            
            return obj;
        },
        save: function(model) {
            $.ajax({
                type: 'POST',
                url: __params.url,
                data: this.getParams(this.cards, this.billingAddress),
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        this.parse(res, model);
                    } else {
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，刷新页面】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:res.message});
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
         * /mobileApiWeb/pay-Card-add.do
         * 接口文档地址：
         * https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?spaceKey=SMS&title=04+Pay+API
         *
         * 原始数据结构
         * {
         *     "state": "0x0000", 
         *     "message": "state.success", 
         *     "data": {
         *         //银行卡id
         *         "cardId": "124552"
         *     }
         * }
        **/
        parse: function(res, model) {
            /**
             * 最终格式化为：
             * {
             *     code: 200,
             *     cardId: ''
             * }
            **/
            var obj = {};
            obj.code = (res.state==='0x0000'?200:-1);
            
            if (obj.code !== -1) {
                obj.cardId = res.data.cardId;
                
                //更新PayModel数据模型中的cards:cardId字段，并添加“__cardId”临时数据
                model.set({
                    cards:$.extend(true, [], model.get('cards'), [{cardId:obj.cardId}]),
                    __cardId: obj.cardId
                });
            }
        }
    };
});