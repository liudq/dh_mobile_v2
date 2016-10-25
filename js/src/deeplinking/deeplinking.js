/**
 * module src: deeplinking/deeplinking.js
 * 在android或ios访问时唤起app
 * 无app的情况下：
 * 一种：ios跳转到 app store下载,android直接下载，android有GooglePlay的唤起googlepaly。
 * 另一种：或者是直接跳到对应wap页面
**/
define('deeplinking/deeplinking', ['tools/deeplink'], function(Deeplink){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.Deeplink = this.options.Deeplink;
            this.set_timer = this.options.set_timer;
	  		this.iOS = this.options.config.iOS;
	  		this.android = this.options.config.android;
	  		this.androidDownloadUrl = this.options.androidDownloadUrl;
            this.iosDownloadUrl = this.options.iosDownloadUrl;
	  		this.schemeUrl = this.options.schemeUrl;
	  		this.config = this.options.config;
            //唤起app
            this.openApp();
        },     
        //设置配置对象
        setOptions: function(options) {
            this.options = {
                set_timer: null,
                //ios、android的一些基本配置项
                config: {
                    //设置ios的一些基本配置信息
                    iOS:{
                        appId: "905869418",
                        appName: "DHgate",
                        storeUrl: 'https://app.appsflyer.com/id905869418?pid=WAP-top'
                    },
                    //设置android的一些基本配置信息
                    android:{
                        appId: "com.dhgate.buyer",
                        appName: "DHgate",
                        storeUrl: 'http://m.dhgate.com/common/download.html'
                    },
                    fallback: true
                },
			    //设置android的直接下载的应用包url
			    androidDownloadUrl: 'http://m.dhgate.com/common/download.html',
                //设置ios的下载的地址
                iosDownloadUrl: '',
			    //设置唤起app的schemeUrl
			    schemeUrl : 'DHgate.Buyer://virtual',
                //定义唤起app的插件
                Deeplink: Deeplink
            };
            $.extend(true, this.options, options||{});
        },
        //android上wap唤起页面的最终回落页面
        directDowload:function(){
        	var _self = this;
        	if (this.Deeplink.isAndroid()) {
        		this.set_timer =  setTimeout(function(){
			    	var endTime = Date.now();
			    	if (!_self.startTime || endTime - _self.startTime < 1500 + 200) { 
			    		window.location = _self.androidDownloadUrl;
			    	}
		        }, 1500);
	    	 	window.onblur = function() {
	               clearTimeout(_self.set_timer);
	               self.set_timer = null;
	            }
        	}
        },
        //设置android和ios的直接跳转地址
        skipToPage:function(){
            var self = this,
                timer = null;
            //设置android和ios的5s直接跳转地址
            timer =  setTimeout(function(){
                if (self.Deeplink.isAndroid()) {
                    window.location = self.androidDownloadUrl;
                }else if(self.Deeplink.isIOS()) {
                    window.location = self.iosDownloadUrl;
                }
            }, 5000); 
        },
        //唤起app的方法
      	openApp:function(){           
	    	this.startTime = Date.now();
            //ios和android一些基本参数配置
            this.Deeplink.setup(this.config);
            //唤起app的方法
		    this.Deeplink.open(this.schemeUrl);
	        return false;
	    }
        
    };
});


