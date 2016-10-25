/**
 * module src: detail/tpl/getDhCouponListTpl.js
 * 获取dhCoupon列表
**/
define('appTpl/getDhCouponListTpl', [], function(){
    return {
        //主体内容
        main: [
            '<div class="datailLayer-store-coupon j-dhCouponLayer close-layer1 dhm-hide">',
                '{{title}}',
                '<div class="datail-coupon-box j-datail-dhCoupon-boxScroll">',
                     '{{dhCouponList}}',
                '</div>',
                '<p class="store-coupon-note j-store-coupon-note">Note: One coupin per single order, excluding shipping cost.</p>',
            '</div>'
        ],
        //标题
        title: [
            '<div class="product-title-top j-product-dhTitle-top"><span class="title-top-icon"></span>My DHcoupon</div>',
        ],
        //dhCoupon列表
        dhCouponList: [
            '<% var data = obj;%>',          
            '<% for (var i = 0, len = data.list.length; i < len;i++){ %>',
               '<dl class="dh-coupon">',
                    '<dd> <span><%=data.currencyText%><%=data.list[i].amount%> OFF</span> <%=data.currencyText%><%=data.list[i].orderAmo%>+</dd>',
                    '<dt>CouponExpires <%=data.list[i].endDateFormat%></dt>',
                '</dl>',
            '<% } %>'
        ],
        
    };
});