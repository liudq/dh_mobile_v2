/**
 * module src: deeplinking/cj.js
 * 在CJ上发布广告链接，链接是Deeplink的链接，点击后如果下载APP到APP的产品页面，如果没有下载APP，则跳转至m页。
**/
define('appPayDeeplink/appPayDeeplink', ['tools/deeplink','deeplinking/deeplinking'], function(Deeplink,ToDeeplink){
    return {
        //初始化入口
        init: function() {
            this.schemeUrl = 'dhgate://virtual';
            //需要唤起app上的对应页面
            this.allParam = decodeURIComponent(this.getUrlParam('params')||'');
            //console.log(this.allParam)
            //事件初始化
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            //获取schemeUrl
            this.getSchemeUrl();
            //如果没有安装不去下载页面下载
            
            //5s之后loading页面跳转到对应的页面
            this.clickDeeplink();

            //安卓下不能自动唤起的时候手动触发唤起
            $('.j-andr-openappBtn').on('click',function(){
                ToDeeplink.init({
                    schemeUrl:this.schemeUrl,
                    config: {
                        fallback: false
                    }
                }); 
            });
           
            //唤起app
            ToDeeplink.init({
                schemeUrl:this.schemeUrl,
                config: {
                    fallback: false
                }
            });
           
        },
        clickDeeplink:function(){
            var self = this,
                cAndrOpenapp = $('.j-andr-openapp'),
                cLoadingWarp = $('.j-loading-warp'),
                timer = null;
            //设置android和ios的4s直接跳转地址
            if (Deeplink.isAndroid()) {
                timer =  setTimeout(function(){
                    cAndrOpenapp.show();
                    cLoadingWarp.hide();
                }, 4000);   
            }else{
                cAndrOpenapp.hide();
            }

        },
        //需要格式：dhgate://virtual?params={"des":"ideal","orderIds":"fb_hhh", "amount”:”总价格",paySuccess":"1",message":"How are you gentlemen? Your payment failed because all your base are belong to us."}
        //数据格式：{"data":{"amount":"456","orderNos":"123","other_amount":""},"serverTime":1461726097350,"state":"0x0000","message":""}
        //获取schemeUrl
        getSchemeUrl:function(){

            if(this.allParam==='')return;

            var obj = {},
                JsonAllParam = JSON.parse(this.allParam);

            obj.des = "ideal";
            obj.orderNos = JsonAllParam.data.orderNos||'';
            obj.amount  = JsonAllParam.data.amount||'';
            obj.other_amount = JsonAllParam.data.other_amount;
            obj.thirdPayBackInfo = JsonAllParam.data.thirdPayBackInfo||'';
            obj.thirdPayState = JsonAllParam.data.thirdPayState||'';
            JsonAllParam.state==="0x0000"?obj.paySuccess="1":obj.paySuccess="0";
            obj.message = JsonAllParam.message||'';
            this.allParam = JSON.stringify(obj);

            this.schemeUrl = this.schemeUrl+'?params='+this.allParam; 
            //console.log(this.schemeUrl)    
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


