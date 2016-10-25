/**
 * Created by liudongqing on 2015/12/15.
 */
/**
 * module src: myFavorites/tpl/myFavoritesListTpl.js
 * 收藏列表模版
 **/
define('appTpl/myFavoritesListTpl', [], function(){
    return {
    //当前收藏页标题
        favTitle:[
            '<h1><%=$.lang["FAV_title"] %></h1>'
        ],
        //收藏列表
        myFavorites: [
            '<% var data = obj.list.favoriteProductDTOList; %>',
                '<% if(data.length > 0) { %>',
                '<ul>',
                    '<% for(var i=0;i<data.length;i++){%>',
                        '<% if(data[i].state == 0) { %>',//sold out 商品
                            '<li class="j-fav-item sold-out">',
                                '<a href="<%=data[i].productUrl%>">',
                                    '<% if(data[i].imgurl == undefined || data[i].imgurl == "") { %>',
                                        '<div class="list-img no-img">',
                                            '<img src="http://css.dhresource.com/mobile_v2/myFavorites/image/pic_photo@3x.png">',
                                        '</div>',
                                    '<% } else { %>',
                                        '<div class="list-img">',
                                            '<img src="<%=data[i].imgurl%>">',
                                        '</div>',
                                    '<% } %>',

                                    '<div class="list-cont">',
                                        '<span class="text-black"><%=data[i].productname%></span>',
                                        '<span class="so"><%=$.lang["FAV_sold_out"] %></span>',
                                    '</div>',
                                '</a>',
                                '<a href="javascript:;" class="j-delete-fav" favItemId="<%=data[i].productno%>" pageType="<%=data[i].pageType%>"></a>',
                            '</li>',
                        '<% } else { %>',// 正常商品
                            '<li class="j-fav-item" pageType="<%=data[i].pageType%>">',
                                '<a href="<%=data[i].productUrl%>">',
                                     '<% if(data[i].imgurl == undefined || data[i].imgurl == "") { %>',
                                        '<div class="list-img no-img">',
                                            '<img src="http://css.dhresource.com/mobile_v2/myFavorites/image/pic_photo@3x.png">',
                                        '</div>',
                                    '<% } else { %>',
                                        '<div class="list-img">',
                                            '<% if(i < 4) { %>',
                                                '<img src="<%=data[i].imgurl%>">',
                                            '<% } else { %>',
                                                '<img data-original="<%=data[i].imgurl%>" src="" class="lazy">',
                                            '<% } %>',
                                        '</div>',
                                    '<% } %>',

                                    '<div class="list-cont">',
                                        '<span class="text-black"><%=data[i].productname%></span>',
                                        '<% if(data[i].itemType == "2") { %>',//促销商品：2.促销
                                            '<% if(data[i].promoType == "0") { %>',//折扣
                                                '<span class="text-promotion"><%=$.lang["FAV_off"].replace(/\{\{v\}\}/,data[i].discount + "%") %></span>',
                                            '<% } else if(data[i].promoType == "10"){%>',//直降
                                                '<span class="text-promotion"><%=$.lang["FAV_off"].replace(/\{\{v\}\}/,data[i].discount) %></span>',
                                            '<% } %>',
                                        '<% } else if(data[i].itemType == "3") { %>',// 3.移动专享&非促销
                                                '<span class="text-promotion"><b class="mobile-deals"></b></span>',
                                        '<% } else if(data[i].itemType == "4") { %>',// 4.移动专享&促销
                                            '<% if(data[i].promoType == "0") { %>',//折扣
                                                '<span class="text-promotion"><b class="mobile-deals"></b> <b class="promo"><%=$.lang["FAV_off"].replace(/\{\{v\}\}/,data[i].discount + "%") %></b></span>',
                                            '<% } else if(data[i].promoType == "10"){%>',//直降
                                                 '<span class="text-promotion"><b class="mobile-deals"></b> <b class="promo"><%=$.lang["FAV_off"].replace(/\{\{v\}\}/,data[i].discount) %></b></span>',
                                            '<% } %>',
                                        '<% } else if(data[i].itemType == "5") { %>',// 5.VIP
                                            '<span class="text-promotion">VIP</span>',
                                        '<% } else if(data[i].itemType == "6") { %>',// 6vip&促销
                                            '<% if(data[i].promoType == "0") { %>',//折扣
                                                '<span class="text-promotion"><%=$.lang["FAV_off_vip"].replace(/\{\{v\}\}/,data[i].discount + "%") %></span>',
                                            '<% } else if(data[i].promoType == "10"){%>',//直降
                                                 '<span class="text-promotion"></b><%=$.lang["FAV_off_vip"].replace(/\{\{v\}\}/,data[i].discount) %></span>',
                                            '<% } %>',
                                        '<% } else if(data[i].itemType == "7") { %>',// 7移动专享+vip+促销
                                            '<% if(data[i].promoType == "0") { %>',//折扣
                                                '<span class="text-promotion"><b class="mobile-deals"></b> <b class="promo"><%=$.lang["FAV_off_vip"].replace(/\{\{v\}\}/,data[i].discount + "%") %></b></span>',
                                            '<% } else if(data[i].promoType == "10"){%>',//直降
                                                '<span class="text-promotion"></b><b class="mobile-deals"></b> <b class="promo"><%=$.lang["FAV_off_vip"].replace(/\{\{v\}\}/,data[i].discount) %></b></span>',
                                            '<% } %>',
                                        '<% } else if(data[i].itemType == "8") { %>',// 8移动专享+vip+非促销
                                             '<span class="text-promotion"><b class="mobile-deals"></b> <b class="promo">VIP</b></span>',
                                        '<% } else {%>',
                                        '<% } %>',
                                        '<span class="now-price"><b><%=data[i].finalPrice%></b> / <%=data[i].measure%></span>',
                                        '<% if(data[i].freeShipping == true) { %>',//是免邮 free shipping
                                            '<span class="free-shipping"><%=$.lang["free_shipping"] %></span>',
                                        '<% } %>',
                                        '<span class="min-order"><%=$.lang["min_order"] %>: <%=data[i].minOrder%></span>',
                                    '</div>',
                                '</a>',
                                '<a href="javascript:;" class="j-delete-fav" favItemId="<%=data[i].productno%>"></a>',
                                '<div class="removeArea dhm-hide">',
                                    '<span class="text-remove"><%=$.lang["FAV_removed_text"] %></span>',
                                    '<span class="text-black"><%=data[i].productname%></span>',
                                    '<a href="javascript:;" class="undo"  favItemId="<%=data[i].productno%>" pageType="<%=data[i].pageType%>"><%=$.lang["FAV_undo"] %></a>',
                                '</div>',
                            '</li>',
                        '<% }%>',
                    '<% }%>',
                '</ul>',
            '<% } %>',
        ],
        showMore:[
            '<a class="show-more"><%=$.lang["Show_more"] %></a>',
        ],
        noItem:[
            '<div class="no-item"><%=$.lang["FAV_noItem"] %></div>',
        ],
        removeArea:[
             '<li class="remove-undo">',
                 '<span class="text-black"></span>',
                 '<span class="text-remove"><%=$.lang["FAV_removed_text"] %></span>',
                 '<a href="javascript:;" class="undo"><%=$.lang["FAV_undo"] %></a>',
             '</li>'
        ]
    };
});

