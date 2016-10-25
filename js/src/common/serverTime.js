/**
 * module src: common/serverTime.js
 * 获取服务器当前时间
**/
define('common/serverTime', ['common/config'], function(CONFIG){
    return {
        //获取服务器时间
        get: function(callback) {
            $.ajax({
                type: 'GET',
                //url: CONFIG.wwwURL + '/buyertime.do',
                url: 'http://m.dhgate.com/buyertime.do',
                async: true,
                cache: false,
                dataType: 'jsonp',
                success: callback
            });
        }
    };
});