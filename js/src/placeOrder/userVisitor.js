/**
 * module src: placeOrder/userVisitor.js
 * 点击placeOrder按钮游客自动注册登录
**/
define('app/userVisitor', ['common/config','lib/backbone','app/getPlaceOrder','app/remark','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,Backbone,getPlaceOrder,remark,tip,dataErrorLog){
    //placeOrder按钮游客自动注册登录
    var userVisitorModel = Backbone.Model.extend({
        //placeOrder按钮游客自动注册登录
        defaults: function() {
            return {
                //状态码
                code: -1
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
                    url:CONFIG.wwwURL +  '/mobileApiWeb/user-Visitor-register.do',
                    //url: 'user-Visitor.json',
                    data: {
                        version: 3.3,
                        client: 'wap'
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
        /**
         * parse（数据格式化）
         *
         * 接口地址：
         * /mobileApiWeb/order-Order-submitToPayment.do
         * 接口文档地址：
         * http://m.dhgate.com/mobileApiWeb/order-Order-submitToPayment.do
         *
         * 说明：
         * 就目前WAP端业务而言并不会用到所有的字段信息
         *
         * 原始数据结构
         * {
         *     "data":{
         *         //订单金额
         *         "amount":"true",
         *         //订单orderId
         *         orderIds:''
         *     },
         *     "message":"Success",
         *     "serverTime":1444979606798,
         *     "state":"0x0000"
         * }
        **/
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            if (obj.code !== -1) {

            }
            return obj;
        }
    });

    //model-placeOrder按钮游客自动注册登录
    var userVisitorView = Backbone.View.extend({
        //根节点
        el:'.mainBox',
        //backbone提供的事件集合
        events: {
            'click .j-submit': 'placeOrderSubmit',
            'blur .j-remark': 'addremark'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cJProList = this.options.cJProList;
            this.cJOrderDetails = this.options.cJOrderDetails;
            this.cJRemark = this.options.cJRemark;
            this.jRemark = this.options.jRemark;
            this.cRemarkError = this.options.cRemarkError;
            this.cJErrorInfo = this.options.cJErrorInfo;
            this.cJRemarkInput = this.options.cJRemarkInput;
            this.cOnSubmit = this.options.cOnSubmit;
            this.cJSubmit = this.options.cJSubmit;
            this.cSubmit = this.options.cSubmit;
            this.model = this.options.model;
            this.placeOrder = this.options.placeOrder;
            this.userInfo = this.options.userInfo;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //$dom对象初始化
        initElement: function() {
            this.$cJProList = $(this.cJProList);
            this.$cJOrderDetails = $(this.cJOrderDetails);
            this.$cJRemark = $(this.cJRemark);
            this.$jRemark = $(this.jRemark);
            this.$cRemarkError = $(this.cRemarkError);
            this.$cJErrorInfo = $(this.cJErrorInfo);
            this.$cJRemarkInput = $(this.cJRemarkInput);
            this.$cOnSubmit = $(this.cOnSubmit);
            this.$cJSubmit = $(this.cJSubmit);
            this.$cSubmit = $(this.cSubmit);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //商品信息外层包裹容器
                cJProList:'.j-proList',
                //商品属性信息外层包裹容器
                cJOrderDetails:'.j-order-details',
                //评论外层包裹容器
                cJRemark:'.j-remark',
                //评论样式
                jRemark:'j-remark',
                //备注错误信息提示样式
                cRemarkError:'remark-error',
                //提示错误信息外层包裹容器
                cJErrorInfo:'.j-errorInfo',
                //评论样式文本属性值外层包裹容器
                cJRemarkInput:'.j-remark textarea',
                //placeOrder按钮置灰
                cOnSubmit:'.onsubmit',
                //placeOrder按钮可点击状态
                cSubmit:'submit',
                //placeOrder按钮点击事件样式
                cJSubmit:'j-submit',
                //数据模型
                model: new userVisitorModel(),
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
                //点击placeOrder按钮调用备注接口传参
                remark.init({
                    placeOrder: this.placeOrder,
                    cartItemId:this.getCartItemId(),
                    remarks: this.getRemarkVal()
                });
            }else {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，刷新页面】
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
                        result: response,
                        custom: {
                            userInfo: this.userInfo
                        }
                    });
                }
            }
        },
        //拉取数据失败回调
        error: function() {
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
        //点击placeOrder按钮判断
        placeOrderSubmit:function(){
            var isVisitor= this.userInfo.isVisitor,
                email = this.userInfo.email;

            //判断用户是否是游客
            if(isVisitor === true && !email){
                //显示loading
                tip.events.trigger('popupTip:loading', true);

                //拉取产品数据
                this.model.fetch();
            }else{
                //显示loading
                tip.events.trigger('popupTip:loading', true);
                //点击placeOrder按钮调用备注接口传参
                remark.init({
                    placeOrder: this.placeOrder,
                    cartItemId:this.getCartItemId(),
                    remarks: this.getRemarkVal()
                });
            }
        },
        //获取itemId
        getCartItemId: function(){
            var cartItemIds = [],
                $cJProList = this.$cJProList,
                cJOrderDetails = this.cJOrderDetails,
                cJRemark = this.cJRemark,
                jRemark = this.jRemark,
                $ele;
            $cJProList.each(function(i,ele){
                $ele=$(ele);
                if($ele.find(cJRemark).hasClass(jRemark)){
                   var $cJOrderDetails = $ele.find(cJOrderDetails);
                   cartItemIds.push(JSON.parse(decodeURIComponent($cJOrderDetails.attr("data-info")))['cartItemId']);
                }     
            });
            return cartItemIds.join(",");
        },
        //获取remark文本值
        getRemarkVal:function(){
            var remarkVal = [],
                $cJRemarkInput = $(this.cJRemarkInput),
                $ele,
                val;
            $cJRemarkInput.each(function(i,ele){
                $ele = $(ele),
                val = $.trim($ele.val()).replace(/[,]|[，]/g,"."); 
                remarkVal.push(val);
            });
            return remarkVal.join(",");
        },
        //填写备注
        addremark: function(e){
            var $target = $(e.target),
                cJErrorInfo= this.cJErrorInfo,
                remarkVal = this.remarkVal = $.trim($target.val()).replace(/[,]|[，]/g,"."),
                cJRemark = this.cJRemark,
                error = $target.closest(cJRemark).find(cJErrorInfo);
            if(remarkVal.length >= 200){
                error.text("Limit 200").show();
                setTimeout(function(){
                    error.hide();
                }, 2000)
            }
            this.setRemark(this.getItemId(e));
        
        },

        //获取itemId
        getItemId: function(e){
            var $target = $(e.target),
                cJProList = this.cJProList,
                $parent = $target.closest(cJProList).find(this.cJOrderDetails);

            return JSON.parse(decodeURIComponent($parent.attr("data-info")))['cartItemId'];
        },
        //设置备注
        setRemark:function(itemcode){
            this.placeOrder.model.get('__remarks')[itemcode] = $.trim(this.remarkVal);
        }
    });
    
    return userVisitorView;
});

