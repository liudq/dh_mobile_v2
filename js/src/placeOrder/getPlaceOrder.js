/**
 * module src: placeOrder/getPlaceOrder.js
 * 重新拉取placeOrder初始化数据模块
**/
define('app/getPlaceOrder', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, tip, dataErrorLog){
       //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/order-Order-getPlaceOrderInfo.do',
            //url: 'placeOrder.json',
            data: {
                //通用接口参数
                client: 'wap',
                version: '0.1',
                needSplitOrder:1
            }
        };

    var GetPlaceOrder = function() {
        //初始化事件
        this.initElement();
    };

    //注册静态方法
    $.extend(GetPlaceOrder, {
        //初始化入口
        init: function() {
            return new GetPlaceOrder();
        }
    });

    //注册原型方法
    $.extend(GetPlaceOrder.prototype, {
        //事件初始化
        initElement: function() {
            (this.events=$({})).on('GetPlaceOrder:fetch', $.proxy(this.get, this));
        },
        //拉取业务数据
        get: function() {
            //初始化配置对象
            //arguments = [options] | [event, options]
            this.options = (!arguments[0].successCallback?arguments[1]:arguments[0]);

            //拉取数据
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
                        //关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //数据格式化
                        this.parse(res);
                    }else {
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，跳转到首页】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'gohome',message:res.message});
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
         * mobileWebApi/order-Order-getPlaceOrderInfo.do
         * 接口文档地址：
         * http://m.dhgate.com/mobileWebApi/order-Order-getPlaceOrderInfo.do
         *
         * 说明：
         * 就目前WAP端业务而言并不会用到所有的字段信息
         *
         * 原始数据结构
         * {
         *      "data": {
         *           //placeOrder金额信息
         *           "orderSummary": {
         *               "couponAmount": 10,
         *               "itemsSubtotal": 4188.52,
         *               "shippingCost": 28.42,
         *               "totalPrice": 4216.9400000000005
         *           },
         *           "shippingInfo": {
         *              "addressline1": "us",
         *              "addressline2": "us",
         *              "callingcode": "1",
         *              "city": "us",
         *               "country": "US",
         *              "countryname": "United States",
         *              "firstname": "xiaonannan",
         *              "lastname": "beibei",
         *              "postalcode": "11111",
         *              "shippingInfoId": "4028cca8501295c0015012f72e33002b",
         *              "state": "New York",
         *              "tel": "001-2121212121"
         *       },
         *            //商品信息
         *           "orders": [{
         *                   "orderId": 300053374,
         *                   "orderItemDTOList":[{
         *                      "cartItemDTO":{
         *                         quantity:''
         *                       },
         *                       "shippingMethodList":{
         *                          "carriersName": "01",
         *                          "freightAmountRealFinal": 888.42,
         *                          "freightCycle": "6-9",
         *                          "selected": true,
         *                          "shippingTypeId": "01"
         *                        }
         *                    }]
         *                    "couponDTO":{
         *                        campaignid:'',
         *                        amount:''
         *                    }
         *           ]}
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
        **/
        parse: function(res) {
            /**
             * 最终格式化为：
             *   {
             *       //状态码
             *       code: -1,
             *       orderSummary:{
             *           //itemsSubtotal总价
             *           itemsSubtotal:'',
             *           //运费总价
             *           shippingCost:'',
             *           //总价
             *           totalPrice:'',
             *           //coupon金额
             *           couponAmount:'',
             *           //运费节省
             *           shipCostSave:'',
             *           //满减
             *           orderSave:''
             *       },
             *       "shippingInfo": {
             *           "addressline1": "us",
             *           "addressline2": "us",
             *           "callingcode": "1",
             *           "city": "us",
             *           "country": "US",
             *           "countryname": "United States",
             *           "firstname": "xiaonannan",
             *           "lastname": "beibei",
             *           "postalcode": "11111",
             *           "shippingInfoId": "4028cca8501295c0015012f72e33002b",
             *           "state": "New York",
             *           "tel": "001-2121212121"
             *       },
             *       //商品信息
             *       "orders": [{
             *             "orderId": 300053374,
             *             "orderItemDTOList":[{
             *                "cartItemDTO":{
             *                 "cartItemId":"ff808081507ec3d201507eff751a0005"
             *                     "quantity":4
             *                 }
             *                 "shippingMethodList":[{
             *                     "carriersName": "01",
             *                     "freightAmountRealFinal": 888.42,
             *                     "freightCycle": "6-9",
             *                     "selected": true,
             *                     "shippingTypeId": "01"
             *                 }]
             *             }],
             *             "couponDTO":{
             *                  campaignid:'',
             *                  amount:''
             *             }
             *       ]}
             *  };
            **/
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            obj.orders =[];
            obj.orderSummary = {};
            obj.shippingInfo ={};

            if (obj.code !== -1) {
                $.each(res.data.orders, function(index,orders){
                    var __obj = {};
                    __obj.orderItemDTOList = [];
                    $.each(orders.orderItemDTOList, function(index, shopInfo){
                        var __obj1 = {};
                        __obj1.cartItemDTO ={};
                        __obj1.cartItemDTO.imgURL = shopInfo.cartItemDTO.imgURL;
                        __obj1.cartItemDTO.itemUrl = shopInfo.cartItemDTO.itemUrl;
                        __obj1.cartItemDTO.prodName = shopInfo.cartItemDTO.prodName;
                        __obj1.cartItemDTO.cartItemId = shopInfo.cartItemDTO.cartItemId;
                        __obj1.cartItemDTO.skuInfo = shopInfo.cartItemDTO.skuInfo;
                        __obj1.cartItemDTO.price = shopInfo.cartItemDTO.price;
                        __obj1.cartItemDTO.unit = shopInfo.cartItemDTO.unit;
                        __obj1.cartItemDTO.quantity = shopInfo.cartItemDTO.quantity;
                        __obj1.cartItemDTO.maxQuantity = shopInfo.cartItemDTO.maxQuantity;
                        __obj1.cartItemDTO.minQuantity = shopInfo.cartItemDTO.minQuantity;
                        __obj1.cartItemDTO.currency = shopInfo.cartItemDTO.currency;
                        __obj1.cartItemDTO.leadingTime = shopInfo.cartItemDTO.leadingTime;
                        __obj1.cartItemDTO.inventoryStatus = shopInfo.cartItemDTO.inventoryStatus;
                        __obj1.cartItemDTO.sellStatus = shopInfo.cartItemDTO.sellStatus;
                        __obj1.cartItemDTO.canDelivery = shopInfo.cartItemDTO.canDelivery;
                        __obj1.cartItemDTO.remark =  shopInfo.cartItemDTO.remark === undefined ? "":shopInfo.cartItemDTO.remark;
                        __obj1.shippingMethodList = [];
                        $.each(shopInfo.shippingMethodList, function(index, shipping){
                            var __obj2 = {};
                            __obj2.shippingTypeId = shipping.shippingTypeId;
                            __obj2.freightAmountRealFinal =shipping.freightAmountRealFinal;
                            __obj2.freightCycle =shipping.freightCycle;
                            __obj2.selected =shipping.selected;
                            __obj2.carriersName =shipping.carriersName;
                            __obj1.shippingMethodList.push(__obj2);
                        });
                        __obj.orderItemDTOList.push(__obj1);
                    });
                   __obj.orderId = orders.orderId;
                   __obj.supplier = orders.supplier;
                    //初始化coupon信息
                    if(orders.couponDTO !== undefined){
                        __obj.couponDTO = {};
                        __obj.couponDTO.campaignid = orders.couponDTO.campaignid;
                        __obj.couponDTO.amount = orders.couponDTO.amount;
                    }else{
                        __obj.couponDTO = {};
                        __obj.couponDTO.campaignid = "";
                        __obj.couponDTO.amount = "";
                    }
                    obj.orders.push(__obj);
                });

                //初始化接口金额信息
                data = res.data;
                obj.orderSummary.itemsSubtotal = data.orderSummary.itemsSubtotal;
                obj.orderSummary.shippingCost = data.orderSummary.shippingCost;
                obj.orderSummary.totalPrice = data.orderSummary.totalPrice;
                obj.orderSummary.couponAmount = data.orderSummary.couponAmount;
                obj.orderSummary.orderSave = data.orderSummary.orderSave;
                obj.orderSummary.shipCostSave = data.orderSummary.shipCostSave;

                //初始化接口运输地址信息
                if(typeof(data.shippingInfo) !== "undefined"){
                    obj.shippingInfo.shippingInfoId = data.shippingInfo.shippingInfoId;
                    obj.shippingInfo.firstname = data.shippingInfo.firstname;
                    obj.shippingInfo.lastname = data.shippingInfo.lastname;
                    obj.shippingInfo.zipCode = data.shippingInfo.postalcode;
                    obj.shippingInfo.countryname = data.shippingInfo.countryname;
                    obj.shippingInfo.countryid = data.shippingInfo.country;
                    obj.shippingInfo.state = data.shippingInfo.state;
                    obj.shippingInfo.tel = data.shippingInfo.tel;
                    obj.shippingInfo.addressline1 = data.shippingInfo.addressline1||'';
                    obj.shippingInfo.addressline2 = data.shippingInfo.addressline2||'';
                    obj.shippingInfo.city = data.shippingInfo.city;
                    obj.shippingInfo.vatnum = data.shippingInfo.vatNumber||'';
                }
                obj.isVisitor = data.isVisitor;
                //执行回调
                this.options.successCallback(obj);
            }
        }
    });

    return GetPlaceOrder.init();
});