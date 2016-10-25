/**
 * module src: common/tpl/appSpreadTpl.js
 * 在android或iphone访问时提示下载对应APP的模板
**/
define('tpl/appSpreadTpl', [], function(){
    return [
        '<div class="top-download">',
            '<a rel="nofollow" href="javascript:;" class="downClose j-closeApp"></a>',
            '<a rel="nofollow" href="javascript:;" class="downCentent j-openApp" data-entrance="WAP-Top">',
                '<span class="down-logo"></span>',
                '<p class="down-text"><%=$.lang["COMMON_Price_onapp"]%></p>',
            '</a>',
            '<span class="down-but">APP</span>',
        '</div>'
    ];
});