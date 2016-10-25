/**
 * module src: mycoupon/tpl/getCouponListTpl.js
 * 获取coupon列表初始化初始化模板
**/
define('appTpl/getCouponListTpl', [], function(){
    return {
        warp: [
        '<% var data = obj.couponList, len = data.length;%>',
        '<% if (len !== 0) { %>',
        '<% for (var i = 0; i < len; i++) { %>',
            '<div class="coupon-box">',
                //couponType:1是seller coupon需要加a标签
                '<% if (data[i].couponType === "1") { %>',
                    '<a href="<%=data[i].supplierSeq%>">',
                '<% } %>',
                    '<div class="coupon-tit">',
                        //couponType：0是Dhcoupon 1是seller coupon
                        '<% if (data[i].couponType === "0") { %>',
                            //使用平台,0 all;1 PC;2 Mobile;3 App;4 Wap;5 英文站专用;6 俄文站专用;7 法文站专用;8 西班牙站专用;9 葡萄牙站专用;10 德文站专用;11 意大利站专用;
                            '<% if(data[i].plateForm === "1"){ %>',
                                'DHcoupon(Only for Desktop Website)',
                            '<% }else if(data[i].plateForm === "2"){ %>',
                                'DHcoupon(Only for App & Mobile Website)',
                            '<% }else if(data[i].plateForm === "3"){ %>',
                                'DHcoupon(Only for App)<span class="coupon-goto j-gotoapp"><a href="javascript:;">Go to App</a></span>',
                            '<% }else if(data[i].plateForm === "4"){ %>',
                                'DHcoupon(Only for Mobile Website)',
                            '<% }else{%>',
                                'DHcoupon',
                            '<% } %>',
                        '<% } else if(data[i].couponType === "7") { %>',
                            '<% if(data[i].plateForm === "3"){ %>',
                                'Seller: <%=data[i].sellerName%>(App Coupon)<span class="coupon-goto j-gotoapp"><a href="javascript:;">Go to App</a></span>',
                            '<% } %>',
                        '<% } else { %>',
                                'Seller: <%=data[i].sellerName%><span class="coupon-goto"></span>',
                        '<% } %>',
                    '</div>',
                    '<div class="coupon-con">',
                        '<dl>',
                            '<dt><b>US $<%=data[i].amount%> OFF</b>Order over US $<%=data[i].orderAmo%></dt>',
                            //timeState：0：正常状态；1：快要开始；2：快要到期
                            '<% if (data[i].timeState === 1) { %>',
                                '<dd>Validity Period: <span class="coupon-data"><%=data[i].startDate%></span> - <%=data[i].endDate%></dd>',
                            '<% }else if(data[i].timeState === 2){ %>',
                                '<dd>Validity Period: <%=data[i].startDate%> - <span class="coupon-data"><%=data[i].endDate%></span></dd>',
                            '<% }else if(data[i].timeState === 0){ %>',
                                '<dd>Validity Period: <%=data[i].startDate%> - <%=data[i].endDate%></dd>',
                            '<% } %>',
                            ////allcategory：0代表有类目限制，展示限制类目 1代表适合所有类目。
                            '<% if (data[i].specialProduct === "3") { %>',
                                '<dd>Scope: Valid on specified products.</dd>',
                            '<% }else{%>',
                                '<% if (data[i].allcategory === 1) { %>',
                                    '<dd>Scope: Valid on all categories</dd>',
                                '<% }else if(data[i].allcategory === 0){ %>',
                                    '<dd>Scope: Valid on specified categories.</dd>',
                                '<% } %>',
                            '<% } %>',
                            //判断plateForm>4为coupon应用的站点
                            '<% if (parseInt(data[i].plateForm) > 4) { %>',
                                '<dd><%=data[i].site%></dd>',
                            '<% } %>',
                            //判断refundOrderId退款订单id
                            '<% if (data[i].refundOrderId) { %>',
                                '<dd>Returned from Refund (#po: <%=data[i].refundOrderId%>)</dd>',
                            '<% } %>',
                        '</dl>',
                        //timeState：0：正常状态；1：快要开始；2：快要到期
                        '<% if (data[i].timeState === 1) { %>',
                            '<div class="coupon-soon">Starting Soon</div>',
                        '<% }else if(data[i].timeState === 2){ %>',
                            '<div class="coupon-soon soon-color">Expiring Soon!</div>',
                        '<% } %>',
                    '</div>',
                //couponType:1是seller coupon需要加a标签
                '<% if (data[i].couponType === "1") { %>',
                    '</a>',
                '<% } %>',
            '</div>',
        '<% } %>',
        '<% } %>' 
        ],
        zeroResult:[
            '<div class="con-getcoupons j-nocouponList">',
            '<p>You haven\'t any avilable coupons!</p>',
            '<div class="get-coupons"><a href="http://promo.dhgate.com/en/coupon/store-coupon.html">Go to get coupons</a></div>',
            '</div>',
        ]
    }
});
