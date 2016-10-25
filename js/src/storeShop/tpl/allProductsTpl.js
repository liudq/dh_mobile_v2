/**
 * module src: storeShop/tpl/allProductsTpl.js
 * 全部商品模块
 **/
define('appTpl/allProductsTpl', [], function(){
    return {
        //全部商品
        allProducts: [
            '<% var data = obj.list.itemWinDtos;%>',
            '<% if(data.length > 0) { %>',
                '<% for(var i=0;i<data.length;i++){%>',
                   '<li>',
                         '<a href="<%=data[i].productUrl%>">',
                                '<div class="store-list-img">',
                                '<% if(data[i].type == 2 || data[i].type == 4 ){%>',//促销
                                    '<% if(data[i].itemWinPromoDto.dynamicType == 0){%>',//sale
                                         '<span class="sale"></span>',
                                    '<% }else{ %>',
                                        '<% if(data[i].itemWinPromoDto.promoTypeId == 0){%>',//折扣
                                              '<span class="off-ico2"><%=data[i].itemWinPromoDto.discountRate%></span>',
                                        '<% }else if(data[i].itemWinPromoDto.promoTypeId == 10) {%>',//直降
                                             '<span class="reduction-ico">$<%=data[i].itemWinPromoDto.discountRate%></span>',
                                        '<% } %>',
                                    '<% } %>',
                                '<% } %>',
                             /*   '<% if(dataItemWinList[j].type == 5 ){%>',//vip
                                    '<span class="icon-vip"></span>',
                                '<% } %>',*/
                                '<% if(i<4){%>',
                                     '<img src="<%=data[i].itemImgUrl%>" alt="<%=data[i].seoItemName%>"/>',
                                '<% }else{ %>',
                                     '<img data-original="<%=data[i].itemImgUrl%>" src="" class="lazy" alt="<%=data[i].seoItemName%>"/>',
                                '<% } %>',
                             '</div>',
                             '<h3><%=data[i].itemName%></h3>',
                             '<dl class="info">',
                                    '<% if(data[i].type == 3 || data[i].type == 4 ){%>',//移动专享非促销 && 移动专享促销
                                        '<b class="mobile-deals"></b>',
                                    '<% } %>',
                                    '<% if(data[i].maxPrice !== 0){%>',
                                         '<dt class="nowPrice">US $<%=data[i].minPrice%> - <%=data[i].maxPrice%></span>/ <%=data[i].measureName%></dt>',
                                    '<% } else {%>',
                                      '<dt class="nowPrice">US $<%=data[i].minPrice%></span>/ <%=data[i].measureName%></dt>',
                                    '<% } %>',
                                '<% if(data[i].isfreeShipping == true){%>',
                                     '<dd>Free Shipping</dd>',
                                '<% } %>',
                                '<dd>Minimum Order: <%=data[i].minOrder%> <%=data[i].measureName%></dd>',
                                '<dd>Sold: <%=data[i].soldNum%></dd>',
                             '</dl>',
                         '</a>',
                    '</li>',
                '<% }%>',
            '<% } %>'
        ]
    };
});

