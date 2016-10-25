/**
 * module src: deeplinking/cj.js
 * 在CJ上发布广告链接，链接是Deeplink的链接，点击后如果下载APP到APP的产品页面，如果没有下载APP，则跳转至m页。
**/
define('deeplinking/cj', ['tools/deeplink','deeplinking/deeplinking'], function(Deeplink,ToDeeplink){
    return {
        //初始化入口
        init: function() {
            this.schemeUrl = 'DHgate.Buyer://virtual';
            //需要唤起app上的对应页面
            this.toPage = decodeURIComponent(this.getUrlParam('des'))||'';
            //跟踪码
            this.d1code = decodeURIComponent(this.getUrlParam('d1code'))||'';
            //linkUrl为 app对应的json模板
            this.linkUrl = decodeURIComponent(this.getUrlParam('webUrl'))||'';
            //itemcode
            this.itemcode = decodeURIComponent(this.getUrlParam('itemcode'))||'';
            //storeId为 store对应的id
            this.storeId = decodeURIComponent(this.getUrlParam('storeId'))||'';
            //category Name"
            this.titleName = decodeURIComponent(this.getUrlParam('title'))||'';
            //关键词
            this.key = decodeURIComponent(this.getUrlParam('key'))||'';
            //wap需要跳转的地址
            this.wUrl = decodeURIComponent(this.getUrlParam('wUrl'))||'';
            //修复 wUrlhttp://m.dhgate.com/search.do?key=mp3?f=xx|cj|xxx12345&media=两个问号的情况
            this.parseWurl();
            //事件初始化
            this.initEvent();
        },
        //修复 wUrlhttp://m.dhgate.com/search.do?key=mp3?f=xx|cj|xxx12345&media=两个问号的情况
        parseWurl:function(){
            var locationHref = window.location.href,
                wUrl = locationHref.substring(locationHref.indexOf("wUrl=") + 5,locationHref.indexOf("&affsrc"));

            this.wUrl = 'http://'+wUrl;
        },
        //事件初始化
        initEvent: function() {
            //获取schemeUrl
            this.getSchemeUrl();
            //如果没有安装不去下载页面下载

             //5s之后loading页面跳转到对应的页面
            ToDeeplink.skipToPage();
           
            //唤起app
            ToDeeplink.init({
                schemeUrl:this.schemeUrl,
                androidDownloadUrl:this.wUrl,
                iosDownloadUrl:this.wUrl,
                config: {
                    fallback: false
                }
            });
           
        },
        //获取schemeUrl
        getSchemeUrl:function(){
            var obj = {},
                toPage = this.toPage;
            //home
            if(toPage==='home'){
                obj = {
                    des: toPage,
                    d1code: this.d1code
                };
            //lp
            }else if(toPage==='lp'){
                obj = {
                    des: toPage,
                    webUrl: this.linkUrl,
                    d1code: this.d1code
                };
            //webview    
            }else if(toPage==='webview'){
                obj = {
                    des: toPage,
                    webUrl: this.linkUrl,
                    d1code: this.d1code
                };
            //daily deals
            }else if(toPage==='app-list'){
                obj = {
                    des: toPage,
                    webUrl: this.linkUrl,
                    d1code: this.d1code
                };
            //Item
            }else if(toPage==='itemDetail'){
                obj = {
                    des: toPage,
                    itemcode: this.itemcode,
                    d1code: this.d1code
                };
            //Store Home
            }else if(toPage==='storeHome'){
                obj = {
                    des: toPage,
                    storeId: this.storeId,
                    d1code: this.d1code
                };
            //SRP(Category)
            }else if(toPage==='search'){
                obj = {
                    des: toPage,
                    title: this.titleName,
                    key: this.key,
                    d1code: this.d1code
                };
            }
            this.params = JSON.stringify(obj);
            this.schemeUrl = this.schemeUrl+'?params='+this.params;
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


