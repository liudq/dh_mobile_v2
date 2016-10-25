/**
 * module src: common/mydhgate/contactSeller.js
 * Ntalker聊天对话框模块
**/
define('mydhgate/contactSeller',['common/config','mydhgate/ifLogIn'],function(CONFIG,ifLogIn) {
    var contactSeller = function(options) {
        //事件对象
        this.events = $({});
        //初始化调用
        this.init(options);
        //初始化事件
        this.initEvent();
    };
    $.extend(contactSeller.prototype, {
        init: function(options) {
            //配置对象初始化
            this.setOptions(options&&options.target?arguments[1]:options);
            this.NTKF_PARAM = $.extend(true, {}, this.options.NTKF_PARAM, {
                sellerid: 'dh_'+this.options.NTKF_PARAM.sellerid,
                settingid: 'dh_'+this.options.NTKF_PARAM.settingid+'_9999',
                uid: 'dh_'+this.options.NTKF_PARAM.uid
            });
        },
        setOptions: function (options) {
            this.options = {
                //Ntalker的配置
                NTKF_PARAM: {
                    //平台基础id
                    siteid: 'dh_1000',
                    //商户id，商家页面必须此参数，平台页面不传
                    sellerid: '',
                    //Ntalker分配的缺省客服组id
                    settingid: '',
                    //买家id
                    uid: '',
                    //用户名
                    uname: CONFIG.b2b_nick_n||'',
                    //用户级别，1为vip用户，0为普通用户
                    userlevel: CONFIG.b2b_buyer_lv?CONFIG.b2b_buyer_lv:'0',
                    //Ntalker的js入口文件地址
                    ntalkUrl: ''
                }
            };
            $.extend(true, this.options, options||{});
        },
        initEvent: function() {
            this.events.on('contactSeller:chat', $.proxy(this.init, this));
            this.events.on('contactSeller:chat', $.proxy(this.isSignin, this));
        },
        //判断是否登录
        isSignin: function() {
            var charwin = [],
                NTKF_PARAM = this.NTKF_PARAM;

            //判断是否登录
            ifLogIn.get(function(){
                charwin.push(""+NTKF_PARAM.ntalkUrl+"/mobilechat_en_us.html");
                charwin.push("#siteid="+NTKF_PARAM.siteid+"&settingid="+NTKF_PARAM.settingid);
                charwin.push("&destid="+NTKF_PARAM.sellerid+"_ISME9754_GT2D_embed_"+NTKF_PARAM.settingid+"_icon");
                charwin.push("&myuid="+NTKF_PARAM.uid+"&myuname="+NTKF_PARAM.uname);
                charwin.push("&single=0&userlevel="+NTKF_PARAM.userlevel+"&ref="+encodeURIComponent(document.location));
                try {
                    window.open(charwin.join(''),'chat',"height=540,width=320,directories=no,"+ "location=no,menubar=no,resizable=yes,"+ " status=no,toolbar=no,top=100,left=200");
                } catch(e) {
                    //console.log(e.message);
                }
            }, window.location.href);
        }
    });

    return new contactSeller();
 });
