/**
 * module src: common/tpl/detail/getDefaultShipCostAndWayTpl.js
 * 获取默认展示的[运输方式|目的国家|备货地|运达时间]模板模块
**/
define('tpl/detail/getDefaultShipCostAndWayTpl', [], function(){
    return {
        //主体内容
        main: [
            '<% var data = obj; %>',
            '<div class="datail-product-free-layer close-layer1 dhm-hide j-shipCostLayerWarp">',
                //运费弹出层关闭标题
                '<div class="product-title-top j-shipCostLayerClose">',
                    '<a href="javascript:;">',
                        '<span class="title-top-icon"></span>',
                        'Choose Shipping Method',
                    '</a>',
                '</div>',
                //当前运费详细信息
                '<div class="j-curShipCostInfoWarp">',
                    '{{curShipCostInfo}}',
                '</div>',
                //当前运达目的国家
                '<div class="j-whitherCountryWarp">',
                    '{{curWhitherCountry}}',
                '</div>',
                //当前运达目的国家下的物流方式列表
                '<div class="datail-product-free-layer j-expressTypeListWarp"></div>',
            '</div>'
        ],
        //当前运费详细信息
        curShipCostInfo: [
            '<% var data = obj; %>',
            //可运达才做展示
            '<% if (data.shipcost >= 0) { %>',
                '<div class="datail-free-address">',
                    //有运费
                    '<% if (data.shipcost > 0) { %>',
                        '<p class="free-address-piece">',
                            '<b>$<%=data.shipcost%></b> Shipping',
                        '</p>',
                    //免运费
                    '<% } else if (data.shipcost === 0) { %>',
                        '<p class="free-address-shipp">',
                            '<b>Free Shipping</b>',
                        '</p>',
                    '<% } %>',
                    '<p class="free-address-address">',
                        'From <%=data.stockCountryName%> to <%=data.whitherCountryName%> Via <%=data.expressType%>',
                        '<span>Ships within <%=data.leadingTime%> business ',
                        //“day”单复数处理
                        '<% if (data.leadingTime > 1) { %>',
                            'days',
                        '<% } else { %>',
                            'day',
                        '<% } %>',
                        ', estimated delivery time: <%=data.lowerDate%> and <%=data.upperDate%></span>',
                    '</p>',
                '</div>',
            '<% } %>'
        ],
        //当前运达目的国家
        curWhitherCountry: [
            '<% var data = obj; %>',
            '<div class="datail-ships-to j-whitherCountryBtn">',
                '<span class="ships-to-name">Ships to</span>',
                //可运达
                '<% if (data.shipcost >= 0) { %>',
                    '<span class="ships-to-states"><%=data.whitherCountryName%></span>',
                //反之
                '<% } else { %>',
                    '<span class="ships-to-states ships-to-red"><%=data.whitherCountryName%></span>',
                '<% } %>',
                '<span class="public-arrow"></span>',
            '</div>'
        ],
        //页面展示的运费相关信息
        pageShipCostInfo: [
            '<% var data = obj; %>',
            '<a href="javascript:;">',
                //可运达
                '<% if (data.shipcost >= 0) { %>',
                    //有运费
                    '<% if (data.shipcost > 0) { %>',
                        '<p class="free-shipping-piece"><b>$<%=data.shipcost%></b> Shipping</p>',
                    //免运费
                    '<% } else if (data.shipcost === 0) { %>',
                        '<p class="free-shipping-name"><b>Free Shipping</b></p>',
                    '<% } %>',
                    '<span class="datail-ePaket2">',
                        '<p>To <%=data.whitherCountryName%> Via <%=data.expressType%></p>',
                        'Est.Delivery <%=data.lowerDate%> and <%=data.upperDate%>',
                    '</span>',
                //反之
                '<% } else { %>',
                    '<p class="free-shipping-text">',
                        'This item cannot be shipped to <%=data.whitherCountryName%>',
                        '<span>Please contact seller to resolve this, or select other countries</span>',
                    '</p>',
                '<% } %>',
                '<span class="public-arrow"></span>',
            '</a>'
        ]
    };
});
