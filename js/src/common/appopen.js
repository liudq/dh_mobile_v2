/**
 * module src: common/appopen.js
 * 在android或ios访问时唤起app，无app的情况下，ios跳转到 app store下载,android直接下载。
**/

define('common/appopen', ['common/config','tools/deeplink'], function(CONFIG,Deeplink){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.dRoot = this.options.dRoot;
            this.cOpenBtn = this.options.cOpenBtn;
            this.Deeplink = this.options.Deeplink;
            this.set_timer = this.options.set_timer;
	  		this.iOS = this.options.iOS;
	  		this.android = this.options.android;
	  		this.downloadUrl = this.options.downloadUrl;
	  		this.schemeUrl = this.options.schemeUrl;
            this.entrance = this.options.entrance;
	  		this.config = {};
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },     
        //设置配置对象
        setOptions: function(options) {
            this.options = {
                //根节点
                dRoot: 'body',
                //打开app的按钮
                cOpenBtn: '.j-openApp',
                //当前的点击区域标示
                entrance:null,
                set_timer: null,
                //设置ios的一些基本配置信息
                iOS:{
			            appId: "905869418",
			            appName: "DHgate",
			            storeUrl:'https://app.appsflyer.com/id905869418?pid=WAP-top'
			        },
			    //设置android的一些基本配置信息
			    android:{
			            appId: "com.dhgate.buyer",
			            appName: "DHgate",
				        storeUrl:'http://m.dhgate.com/common/download.html'
			        },
			    //设置android的直接下载的应用包url
			    downloadUrl:'http://m.dhgate.com/common/download.html',
			    //设置唤起app的schemeUrl
			    schemeUrl : 'DHgate.Buyer://virtual',
                //定义唤起app的插件
                Deeplink: Deeplink
            };
            $.extend(true,this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$dRoot = this.$dRoot||$(this.dRoot);
            this.$cOpenBtn = $(this.cOpenBtn);
         	//判断是不是最终页des 是最终页能获取des的值为：“itemDetail”
            if(this.$dRoot.attr('data-pagetype')==='itemDetail'){
	  			this.des = this.$dRoot.attr('data-pagetype');
		  		this.itemcode = window.location.pathname.match(/(\d+).html/)[1];
		  		this.params = JSON.stringify({
                    des: this.des,
                    itemcode: this.itemcode
                });
                this.schemeUrl = this.schemeUrl+'?params='+this.params;
	  		}
           
            //获取当前点击区域，给安卓下载页面加点击区域的标示，便于统计安卓下载
            if(this.entrance){
                this.downloadUrl = this.downloadUrl+'?entrance='+this.entrance;
                this.android.storeUrl = this.android.storeUrl+'?entrance='+this.entrance;
            }
        },
        //事件初始化
        initEvent: function() {
            this.openAppMethod();
        },
        //ios和android配置一些基本信息
       configParam:function(){
        	if(this.Deeplink.isIOS()){
        		return this.config = {
 				        iOS:this.iOS
			    };
        	}else if (this.Deeplink.isAndroid()){
        		return this.config = {
				        android: this.android,
				        fallback:true
				    }
        	}
        },
        //android下面直接下载方法
        directDowload:function(){
        	var _self = this;
        	if (this.Deeplink.isAndroid()) {
        		this.set_timer =  setTimeout(function(){
			    	var endTime = Date.now();
			    	if (!_self.startTime || endTime - _self.startTime < 1500 + 200) { 
			    		window.location = _self.downloadUrl;
			    	}
		        }, 1500);
	    	 	window.onblur = function() {
	               clearTimeout(_self.set_timer);
	               self.set_timer = null;
	            }
        	}
        },
        //唤起app的方法
      	openAppMethod:function(){            
	    	this.startTime = Date.now();
            this.configParam();
	    	this.Deeplink.setup(this.config);
	    	this.directDowload();
		    this.Deeplink.open(this.schemeUrl);
	        return false;
	    }
        
    };
});


