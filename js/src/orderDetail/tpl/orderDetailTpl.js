/**
 * module src: orderDetail/tpl/orderDetailTpl.js
 * 订单详情模版
 **/
define('appTpl/orderDetailTpl', [], function(){
    return {
        orderDetailHeader:[
            '<% var data = obj; %>',
            '<header class="detail-header clearfix">',
                '<a href="/mydhgate/order/orderlist.html?rft=<%=data.rft%>" class="det-back"><span>Back</span></a>',
                '<a href="/" class="det-home" ></a>',
                '<span class="det-hdtitle">Order detail</span>',
            '</header>',
        ],
        //订单详情
        orderDetails:[
            '<% var data = obj; %>',
            '<div class="detail_re">',
                '<p class="pa_order">',
                    '<span class="detail_name">Order Status ：</span>',
                    '<span class="pa_red"><%=data.tdrfxvo.rfxstatusname%></span>',
                    '<a href="/reorder.do?rfx_id=<%=data.tdrfxvo.rfxid%>&vid=<%=data.vid%>&b2b_cart_sid=<%=data.b2bCartSid%>" class="re_order">Re-order</a>',
                ' </p>',
            '</div>',
            '<% var data1 = data.shippingInfo; %>',
            '<div class="detail_information J_person">',
                '<p>Contact Name : <span><%=data1.firstname%> <%=data1.lastname%></span></p>',
                '<p>Phone : <span><%=data1.tel%></span></p>',
                '<% if(data1.addressline2 === "") { %>',
                    '<p>Address : <span id="J_address"><%=data1.addressline1%>,<%=data1.city%>,<%=data1.state%>,<%=data1.countryname%>,<%=data1.postalcode%></span></p>',
                '<% } else { %>',
                    '<p>Address : <span id="J_address"><%=data1.addressline1%>,<%=data1.addressline2%>,<%=data1.city%>,<%=data1.state%>,<%=data1.countryname%>,<%=data1.postalcode%></span></p>',
                '<% } %>',
            '</div>',
            '<% var data2 = data.productlist; %>',
            '<% for(var i=0;i<data2.length;i++){%>',
                '<div class="detail_product">',
                    '<a class="pa_product" href="<%=data2[i].productUrl1%>"> ',
                        '<img src="<%=data2[i].rImage1%>">',
                        '<p class="detail_p J_name"><%=data2[i].productname%></p>',
                        '<p><span class="pay_price">US $<%=data2[i].targetprice%>/<%=data2[i].measurename%></span> ×<%=data2[i].quantity%></p>',
                    '</a> ',

                '</div>',
            '<% } %>',
            '<% if(data.isonLine == false) { %>',
                '<a  id="J_dhMsg" class="detail_order" href="/sendmsg.do?order_no=<%=data.tdrfxvo.rfxno%>&spid=<%=data.systemuserid%>&mty=<%=data.rfxstatusname%>"><span class="email"></span>Contact Seller</a>',
            '<% } else { %>',
                '<a  id="J_dhChat" class="detail_order" href="javascript:;" ntalker_sellerid="<%=data.ntalkerSellerid%>" ntalker_buyerid="<%=data.ntalkerBuyerid%>" ntalker_js_url="<%=data.ntalkerJsUrl %>"><span class="chat talk"></span>Contact Seller</a>',
            '<% } %>',
            '<div class="detail_addr">',
                '<% if(data.summarybuyerto.subtotal !== 0) { %>',//如果等于0则不显示
                    '<p>Items Cost ：<span>US $ <%=data.summarybuyerto.subtotal%></span></p>',
                '<% } %>',
                '<% if(data.summarybuyerto.shippingtotal !== "") { %>',
                    '<p>Shipping Total ：<span>US $ <%=data.summarybuyerto.shippingtotal%></span></p>',
                '<% } %>',
                '<% if(data.tdrfxvo.totalrefund !== 0) { %>',
                    '<p>Refund ：<span>-US $ <%=data.tdrfxvo.totalrefund%></span></p>',
                '<% } %>',
                '<% if(data.tdrfxvo.rfxrefund !== 0) { %>',
                    '<p>Product Refund ：<span>US $ <%=data.tdrfxvo.rfxrefund%></span></p>',
                '<% } %>',
                '<% if(data.tdrfxvo.shipcostrefund !== 0) { %>',
                    '<p>Shipping Cost Refund ：<span>-US $ <%=data.tdrfxvo.shipcostrefund%></span></p>',
                '<% } %>',
                '<% if(data.tdrfxvo.fillsection !== 0) { %>',
                    '<p>Payment added ：<span>US $ <%=data.tdrfxvo.fillsection%></span></p>',
                '<% } %>',
                '<% if(data.tdrfxvo.rfxsave !== 0) { %>',
                    '<p>Discount ：<span>-US $ <%=data.tdrfxvo.rfxsave%></span></p>',
                '<% } %>',
                '<% if(data.tdrfxvo.couponofseller !== 0) { %>',
                    '<p>sellerShowUpper Coupon ：<span>-US $ <%=data.tdrfxvo.couponofseller%></span></p>',
                '<% } %>',
                '<% if(data.tdrfxvo.coupondiscount !== 0) { %>',
                    '<p>DHcoupon ：<span>-US $ <%=data.tdrfxvo.coupondiscount%></span></p>',
                '<% } %>',
                '<% if(data.tdrfxvo.shipcostsave !== 0) { %>',
                    '<p>Shipping Cost Saving ：<span>-US $ <%=data.tdrfxvo.shipcostsave%></span></p>',
                '<% } %>',
                '<% if(data.summarybuyerto.wholesalediscount !== 0) { %>',
                    '<p>Wholesale Discount ：<span>-US $ <%=data.summarybuyerto.wholesalediscount%></span></p>',
                 '<% } %>',
                    '<p class="addr_last">Order Total：<span class="pay_price">US $ <%=data.summarybuyerto.totalprice%></span></p>',
            '</div>',
            '<div class="detail_information J_order">',
                '<p>Order Number ：<span><%=data.tdrfxvo.rfxno%></span></p>',
                '<p>Order Time：<span><%=data.tdrfxvo.starteddate%></span></p>',
                '<p>Ship Via ：<span><%=data.tdrfxvo.shippingtype%></span></p>',
            '</div>',

             //awaiting payment
            '<% if(data.tdrfxvo.rfxstatusid==101003) { %>',
                '<div class="payment-btn">',
                    '<p class="clearfix operate pay_but" rfid="<%=data.tdrfxvo.rfxid%>" orderNo="<%=data.tdrfxvo.rfxno%>">',
                        '<span class="lt"><a class="pay_cancel a1" href="javascript:;">Cancel Order</a></span>',
                        '<span class="rt"><a class="pay_topay a2" href="javascript:;">Proceed to Pay</a></span>',
                    '</p>',
                '</div>',
             //订单状态为101009 并且 填写过订单号
            '<% } else if(data.tdrfxvo.rfxstatusid==101009 && data.tdrfxvo.trackInfoFilled == true) { %>',
                '<div class="payment-btn">',
                    '<p class="clearfix operate pay_but" rfid="<%=data.tdrfxvo.rfxid%>" orderNo="<%=data.tdrfxvo.rfxno%>">',
                        '<span class="lt"><a class="track_item a1" href="/mydhgate/order/trackinfo.html?rfx_id=<%=data.tdrfxvo.rfxid%>&rft=<%=obj.rft%>&rfer=detail">Track Items</a></span>',
                        '<span class="rt"><a class="order-shipped a2" href="javascript:;">Order Has Been Received</a></span>',
                    '</p>',
                '</div>',
            //订单状态为101009 并且 未填写过订单号
            '<% } else if(data.tdrfxvo.rfxstatusid==101009 && data.tdrfxvo.trackInfoFilled == false) { %>',
                '<div class="payment-btn">',
                    '<p class="clearfix operate pay_but" rfid="<%=data.tdrfxvo.rfxid%>" orderNo="<%=data.tdrfxvo.rfxno%>">',
                        '<span class="rt"><a class="order-shipped a2" href="javascript:;">Order Has Been Received</a></span>',
                    '</p>',
                '</div>',
            //填写过订单号
            '<% } else if(data.tdrfxvo.trackInfoFilled == true) { %>',
                '<div class="payment-btn">',
                    '<p class="clearfix operate pay_but" rfid="<%=data.tdrfxvo.rfxid%>" orderNo="<%=data.tdrfxvo.rfxno%>">',
                        '<span class="rt"><a class="track_item a1" href="/mydhgate/order/trackinfo.html?rfx_id=<%=data.tdrfxvo.rfxid%>&rft=<%=obj.rft%>&rfer=detail">Track Items</a></span>',
                    '</p>',
                '</div>',
            '<% } else { %>',

            '<% } %>',

            '</div>'
        ]
    };
});

