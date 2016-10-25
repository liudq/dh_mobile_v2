
/*
* module src:storeShop/contactSeller.js
* contact and message模块
* */
define('app/contactSeller',['common/config'],function(CONFIG) {
    var contactSeller = function(options) {
        //事件对象
        this.events = $({});
        //初始化调用
        this.init(options);
        //初始化事件
        this.initEvent();
    };
    $.extend(contactSeller.prototype, {
        init: function(options){
            //配置对象初始化
            this.setOptions(options&&options.target?arguments[1]:options);
            this.uname = this.options.uname;
            this.ntalkerBuyerid = this.options.ntalkerBuyerid;
            this.ntalkerSellerId = this.options.ntalkerSellerId;
            this.ntalkUrl = this.options.ntalkUrl;
            this.ntalkUrl1 = this.options.ntalkUrl1;
            this.NTKF_PARAM = this.options.NTKF_PARAM;
        },
        setOptions: function (options) {
            this.options = {
                ntalkerBuyerid: '',
                ntalkerSellerId:'',
                ntalkUrl: '',
                ntalkUrl1: '',
                NTKF_PARAM: {
                    siteid: 'dh_1000',                                  //平台基础id
                    sellerid: 'dh_' + this.ntalkerSellerId,             //商户id，商家页面必须此参数，平台页面不传
                    settingid: 'dh_' + this.ntalkerSellerId + '_9999',  //Ntalker分配的缺省客服组id
                    uid: 'dh_' + this.ntalkerBuyerid + '',              //用户id  buyerid   hashcode的绝对值的字符串，前面加dh_
                    uname: this.uname,                                  //用户名    nickname获取cookie b2b_nick_n值
                    userlevel: '0'                                      //用户级别，1为vip用户，0为普通用户
                }
            };
            $.extend(true, this.options, options||{});
        },
        initEvent:function(){
            this.events.on('contactSeller:chat', $.proxy(this.init, this));
            this.events.on('contactSeller:chat', $.proxy(this.isSignin, this));
        },
        //判断是否登录  必须要请求一次后台判断用户是否登录，不能用页面上的参数，因为用户可能在另外一个页面已经退出了登录
        isSignin:function(){
            var signUrl = 'http://m.dhgate.com/buyerislogin.do',
                charwin = [],
                NTKF_PARAM = this.NTKF_PARAM;
            $.ajax({
                url:signUrl,
                type:'GET',
                dataType:'text',
                async: false,
                context: this,
                error: function(){},
                success: function(data){
                    if(data != undefined && data.trim()=="true"){//登录
                        charwin.push(""+this.ntalkUrl1+"/mobilechat_en_us.html");//js地址
                        charwin.push("#siteid="+NTKF_PARAM.siteid+"&settingid="+NTKF_PARAM.settingid);
                        charwin.push("&destid="+NTKF_PARAM.sellerid+"_ISME9754_GT2D_embed_"+NTKF_PARAM.settingid+"_icon");
                        charwin.push("&myuid="+NTKF_PARAM.uid+"&myuname="+NTKF_PARAM.uname);
                        charwin.push("&single=0&userlevel="+NTKF_PARAM.userlevel+"&ref="+encodeURIComponent(document.location));
                    }else{//未登录
                        var href= window.location.href;
                        window.location.href = '/login.do?returnURL='+href;
                    }
                    if(charwin.length>0){
                        var p = "height=540,width=320,directories=no,"+ "location=no,menubar=no,resizable=yes,"+ " status=no,toolbar=no,top=100,left=200";
                        try {window.open(charwin.join(''),'chat',p);} catch(e) {console.log(e.message);}
                    }
                }
            });
        }
    });

    return new contactSeller();
 })
