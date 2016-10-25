/**
 * module src: common/tpl/suggestTpl.js
 * 页面顶部搜索：推荐搜索关键词模板
**/
define('tpl/suggestTpl', [], function(){
    return [
        '<% var data = obj.list; %>',
        '<% if (data.length!==0) { %>',
            '<div class="search-clear"><a class="j-searchlistClose" href="javascript:;"><%=$.lang["close"]%></a></div>',
            '<ul>',
                '<% for (var i = 0, len = data.length; i < len; i++) { %>',
                    '<li><key class="j-searchKey"><%=data[i]%></key></li>',
                '<% } %>',
            '</ul>',
        '<% } %>'
    ];
});
