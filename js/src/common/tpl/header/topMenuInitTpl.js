/**
 * module src: common/tpl/header/topMenuInitTpl.js
 * 页面顶部菜单初始化模板
**/
define('tpl/header/topMenuInitTpl', [], function(){
    return {
        //外层容器
        warp: [
            '<div class="category-layer">',
                '<div class="category-menu">',
                    '{{close}}',
                    '{{notLogin}}',
                '</div>',
                '<div class="category-layer-scroll j-menuInitScroll">',
                    '{{entranceOne}}',
                    '{{entranceTwo}}',
                    '{{entranceThree}}',
                    '{{isLogin}}',
                '</div>',
            '</div>'
        ],
        //遮罩层
        fixedShadow: [
            '<div class="j-fixedShadow dhm-hide" style="position:fixed;width:100%;height:100%;bottom:0;z-index:92;background:#fff;"></div>'
        ],
        //关闭按钮
        close: [
            '<span class="category-close j-menu-close"></span>'
        ],
        //未登录状态
        notLogin: [
            '<% var data = obj.list; %>',
            '<% if (!data.nickName) { %>',
                '<div class="category-sign">',
				     '<a href="/register.do" rel="nofollow" class="join-free" onClick="javascript:ga(\'send\', \'event\', \'MHP\', \'Menu\', \'Join free\')"><%=$.lang["Head_joinFree"]%></a> <%=$.lang["Head_or"]%> <a href="/login.do" rel="nofollow" onClick="javascript:ga(\'send\', \'event\', \'MHP\', \'Menu\', \'Sign in\')"><%=$.lang["Head_signIn"]%></a>',
                '</div>',
            '<% } else { %>',
				'<div class="category-signout"><%=$.lang["Head_mainMenu"]%></div>',
			'<% } %>'
        ],
        //已登录状态
        isLogin: [
            '<% var data = obj.list; %>',
            '<% if (data.nickName) { %>',
                '<p class="category-out"><%=$.lang["Head_not"]%> <%=data.nickName%>? <a rel="nofollow" href="/signout.do" onClick="javascript:ga(\'send\', \'event\', \'MHP\', \'Menu\', \'Sign out\')"><%=$.lang["sign_out"]%></a></p>',
            '<% } %>'
        ],
        //首页&一级类目入口
        entranceOne: [
            '<div class="category-shop">',
                '<ul>',
                    '<li><b class="s-home"></b><a rel="nofollow" href="/"><%=$.lang["Head_home"]%></a><span></span></li>',
                    '<li class="j-categoryOneOpen shop-category"><b class="s-category"></b><a rel="nofollow" href="#mhp1601_tlc-all"><%=$.lang["l_all_cas"]%><span></span></a></li>',
                '</ul>',
            '</div>',
            '<div class="category-exclusivedeals">',
                '<ul>',
                    '<li><b class="s-exclusivedeals"></b><a rel="nofollow" href="/exclusivedeals/exclusivedeals.html#mhp1601_mobilex"><%=$.lang["Home_mobileExclusiveDeals"]%></a><span></span></li>',
                '</ul>',
            '</div>'
        ],
        //站内信、购物车、订单、优惠券等入口
        entranceTwo: [
            '<% var data = obj.list; %>',
            '<div class="category-list2">',
                '<ul>',
                    '<li><b class="s-cart"></b><a rel="nofollow" href="/viewcart.do#mhp1601_mydh-cart"><%=$.lang["Head_shoppingCart"]%><span class="number j-cartnum"><%=data.cartSum%></span></a><span></span></li>',
					'<li><a rel="nofollow" href="/mydhgate/downloadApp.html?linkType=1#hp1601_mydh"><%=$.lang["Head_myDHgate"]%></a><span></span></li>',
					'<li><a rel="nofollow" href="/mydhgate/downloadApp.html?linkType=2#hp1601_mydh-order"><%=$.lang["Head_myOrders"]%></a><span></span></li>',
					'<li><a rel="nofollow" href="/mydhgate/downloadApp.html?linkType=3#hp1601_mydh-message"><%=$.lang["Head_myMessage"]%><span class="number"><%=data.messageSum%></span></a><span></span></li>',
                    '<li><a rel="nofollow" href="/mydhgate/downloadApp.html?linkType=4#hp1601_mydh-coupon"><%=$.lang["Head_myCoupons"]%></a><span></span></li>',
                    '<li><a rel="nofollow" href="/mydhgate/downloadApp.html?linkType=5#hp1601_mydh-favorite"><%=$.lang["Head_myFavorites"]%></a><span></span></li>',
                    '<% if (data.nickName && data.buyerLevel==="1") { %>',
                        '<li><a rel="nofollow" href="/vipClub.html#mhp1601_mydh-vipclub"><%=$.lang["Head_myVipClub"]%></a><span></span></li>',
                    '<% } %>',
                '</ul>',
            '</div>'
        ],
        //多语言&feedback入口
        entranceThree: [
            '<% var data = obj.list; %>',
            '<div class="category-language">',
                '<ul>',
                    '<li id="J_language" onClick="javascript:ga(\'send\', \'event\', \'MHP\', \'Menu\', \'Select language\')"><b class="s-language"></b><a rel="nofollow" href="javascript:;"><%=$.lang["Head_selectLanguage"]%><span class="English"><%=data.lang%></span><span class="English-errow"></span></a></li>',
                    '<li><a rel="nofollow" class="j-openApp" data-entrance="Maindirect" href="javascript:;" onClick="javascript:ga(\'send\', \'event\', \'MHP\', \'Menu\', \'Download App\')"><b class="s-app"></b><%=$.lang["Head_downloadApp"]%></a><span></span></li>',
                '</ul>',
            '</div>',
			'<div class="category-feedback">',
                '<ul>',
                    '<li><a rel="nofollow" href="http://dg.dhgate.com/contact/contactUs.do" onclick="javascript:ga(\'send\', \'event\', \'MHP\', \'Menu\', \'Customer Service\')"><b class="s-service"></b>Customer Service</a><span></span></li>',
                    '<li><a rel="nofollow" href="http://survey.dhgate.com/index.php?sid=92928&lang=en" onClick="javascript:ga(\'send\', \'event\', \'MHP\', \'Menu\', \'Feed back\')"><%=$.lang["Head_feedback"]%></a><span></span></li>',
                '</ul>',
            '</div>'
        ]
    };
});
