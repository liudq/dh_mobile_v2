/**
 * module src: orderTrack/tpl/orderTrackTpl.js
 * 订单物流模版
 **/
define('appTpl/orderTrackTpl', [], function(){
    return {
        //物流头部
        orderTrackHeader: [
            '<% var data = obj; %>',
            '<header class="detail-header">',
                '<% if (data.rfer == "list") { %>',
                    '<a href="/mydhgate/order/orderlist.html?rft=<%=data.rft%>" class="det-back"><span>Back</span></a>',
                '<% } else { %>',
                    '<a href="/mydhgate/order/orderdetail.html?rfid=<%=data.rfid%>&rft=<%=data.rft%>" class="det-back"><span>Back</span></a>',
                 '<% } %>',
                '<a href="/" class="det-home"></a>',
                '<span class="det-hdtitle">Track Items</span>',
            '</header>'
        ],
        //订单物流追踪
        orderTrack: [
            '<% var data = obj.info; %>',
            '<% for(var i=0;i<data.length;i++){%>',
                '<div class="detail_information">',
                    '<p>Track Number ：<span><%=data[i].trackingNumer%></span></p>',
                    '<p>Shipping Method ：<%=data[i].shippingMethod%></p>',
                    '<p>Time of Submission ：<%=data[i].timeOfSubmission1%></p>',
                    '<p>Delivered time ：<%=data[i].deliveredTime%></p>',

                    '<% if(data[i].trackable===true) { %>',
                        '<% var data1 = data[i].items; %>',
                        '<div class="track_addr">',
                            '<div class="track_head down">',
                                '<img src="http://css.dhresource.com/mobile/order/image/trak_orange.png"/>',
                                '<p class="label"><%=data1[0].address%>,<%=data1[0].desc%></p>',
                                '<span><%=data1[0].date%></span>',
                            '</div>',
                        '</div>',
                        '<% if (data.length === 1) {%>',
                            '<ul class="menu">',
                                '<%for(var j=1;j<data1.length;j++){%>',
                                    '<li>',
                                        '<img src="http://css.dhresource.com/mobile/order/image/track_grey.png">',
                                        '<p><%=data1[j].address%>,<%=data1[j].desc%></p>',
                                        '<span><%=data1[j].date%></span>',
                                    '</li>',
                                '<% } %>',
                            '</ul>',
                        '<% } %>',
                        '<ul class="menu dhm-hide">',
                            '<%for(var j=1;j<data1.length;j++){%>',
                                '<li>',
                                    '<img src="http://css.dhresource.com/mobile/order/image/track_grey.png">',
                                    '<p><%=data1[j].address%>,<%=data1[j].desc%></p>',
                                    '<span><%=data1[j].date%></span>',
                                '</li>',
                            '<% } %>',
                        '</ul>',
                    '<% } else { %>',
                        '<div class="track_addr">',
                            '<div class="track_head">',
                                '<img src="http://css.dhresource.com/mobile/order/image/track_grey.png"/>',
                                '<p class="label"><%=data[i].untrackableDesc%></p>',
                                '<span><%=data[i].timeOfSubmission1%></span>',
                            '</div>',
                        '</div>',
                    '<% } %>',
                '</div>',
            '<% } %>'
        ],
        noTrack:[

        ]
    }
});

