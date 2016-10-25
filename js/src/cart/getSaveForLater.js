/**
 * module src: cart/getSaveForLater.js
 * //更新saveForLaterModel数据模型中data下的字段
**/
define('app/getSaveForLater', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog','app/formatTime'], function(CONFIG, tip, dataErrorLog,formatTime){
       //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/cart-Cart-getSave4LaterList.do',
            //url: 'saveForLaterList.json',
            data: {
                //通用接口参数
                client: 'wap',
                version: '0.1',
                pageNo: 1,
                pageSize:10
            }
        };
    return {
        init: function(options) {
            //配置对象初始化
            this.saveForLaverList = options.saveForLaverList;
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
                        //关闭loading
                        tip.events.trigger('popupTip:loading', false);
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
                    //展示数据接口错误信息【点击ok，刷新页面】
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
             *       ]
             *  };
            **/
            var obj = {};
            obj.cartItems = [];
            obj.code = res.state==='0x0000'?200:-1;
            if (obj.code !== -1 && res.data.cartItems !==undefined) {
               $.each(res.data.cartItems,function(index,pro){
                    var __obj = {};
                    __obj.cartItemId = pro.cartItemId;
                    __obj.itemCode = pro.itemCode;
                    __obj.imgURL = pro.imgURL;
                    __obj.itemUrl = CONFIG.wwwURL + '/' + pro.itemUrl;
                    __obj.prodName = pro.prodName;
                    __obj.skuInfo = pro.skuInfo;
                    __obj.sellStatus = pro.sellStatus;
                    __obj.inventoryStatus = pro.inventoryStatus;
                    __obj.canDelivery = pro.canDelivery;
                    __obj.maxQuantity = pro.maxQuantity;
                    __obj.minQuantity = pro.minQuantity;
                    __obj.price = pro.price;
                    __obj.unit = pro.unit;
                    __obj.quantity = pro.quantity;
                    __obj.cheapen = pro.cheapen?pro.cheapen:'';
                    __obj.endDate = pro.endDate?formatTime.get(pro.endDate):'';
                    obj.cartItems.push(__obj);
                });
                
                obj.pageCount = res.data.pageCount;
                obj.totalCount = res.data.totalCount;  
                
                //更新saveForLaterModel数据模型中cartItems下的字段
                model.set({
                   // obj: $.extend(true, {}, model.get('obj'), obj)
                   obj: obj
                });
                //saveForLater渲染
                this.saveForLaverList.trigger('saveForLaterView:render:renderSaveForLater', obj);

                //重新初始化$dom对象自定义事件
                this.saveForLaverList.trigger('saveForLaterView:render:initElement');

                //showMore渲染
                this.saveForLaverList.trigger('saveForLaterView:render:renderShowMore',obj);

            }else{
                //更新saveForLaterModel数据模型中cartItems下的字段
                model.set({
                    obj: obj
                });
                //saveForLater列表渲染
                this.saveForLaverList.trigger('saveForLaterView:render:renderSaveForLater', obj);
                
                //重新初始化$dom对象自定义事件
                this.saveForLaverList.trigger('saveForLaterView:render:initElement');

                //showMore渲染
                this.saveForLaverList.trigger('saveForLaterView:render:renderShowMore',obj);
            }
        }
    };
});