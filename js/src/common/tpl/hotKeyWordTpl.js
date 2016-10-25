/**
 * module src: common/tpl/hotKeyWord.js
 * 页面顶部搜索：热门关键词模板
**/
define('tpl/hotKeyWordTpl', [], function(){
    return [
        '<div class="search-clear"><%=$.lang["hot_search"]%></div>',
        '<ul>',
            '<% var data = obj.list; %>',
            '<% for (var i = 0, len = data.length; i < len; i++) { %>',
                '<% if (i < 3) { %>',
                    '<li><key class="j-searchKey"><%=data[i]%></key><span><%=i+1%></span></li>',
                '<% } else { %>',
                    '<li><key class="j-searchKey"><%=data[i]%></key></li>',
                '<% } %>',
            '<% } %>',
        '</ul>'
    ];
});