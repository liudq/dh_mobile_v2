/**
 * module src: common/tpl/header/suggestTpl.js
 * 页面顶部搜索：推荐搜索关键词模板
**/
define('tpl/header/suggestTpl', [], function(){
    return [
        '<% var data = obj.list; %>',
        '<% if (data.length!==0) {  %>',
            '<div class="search-clear"><a class="j-searchlistClose" href="javascript:;"><%=$.lang["close"]%></a></div>',
            '<ul class="suggestcon">',
                '<% for (var i = 0, len = data.length; i < len; i++) {%>',
                    //前面的显示关键词+类目，后面的显示关键词+属性
                    '<% if (data[i].cid||data[i].cid===0){%>',
                        '<% if (data[i].cid===0){%>',
                            '<li class="key-cate j-keycate" data-key="<%=data[i].key%>"><key class="j-searchKey searchkey"><%=data[i].key%></key> in <attr class="cateName j-cateName" data-cid = ""><%=data[i].cateName%></attr></li>',
                        '<% }else{ %>',
                            '<li class="key-cate j-keycate" data-key="<%=data[i].key%>"><key class="j-searchKey searchkey"><%=data[i].key%></key> in <attr class="cateName j-cateName" data-cid = "<%=data[i].cid%>"><%=data[i].cateName%></attr></li>',
                        '<% } %>',
                        
                    '<% }else{ %>',
                        '<li class="key-cate key-label clearfix" data-key="<%=data[i].key%>"><key class="j-searchKey searchkey"><%=data[i].key%></key>',
                            '<% if (data[i].labelList) {%>',
                                '<div class="attrcon">',
                                    '<% for (var j = 0, len2 = data[i].labelList.length; j < len2; j++) {%>',
                                        '<attr class="attrName j-suggetAttrList" data-attrName = "<%=data[i].labelList[j].suggestTag%>"><%=data[i].labelList[j].suggestTag%></attr>',
                                    '<% } %>',
                                '</div>',
                            '<% } %>',
                        '</li>',
                    '<% } %>',
                '<% } %>',
            '</ul>',
        '<% } %>'
    ];
});
