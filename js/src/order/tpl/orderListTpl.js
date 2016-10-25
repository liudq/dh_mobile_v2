/**
 * module src: order/tpl/orderListTpl.js
 * 订单列表模版
 **/
define('appTpl/orderListTpl', [], function(){
    return {
        //订单头部
        orderHeader: [
            '<header class="detail-header">',
                '<a href="/vieworder.do" class="det-back"><span>Back</span></a>',
                '<a href="/" class="det-home"></a>',
                '<span class="det-hdtitle">My Orders</span>',
            '</header>'
        ],
        //TAB订单类型
        orderType: [
            '<% var data = obj; %>',
            '<div class="order-detail-status ordersStatus">',
                '<ul>',
                    //待付款订单总数
                    '<li class="tab_1" totalPage="<%=data.awaitingpaycount.totalPage%>" pageNum="1">',
                        '<p class="ls-mlimg">',
                            '<% if(data.awaitingpaycount.sum !== 0) { %>',
                                '<span class="ls_message"><%=data.awaitingpaycount.sum%></span>',
                            '<% } %>',
                        '</p>',
                        '<h3 class="ls-mltit">Awaiting<br />Payment</h3>',
                        '<p class="select_line"></p>',
                    '</li>',
                    //待确认订单总数
                    '<li class="tab_2" totalPage="<%=data.pendingConfirmationcount.totalPage%>" pageNum="1">',
                        '<p class="ls-mlimg">',
                            '<% if(data.pendingConfirmationcount.sum !== 0) { %>',
                                '<span class="ls_message"><%=data.pendingConfirmationcount.sum%></span>',
                            '<% } %>',
                        '</p>',
                        '<h3 class="ls-mltit">Pending<br />Confirmation</h3>',
                        '<p class="select_line"></p>',
                    '</li>',
                    //待发货订单总数
                    '<li class="tab_3" totalPage="<%=data.awaitingShipmentcount.totalPage%>" pageNum="1">',
                        '<p class="ls-mlimg">',
                            '<% if(data.awaitingShipmentcount.sum !== 0) { %>',
                                '<span class="ls_message"><%=data.awaitingShipmentcount.sum%></span>',
                            '<% } %>',
                        '</p>',
                        '<h3 class="ls-mltit">Awaiting<br />Shipment</h3>',
                        '<p class="select_line"></p>',
                    '</li>',
                    //已发货订单总数
                    '<li class="tab_4" totalPage="<%=data.shippedcount.totalPage%>" pageNum="1">',
                        '<p class="ls-mlimg">',
                            '<% if(data.shippedcount.sum !== 0) { %>',
                                '<span class="ls_message"><%=data.shippedcount.sum%></span>',
                            '<% } %>',
                        '</p>',
                        '<h3 class="ls-mltit">Shipped</h3>',
                        '<p class="select_line"></p>',
                    '</li>',
                    //已完成订单总数
                    '<li class="tab_5" totalPage="<%=data.completedcount.totalPage%>" pageNum="1">',
                        '<p class="ls-mlimg">',
                            '<% if(data.completedcount.sum !== 0) { %>',
                                '<span class="ls_message"><%=data.completedcount.sum%></span>',
                            '<% } %>',
                        '</p>',
                        '<h3 class="ls-mltit">Completed</h3>',
                        '<p class="select_line"></p>',
                    '</li>',
                    //纠纷状态订单总数
                    '<li class="tab_6" totalPage="<%=data.refundcount.totalPage%>" pageNum="1">',
                        '<p class="ls-mlimg">',
                            '<% if(data.refundcount.sum !== 0) { %>',
                                '<span class="ls_message"><%=data.refundcount.sum%></span>',
                            '<% } %>',
                        '</p>',
                        '<h3 class="ls-mltit">Refund &<br />Dispute</h3>',
                        '<p class="select_line"></p>',
                    '</li>',
                    //取消状态订单总数
                    '<li class="tab_7" totalPage="<%=data.canceledcount.totalPage%>" pageNum="1">',
                        '<p class="ls-mlimg">',
                            '<% if(data.canceledcount.sum !== 0) { %>',
                                '<span class="ls_message"><%=data.canceledcount.sum%></span>',
                            '<% } %>',
                        '</p>',
                        '<h3 class="ls-mltit">Canceled</h3>',
                        '<p class="select_line"></p>',
                    '</li>',
                '</ul>',
            '</div>'
        ],
        //TAB订单类型对应的列表外层包裹容器
        orderTypeList: [
            '<div id="j_order_1" class="payment dhm-hide"></div>',
            '<div id="j_order_2" class="payment dhm-hide"></div>',
            '<div id="j_order_3" class="payment dhm-hide"></div>',
            '<div id="j_order_4" class="payment dhm-hide"></div>',
            '<div id="j_order_5" class="payment dhm-hide"></div>',
            '<div id="j_order_6" class="payment dhm-hide"></div>',
            '<div id="j_order_7" class="payment dhm-hide"></div>'
        ],
        //订单列表
        orderList: [
            '<% var data = obj.orders; %>',
                '<% if (data.length > 0) { %>',
                    '<% for (var i=0; i<data.length; i++) { %>',
                            '<div class="awaiting_list">',
                                '<p class="pa_order">',
                                    'Order Number ：',
                                    '<span class="pa_number"><%=data[i].tdrfx.rfxno%></span>',
                                    '<span class="pa_time"><%=data[i].tdrfx.starteddate%></span>',
                                '</p>',
                                '<p class="pa_order">',
                                    '<span class="detail_name">Order Status ：</span><span class="pa_red"><%=data[i].tdrfx.rfxstatusname%></span>',
                                    '<% if(data[i].isonLine === false) { %>',
                                        '<a id="J_dhMsg" class="email talk" href="/sendmsg.do?order_no=<%=data[i].tdrfx.rfxno%>&spid=<%=data[i].systemuserid%>&mty=2"></a>',
                                    '<% } else { %>',
                                        '<a id="J_dhChat" class="chat talk j-dhChat" href="javascript:;" ntalker_sellerid="<%=data[i].ntalker_sellerid%>" ntalker_buyerid="<%=data[i].ntalker_buyerid%>" ntalker_js_url="<%=data[i].ntalker_js_url%>" rfxstatusname="<%=data[i].tdrfx.rfxstatusname%>"></a>',
                                    '<% } %>',
                                '</p>',
                                '<% var data1 = obj.orders[i].proList; %>',
                                    '<% if(data1.length > 0) { %>',
                                        //一个订单一个商品 展示图片和标题
                                        '<% if (data1.length === 1) { %>',
                                            '<a href="<%=data[i].tdrfx.orderDetailUrl%>&rft=<%=obj.rft%>" class="pa_product clearfix">',
                                                '<img src="<%=data[i].proList[0].rImageUrl%>">',
                                                '<p class="J_name"><%=data[i].proList[0].productname%></p>',
                                             '</a>',
                                        //一个订单多个商品 只展示图片 不展示标题
                                        '<% } else { %>',
                                            '<a href="<%=data[i].tdrfx.orderDetailUrl%>&rft=<%=obj.rft%>" id="pa_product" class="may-like clearfix">',
                                                '<ul class="clearfix">',
                                                    '<% for(var j=0;j<data1.length;j++){%>',
                                                        '<li><img src="<%=data[i].proList[j].rImageUrl%>"></li>',
                                                    '<% } %>',
                                                '</ul>',
                                            '</a>',
                                        '<% } %>',
                                '<% } %>',
                                '<p class="pa_order pa_right">Total : <span class="pay_price">US $ <%=data[i].tdrfx.ordertotal%></span></p>',
                                '<p class="clearfix operate pay_but" rfid="<%=data[i].tdrfx.rfxid%>" orderNo="<%=data[i].tdrfx.rfxno%>">',
                                    '<% if (data[i].tdrfx.rfxstatusid === "101003") { %>',
                                        '<span class="lt"><a class="pay_cancel a1" href="javascript:;">Cancel Order</a></span>',
                                        '<span class="rt"><a class="pay_topay a2" href="javascript:;">Proceed to Pay</a></span>',
                                    //订单状态为101009，且填写过运单号
                                    '<% } else if (data[i].tdrfx.rfxstatusid === "101009" && data[i].tdrfx.trackInfoFilled === true) { %>',
                                        '<span class="lt"><a class="track_item a1" href="/mydhgate/order/trackinfo.html?rfx_id=<%=data[i].tdrfx.rfxid%>&rft=<%=obj.rft%>&rfer=list">Track Items</a></span>',
                                        '<span class="rt"><a class="order-shipped a2" href="javascript:;">Order Has Been Received</a></span>',
                                    //订单状态为101009，且未填写过运单号
                                    '<% } else if (data[i].tdrfx.rfxstatusid === "101009" && data[i].tdrfx.trackInfoFilled === false) { %>',
                                        '<span class="rt"><a class="order-shipped a2" href="javascript:;">Order Has Been Received</a></span>',
                                    //填写过运单号
                                    '<% } else if(data[i].tdrfx.trackInfoFilled === true) { %>',
                                        '<span class="rt"><a class="track_item a1" href="/mydhgate/order/trackinfo.html?rfx_id=<%=data[i].tdrfx.rfxid%>&rft=<%=obj.rft%>&rfer=list">Track Items</a></span>',
                                    '<% }%>',
                                '</span></p>',
                            '</div>',
                      '<% } %>',
                '<% } %>',
        ],
        //没有订单显示的内容
        noOrder: [
            '<% var data = obj; %>',
            '<div class="j-order-no order_shop">',
                '<p class="shop_p">You currently have no <%=data.orderTypeTitle%> orders.</p>',
                '<a href="/" class="go_shop">Start Shopping</a>',
            '</div>'
        ],
        //loading状态
        loading: [
            '<div class="pro-load j-pro-load"><span></span></div>'
        ]
    };
});

