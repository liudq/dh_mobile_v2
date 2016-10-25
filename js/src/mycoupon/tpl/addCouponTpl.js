/**
 * module src: mycoupon/tpl/addCoupon.js
 * 添加coupon模板
**/
define('appTpl/addCouponTpl', [], function(){
    return {
        warp: [
        '<% var data = obj.couponList;%>',
        //couponType:1是seller coupon需要加a标签
        '<% if (data.couponType === "1") {%>',
            '<a href="<%=data.supplierSeq%>">',
        '<% } %>',
            '<div class="coupon-tit">',
                //couponType：0是Dhcoupon 1是seller coupon
                '<% if (data.couponType === "0") { %>',
                    //使用平台,0 all;1 PC;2 Mobile;3 App;4 Wap;5 英文站专用;6 俄文站专用;7 法文站专用;8 西班牙站专用;9 葡萄牙站专用;10 德文站专用;11 意大利站专用;
                    '<% if(data.plateForm === "1"){ %>',
                        'DHcoupon(Only for Desktop Website)</div>',
                    '<% }else if(data.plateForm === "2"){ %>',
                        'DHcoupon(Only for App & Mobile Website)',
                    '<% }else if(data.plateForm === "3"){ %>',
                        'DHcoupon(Only for App)<span class="coupon-goto j-gotoapp"><a href="javascript:;">Go to App</a></span>',
                    '<% }else if(data.plateForm === "4"){ %>',
                        'DHcoupon(Only for Mobile Website)',
                    '<% }else{%>',
                        'DHcoupon</div>',
                    '<% } %>',
                '<% }else{ %>',
                        'Seller: <%=data.sellerName%>',
                '<% } %>',
            '</div>',
            '<div class="coupon-con">',
                '<dl>',
                    '<dt><b>US $<%=data.amount%> OFF</b>Order over US $<%=data.orderAmo%></dt>',
                    //timeState：0：正常状态；1：快要开始；2：快要到期
                    '<% if (data.timeState === 1) { %>',
                        '<dd>Validity Period: <span class="coupon-data"><%=data.startDate%></span> - <%=data.endDate%></dd>',
                    '<% }else if(data.timeState === 2){ %>',
                        '<dd>Validity Period: <%=data.startDate%> - <span class="coupon-data"><%=data.endDate%></span></dd>',
                    '<% }else if(data.timeState === 0){ %>',
                        '<dd>Validity Period: <%=data.startDate%> - <%=data.endDate%></dd>',
                    '<% } %>',
                    ////allcategory：0代表有类目限制，展示限制类目 1代表适合所有类目。
                    '<% if (data.specialProduct === "3") { %>',
                        '<dd>Scope: Valid on specified products.</dd>',
                    '<% }else{%>',
                        '<% if (data.allcategory === 1) { %>',
                            '<dd>Scope: Valid on all categories</dd>',
                        '<% }else if(data.allcategory === 0){ %>',
                            '<dd>Scope: Valid on specified products.</dd>',
                        '<% } %>',
                    '<% } %>',
                    //判断plateForm>4为coupon应用的站点
                    '<% if (parseInt(data.plateForm) > 4) { %>',
                        '<dd><%=data.site%></dd>',
                    '<% } %>',
                    //判断refundOrderId退款订单id
                    '<% if (data.refundOrderId) { %>',
                        '<dd>Returned from Refund (#po: <%=data.refundOrderId%>)</dd>',
                    '<% } %>',
                '</dl>',
                //timeState：0：正常状态；1：快要开始；2：快要到期
                '<% if (data.timeState === 1) { %>',
                    '<div class="coupon-soon">Starting Soon</div>',
                '<% }else if(data.timeState === 2){ %>',
                    '<div class="coupon-soon soon-color">Expiring Soon!</div>',
                '<% } %>',
            '</div>',
        //couponType:1是seller coupon需要加a标签
        '<% if (data.couponType === "1") { %>',
            '</a>',
        '<% } %>'
        ]
    }
});
