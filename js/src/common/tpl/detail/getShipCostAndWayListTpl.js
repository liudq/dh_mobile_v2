/**
 * module src: common/tpl/detail/getShipCostAndWayListTpl.js
 * 获取[运输方式|目的国家|备货地|运达时间]列表模板模块
**/
define('tpl/detail/getShipCostAndWayListTpl', [], function(){
    return {
        //主体内容
        main: [
            '<% var data = obj; %>',
            //不可运达
            '<% if (data.list.length===1 && data.list[0].shipcost===-1) { %>',
                '{{noArrive}}',
            //可运达
            '<% } else { %>',
                '{{shipCostlist}}',
            '<% } %>'
        ],
        //运费列表
        shipCostlist: [
            '<% var data = obj; %>',
            '<div class="layer-tit">Choose Shipping Method</div>',
            '<div class="datail-free-route j-expressTypeListContent">',
                '<% for (var i = 0, len = data.list.length; i < len; i++) { %>',
                    //选中的物流方式
                    '<% if (data.selectExpressType && data.selectExpressType===data.list[i].expressType) { %>',
                        '<span data-type="y" class="free-route-text free-current-frame"><span class="free-route-text-inne">',
                    //其他为非选中项
                    '<% } else { %>',
                        '<span data-type="y" class="free-route-text"><span class="free-route-text-inne">',
                    '<% } %>',
                        //免运费
                        '<% if (data.list[i].shipcost === 0) { %>',
                            '<strong>Free Shipping</strong>',
                        //有运费
                        '<% } else { %>',
                            '<strong>$<%=data.list[i].shipcost%></strong>',
                        '<% } %>',
                        '<%=data.list[i].expressType%> delivery time: <%=data.list[i].deliveryTime%> days to ship',
                    '</span></span>',
                '<% } %>',
            '</div>'
        ],
        //提示不能运达
        noArrive: [
            '<% var data = obj; %>',
            '<p class="datail-free-noroute">This item cannot be shipped to <%=data.whitherCountryName%>. Please contact seller to resolve this, or select other countries.</p>'
        ]
    };
});
