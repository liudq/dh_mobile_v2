/**
 * module src: placeOrder/getShippingAddressList.js
 * 更新shippingAddressList（运输地址列表）数据模型中data中的字段
**/
define('app/getShippingAddressList', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, tip, dataErrorLog){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/user-Shipping-getShippingAddressList.do',
            //url: 'getShippingAddressList.json',
            data: {
                //通用接口参数
                client: 'wap',
                version: '0.1'
            }
        };
    return {
        init: function(options) {
            //配置对象初始化
            this.placeOrder = options.placeOrder;
        },
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
                    }else {
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
         * /mobileApiWeb/user-Shipping-getShippingAddressList.do
         * 接口文档地址：
         * http://m.dhgate.com/mobileApiWeb/user-Shipping-getShippingAddressList.do
         *
         * 说明：
         * 就目前WAP端业务而言并不会用到所有的字段信息
         *
         * 原始数据结构
         * {
         *     "data":[{
         *           "addressline1": "us",
         *           "addressline2": "us",
         *           "callingcode": "1",
         *           "city": "US",
         *           "country": "US",
         *           "countryname": "United States",
         *           "firstname": "us",
         *           "lastname": "us",
         *           "postalcode": "11111",
         *           "shippingInfoId": "65a6e33d-335c-4efe-b0b9-40e4d27b0ada",
         *           "state": "New York",
         *           "tel": "001-2121212121"
         *       }],
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
        **/
        parse: function(res, model) {
            var obj = {};
            obj.code = (res.state==='0x0000'?200:-1);
            /**
             * 最终格式化为：
             *   {
             *       //状态码
             *       code: -1,
             *       data:[{
             *           "addressline1": "us",
             *           "addressline2": "us",
             *           "callingcode": "1",
             *           "city": "US",
             *           "country": "US",
             *           "countryname": "United States",
             *           "firstname": "us",
             *           "lastname": "us",
             *           "postalcode": "11111",
             *           "shippingInfoId": "65a6e33d-335c-4efe-b0b9-40e4d27b0ada",
             *           "state": "New York",
             *           "tel": "001-2121212121"
             *       }],
             *  };
            **/
            var obj = {};
            obj.list =[];
            obj.code = res.state==='0x0000'?200:-1;

            if (obj.code !== -1) {
                //运输地址列表信息
                $.each(res.data,function(index,pro){
                    var __obj ={};
                    __obj.email = pro.email||'';
                    __obj.shippingInfoId = pro.shippingInfoId;
                    __obj.firstname = pro.firstname;
                    __obj.lastname = pro.lastname;
                    __obj.zipCode = pro.postalcode;
                    __obj.country = pro.countryname;
                    __obj.countryid = pro.country;
                    __obj.state = pro.state;
                    __obj.telephone = pro.tel;
                    __obj.addressline1 = pro.addressline1;
                    __obj.addressline2 = pro.addressline2||'';
                    __obj.city = pro.city;
                    __obj.vatnum = pro.vatNumber||'';
                    obj.list.push(__obj);
                });

                //更新shipAddressModel数据模型中list下的字段
                model.set({list: obj.list});
                //运输地址列表绘制
                this.placeOrder.trigger('shipAddressView:render:shippingAddressList',model.attributes);
                //展示当前默认运输地址
                this.placeOrder.trigger('showAddress');
            }
        }
    };
});