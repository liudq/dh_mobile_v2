/**
 * module src: getCoupon/tpl/getCouponTpl.js
 * 支付成功信息初始化模板
**/
define('appTpl/getCouponTpl', [], function(){
    return {
        //初始化需要绘制的页面元素
        warp: [
            '<% var data = obj.couponList, len = data.length;%>',
            '<% if (len !== 0) { %>',
            '<% for (var i = 0; i < len; i++) { %>',
                //isreceived=0是可领取的coupon
                '<% if (data[i]["isreceived"]==="0") { %>',
                 //大于等于4主要是针对app专享可领取的coupon添加样式名：coupon-box2，目的在于解决页面前4个coupon列表是黄色，后面的是绿色的样式展示问题。
                    '<% if (i < 4) { %>',
                        '<div class="coupon-box j-couponbox" data-currentCode=<%=data[i].couponcode%>>',
                    '<% }else{ %>',
                        '<div class="coupon-box coupon-box2 j-couponbox" data-currentCode=<%=data[i].couponcode%>>',
                    '<% } %>',
                            '<a href="javascript:;">',
                                '<dl>',
                                    '<dd>',
                                        '<p class="p1"><span>$<%=data[i].amount%></span> OFF $<%=data[i].orderAmo%></p>',
                                        '<p class="p2">Coupon Expires: <%=data[i].endDate%></p>',
                                        '<p class="p2">Issued/Total: <span class="j-currentCouponNum"><%=data[i].usedNumber%></span>/<%=data[i].totalNumber%></p>',
                                    '</dd>',
                                    '<dt>Get Now</dt>',
                                '</dl>',
                            '</a>',
                        '</div>',
                    //isreceived=1是已经领取的coupon
                '<% }else if(data[i]["isreceived"]==="1"){ %>',
                    '<div class="coupon-box outof2 j-couponbox" data-currentCode=<%=data[i].couponcode%>>',
                        '<a href="javascript:;">',
                            '<dl>',
                                '<dd>',
                                    '<p class="p1"><span>$<%=data[i].amount%></span> OFF $<%=data[i].orderAmo%></p>',
                                    '<p class="p2">Coupon Expires: <%=data[i].endDate%></p>',
                                    '<p class="p2">Issued/Total: <span class="j-currentCouponNum"><%=data[i].usedNumber%></span>/<%=data[i].totalNumber%></p>',
                                  '</dd>',
                                 '<dt></dt>',
                            '</dl>',
                        '</a>',
                    '</div>',
                //isreceived=2是被领光的coupon
                '<% }else{ %>',
                    '<div class="coupon-box outof j-couponbox" data-currentCode=<%=data[i].couponcode%>>',
                        '<a href="javascript:;">',
                            '<dl>',
                                '<dd>',
                                    '<p class="p1"><span>$<%=data[i].amount%></span> OFF $<%=data[i].orderAmo%></p>',
                                    '<p class="p2">Coupon Expires: <%=data[i].endDate%></p>',
                                    '<p class="p2">Issued/Total: <span class="j-currentCouponNum"><%=data[i].usedNumber%></span>/<%=data[i].totalNumber%></p>',
                                  '</dd>',
                                  '<dt>Out of<br>Coupons</dt>',
                            '</dl>',
                        '</a>',
                    '</div>',
                '<% } %>',
            '<% } %>',
            '<% } %>'
        ]
    }
});
