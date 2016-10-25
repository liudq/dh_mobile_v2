/**
 * module src: storeShop/tpl/storeListTpl.js
 * 橱窗商品模块
 **/
define('appTpl/storeListTpl', [], function(){
    return {
        //橱窗二级类目
        storeCategory: [
            '<% var data = obj.list;%>',
            '<% if(data.length > 0) { %>',
                 '<% for(var i=0;i<data.length;i++){%>',
                      '<li class="swiper-slide"><a href="javascript:;"><%=data[i].displayWinName%></a></li>',
                '<% }%>',
            '<% } %>'
        ],
        //橱窗商品列表
         storeList:[
             '<% var data = obj.list;%>',
             '<% if(data.length > 0) { %>',
                 '<% for(var i=0;i<data.length;i++){%>',
                        '<ul class="store-list clearfix hide">',
                            '<% var dataItemWinList = data[i].itemWinList;%>',
                                '<% for(var j=0;j<dataItemWinList.length;j++){%>',
                                     '<li>',
                                        '<a href="<%=dataItemWinList[j].productUrl%>">',
                                             '<div class="store-list-img">',
                                                 '<% if(dataItemWinList[j].type == 2 || dataItemWinList[j].type == 4){%>',//促销
                                                     '<% if(dataItemWinList[j].itemWinPromoDto.dynamicType == 0){%>',
                                                         '<span class="sale"></span>',
                                                      '<% }else{ %>',
                                                             '<% if(dataItemWinList[j].itemWinPromoDto.promoTypeId == 0){%>',
                                                                 '<span class="off-ico2"><%=dataItemWinList[j].itemWinPromoDto.discountRate%></span>',
                                                             '<% }else if(dataItemWinList[j].itemWinPromoDto.promoTypeId == 10) {%>',
                                                                 '<span class="reduction-ico">$<%=dataItemWinList[j].itemWinPromoDto.discountRate%></span>',
                                                             '<% } %>',
                                                      '<% } %>',
                                                 '<% } %>',
                                       /*          '<% if(dataItemWinList[j].type == 5 ){%>',//vip
                                                    '<span class="icon-vip"></span>',
                                                 '<% } %>',*/
                                                 '<% if(j<4){%>',
                                                     '<img src="<%=dataItemWinList[j].itemImgUrl%>"  alt="<%=dataItemWinList[j].seoItemName%>" />',
                                                 '<% }else{ %>',
                                                     '<img data-original="<%=dataItemWinList[j].itemImgUrl%>" src="" class="lazy" alt="<%=dataItemWinList[j].seoItemName%>" />',
                                                 '<% } %>',
                                             '</div>',
                                             '<h3><%=dataItemWinList[j].itemName%></h3>',
                                             '<dl class="info">',
                                                 '<% if(dataItemWinList[j].type == 3 || dataItemWinList[j].type == 4 ){%>',//移动专享非促销 && 移动专享促销
                                                    '<b class="mobile-deals"></b>',
                                                 '<% } %>',
                                                 '<% if(dataItemWinList[j].maxPrice !== 0){%>',
                                                    '<dt class="nowPrice">US $<%=dataItemWinList[j].minPrice%>  - <%=dataItemWinList[j].maxPrice%> / <%=dataItemWinList[j].measureName%></dt>',
                                                 '<% } else {%>',
                                                     '<dt class="nowPrice">US $<%=dataItemWinList[j].minPrice%> / <%=dataItemWinList[j].measureName%></dt>',
                                                 '<% } %>',
                                                 '<% if(dataItemWinList[j].isfreeShipping == true){%>',
                                                     '<dd>Free Shipping</dd>',
                                                 '<% } %>',
                                                 '<dd>Minimum Order: <%=dataItemWinList[j].minOrder%> <%=dataItemWinList[j].measureName%></dd>',
                                                 '<dd>Sold: <%=dataItemWinList[j].soldNum%></dd>',
                                              '</dl>',
                                         '</a>',
                                     '</li>',
                                '<% }%>',
                        '</ul>',
                 '<% }%>',
             '<% } %>'
        ]
    };
});

