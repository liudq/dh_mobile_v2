/**
 * module src: common/header/buyerUserInfo.js
 * 获取买家相关信息，包含用户名、购物车、站内信的数量
**/
define('common/header/buyerUserInfo', ['common/config', 'tools/jquery.cookie', 'lib/underscore'], function(CONFIG, $cookie, _){
    var BuyerUserInfo = function(options) {
        //配置对象初始化
        this.setOptions(options);
        this.cHearCategoryBtn = this.options.cHearCategoryBtn;
        this.nDataValue = this.options.nDataValue;
        this.cLoginWarp = this.options.cLoginWarp;
        this.cCart = this.options.cCart;
        this.cMessage = this.options.cMessage;
        this.nickName = CONFIG.b2b_nick_n;
        this.buyerLevel = CONFIG.b2b_buyer_lv;
        this.url = CONFIG.wwwURL + this.options.api.url;
        this.param = this.options.api.param;
        //存储数据的对象
        this.obj = {};
        //成功回调
        this.successAfter = this.options.successAfter;
        
        //初始化调用
        this.init();
    };

    $.extend(BuyerUserInfo.prototype, {
        setOptions: function(options) {
            this.options = {
                //顶部左侧菜单打开按钮
                cHearCategoryBtn: '.j-headCategoryBtn',
                //存放购物车数量/站内性数量/nickName的自定义属性名称
                nDataValue: 'data-value',
                //用户登录信息外层包裹容器
                cLoginWarp: '#J_logined',
                //购物车数量
                cCart: '#cartnum',
                //站内信数量
                cMessage: '#msgnum',
                //数据接口
                api: {
                    //地址
                    url: '/logodata.do',
                    //参数
                    param: {}
                },
                //对外暴露的api在请求成功返回调用
                successAfter: $.noop
            };
            $.extend(true, this.options, options||{});
        },
        //初始化入口
        init: function(options) {
            this.initElement();
            this.getSum();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cHearCategoryBtn = $(this.cHearCategoryBtn);
            this.$cLoginWarp = $(this.cLoginWarp);
            this.$cCart = $(this.cCart);
            this.$cMessage = $(this.cMessage);
        },
        //获取购物车、站内信的数量
        getSum: function() {
            var url = this.url,
                param = this.param;
            
            $.ajax({
                type: 'GET',
                url: url,
                async: true,
                cache: false,
                dataType: 'json',
                data: param,
                context: this,
                success: function(res){
                    if (typeof res === 'object') {
                        this.setMessageSum(res.msgnum);
                        this.setCartSum(res.cartnum);
                        this.setUserName(this.nickName);
                        this.setUerLevel(this.buyerLevel);
                        this.setHearCategoryBtnState();
                        this.successAfter();
                    } else {
                        try{throw('success(): data is wrong');}catch(e){}
                    }
                },
                error: function(){
                    try{throw('error(): request is wrong');}catch(e){}
                }
            });
        },
        //设置站内信数量
        setMessageSum: function(sum) {
            if (_.isNumber(sum*1) && !isNaN(sum*1)) {
                this.obj['messageSum'] = sum*1;
            } else {
                this.obj['messageSum'] = 0;
            }
        },
        //设置购物车数量
        setCartSum: function(sum) {
            var $cCartnum = $('.j-cartnum');
            if (_.isNumber(sum*1) && !isNaN(sum*1)) {
                //页头购物车数量初始化
                this.$cCart.html('<span class="cart-nub j-cartnum">'+sum+'</span>');
                this.obj['cartSum'] = sum*1;
                //底部浮动工具条中购物车数量初始化
                $cCartnum[0]&&$cCartnum.html(sum);
            } else {
                this.$cCart.html('<span class="cart-nub j-cartnum">0</span>');
                this.obj['cartSum'] = 0;
            }
        },
        //设置用户名
        setUserName: function(name) {
            var str = '';
            if (name && typeof name === 'string') {
                str += '<p>' + $.lang["Head_not"] + ' ' + name + '? <a href="/signout.do" onclick="javascript:ga(\'send\', \'event\', \'MHP\', \'Sign out-bottom\')">' + $.lang['sign_out'] + '</a></p>';
                this.$cLoginWarp.html(str);
                this.obj['nickName'] = name;
            }
        },
        //设置用户级别
        setUerLevel: function(level) {
            this.obj['buyerLevel'] = level;
        },
        //顶部左侧打开按钮相关设置
        setHearCategoryBtnState: function() {
            var $cHearCategoryBtn = this.$cHearCategoryBtn;
            
            //如果购物车或站内信有数量则添加状态
            if (this.obj['cartSum']>0 || this.obj['messageSum']>0) {
                $cHearCategoryBtn.append('<span></span>');
            }

            //将相关数据序列化存入到自定义属性中
            $cHearCategoryBtn.attr(this.nDataValue, escape(JSON.stringify(this.obj)));
        }
    });
    
    return BuyerUserInfo;
});