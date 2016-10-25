/**
 * module src: paySucc/tpl/paysuccTpl.js
 * 支付成功信息初始化模板
**/
define('appTpl/paysuccTpl', [], function(){
    return {
        //初始化需要绘制的页面元素
        warp: [
            '<% var data = obj;%>',
            '<div class="process-bar process-paySucc">',
                '<span>PLACE ORDER</span>',
                '<span>PAY FOR ORDER</span>',
                '<span>SUCCESS</span>',
            '</div>',
            '<h3 class="success-h">',
                //第三方支付方式支付成功后返回，并带有相关
                //提示信息则进行展示，否则使用默认提示信息
                '<% if (data.thirdPayBackInfo === "") { %>',
                    'Thank you,you have successfully paid for your order!',
                '<% } else { %>',
                    '<%=data.thirdPayBackInfo%>',
                '<% } %>',
            '</h3>',
            '<div class="success-info">',
                '{{isVisitor}}',
                '{{shippedTo}}',
                '<a href="/vieworder.do">Track or review your order <span class="arrow"></span></a>',
           '</div>',
            '<a href="/" class="continue-btn">Continue Shopping </a>',
            '<div id="J_paySuccDialog"></div>',
            '<div class="view-order"></div>'
        ],
        //运输地址初始化
        shippedTo: [
            '<% var data = obj;%>',
            '<% if (data.length) { %>',
                '<p>',
                    '<span>Your order will be shipped </span>',
                    '<span>to <%=data[0]["firstname"]%> <%=data[0]["lastname"]%>; <%=data[0]["addressline1"]%> <%=data[0]["addressline2"]%>,<%=data[0]["tel"]%>; <%=data[0]["city"]%>, <%=data[0]["state"]%>, <%=data[0]["postalcode"]%>, <%=data[0]["countryname"]%>.</span>',
                '</p>',
            '<% } %>'
        ],
        isVisitor:[
            '<% var data = obj;%>',
            '<% if (data.isVisitor) { %>',
                '<div class="guestmode j-guestmode">',
                    '<div class="guestmode-tit">Password now required for tracking orders.</div>',
                    '<div class="guestmode-txt">',
                        '<input type="text" disabled="disabled" value="<%=data.email%>">',
                        '<input type="text" placeholder="Password" class="j-password">',
                        '<div class="errortips j-errortips"></div>',
                    '</div>',
                '</div>',
            '<% } %>'
        ]
    }
});
