/**
 * module src: cart/tpl/saveForLaterTpl.js
 * 查看购物车模板
**/
define('appTpl/saveForLaterTpl', [], function(){
    return {
        //saveForLater
        saveForLaterList:[
                '<% var data = obj.cartItems;%>',
                '<% if (data && data.length > 0) { %>',
                   '<h3>SAVE FOR LATER</h3>',
                    '<% for (var i = 0;  i < data.length; i++) { %>',
                        '<div class="j-saveForLaterCont">',
                            '<div class="j-orderDetails order-details clearfix">',
                            '<% if (data[i].cheapen!=="" && data[i].endDate!=="") {%>',
                                '<div class="cheapen">',
                                     '<span><%=$.lang.replaceTplVar("Cart_cheapen", {endTime: data[i].endDate,deals: data[i].cheapen})%></span>',
                                '</div>',
                            '<% } %>',
                            '<div class="od-imgcon">',
                                '<a class="od-img" href="<%=data[i].itemUrl%>">',
                                '<% if(i <= 4) { %>',
                                    '<img src="<%=data[i].imgURL%>"  data-original="<%=data[i].imgURL%>" alt="">',
                                '<% } else { %>',
                                    '<img src="" class="lazy" data-original="<%=data[i].imgURL%>" alt="">',
                                '<% } %>',
                            '</div>',
                            '<div class="od-con">',

                                '<p class="od-productit"><a href="<%=data[i].itemUrl%>"><%=data[i].prodName%></a></p>',
                                '<p class="od-productAttr"><%=data[i].skuInfo%></p>',
                                '<div class="unit-price">',
                                    '<strong>US $</strong><strong class="j-itemPrice"><%=data[i].price%></strong> / <%=data[i].unit%>',
                                '</div>',
                                '<% var cartItemId = data[i].cartItemId; %>',
                                '<% var sellStatus =data[i].sellStatus;%>',
                                '<div class="saveForLaterInfo j-saveForLaterInfo" data-info="<%=encodeURIComponent(JSON.stringify({cartItemId:cartItemId}))%>">',
                                    '<span><%=data[i].quantity%></span>',
                                    '<% if (sellStatus === false) { %>',
                                        '<a href="javascript:void(0)" title="move to cart" class="noMoveToCart">MOVE TO CART</a>',
                                    '<% } else { %>',
                                        '<a href="javascript:void(0)" title="move to cart" class="moveToCart j-moveToCart">MOVE TO CART</a>',
                                    '<% } %>',
                                    '<a class="j-delete" href="javascript:;">Delete</a>',
                                '</div>',
                                '<% if (sellStatus === false) { %>',
                                    '<div class="j-errorInfo error">sold out</div>',
                                '<% } %>',
                            '</div>',
                        '</div>',
                        '</div>',
                   '<% } %>',
                '<% } %>'
        ],
        showMore:[
            '<% var totalCount = obj.totalCount;%>',
            '<% if (totalCount > 10) { %>',
                '<a class="show-more j-show-moreBtn">Show More</a>',
            '<% } %>',
        ]

    }
});
