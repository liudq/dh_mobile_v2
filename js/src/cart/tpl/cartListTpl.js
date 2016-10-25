/**
 * module src: cart/tpl/cartListTpl.js
 * 查看购物车模板
**/
define('appTpl/cartListTpl', [], function(){
    return {
        //头部外层包裹容器
        header:[
                '<div class="header-back clearfix ">',
                    '<a href="javascript:window.location = document.referrer;" class="det-back"><span>Back</span></a>',
                    '<b class="det-hdtitle"><%=$.lang["Cart_my_cart"]%> (<em class="j-itemsTotal">0</em>)</b>',
                '</div>'
        ],
        //查看购物车列表
        cartList:[
                '<% var dataGroups = obj.cartItemGroups;%>',
                '<% if (dataGroups && dataGroups.length > 0) { %>',
                    '<% for (var j = 0, len = dataGroups.length; j < len; j++) { %>',
                        '<section class="order-list j-order-list" data-info="<%=encodeURIComponent(JSON.stringify({shipToCountry:obj.shipToCountry}))%>">',
                            '<h3 class="order-tit">Supplier: <%=dataGroups[j].supplierName%>(<em class="j-orderTotal"><%=dataGroups[j].cartItemCount%></em>)</h3>',
                            '<% var data = dataGroups[j].cartItems %>',
                            '<% for (var i = 0 ; i < data.length; i++) { %>',
                                '<% var sellStatus = data[i].sellStatus %>', //是否可售
                                '<% var inventoryStatus = data[i].inventoryStatus %>',  //库存不足
                                '<% var canDelivery = data[i].canDelivery %>',   //是否可运达国家 
                                '<div data-info="<%=encodeURIComponent(JSON.stringify({sellStatus:sellStatus,inventoryStatus:inventoryStatus,canDelivery:canDelivery}))%>" cartItemId="<%=data[i].cartItemId %>"  class="j-orderDetails order-details clearfix">',
                                    '<% if (data[i].cheapen!=="" && data[i].endDate!=="") {%>',
                                        '<div class="cheapen">',
                                            '<span><%=$.lang.replaceTplVar("Cart_cheapen", {endTime: data[i].endDate,deals: data[i].cheapen})%></span>',
                                        '</div>',
                                    '<% } %>',
                                    '<div class="od-imgcon j-od-imgcon">',
                                        '<% if (sellStatus == true) { %>', //不可售状态时选中按钮置灰不可点击
                                            '<a class="j-odChecked od-checkimg checked" href="javascript:;"></a>',
                                        '<% } else {%>',
                                            '<a class="od-checkimg" href="javascript:;"></a>',
                                        '<% } %>',
                                        '<a class="od-img" href="<%=data[i].itemUrl%>">',
                                            '<img src="" class="lazy" data-original="<%=data[i].imgURL%>" alt="">',
                                        '</a>',
                                    '</div>',
                                    '<div class="od-con">',
                                        '<p class="od-productit"><a href="<%=data[i].itemUrl%>"><%=data[i].prodName%></a></p>',
                                        '<p class="od-productAttr"><%=data[i].skuInfo%></p>',
                                        '<div class="unit-price j-unit-price">',
                                            '<strong>US $</strong><strong class="j-itemPrice"><%=data[i].price%></strong> / <%=data[i].unit%>',
                                        '</div>',
                                        '<span class="ui-number">',
                                            '<input class="j-numDecrease d-decrease" type="button" value="-" data-val="jian">',
                                            '<input class="j-num d-num" type="text" value="<%=data[i].quantity%>" min="<%=data[i].minQuantity%>" max="<%=data[i].maxQuantity%>", data-value="<%=data[i].quantity%>">',
                                            '<input class="j-numIncrease d-increase" type="button" value="+" data-val="jia">',
                                            '<a href="javascript:void(0);" title="" class="j-saveForLater">save for later</a>',
                                            '<a class="j-odDelete" href="javascript:;">Delete</a>',
                                        '</span>',
                                        '<% if (sellStatus === false) { %>',//不可售状态时提示错误信息
                                            '<div class="j-errorInfo error"><%=$.lang["PO_item_sold_out"] %></div>',
                                        '<% } %>',
                                        '<div class="j-errorInfo error"></div>',
                                    '</div>',
                                '</div>',
                            '<% } %>',
                        '</section>',
                    '<% } %>',
                '<% }else{ %>',
                    '<div class="errorinfro">',
                        '<div class="serror"><%=$.lang["Cart_alert_noitem"] %></div>',
                        '<div class="cart-goon"><a href="http://<%=document.domain %>"><%=$.lang["Continue_shopping"] %></a></div>',
                    '</div>',
                '<% } %>'
        ],
        checkOut:[
            '<div class="checkout-main">',
                '<div class="checkout-price"><span class="j-itemsTotal">0</span> <%=$.lang["Cart_items_subtotal"] %> :<br/><strong>US $</strong><strong class="j-totalPrice">0</strong></div>',
                '<div class="checkout-btn"><input class="j-checkOut" type="button" value="<%=$.lang["Cart_check_out"]%>"/></div>',
            '</div>',
        ]
    }
});
