/**
 * module src: home/tpl/dailyDealsTpl.js
 * 每日优惠商品模板
 * 注意：
 * 该模板US $未国际化
**/
define('appTpl/dailyDealsTpl', [], function(){
    return {
        //外层包裹容器
        warp: [
            '<div class="daily-deals">',
                '<div class="daily-tit"><%=$.lang["Home_dailyDeals"]%>',
                    '<span class="daily-time j-daily-time">',
                        '{{countdown}}',
                    '</span>',
					'<a rel="nofollow" href="/dailydeals.html#mhp1509-daily-all" class="see-all"><%=$.lang["Home_seeAll"]%><span></span></a>',
                '</div>',
                '<div class="swiper-container swiper-container-horizontal daily-box js-scroll">',
                    '<div class="swiper-wrapper">',
                        '<ul>',
                            '{{list}}',
                        '</ul>',
                    '</div>',
                '</div>',
            '</div>'
        ],
        //倒计时模板
        countdown: [
            '<% var data = obj; %>',
            '<span class="time-nub"><%=data.hh%></span>',
            '<span class="time-colon">:</span>',
            '<span class="time-nub"><%=data.mm%></span>',
            '<span class="time-colon">:</span>',
            '<span class="time-nub"><%=data.ss%></span>'
        ],
        //产品列表模板
        list: [
            '<% var data = obj; %>',
            '<% for (var i = 0, len = data.length; i < len; i++) { %>',
                '<li class="swiper-slide">',
                    '<a rel="nofollow" href="<%=data[i]["producturl"]%>">',
                        '<div class="pro-img"><img src="<%=data[i]["imageurl"]%>"></div>',
                        '<div class="pro-text">',
							'<p class="pro-off"><span><%=$.lang.replaceTplVar("COMMON_Discount_0", {val: data[i]["discount"]})%></span></p>',
                            '<p class="pro-piece"><strong>US $<%=data[i]["discountPrice"]%></strong> / <%=data[i]["measurename"]%></p>',
                            '<p class="pro-piece2">US $<%=data[i]["price"]%> / <%=data[i]["measurename"]%></p>',
                        '</div>',
                    '</a>',
                '</li>',
            '<% } %>'
        ]
    }
});