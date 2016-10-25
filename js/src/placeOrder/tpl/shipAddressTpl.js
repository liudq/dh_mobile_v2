/**
 * module src: placeOrder/tpl/shipAddressTpl.js
 * 点击更改运输地址信息
**/
define('appTpl/shipAddressTpl', [], function(){
    return {
        //头部外层包裹容器
        header: [
                 '<header class="header-back clearfix">',
                    '<a href="javascript:void(0);" class="det-back j-det-back"><span>Back</span></a>',
                    '<span class="det-hdtitle">Shipping  Address</span>',
                '</header>'
        ],
        //运输地址列表外层包裹容器
        shippingAddressList:[
                '<% var data = obj.list;%>',
                '<% for (var i = 0; i < data.length;i++){ %>',
                    '<div class="shipAdress-list j-shipAdress-lists clearfix">',
                        '<div class="shipAddress-edit j-shipAddress-edit"><span href="javascript:void(0)"></span></div>',
                        '<div class="shipAdress-detail j-shipAdress-detail " data-info="<%=encodeURIComponent(JSON.stringify({shippingInfoId:data[i].shippingInfoId}))%>">',
                            '<a class="j-selectAdr" href="javascript:void(0);">',
                                '<p><%=data[i].firstname %> '+'<%=data[i].lastname %></p>',
                                '<p><%=data[i].addressline1 %>. '+'<%=data[i].addressline2 %></p>',
                                '<p><%=data[i].city %>, '+'<%=data[i].state %> '+'<%=data[i].zipCode %></p>',
                                '<p><%=data[i].country %></p>',
                                '<p><%=data[i].telephone %></p>',
                                '<% if (data[i].vatnum !== "") { %>',
                                    '<p><%=data[i].vatnum %></p>',
                                '<% } %>',
                            '</a>',
                            '<div class="j-errorInfo error" style="display:none;"></div>',
                        '</div>',
                    '</div>',
                '<% } %>'
        ],
        //添加新地址按钮
        addNewAddress:[
            '<% var data = obj.list;%>',
            '<% if (data.length >= 10) { %>',
                '<a href="javascript:void(0);" style="display:none;">Add new Address</a>',
            '<% } else { %>',
                '<a href="javascript:void(0);">Add new Address</a>',
            '<% } %>'
        ]
    }
});
