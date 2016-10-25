/**
 * module src: payment/getCardAndDhpayInfo
 * 获取用户账户（DHPAY）、银行卡（CARD）以及绑定在卡上的账单地址的模块
**/
define('app/getCardAndDhpayInfo', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, tip, dataErrorLog){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/pay-Account-get.do',
            //url: 'pay-Account-get.do',
            data: {
                //通用接口参数
                client: 'wap',
                version: '0.1'
            }
        };

    return {
        get: function(model) {
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
                    //展示数据接口错误信息【点击ok，刷新页面】
                    tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Network anomaly.'});
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
         * /mobileApiWeb/pay-Account-get.do
         * 接口文档地址：
         * https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?spaceKey=SMS&title=04+Pay+API
         *
         * 说明：
         * 就目前WAP端业务而言并不会用到所有的字段信息
         *
         * 原始数据结构
         * {
         *     "data":{
         *         //银行卡列表信息
         *         "cards":[{
         *             //账单地址
         *             "billingAddress":{
         *                 "addressId":"ff808081505b327c01505f5a6b4d01fa",
         *                 "addressOne":"aaa",
         *                 "addressTwo":"aaa",
         *                 "aemail":"",
         *                 "city":"a",
         *                 "country":"US",
         *                 "countryName":"United States",
         *                 "email":"",
         *                 "fax":"",
         *                 "firstName":"saa",
         *                 "lastName":"111",
         *                 "mobilephone":"",
         *                 "orgName":"",
         *                 "state":"Alabama",
         *                 "telephone":"111111",
         *                 "userId":"ff80808134c16a2b0134c1a5951b000a",
         *                 "vatnum":"88888888",
         *                 "zipCode":"1111"
         *             },
         *             "cardHiddenNo":"423714******0001",
         *             "cardId":"ff808081505b327c01505f5a6b4d01fb",
         *             "cardNo":"423714******0001",
         *             "cardType":"VISA",
         *             "count":7,
         *             "csc":"",
         *             "expireMonth":"08",
         *             "expireYear":"26",
         *             "isExpire":false,
         *             "lastDate":1444893425000,
         *             "serialNumber":"20151015-151705199169",
         *             "status":"1",
         *             "userId":"ff80808134c16a2b0134c1a5951b000a",
         *             "uuid":"1"
         *         }],
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
         *         }
         *     },
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
        **/
        parse: function(res, model) {
            /**
             * 最终格式化为：
             * {
             *     code: 200,
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
             *         }
             *         ...
             *     ],
             *     dhpay: {
             *         active: true,
             *         balance: 0,
             *         cashbalance: 0,
             *         rebatebalance: 0
             *     }
             * }
            **/
            var obj = {};
            obj.code = (res.state==='0x0000'?200:-1);
            obj.cards = [];
            obj.__defaultIsAmex = false;
            obj.billingAddress = [];
            obj.dhpay = {};
            
            if (obj.code !== -1) {
                $.each(res.data.cards, function(index, card){
                    var __obj = {},
                        __obj1 = {};
                    
                    //如果过期则不展示该卡
                    if (card.isExpire) {
                        return;
                    }
                    
                    //判断默认展示的卡是否为amex卡
                    if (index === 0 && card.cardType === 'AMEX') {
                        obj.__defaultIsAmex = true;
                    }
                    
                    __obj.cardId = card.cardId;
                    __obj.cardNo = card.cardNo;
                    __obj.cardType = card.cardType;
                    __obj.expireMonth = card.expireMonth;
                    __obj.expireYear = card.expireYear;
                    __obj.csc = card.csc;
                    
                    __obj1.firstName = card.billingAddress.firstName;
                    __obj1.lastName = card.billingAddress.lastName;
                    __obj1.addressOne = card.billingAddress.addressOne;
                    __obj1.addressTwo = card.billingAddress.addressTwo||'';
                    __obj1.city = card.billingAddress.city;
                    __obj1.country = card.billingAddress.countryName;
                    __obj1.countryid = card.billingAddress.country;
                    __obj1.state = card.billingAddress.state;
                    __obj1.zipCode = card.billingAddress.zipCode;
                    __obj1.telephone = card.billingAddress.telephone;
                    __obj1.vatnum = card.billingAddress.vatnum||'';

                    obj.cards.push(__obj);
                    obj.billingAddress.push(__obj1);
                });
                
                obj.dhpay.active = res.data.myDHPay.active;
                obj.dhpay.balance = res.data.myDHPay.balance*1;
                obj.dhpay.cashbalance = res.data.myDHPay.cashbalance*1;
                obj.dhpay.rebatebalance = res.data.myDHPay.rebatebalance*1;
                
                //30毫秒的延时，确保PayModel:parse()中的数据“change”顺序
                setTimeout(function(){
                    //更新PayModel数据模型中的cards、billingAddress和dhpay字段
                    model.set({
                        cards: obj.cards,
                        __defaultIsAmex: obj.__defaultIsAmex,
                        billingAddress: obj.billingAddress,
                        dhpay: obj.dhpay
                    });
                },30);
                
                //数据准备完毕，关闭loading
                tip.events.trigger('popupTip:loading', false);
            }
        }
    };
});