/**
 * module src: exclusivedeals/tpl/displayClassifyTpl.js
 * 展示更多分类列表模板模块
**/
define('appTpl/displayClassifyTpl', [], function(){
    return {
        //外层包裹容器
        warp: [
            '<div class="allcate-list dhm-hide j-allcateWarp">',
                '{{list}}',
                '{{closeBtn}}',
            '</div>',
            '{{mask}}'
        ],
        //分类列表
        list: [
            '<ul class="j-allcateInner">',
                //justForYou
                '<li data-type="j-justForYouWarp"><a href="javascript:;"><%=$.lang["Exclusivedeals_justforyou"]%></a></li>',
                '<% var data = obj.categorys; %>',
                '<% for (var i = 1, len = data.length; i < len; i++) { %>',
                    //类目列表
                    '<li data-type="j-categoryListWarp-<%=data[i].id%>"><a href="javascript:;"><%=data[i].name%></a></li>',
                '<% } %>',
            '</ul>'
        ],
        //分类选择状态
        selected: '<span></span>',
        //关闭按钮
        closeBtn: [
            '<div class="allcate-close2 j-allcateClose"></div>'
        ],
        //遮罩层
        mask: [
            '<div class="allcate-box dhm-hide j-allcateBox"></div>'
        ]
    };
});