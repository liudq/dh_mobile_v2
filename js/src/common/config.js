/**
 * module src: common/config.js
 * 全局变量配置
**/
define('common/config', ['tools/jquery.cookie'], function($cookie){
        //站点域名
    var wwwURL = (/https/i.test(location.protocol)===false?'http://':'https://') + location.hostname,
        //多语言站点语言列表
        countrys = {
            'en': 'English (EN)',
            'es': 'Español (ES)',
            'pt': 'Português (PT)',
            'ru': 'Русский (RU)',
            'fr': 'Français (FR)',
            'de': 'Deutsch (DE)',
            'it': 'Italiano (IT)',
            'tr': 'Türk (TR)'
        },
        //根据站点域名来判断当前站点国家
        countryCur = wwwURL.match(/.+\.(es|pt|ru|fr|de|it|tr)\..+/i)||'en',
        //判断是否为Android设备
        isAndroid = /(A|a)ndroid/i.test(navigator.userAgent);
    
    return {
        //判断是否为Android设备
        isAndroid: isAndroid,
        //阻止android浏览器点透（糟糕的方式，能不用尽量不用）
        preventClick: function(){
            var self = arguments.callee,
                $preventclick = self.$preventclick;
            
            //如果是android写入一个透明的遮罩层并显示300毫秒
            if (isAndroid) {
                if (!$preventclick) {
                    $('body').append('<div id="preventclick" style="position:fixed;z-index:9999;top:0;left:0;width:100%;height:100%;"></div>');
                    self.$preventclick = $preventclick = $('#preventclick');
                } else {
                    $preventclick.show();
                }
                setTimeout(function(){$preventclick.hide();},300);
            }
        },
        //判断支持localStorage
        isLocalStorageNameSupported: function() {
            try {
                if ('localStorage' in window && window['localStorage']) {
                    localStorage.setItem('__DH_LOCALSTORAGETEST__', 1);
                    return true;
                }
            } catch (e) {
                return false
            }
        },
        //url-站点域名
        wwwURL: wwwURL,
        //url-路径名
        wwwPATHNAME: location.pathname,
        //url-锚点
        wwwHASH: location.hash,
        //url-查询部分
        wwwSEARCH: location.search,
        //多语言站点语言列表
        countrys: countrys,
        //当前站点国家（国家缩写，语言列表中的key）
        countryCur: $.isArray(countryCur)?countryCur[1]:countryCur,
        //时间戳版本号
        version: '1466044598924',
        //nick name
        b2b_nick_n: $.cookie('b2b_nick_n'),
        //买家级别
        b2b_buyer_lv: $.cookie('b2b_buyer_lv'),
        //未登录状态下记录购物车内商品
        vid: $.cookie('vid'),
        b2b_cart_sid: $.cookie('b2b_cart_sid'),
        //买家Id
        b2b_buyerid: $.cookie('b2b_buyerid')
    };
});