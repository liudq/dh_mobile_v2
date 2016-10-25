/**
 * module src: common/detail/addToCart.js
 * 添加购物车
**/
define('common/detail/addToCart', ['common/config','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,tip,dataErrorLog){
       //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/cart-Cart-addToCart.do',
            //url: 'addToCart.json',
            data: {}
        };
     return {
        //获取需要传递的参数数据
        getParams: function(params) {
            var obj = {
                //通用参数
                client: 'wap',
                version: '3.0',
                //产品编号
                itemcode: params.submitData.itemCode,
                //产品id
                productId: params.submitData.productId,
                //卖家id
                supplierId: params.submitData.supplierid,
                //产品计量单位（单数）
                unit: params.submitData.unit,
                //skuMd5
                skuMd5: params.submitData.skuMd5,
                //skuId
                skuid: params.submitData.skuid,
                //库存国家
                stockIn: params.submitData.stockIn,
                //运达目的国家id
                shipToCountry: params.submitData.shipToCountry,
                //物流方式
                shipTypeId: params.submitData.shipTypeId,
                //购买的产品数量
                quantity: params.submitData.quantity,
                //url#号后面所传参数统计数据调用
                impressionInfo: params.submitData.impressionInfo
            };

            //__params捕获传递过来的参数数据
            $.extend(__params.data, obj);

            return obj;
        },
        //添加购物车
        fetch: function(options) {
            $.ajax({
                type: 'GET',
                url: __params.url,
                data: this.getParams(options),
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {                       
                        this.parse(res);
                    }else {
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
         * /mobileApiWeb/cart-Cart-addToCart.do
         * 接口文档地址：
         * http://192.168.76.42:8090/display/MOB/01.addToCart
         *
         * 原始数据结构
         * {
         *     "data": {
         *         //当前购物车数量
         *         "cartItemCount":""
         *     },
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
        **/
        parse: function(res) {
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //提示文案
            tip.events.trigger('popupTip:autoTip',{message:'1 item added to cart',timer:800});
            //更新购物车数量
            this.updateCartNum(res.data&&res.data.cartItemCount);
        },
        //更新页面上购物车的展示数量
        updateCartNum: function(num) {
            var $cHearCategoryBtn = $('.j-headCategoryBtn');
            //设置顶部左侧打开弹层购物车数量
            if ($cHearCategoryBtn.length > 0) {
                this.setCartSum($cHearCategoryBtn, num);
            }
            //更新页面上所有购物车数量
            $('.j-cartnum').html(num);
        },
        //设置顶部左侧打开弹层购物车数量
        setCartSum: function($ele, num){
            var dataValue = JSON.parse(decodeURIComponent($ele.attr('data-value'))),
                obj = {
                   messageSum: dataValue.messageSum,
                   cartSum: num,
                   nickName: dataValue.nickName,
                   buyerLevel: dataValue.buyerLevel
                };
           $ele.attr('data-value', escape(JSON.stringify(obj))); 
        }
    };
});