/**
 * module src: placeOrder/placeOrderupDateCart.js
 * placeOrder商品里点击更改产品数量
**/
define('app/placeOrderupDateCart', ['common/config','lib/backbone','app/getPlaceOrder','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,getPlaceOrder,tip,dataErrorLog){
    //model-placeOrder商品中点击更改产品数量
    var placeOrderupDateCartModel = Backbone.Model.extend({
        //点击更新placeOrder商品中产品数量
        defaults: function() {
            return {
                //状态码
                code: -1,
                //dom事件对象
                evt: null,
                //加入购物车产品数量
                quantity: 1,
                //需要删除的itemId
                cartItemIds: '',
                //产品价格
                price: 0,
                //成功或失败提示语
                message:''
            };
        },
        /**
         * 初始化入口
         * argument[0|1]:
         * 0: [attributes]
         * 1: [options]
        **/
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: CONFIG.wwwURL + '/mobileApiWeb/order-Order-updateCartItem.do',
                    //url: 'placeOrderupDateCart.json',
                    data: {
                        version: 3.3,
                        client: 'wap',
                        cartItemId: this.get('cartItemIds'),
                        quantity: this.get('quantity')
                    },
                    type: 'GET',
                    dataType: 'json',
                    async: true,
                    cache: false,
                    //发送到服务器的数据，将自动转换为请求字符串格式
                    //例如：{foo:["bar1", "bar2"]} 转换为 "&foo=bar1&foo=bar2"
                    //在此处显示告诉$.ajax()需要对象序列化，这样就不需要设置
                    //Backbone.emulateJSON = true
                    processData: true
                }
            };
            $.extend(true, this.options, options||{});
        },
        //设置生成模型的url
        urlRoot: function() {
            //return CONFIG.wwwURL + this.ajaxOptions.url;
            return this.ajaxOptions.url;
        },
       sync: function(method, model, options) {
            //请求异常的时候“dataErrorLog”会捕获“__params”
            this.__params = $.extend(true, {}, this.ajaxOptions, options||{});
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            return obj;
        }
    });

    //model-placeOrder商品中点击更改产品数量
    var placeOrderupDateCartView = Backbone.View.extend({
        //根节点
        el:'.mainBox',
        //backbone提供的事件集合
        events: {
            'focus .j-num': 'numInputFocus',
            'blur .j-num':'numInputBlur',
            'click .j-numIncrease': 'numIncrease',
            'click .j-numDecrease' : 'numDecrease'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.placeOrder = this.options.placeOrder;
            this.cJNum = this.options.cJNum;
            this.cJOrderDetails = this.options.cJOrderDetails;
            this.cJShippingCostWarp = this.options.cJShippingCostWarp;
            this.cJShippingCostA = this.options.cJShippingCostA;
            this.cJNumIncrease = this.options.cJNumIncrease;
            this.cJOdCon = this.options.cJOdCon;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化事件
            this.initEvent();

            //初始化$dom对象
            this.initElement();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cJNum = $(this.cJNum);
            this.$cJOrderDetails = $(this.cJOrderDetails);
            this.$cJShippingCostWarpA = $(this.cJShippingCostWarpA);
            this.$cJShippingCost = $(this.cJShippingCost);
            this.$cJNumIncrease = $(this.cJNumIncrease);
            this.$cJOdCon = $(this.cJOdCon);
        },
        //事件初始化
        initEvent: function() {
            //监听cartItemId
            this.listenTo(this.model, 'change:cartItemIds', this.resetAjaxOptions);
            //监听quantity
            this.listenTo(this.model, 'change:quantity', this.resetAjaxOptions);

            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //获取数量
                cJNum:'.j-num',
                //单个商品属性外层包裹容器
                cJOrderDetails:'.j-order-details',
                //运输方式包裹外层容器
                cJShippingCostWarp:'.j-shipping-cost-warp',
                //运输方式内容包裹外层容器
                cJShippingCostA:'.j-shipping-cost a',
                //增加产品数量外层包裹容器
                cJNumIncrease:'.j-numIncrease',
                //商品信息外层包裹容器
                cJOdCon:'.j-od-con',
                //数据模型
                model: new placeOrderupDateCartModel(),
                //placeOrder实例对象
                placeOrder: $({}),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                //调用初始化接口渲染页面
                this.getPlaceOrder(this.placeOrder.model);
            }else {
                //还原产品数量
                this.returnInputValue(this.numVal);
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，刷新页面】、有可能后端强制拆单需要刷新页面
                tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:response.message});
                //捕获异常
                try {
                    throw('success(): data is wrong');
                } catch(e) {
                    //异常数据收集
                    this.dataErrorLog.events.trigger('save:dataErrorLog', {
                        message: e,
                        url: this.model.__params.url,
                        params: this.model.__params.data,
                        result: response
                    });
                }
            }
        },
        //拉取数据失败回调
        error: function() {
            //还原产品数量
            this.returnInputValue(this.numVal);
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，刷新页面】、有可能后端强制拆单需要刷新页面
            tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Network anomaly.'});
            //捕获异常
            try {
                throw('error(): request is wrong');
            } catch(e) {
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
        },
        //重置ajax()配置对象
        resetAjaxOptions: function(){
            this.model.initialize({
                ajaxOptions: {
                    data: {
                        cartItemId: this.model.get('cartItemIds'),
                        quantity: this.model.get('quantity')
                    }
                }
            });
        },
        //获取itemId
        getCartItemId: function(e){
            var $target = $(e.target),
                $parent = $target.closest(this.cJOrderDetails);
            return JSON.parse(decodeURIComponent($parent.attr("data-info")))['cartItemId'];
        },
        getNum:function(e){
            var $target = $(e.target);
            return $target.attr('type')==='text'?$target.val():$($target.siblings(this.cJNum)).val();
        },
        //商品最大可卖数量、商品最低起售数量
        soldQuantity: function(i,$num,e){
            var cJNum = this.cJNum,
                cJerrorInfo = this.cJerrorInfo,
                cJOdCon= this.cJOdCon,
                $target = $(e.target),
                $error = $target.closest(cJOdCon).next(cJerrorInfo),
                $num = $target.attr('type')==='text'?$target:$($target.siblings(this.cJNum)),
                sellStatus = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['sellStatus'],
                min = this.min = $num.attr('min'),
                max = this.max = $num.attr('max');
            $error.html("");
            if(i > max){
                i = parseInt(max);
                $error.html($.lang["PO_only"]+"&nbsp;"+min+"&nbsp;"+$.lang["PO_to"]+"&nbsp;"+max+"&nbsp;"+$.lang["PO_is_allow"]).show();
            }
            if(i < min){
                i = parseInt(min);
                $error.html($.lang["PO_only"]+"&nbsp;"+min+"&nbsp;"+$.lang["PO_to"]+"&nbsp;"+max+"&nbsp;"+$.lang["PO_is_allow"]).show();
            }
            if(sellStatus === false){
               $error.hide();
            }
            return i;
        },
        //购物车列表点击增加产品数量
        numIncrease: function(e){
            var _self = this,
                cJNum = this.cJNum,
                cJerrorInfo = this.cJerrorInfo,
                cJOdCon= this.cJOdCon,
                $target = $(e.target),
                sellStatus = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['sellStatus'],
                inventorystatus = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['inventorystatus'],
                canDelivery = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['canDelivery'],
                $error = $target.closest(cJOdCon).next(cJerrorInfo),
                $num = this.$num =  $target.prev(cJNum),
                numVal,
                i,
                rei;

            if(sellStatus === false ||  canDelivery == false){
                return;
            }

            if(!$num.val() || isNaN($num.val())){
                $error.text($.lang["PO_number_allow"]).show();
                return;
            }

            numVal = this.numVal = $num.attr('data-value');
            i = parseInt($($num).val())+1,
            rei = _self.soldQuantity(i,$num,e);

            if(rei == numVal) return;

            numVal = rei;
            $num.val(numVal);

            //显示loadding弹层
            tip.events.trigger('popupTip:loading', true);
            //获取CartItemId
            this.model.set({cartItemIds: this.getCartItemId(e)});
            //加入购物车获取产品数量的值
            this.model.set({quantity: this.getNum(e)});
            //拉取数据
            this.model.fetch();
        },
        //购物车列表获得焦点发送请求
        numInputAjax: function(e){
            var $target = $(e.target),
                cJerrorInfo = this.cJerrorInfo,
                cJOdCon= this.cJOdCon,
                $error = $target.closest(cJOdCon).next(cJerrorInfo),
                sellStatus = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['sellStatus'],
                inventorystatus = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['inventorystatus'],
                canDelivery = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['canDelivery'];

            if(sellStatus === false ||  canDelivery == false){
                return;
            }

            //获取CartItemId
            this.model.set({cartItemIds: this.getCartItemId(e)});

            //显示loadding弹层
            tip.events.trigger('popupTip:loading', true);

            //加入购物车获取产品数量的值
            this.model.set({quantity: this.getNum(e)});

            //拉取产品数据
            this.model.fetch();
        },
        //购物车列表点击失去焦点输入框
        numInputBlur: function(e){
            var _self = this,
                cJNum = this.cJNum,
                cJerrorInfo = this.cJerrorInfo,
                $target = $(e.target),
                cJOdCon= this.cJOdCon,
                $error = $target.closest(cJOdCon).next(cJerrorInfo),
                $num = $($target),
                i = parseInt($($num).val()),
                rei,
                numVal = this.numVal,
                canDelivery = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['canDelivery'];

            if(canDelivery == false){
                return $num.val(numVal);
            }

            if(!i||isNaN(i)){
               $error.text($.lang["PO_only_number"]).show();
                return;
            }

            rei = _self.soldQuantity(i,$num,e);
            
            numVal = rei;
            $num.val(rei);

            this.numInputAjax(e);
        },
        //购物车列表点击获得焦点输入框
        numInputFocus: function(e){
            var $target = this.$num = $(e.target),
                numVal = this.numVal = $target.attr('data-value'),
                cJerrorInfo = this.cJerrorInfo,
                cJOdCon= this.cJOdCon,
                $target = $(e.target),
                $error = $target.closest(cJOdCon).next(cJerrorInfo);

            $error.html("");
        },
        //购物车列表点击减少产品数量
        numDecrease: function(e){
            var _self = this,
                cJNum = this.cJNum,
                cJerrorInfo = this.cJerrorInfo,
                cJOdCon= this.cJOdCon,
                $target = $(e.target),
                $error = $target.closest(cJOdCon).next(cJerrorInfo),
                $num = this.$num = $target.next(cJNum),
                sellStatus = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['sellStatus'],
                canDelivery = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['canDelivery'],
                numVal,
                i,
                rei;

            if(canDelivery == false){
                return;
            }

            if(!$num.val() || isNaN($num.val())){
                $error.show();
                return;
            }

            numVal = this.numVal = $num.attr('data-value'),
            i = parseInt($($num).val())-1,
            rei = _self.soldQuantity(i,$num,e);

            if(rei == numVal) return;

            numVal = rei;
            $num.val(numVal);

            //显示loadding弹层
            tip.events.trigger('popupTip:loading', true);

            //获取CartItemId
            this.model.set({cartItemIds: this.getCartItemId(e)});

            //加入购物车获取产品数量的值
            this.model.set({quantity: this.getNum(e)});

            //拉取产品数据
            this.model.fetch();
        },
        //当改变产品数量发生错误时，将input的还到上一次的结果
        returnInputValue: function(value){
            this.$num.val(value);
        },
        //增加购物车数量产品单价更新
        upaDatePrice : function(response,evt){
            var $target = $(evt.target),
                $cJItemPrice = this.$cJItemPrice,
                $cJTotalPrice = this.$cJTotalPrice,
                $parent =$target.closest(".ui-number").prev(".unit-price").find($cJItemPrice),
                carList = this.carList,
                data = response.data.cartItems;

            $parent.text(data.price);

            //调取总价格方法
            $cJTotalPrice.text(carList.getTotalPrice());
        },
        //调用初始化接口
        getPlaceOrder:function(model){
            getPlaceOrder.events.trigger('GetPlaceOrder:fetch', {
                //保存成功重置相关数据
                successCallback: $.proxy(function(res){
                    model.set({
                       orderSummary: $.extend(true, {}, model.get('orderSummary'), res.orderSummary),
                       shippingInfo: res.shippingInfo,
                       orders: res.orders
                    });
                    //更新商品金额渲染
                    this.placeOrder.trigger('placeOrderView:render:renderProductInfoAmount', res);
                    //重新初始化$dom对象自定义事件
                    this.placeOrder.trigger('placeOrderView:render:initElement');
                    //运输方式渲染
                    this.placeOrder.trigger('placeOrderView:render:renderShipping', res);
                    //当前coupon信息绘制
                    this.placeOrder.trigger('placeOrderView:render:renderCoupon',res);
                }, this)
            });
        }
    });

    return placeOrderupDateCartView;
});

