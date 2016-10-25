/**
 * module src: common/tpl/detail/getStoreCouponListTpl.js
 * 获取店铺优惠券列表
**/
define('tpl/coupon/getStoreCouponListTpl', [], function(){
    return {
        //主体内容
        main: [            
            '{{title}}',
            '<div class="store-coupon-list j-store-coupon-list">',
                '<div class="store-coupon-list-inne">',
                    '{{products}}',
                '</div>',
            '</div>'
        ],
        //标题
        title: [
            '<% var data = obj; %>',
            '<h2 class="store-coupon-tit j-store-coupon-tit"><a href="javascript:void(0);">Store Coupons (<%=data.couponList.length%>)<span class="public-arrow"></span></a></h2>'
        ],
        //店铺优惠券列表
        products: [
            '<% var data = obj; %>',
            '<% var dataCouponList = data.couponList; %>',
            '<% for (var i = 0, len = dataCouponList.length; i < len; i++) { %>',
                '<% if(dataCouponList[i].totalNumber - dataCouponList[i].usedNumber === 0) { %>',
                    '<dl class="store-coupon-sold">',
                        '<dt><span><%=data.currencyText%><%=dataCouponList[i].couponAmount%></span> off <%=data.currencyText%><%=dataCouponList[i].minOrderAmount%>+</dt>',
                        '<dd>Out Of Coupons</dd>',
                    '</dl>',
                '<% } else { %>',
                    '<% if(dataCouponList[i].ifBuyerBind === false) { %>',
                        '<dl class="j-sCoupon-btn store-coupon-sell" data-couponcode="<%=dataCouponList[i].couponCode%>">',
                            '<dt><span><%=data.currencyText%><%=dataCouponList[i].couponAmount%></span> off <%=data.currencyText%><%=dataCouponList[i].minOrderAmount%>+</dt>',
                            '<dd class="j-getNow">Get Now</dd>',
                        '</dl>',
                    '<% } else if(dataCouponList[i].ifBuyerBind === true) { %>',
                        '<dl class="store-coupon-sold">',
                            '<dt><span><%=data.currencyText%><%=dataCouponList[i].couponAmount%></span> off <%=data.currencyText%><%=dataCouponList[i].minOrderAmount%>+</dt>',
                            '<dd>Received</dd>',
                        '</dl>',
                    '<% } %>',
                '<% } %>',
            '<% } %>'
        ],
        //店铺弹出层中的coupon列表展示
        storeCouponMain: [
            '<% var data = obj; %>',
            //查看是否存在店铺优惠券
            '<% if (data.couponList.length > 0) { %>',
                '<div class="datailLayer-store-coupon j-storeCouponLayer close-layer1 dhm-hide">',
                    '<div class="product-title-top j-product-storeTitle-top"><span class="title-top-icon"></span>Store Coupons</div>',
                    '<div class="datail-coupon-box datail-coupon-boxScroll j-datail-coupon-boxScroll">',
                        '{{storeCouponList}}',
                    '</div>',
                    '<p class="store-coupon-note j-store-coupon-note">Note: One coupin per single order, excluding shipping cost.</p>',
                '</div>',
            '<% } %>'
        ],
        storeCouponList: [
            '<% var data = obj; %>',
            '<% var dataCouponList = obj.couponList;%>',
            '<% for (var i = 0, len = dataCouponList.length; i < len; i++) { %>',
                '<% if(dataCouponList[i].totalNumber - dataCouponList[i].usedNumber === 0) { %>',
                    '<dl class="store-coupon-sell store-coupon-sold" data-couponcode="<%=dataCouponList[i].couponCode%>">',
                        '<dd>',
                            '<p class="coupon-1"><span><%=data.currencyText%><%=dataCouponList[i].couponAmount%></span> OFF <%=data.currencyText%><%=dataCouponList[i].minOrderAmount%>+</p>',
                            '<p>Coupon Expires: <%=dataCouponList[i].expiresTime%></p>',
                            '<p class="coupon-2">Issued/Total: <span><%=dataCouponList[i].usedNumber%></span>/<%=dataCouponList[i].totalNumber%></p>',
                        '</dd>',
                        '<dt>Out of Coupons</dt>',
                    '</dl>',
                '<% } else { %>',
                    '<% if(dataCouponList[i].ifBuyerBind === false) { %>',
                        '<dl class="store-coupon-sell j-sCoupon-btn" data-couponcode="<%=dataCouponList[i].couponCode%>">',
                            '<dd>',
                                '<p class="coupon-1"><span><%=data.currencyText%><%=dataCouponList[i].couponAmount%></span> OFF <%=data.currencyText%><%=dataCouponList[i].minOrderAmount%>+</p>',
                                '<p>Coupon Expires: <%=dataCouponList[i].expiresTime%></p>',
                                '<p class="coupon-2">Issued/Total: <span><%=dataCouponList[i].usedNumber%></span>/<%=dataCouponList[i].totalNumber%></p>',
                            '</dd>',
                            '<dt class="j-popGetNow">Get Now</dt>',
                        '</dl>',
                    '<% } else if(dataCouponList[i].ifBuyerBind === true) { %>',
                        '<dl class="store-coupon-received" data-couponcode="<%=dataCouponList[i].couponCode%>">',
                            '<dd>',
                                '<p class="coupon-1"><span><%=data.currencyText%><%=dataCouponList[i].couponAmount%></span> OFF <%=data.currencyText%><%=dataCouponList[i].minOrderAmount%>+</p>',
                                '<p>Coupon Expires: <%=dataCouponList[i].expiresTime%></p>',
                                '<p class="coupon-2">Issued/Total: <span><%=dataCouponList[i].usedNumber%></span>/<%=dataCouponList[i].totalNumber%></p>',
                            '</dd>',
                            '<dt></dt>',
                        '</dl>',
                    '<% } %>',
                '<% } %>',
            '<% } %>'
        ]
    };
});