/**
 * module src: common/tpl/detail/priceRangeTpl.js
 * sku价格区间
**/
define('tpl/detail/priceRangeTpl', [], function(){
    return {
        //主体内容
        main: [
            '<% var data = obj;%>',
            '<div class="pro-table">',
                '{{arrtPriceRanges}}',
            '</div>',
            '<div class="layer-tit">Quantity</div>',
            '<div class="pro-number">',
                '{{quantity}}',
                '<div class="j-quantityUnit">',
                    '{{quantityUnit}}',
                '</div>',
                //是否是限时限量促销
                '<% if (data.isLimitPromo === true) { %>',
                    '{{limitPromoContent}}',
                '<% } %>',
            '</div>'
        ],
        //产品价格区间
        productPrice: [
            '<% var data = obj;%>',
            //显示促销价
            '<p class="pro-piece">',
                '<b>US $<%=data.displayPrice%></b> / ',
                  '<% if (isLot === true) { %>',
                     ' Lot ',
                    '<span>(<%=data.lot%> <%=data.plural%> / Lot)</span>',
                  '<% } else { %>',
                    '<%=data.measureName%>',
                  '<% } %>',
            '</p>',
            //是否展示删除价
            '<% if (data.isDeletePrice===true) { %>',
                '<p class="pro-piece2">',
                  '<b">US $<%=data.deletePrice%></b> / ',
                  '<% if (isLot === true) { %>',
                     ' Lot ',
                  '<% } else { %>',
                    '<%=data.measureName%>',
                  '<% } %>',
                '</p>',
            '<% } %>',
            '<p><%=data.inventoryQuantity%> in Stock</p>'
        ],
        //选择SKU产品属性价格区间
        arrtPriceRanges: [
            '<% var data = obj; %>',
            '<% var discountPrice = data.priceRanges[0].discountPrice %>',
            '<% if (discountPrice > 0) { %>',
                '<table width="100%" border="0" cellspacing="0" cellpadding="0">',
            '<% } else { %>',
                '<table width="100%" border="0" cellspacing="0" cellpadding="0" class="pro-table-two">',
            '<% } %>',
                '<thead>',
                    '<tr class="table-tit">',
                        '<td class="tr1"><span>Quantity</span></td>',
                        '<td class="tr2"><span>Price</span> /Piece</td>',
                        '<% if (discountPrice > 0) { %>',
                            '<td class="tr3">',
                                '<% if (data.isVip === true) { %>',
                                  '<span>Prime Price </span>/Piece',
                                '<% } else if (data.isDeletePrice !== false) { %>',
                                  '<span>Discount Price </span>/Piece',
                                '<% } %>',
                            '</td>',
                        '<% } %>',
                    '</tr>',
                '</thead>',
                '<tbody>',
                    '<% for (var i = 0; i < data.priceRanges.length; i++) { %>',
                        '<% if (i === 0) { %>',
                            '<tr class="tr-current">',
                        '<% } else { %>',
                            '<tr>',
                        '<% } %>',
                                    '<td><%=data.priceRanges[i].numLowerLimit%>+</td>',
                                '<% if (discountPrice <= 0) { %>',
                                    '<td class="td2 noLineThrough">US $<%=data.priceRanges[i].originalPrice%></td>',
                                '<% } else { %>',
                                    '<td class="td2">US $<%=data.priceRanges[i].originalPrice%></td>',
                                    '<td class="td3">US $<%=data.priceRanges[i].discountPrice%></td>',
                                '<% } %>',
                            '</tr>',
                    '<% } %>',
                '</tbody>',
          '</table>'
        ],
        //购买数量
        quantity: [
            '<% var data = obj;%>',
            //是否为限时限量活动
            '<% if (data.isLimitPromo === true) { %>',
                //活动库存
                '<% var inventory = data.maxPurchaseQuantity;%>',
            '<% } else { %>',
                //默认库存
                '<% var inventory = data.inventoryQuantity;%>',
            '<% } %>',
            //'<%console.log(data);%>',
            //是否可售或无库存
            '<% if (data.istate === false || inventory === 0) { %>',
                '<span class="pro-reduce pro-number-sold">-</span>',
                '<input name="" type="text" class="pro-num pro-number-sold" maxlength="10" value="<%=data.minOrder%>">',
                '<span class="pro-plus pro-number-sold">+</span>',
            //反之
            '<% } else { %>',
                '<span class="pro-reduce j-pro-reduce pro-number-sold">-</span>',
                '<input name="" type="number" class="pro-num j-pro-num" autocomplete="off" value="<%=data.minOrder%>">',
                '<span class="pro-plus j-pro-plus">+</span>',
            '<% } %>',
        ],
        //购买数量计量单位
        quantityUnit: [
            '<span class="pro-text">',
              '<% var data = obj;%>',
              '<% if (isLot === true) { %>',
                 '<% if (data.minOrder > 1 || data.quantity > 1) { %>',
                  '<p> Lots </p>',
                '<% } else { %>',
                  '<p> Lot </p>',
                '<% } %>',
                '(MOQ:',
                //最小购买数量大于1显示个数单位否则显示复数单位
                '<% if (data.minOrder > 1) { %>',
                  '<%=data.minOrder%> Lots)',
                '<% } else { %>',
                  '<%=data.minOrder%> Lot)</span>',
                '<% } %>',
              '<% } else { %>',
                //最小购买数量大于1显示个数单位否则显示复数单位
                '<% if (data.minOrder > 1 || data.quantity > 1) { %>',
                  '<p><%=data.plural%></p>',
                '<% } else { %>',
                  '<p><%=data.measureName%></p>',
                '<% } %>',
                '(MOQ:',
                '<% if (data.minOrder > 1) { %>',
                  '<%=data.minOrder%> <%=data.plural%>)',
                '<% } else { %>',
                  '<%=data.minOrder%> <%=data.measureName%>)',
                '<% } %>',
              '<% } %>',
            '</span>',
        ],
        //限时限量提示内容
        limitPromoContent: [
            '<% var data = obj;%>',
            '<p class="pro-prompt">Limited to <%=data.maxPurchaseQuantity%>',
                '<% if (isLot === true) { %>',
                    '<% if (data.maxPurchaseQuantity > 1) { %>',
                    ' Lots ',
                    '<% } else { %>',
                        ' Lot ',
                    '<% } %>',
                '<% } else { %>',
                    '<% if (data.maxPurchaseQuantity > 1) { %>',
                    ' <%=data.plural%> ',
                    '<% } else { %>',
                        ' <%=data.measureName%> ',
                    '<% } %>',
                '<% } %>',
                ' per Buyer',
          '</p>'
        ]
    };
});