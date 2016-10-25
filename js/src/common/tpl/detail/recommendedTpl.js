/**
 * module src: common/tpl/detail/recommendedTpl.js
 * 个性化推荐模板模块
**/
define('tpl/detail/recommendedTpl', [], function(){
    return {
        //主体内容
        main: [
            '<% var data = obj; %>',
            '{{title}}',
            '<div class="datail-pro-list">',
                '{{products}}',
            '</div>',
            '{{recommendedMore}}'
        ],
        //标题
        title: [
            '<h2 class="country-tit">Recommended Products</h2>'
        ],
        //产品列表
        products: [
            '<% var data = obj; %>',
            '<% for (var i = 0, len = data.list.length, groupIndex = 0; i < len; i++) { %>',
                '<% if ((i+1)%2===1) { %>',
                    //默认展示4组产品，每两个产品为一组
                    '<% groupIndex += 1; %>',
                    '<% if (groupIndex <= 4) { %>',
                        '<ul>',
                    //大于4组的产品默认隐藏
                    '<% } else { %>',
                        '<ul class="dhm-hide">',
                    '<% } %>',
                '<% } %>',
                            '<li>',
                                '<a rel="nofollow" href="<%=data.list[i].url%>">',
                            //默然展示8张图片
                            '<% if (i <= 7) { %>',
                                    '<div class="datail-pro-img"><img src="<%=data.list[i].imageUrl%>" /></div>',
                            //其余带有图片懒加载功能
                            '<% } else { %>',
                                    '<div class="datail-pro-img" data-original="<%=data.list[i].imageUrl%>"></div>',
                            '<% } %>',
                                //直降
                                '<% if (data.list[i].promoType === "1") { %>',
                                    '<p class="datail-pro-off"><%=$.lang.replaceTplVar("COMMON_Discount_1", {val: data.list[i].discount})%></p>',
                                //打折
                                '<% } else if (data.list[i].promoType === "2") { %>',
                                    '<p class="datail-pro-off"><%=$.lang.replaceTplVar("COMMON_Discount_0", {val: data.list[i].discount})%></p>',
                                '<% } %>',
                                    '<div class="datail-pro-name">',
                                        '<p class="datail-pro-piece"><%=data.list[i].curreny%><%=data.list[i].price%></p>',
                                    '</div>',
                                '</a>',
                            '</li>',
                    //(i+1)===len：防止产品个数为奇数时没有闭合标签
                    '<% if ((i+1)%2!==1 || (i+1)===len) { %>',
                        '</ul>',
                    '<% } %>',
            '<% } %>'
        ],
        //查看更多
        recommendedMore: [
            '<% var data = obj; %>',
            '<% if (data.list.length > 8) { %>',
                '<div class="j-recommended-more"><a href="javascript:;" class="recommended-more" rel="nofollow">Show More</a></div>',
            '<% } %>'
        ]
    };
});