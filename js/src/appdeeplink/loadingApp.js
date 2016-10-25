/**
 * module src: appdeeplink/appdeeplink.js
 * 在android或ios访问时唤起app，无app的情况下，ios跳转到 app store下载,android直接下载。
**/
define('appdeeplink/appDeeplink', ['common/config','tools/deeplink'], function(CONFIG,Deeplink){
    return {
        //初始化入口
        init: function(options) {
            this.hostName = (/https/i.test(location.protocol)===false?'http://':'https://') + location.hostname;
            this.itemcode = this.getUrlParam('itemcode');
            if(this.itemcode===''){
                window.location.href = this.hostName;
            }
            this.pid = this.getUrlParam('pid')
            //配置对象初始化
            this.setOptions(options);
            this.dRoot = this.options.dRoot;
            this.Deeplink = this.options.Deeplink;
            this.set_timer = this.options.set_timer;
	  		this.iOS = this.options.iOS;
	  		this.android = this.options.android;
	  		this.androidDownloadUrl = this.options.androidDownloadUrl;
            this.iosDownloadUrl = this.options.iosDownloadUrl;
	  		this.schemeUrl = this.options.schemeUrl;
	  		this.config = {};
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
           
        },     
        //设置配置对象
        setOptions: function(options) {
            this.options = {
                set_timer: null,
                //设置ios的一些基本配置信息
                iOS:{
		            appId: "905869418",
		            appName: "DHgate",
                    storeUrl:"https://app.appsflyer.com/id905869418?pid="+this.pid+"&af_sub1=itemcode&af_sub2="+this.itemcode
		        },
			    //设置android的一些基本配置信息
			    android:{
		            appId: "com.dhgate.buyer",
		            appName: "DHgate",
                    storeUrl:"http://app.appsflyer.com/com.dhgate.buyer-dhgate?pid="+this.pid+"&af_sub1=itemcode&af_sub2="+this.itemcode+"&af_r=http://m.dhgate.com/product/deeplink/"+this.itemcode+".html"
		        },
			    //设置android的直接下载地址
			    androidDownloadUrl:"http://app.appsflyer.com/com.dhgate.buyer-dhgate?pid="+this.pid+"&af_sub1=itemcode&af_sub2="+this.itemcode+"&af_r=http://m.dhgate.com/product/deeplink/"+this.itemcode+".html",
                //设置ios的直接下载地址
                iosDownloadUrl:"http://m.dhgate.com/product/deeplink/"+this.itemcode+".html",
			    //设置唤起app的schemeUrl
			    schemeUrl : 'DHgate.Buyer://virtual',
                //定义唤起app的插件
                Deeplink: Deeplink
            };
            $.extend(this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
         	//判断是不是最终页des 是最终页能获取des的值为：“itemDetail”
            //DHgate.Buyer://virtual?params={"des": "itemDetail", "itemcode": "216137579", "d1code": "APP-DEEPLINK-ITEM"}
	  		this.params = JSON.stringify({
                des: "itemDetail",
                itemcode: this.itemcode,
                d1code:this.pid
            });
            this.schemeUrl = this.schemeUrl+'?params='+this.params;
        },
        //事件初始化
        initEvent: function() {
            var self = this;
            // setTimeout(function(){
            //     self.openAppMethod();
            // },3000)
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
			    };
        	}
        },
        //android下面直接下载方法
        directDowload:function(){
        	var _self = this;

            this.set_timer =  setTimeout(function(){
                if (_self.Deeplink.isAndroid()) {
                    window.location = _self.androidDownloadUrl;
                }
                if (_self.Deeplink.isIOS()) {
                    window.location = _self.iosDownloadUrl;
                }
            }, 5000); 
        },
        //唤起app的方法
      	openAppMethod:function(){            
	    	this.startTime = Date.now();
            this.configParam();
	    	this.Deeplink.setup(this.config);
	    	this.directDowload();
		    this.Deeplink.open(this.schemeUrl);
	        return false;
	    },
        //获取URl上面的参数
        getUrlParam:function(key){

            var url = location.href,
                paraString = url.substring(url.indexOf("?") + 1, url.length).split("&"),
                paraObj = {};

            for (var i = 0; j = paraString[i]; i++) {  
               paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);  
            }

            //排除key=wedding+dresses#aa中#aa 把‘+’去掉
            var returnValue = paraObj[key.toLowerCase()];

            if (typeof (returnValue) == "undefined") {  
               return "";  
            } else { 
               return returnValue.replace(/(.+)#.*/, '$1').replace(/\+/, ' '); 

            }

        }
        
    };
});


