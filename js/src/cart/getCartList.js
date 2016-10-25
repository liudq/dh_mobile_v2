/**
 * module src: placeOrder/getCartList.js
 * 更新CartListView数据模型中cartItemGroups下的字段
**/
define('app/getCartList', ['common/config', 'app/cartList','checkoutflow/popupTip', 'checkoutflow/dataErrorLog','app/formatTime'], function(CONFIG, cartList, tip, dataErrorLog,formatTime){
       //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/cart-Cart-getCartList.do',
            //url: 'data1.json',
            data: {
                //通用接口参数
                client: 'wap',
                version: '0.1'
            }
        };

    return {
        init: function(options) {
            //配置对象初始化
            this.cartList = options.cartList;
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

                        //获取选中的个数
                        this.cartList.getCheckNum();

                        //获取价格    
                        this.cartList.getPrice();

                    }else {
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，刷新页面】
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
         * mobileApiWeb/cart-Cart-getSave4LaterList.do
         * 接口文档地址：
         * http://m.dhgate.com/mobileApiWeb/cart-Cart-getSave4LaterList.do
         *
         * 说明：
         * 就目前WAP端业务而言并不会用到所有的字段信息
         *
         * 原始数据结构
         *{
         *   "data": {
         *       "cartItems": [
         *           {
         *               "amount": 1047.13,
         *               "canDelivery": true,
         *               "cartItemId": "ff80808151009cd0015110525f010047",
         *               "currency": "USD",
         *               "imgURL": "http://image.dhgate.com/100x100/f2/albu/g1/M00/00/00/wKjfHVXMjHiICIftAADIHJQhV4sAAAAGQL2LmAAAMg0878.jpg",
         *               "inventoryStatus": true,
         *               "itemCode": 154003160,
         *               "itemUrl": "product/a-line-wedding-dresses-for-seller-for-wedding/154003160.html",
         *               "leadingTime": 2,
         *               "maxQuantity": 9998,
         *               "minQuantity": 1,
         *               "price": 1047.13,
         *               "prodName": "A-Line Wedding Dresses for seller for Wedding & Events 081232",
         *               "quantity": 1,
         *               "sellStatus": true,
         *               "skuInfo": "[Black] [Ready to Wear] [Christmas] [Standard]",
         *               "skumd5": "3652df8f102797dd8e9057ea070dfe2f",
         *               "unit": "Piece"
         *           }
         *       ],
         *       "pageCount": 3,
         *       "totalCount": 30
         *   },
         *   "message": "Success",
         *   "serverTime": 1447652679061,
         *   "state": "0x0000"
        }
}
        **/
        parse: function(res, model) {
            var obj = {};
            obj.code = (res.state==='0x0000'?200:-1);
            /**
             * 最终格式化为：
             *   {
             *       //状态码
             *       code: -1,
             *       "cartItems": [
             *           {
             *               "amount": 1047.13,
             *               "canDelivery": true,
             *               "cartItemId": "ff80808151009cd0015110525f010047",
             *               "currency": "USD",
             *               "imgURL": "http://image.dhgate.com/100x100/f2/albu/g1/M00/00/00/wKjfHVXMjHiICIftAADIHJQhV4sAAAAGQL2LmAAAMg0878.jpg",
             *               "inventoryStatus": true,
             *               "itemCode": 154003160,
             *               "itemUrl": "product/a-line-wedding-dresses-for-seller-for-wedding/154003160.html",
             *               "leadingTime": 2,
             *               "maxQuantity": 9998,
             *               "minQuantity": 1,
             *               "price": 1047.13,
             *               "prodName": "A-Line Wedding Dresses for seller for Wedding & Events 081232",
             *               "quantity": 1,
             *               "sellStatus": true,
             *               "skuInfo": "[Black] [Ready to Wear] [Christmas] [Standard]",
             *               "skumd5": "3652df8f102797dd8e9057ea070dfe2f",
             *               "unit": "Piece"
             *           }
             *       ],
             *       //目的地国家
             *       shipToCountry: ''
             *  };
            **/
            var obj = {};
            obj.cartItemGroups = [];
            obj.code = res.state==='0x0000'?200:-1;
            if (obj.code !== -1  && res.data !="" && res.data.cartItemGroups != undefined) {
                $.each(res.data.cartItemGroups, function(index, pro){
                    var __obj = {};
                    __obj.cartItems = [];
                    $.each(pro.cartItems, function(_index, _pro){
                        var __obj1 = {};
                        __obj1.cartItemId = _pro.cartItemId;
                        __obj1.itemCode = _pro.itemCode;
                        __obj1.imgURL = _pro.imgURL;
                        __obj1.itemUrl = CONFIG.wwwURL + '/' + _pro.itemUrl;
                        __obj1.prodName = _pro.prodName;
                        __obj1.skuInfo = _pro.skuInfo;
                        __obj1.sellStatus = _pro.sellStatus;
                        __obj1.inventoryStatus = _pro.inventoryStatus;
                        __obj1.canDelivery = _pro.canDelivery;
                        __obj1.maxQuantity = _pro.maxQuantity;
                        __obj1.minQuantity = _pro.minQuantity;
                        __obj1.price = _pro.price;
                        __obj1.unit = _pro.unit;
                        __obj1.quantity = _pro.quantity;
                        __obj1.cheapen = _pro.cheapen?_pro.cheapen:'';
                        __obj1.endDate = _pro.endDate?formatTime.get(_pro.endDate):'';
                        __obj.cartItems.push(__obj1);                 
                    });
                    __obj.supplierName = pro.supplier.supplierName;
                    __obj.cartItemCount =pro.cartItemCount;

                    obj.cartItemGroups.push(__obj);
                });
                
                obj.shipToCountry = res.data.shipToCountry;
                
                //更新CartListView数据模型中cartItemGroups下的字段
                model.set({
                    obj: $.extend(true, {}, model.get('obj'), obj)
                });

                //cart列表渲染
                this.cartList.trigger('CartListView:render:renderCartList', obj);

                //重新初始化$dom对象自定义事件
                this.cartList.trigger('CartListView:render:initElement');
            }else{
                //更新CartListView数据模型中cartItemGroups下的字段
                model.set({
                    obj: obj
                });
                
                //cart列表渲染
                this.cartList.trigger('CartListView:render:renderCartList', obj);

                //重新初始化$dom对象自定义事件
                this.cartList.trigger('placeOrderView:render:initElement');
            }
        }
    };                                          
});