/**
 * module src: common/ntalker.js
 * NTALER第三方及时通讯工具
**/
define('common/ntalker', ['common/config', 'common/getUserInfo'], function(CONFIG, getUserInfo){
    var Ntalker = function(options) {
        //自定义事件对象
        this.events = $({});
        //初始化调用
        this.init(options);
        //初始化事件
        this.initEvent();
    };

    //注册原型方法和属性
    $.extend(Ntalker.prototype, {
        //初始化入口
        init: function(options) {
            //初始化配置对象
            this.setOptions(options&&options.target?arguments[1]:options);
            //客服类型
            this.type = this.options.type;
            //Ntalker脚本入口文件地址
            this.url = (this.options.url||'http://www.dhresource.com/dhs/thirdparty/ntalker/ntkfstat_')+(CONFIG.countryCur==='en'?'en_us': CONFIG.countryCur)+'.js?v='+CONFIG.version;
            //平台基础id
            this.siteid = 'dh_1000';
            //商户id，商家页面必须此参数，平台页面不传
            this.sellerid = 'dh_'+this.options.sid;
            //Ntalker分配的缺省客服组id
            this.settingid = 'dh_'+this.options.sid+'_9999';
            //由buyerId换算出来的用户id
            this.uid = 'dh_'+this.options.uid;
            //买家名称
            this.uname = CONFIG.b2b_nick_n;
            //买家级别，1为vip用户，0为普通用户
            this.userlevel = CONFIG.b2b_buyer_lv||'0';
            //产品id
            this.productId = this.options.productId||'';
            //产品名称
            this.productName = this.options.productName||'';
            //买家id-DH-卖家id-DH-产品id
            this.bid_sid_pid = CONFIG.b2b_buyerid+'-DH-'+this.options.supplierId+'-DH-'+this.productId;
        },
        //设置配置对象
        setOptions: function(options) {
            this.options = {
                //kf：平台客服，dh：卖家客服
                type: 'dh',
                //Ntalker脚本入口文件地址
                url: '',
                //由buyerId换算出来的用户id
                uid: '',
                //卖家id
                supplierId: '',
                //由supplierId换算出来的商户id
                sid: '',
                //产品id
                productId: '',
                //产品名称
                productName: ''
            };
            $.extend(true, this.options, options||{});
        },
        //事件初始化
        initEvent: function() {
            this.events.on('Ntalker:open', $.proxy(this.init, this));
            this.events.on('Ntalker:open', $.proxy(this.openNtalker, this));
        },
        //打开Ntalker聊天对话框
        openNtalker: function() {
            //查看登录状态
            getUserInfo.init({
                isAsync: false,
                successCallback: $.proxy(function(){
                    var charwin = [];
                    //卖家客服
                    if (this.type === 'dh') {
                        charwin.push(""+this.url.substring(0,this.url.lastIndexOf("/"))+"/mobilechat_en_us.html");
                        charwin.push("#siteid="+this.siteid+"&settingid="+this.settingid);
                        charwin.push("&destid="+this.sellerid+"_ISME9754_GT2D_embed_"+this.settingid+"_icon");
                        charwin.push("&myuid="+this.uid+"&myuname="+this.uname+"&itemid="+this.productId+"");
                        charwin.push("&single=0&userlevel="+this.userlevel+"&ref="+encodeURIComponent(document.location));
                        charwin.push("&title=Wholesale"+encodeURIComponent("-"+this.productName+""));
                        charwin.push("&itemparam="+this.bid_sid_pid+"");
                        try {
                            window.open(charwin.join(''),'chat',"height=540,width=320,directories=no,"+ "location=no,menubar=no,resizable=yes,"+ " status=no,toolbar=no,top=100,left=200");
                        } catch(e) {}
                    }
                }, this)
            });
        }
    });

    return new Ntalker();
});
