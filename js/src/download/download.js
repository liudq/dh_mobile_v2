/**
 * module src: download/download.js
 * 安卓中间页面
**/
define('download/download', [], function(){
    return {
        //初始化入口
        init: function() {
            //需要唤起app上的对应页面
            this.entrance = decodeURIComponent(this.getUrlParam('entrance')).toLowerCase()||'';
            //事件初始化
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
           //来源不同跳转到不同的页面 
            //点击reviews全屏图back
            $('body').on('click', '.j-downloadBtn', $.proxy(this.skipTo, this));
        },
        skipTo: function(){
          
            //从顶部下载条进来
           if(this.entrance==="wap-top"){
                window.location.href = "https://app.appsflyer.com/com.dhgate.buyer-dhgate?pid=dhgate&c=WAP-Top&af_r=http://www.dhresource.com/mobile/dhgate_buyer.apk";
           //从主导航进来
           }else if(this.entrance==="maindirect"){
                window.location.href = "https://app.appsflyer.com/com.dhgate.buyer-dhgate?pid=dhgate&c=Maindirect&af_r=http://www.dhresource.com/mobile/dhgate_buyer.apk";
           //从支付成功页进来
           }else if(this.entrance==="paysuccess"){
                window.location.href = "https://app.appsflyer.com/com.dhgate.buyer-dhgate?pid=dhgate&c=Paysuccess&af_r=http://www.dhresource.com/mobile/dhgate_buyer.apk";
           //其他来源
           }else{
                window.location.href = "http://www.dhresource.com/mobile/dhgate_buyer.apk";
           } 
        },
        //获取URl上面的参数
        getUrlParam:function(key){
            var url = location.href,
                paraString = url.substring(url.indexOf("?") + 1, url.length).split("&"),
                paraObj = {},
                j = [];

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


