/**
 * module src: common/tpl/topMenuOneCategoriesTpl.js
 * 顶部左侧菜单一级类目模板
**/
define('tpl/topMenuOneCategoriesTpl', [], function(){
    return {
        //外层容器
        warp: [
            '<div class="category-layer">',
                '{{returnOrClose}}',
                '<div class="category-layer-scroll j-categoryOneScroll">',
                    '{{oneTitle}}',
                    '{{oneCategories}}',
                '</div>',
            '</div>'
        ],
        //返回、关闭按钮
        returnOrClose: [
            '<div class="category-menu">',
                '<p class="menu-text j-categoryOneReturn"><span class="menu-return"></span><a rel="nofollow" href="javascript:;"><%=$.lang["Head_mainMenu"]%></a></p>',
                '<span class="category-close j-categoryOneClose"></span>',
            '</div>'
        ],
        //一级标题
        oneTitle: [
            '<div class="category-shop2"><p><%=$.lang["l_all_cas"]%></p></div>'
        ],
        //一级类目
        oneCategories: [
            '<% var data = obj.list; %>',
            '<div class="category-language">',
                '<ul>',
                    '<% for (var i = 0, len = data.length; i < len; i++) { %>',
                        '<li><a rel="nofollow" href="<%=data[i]["url"]%>"><%=data[i]["name"]%><span class="English-errow"></span></a></li>',
                    '<% } %>',
                '</ul>',
            '</div>'
        ]
    };
});