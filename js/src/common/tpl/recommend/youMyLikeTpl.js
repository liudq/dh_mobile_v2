/**
 * module src: common/tpl/recommend/youMyLikeTpl.js
 * 猜你喜欢模板模块
**/
define('tpl/recommend/youMyLikeTpl', [], function(){
    return {
        //主体内容
        main: [
            '<div class="viewed1">',
                '{{title}}',
                '<div class="pro-box">',
                    '<ul>',
                        '{{products}}',
                    '</ul>',
                '</div>',
            '</div>'
        ],
        //标题
        title: [
            '<% var data = obj; %>',
            '<div class="pro-tit"><%=data.blockTit%><a rel="nofollow" href="/youmylike.html#mhp1509-youmylike-all" class="see-all"><%=$.lang["Home_seeAll"]%><span></span></a></div>'
        ],
        //产品列表
        products: [
            '<% var data = obj; %>',
            '<% for (var i = 0, len = data.list.length; i < len; i++) { %>',
                '<li>',
                    //'<a rel="nofollow" href="<%=data.list[i].url%><%=data.trackingPrefix%><%=i+1%>-9|null:01">',
                    '<a rel="nofollow" href="<%=data.list[i].url%>">',
                        '<div class="pro-img">',
                            //[打折|移动专享打折]
                            '<% if (/^1$|^6$/.test(data.list[i].promoType)) { %>',
                                '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_0", {val: data.list[i].discount})%></span>',
                            //[直降|移动专项直降]
                            '<% } else if (/^2$|^7$/.test(data.list[i].promoType)) { %>',
                                '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_1", {val: data.list[i].discount})%></span>',
                            //[VIP打折|移动专享VIP打折]
                            '<% } else if (/^4$|^8$/.test(data.list[i].promoType)) { %>',
                                '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_2", {val: data.list[i].discount})%></span>',
                            //[VIP直降|移动专享VIP直降]
                            '<% } else if (/^5$|^9$/.test(data.list[i].promoType)) { %>',
                                '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_3", {val: data.list[i].discount})%></span>',
                            //[VIP|APPVIP独享]
                            '<% } else if (/^3$|^11$/.test(data.list[i].promoType)) { %>',
                                '<span class="off-ico2"><%=$.lang["COMMON_Discount_4"]%></span>',
                            '<% } %>',
                            '<img src="<%=data.list[i].imageUrl%>">',
                        '</div>',
                    '</a>',
                    '<div class="pro-text">',
                        '<p class="pro-piece">',
                            //[移动专项-[打折|直降|VIP打折|VIP直降]|APP-[独享|VIP独享]]
                            '<% if (/^6$|^7$|^8$|^9$|^10$|^11$/.test(data.list[i].promoType)) { %>',
                                '<b class="mobile-deals"></b>',
                            '<% } %>',
                            '<%=data.list[i].curreny%><%=data.list[i].price%></p>',
                    '</div>',
                '</li>',
            '<% } %>'
        ]
    };
});