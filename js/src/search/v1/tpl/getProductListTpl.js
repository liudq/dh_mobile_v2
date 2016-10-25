/**
 * module src: search/tpl/getProductListTpl.js
 * 获取search列表初始化初始化模板
**/

define('appTpl/getProductListTpl', [], function(){
    return {
        warp: [
        '<% var data = obj.list, len = data.length;%>',
        '<% if (len !== 0) { %>',
        '<% for (var i = 0; i < len; i++) { %>',
        '<li>',
            '<a href="<%=data[i]["url"]%>">',
                '<div class="list-img">',
                    //'<% if (i<=1) { %>',
                        '<img  src="<%=data[i]["imageurl"]%>"/>',
                    //'<% }else {%>',
                      //  '<img  src="http://css.dhresource.com/mobile/home/image/grey.png" class="lazy" data-original="<%=data[i]["imageurl"]%>" />',
                    //'<% } %>',
                '</div>',
                '<div class="list-cont">',
                    '<div class="list-title"><%=data[i]["title"]%></div>',
                    '<div class="by-sellername">by <%=data[i]["sellerName"]%></div>',
                    '<div class="now-price"><strong>$<%=data[i]["price"]%></strong> / <%=data[i]["measure"]%></div>',
                    //有移动专享价情况
                    '<% if (data[i].hasMobilePrice==="1") { %>',
                        '<div class="priceOnApp">$<%=data[i]["lowPrice"]%> on App</div>',
                    '<% } %>',
                    '<div class="freeship-coupon">',
                        //免运费
                        '<% if (data[i].freeShipping==="1") { %>',
                            '<span class="free-shipping">Free Shipping</span>',
                        '<% } %>',
                        //有coupon存在
                        '<% if (data[i].hasCoupon==="1") { %>',
                            '<span class="clip-coupon">Clip Coupon</span>',
                        '<% } %>',
                    '</div>',
                    '<div class="min-order">Min. Order: <%=data[i]["minOrder"]%> piece</div>',
                    //已售出数量
                    '<% if (data[i].quantitysold) { %>',
                        '<div class="orders"><%=data[i]["quantitysold"]%>',
                        '<% if (parseInt(data[i].quantitysold)>1) { %>',
                            ' Orders</div>',
                        '<% }else{ %>',
                            ' Order</div>',
                        '<% } %>',
                    '<% } %>',
                    //存在评论数
                    '<% if (data[i].quantityreviews) { %>',
                        '<div class="reviews clearfix"><span class="reviewsCon"><span class="reviewsNum" style="width:<%=data[i]["quantityreviews"]%>%"></span></span><em>(<%=data[i]["quantityreviews"]%>)</em></div>',
                    '<% } %>',
                '</div>',
            '</a>',
            '<span data-pagetype="4" data-itemcode="<%=data[i]["itemcode"]%>" class="j-favorite favorite"><var class="icon-nofavorite"></var></span>',
        '</li>',
        '<% } %>',
        '<% } %>' 
        ]
    }
});
