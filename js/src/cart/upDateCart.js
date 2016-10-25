/**
 * module src: cart/upDateCart.js
 * 购物车列表点击增加&&减少产品数量
**/
define('app/upDateCart', ['common/config','lib/backbone','app/getCartList','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,getCartList,tip,dataErrorLog){
    //model-购物车列表点击增加&&减少产品数量
    var upDateCartModel = Backbone.Model.extend({
        //点击更新购物车列表产品数量
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
                    url: CONFIG.wwwURL + '/mobileApiWeb/cart-Cart-updateCartItem.do',
                    //url: 'upDateCart.json',
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
        //为适配non-RESTful服务端接口，重载model.sync
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
    //model-购物车列表点击增加 && 减少产品数量
    var upDateCartView = Backbone.View.extend({
        //根节点
        el:'.j-wrap-order',
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
            this.cJOrderDetails = this.options.cJOrderDetails;
            this.cJerrorInfo = this.options.cJerrorInfo;
            this.cJNum = this.options.cJNum;
            this.cJItemPrice = this.options.cJItemPrice;
            this.cJTotalPrice = this.options.cJTotalPrice;
            this.model = this.options.model;
            this.cartList = this.options.cartList;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化事件
            this.initEvent();

            //初始化$dom对象
            this.initElement();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cJOrderDetails = $(this.options.cJOrderDetails);
            this.$cJerrorInfo = $(this.options.cJerrorInfo);
            this.$cJNum = $(this.options.cJNum);
            this.$cJItemPrice = $(this.options.cJItemPrice);
            this.$cJTotalPrice = $(this.options.cJTotalPrice);
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
                //查看购物车列表单个产品外层包裹容器
                cJOrderDetails:'.j-orderDetails',
                //产品单价
                cJItemPrice:'.j-itemPrice',
                //购物车中选中的总价格
                cJTotalPrice:".j-totalPrice",
                //获取数量
                cJNum:'.j-num',
                //错误提示信息
                cJerrorInfo:'.j-errorInfo',
                //数据模型
                model: new upDateCartModel(),
                //购物车列表实例对象
                cartList: null,
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
                //关闭loading
               tip.events.trigger('popupTip:loading', false);

               this.upaDatePrice(response,model.get('evt'));

               //拉取数据成功调用cart初始化接口
               getCartList.get(this.cartList.model);

            }else {
                //还原产品数量
                this.returnInputValue(this.numVal);
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
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
        error: function() {
            //还原产品数量
            this.returnInputValue(this.numVal);
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            //展示数据接口错误信息【点击ok，关闭提示】
            tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
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
            var cartItemIds = [];
            cartItemIds.push($($(e.target).closest(this.cJOrderDetails)).attr('cartItemId'));
            return cartItemIds.join(',');
        },
        //获取产品数量值
        getNum: function(e){
            var $target = $(e.target);
            return $target.attr('type')==='text'?$target.val():$($target.siblings(this.cJNum)).val();
        },

        //商品最大可卖数量、商品最低起售数量
        soldQuantity: function(i,$num,e){
            var cJNum = this.cJNum,
                cJerrorInfo = this.cJerrorInfo,
                $target = $(e.target),
                $error  = $target.parent().next(cJerrorInfo),
                $num = $target.attr('type')==='text'?$target:$($target.siblings(this.cJNum)),
                min = $num.attr("min"),
                max = $num.attr("max");

            $error.html("");

            if(i > max){
                i = parseInt(max);
                $error.html($.lang["PO_only"]+"&nbsp;"+min+"&nbsp;"+$.lang["PO_to"]+"&nbsp;"+max+"&nbsp;"+$.lang["PO_is_allow"]).show();
            }
            if(i < min){
                i = parseInt(min);
                $error.html($.lang["PO_only"]+"&nbsp;"+min+"&nbsp;"+$.lang["PO_to"]+"&nbsp;"+max+"&nbsp;"+$.lang["PO_is_allow"]).show();
            }
            return i;
        },
        //购物车列表点击增加产品数量
        numIncrease: function(e){
            var _self = this,
                cJNum = this.cJNum,
                cJerrorInfo = this.cJerrorInfo,
                $target = $(e.target),
                $error  = $target.parent().next(cJerrorInfo),
                $num = this.$num = $target.prev(cJNum),
                sellStatus = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['sellStatus'],
                numVal,
                i,
                rei;

            if(!$num.val() || isNaN($num.val())){
                $error.text($.lang["PO_number_allow"]).show();
                return;
            }

            if(sellStatus === false){
                $error.html($.lang["PO_item_sold_out"]).show();
                return;
            }

            numVal = this.numVal = $num.attr('data-value');
            i = parseInt($($num).val())+1;
            rei = _self.soldQuantity(i,$num,e);

            if(rei == numVal) return;

            numVal  =  rei;
            $num.val(numVal);

            //显示loadding弹层
            tip.events.trigger('popupTip:loading', true);

            //获取CartItemId
            this.model.set({evt: e, cartItemIds: this.getCartItemId(e)});

            //加入购物车获取产品数量的值
            this.model.set({evt: e, quantity: this.getNum(e)});

            //拉取产品数据
            this.model.fetch();

            //调用cart列表接口
            getCartList.init({
                cartList: this.cartList
            });
        },
        //购物车列表获得焦点发送请求
        numInputAjax: function(e){
            //显示loadding弹层
            tip.events.trigger('popupTip:loading', true);

            //获取CartItemId
            this.model.set({evt: e, cartItemIds: this.getCartItemId(e)});

            //加入购物车获取产品数量的值
            this.model.set({evt: e, quantity: this.getNum(e)});

            //拉取产品数据
            this.model.fetch();

             //调用cart列表接口
            getCartList.init({
                cartList: this.cartList
            });
        },
        //购物车列表点击失去焦点输入框
        numInputBlur:function(e){
            var _self = this,
                cJNum = this.cJNum,
                cJerrorInfo = this.cJerrorInfo,
                $target = $(e.target),
                $error  = $target.parent().next(cJerrorInfo),
                $num = $($target),
                i = parseInt($($num).val()),
                sellStatus = JSON.parse(decodeURIComponent($target.closest(this.cJOrderDetails).attr("data-info")))['sellStatus'],
                rei,
                numVal = this.numVal;

            if(!i||isNaN(i)){
                $error.text($.lang["PO_only_number"]).show();
                return;
            }

            rei = _self.soldQuantity(i,$num,e);

            //输入文本值和最大最小起动量相等时，不发送请求
            if(rei == numVal){
                numVal = rei;
                $num.val(numVal);
                return;
            };
            
            if(sellStatus == false){
                $error.html($.lang["PO_item_sold_out"]).show();
                return;
            }

            this.numInputAjax(e);
        },
        //购物车列表点击获得焦点输入框
        numInputFocus: function(e){
            var $target = this.$num = $(e.target),
                numVal = this.numVal = $target.attr('data-value'), 
                cJerrorInfo = this.cJerrorInfo,
                $error  = $target.parent().next(cJerrorInfo);
            $error.html("");
        },
        //购物车列表点击减少产品数量
        numDecrease: function(e){
            var _self = this,
                cJNum = this.cJNum,
                cJerrorInfo = this.cJerrorInfo,
                $target = $(e.target),
                $error  = $target.parent().next(cJerrorInfo),
                $num = this.$num = $target.next(cJNum),
                numVal,
                i,
                rei;

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
            this.model.set({evt: e, cartItemIds: this.getCartItemId(e)});

            //点击移除购物车获取产品数量的值
            this.model.set({evt: e, quantity: this.getNum(e)});

            //拉取产品数据
            this.model.fetch();

            //调用cart列表接口
            getCartList.init({
                cartList: this.cartList
            });
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
                cartList = this.cartList,
                data = response.data.cartItem;

            $parent.text(data.price);

            //调取总价格方法
            $cJTotalPrice.text(cartList.getTotalPrice());
        }
    });

    return upDateCartView;
});

