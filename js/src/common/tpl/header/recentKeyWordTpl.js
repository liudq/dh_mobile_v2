/**
 * module src: common/tpl/header/recentKeyWordTpl.js
 * 页面顶部搜索：最近搜索关键词模板
**/
define('tpl/header/recentKeyWordTpl', [], function(){
    return [
        '<% var data = obj.list; %>',
        '<div class="search-clear"><a class="j-historyClose" href="javascript:;"><%=$.lang["clear_history"]%></a></div>',
        '<ul>',
            '<% for (var i = 0, len = data.length; i < len; i ++) { %>',
                '<li data-key="<%=data[i]%>"><key class="j-searchKey"><%=data[i]%></key></li>',
            '<% } %>',
        '</ul>',
        
    ];
});