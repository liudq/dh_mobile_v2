/**
 * module src: landpage/buyerUserInfo.js
 * 获取买家相关信息，包含用户名、购物车、站内信的数量
**/
define('app/buyerUserInfo', ['common/config', 'tools/jquery.cookie'], function(CONFIG, $cookie){
    var BuyerUserInfo = function(options) {
        //配置对象初始化
        this.setOptions(options);
        this.cLoginWarp = this.options.cLoginWarp;
        this.cCart = this.options.cCart;
        this.cMessage = this.options.cMessage;
        this.nickName = CONFIG.b2b_nick_n;
        //this.url = CONFIG.wwwURL + this.options.api.url;
        this.url = this.options.api.url;
        this.param = this.options.api.param;
        
        //初始化调用
        this.init();
    };

    $.extend(BuyerUserInfo.prototype, {
        setOptions: function(options) {
            this.options = {
                //用户登录信息外层包裹容器
                cLoginWarp: '#J_logined',
                //购物车数量
                cCart: '#cartnum',
                //站内信数量
                cMessage: '#msgnum',
                //数据接口
                api: {
                    //地址
                    url: 'logodata.do',
                    //参数
                    param: {}
                }
            };
            $.extend(this.options, options||{});
        },
        //初始化入口
        init: function(options) {
            this.initElement();
            this.getSum();
        },
        //$dom对象初始化
        initElement: function() {
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
                    } else {
                        throw('success(): data is wrong');
                    }
                },
                error: function(){
                    try {
                        throw('error(): request is wrong');
                    }catch(e){console.log(e);}
                }
            });
        },
        //设置站内信数量
        setMessageSum: function(sum) {
            if (sum && typeof sum === 'number') {
                this.$cMessage.html(sum);
            }
        },
        //设置购物车数量
        setCartSum: function(sum) {
            if (sum && typeof sum === 'number') {
                this.$cCart.html(sum);
            }
        },
        //设置用户名
        setUserName: function(name) {
            var str = '';
            if (name && typeof name === 'string') {
                str += $.lang['hello'] + ', ' + name + ' | <a href="/signout.do">' + $.lang['sign_out'] + '</a>';
                this.$cLoginWarp.html(str);
            }
        }
    });
    
    return BuyerUserInfo;
});