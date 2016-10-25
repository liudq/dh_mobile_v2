/**
 * module src: payment/addCardAndPayTpl.js
 * 新添加卡支付模板模块
**/
define('appTpl/addCardAndPayTpl', [], function(){
    return {
        //银行卡外层包裹容器
        cardWarp: [
            '<% var data = obj; %>',
            '{{cardHeader}}',
            '<div class="pay-subcon j-pay-subcon-warp">',
                '<div class="chooseCardcon">',
                    '<div class="visa-con">',
                        '{{cardNum}}',
                        '{{cardExpDate}}',
                        '{{cardSecCode}}',
                        '<section class="bill-adress">',
                            '<div class="j-new-cardBillAdressWarp">',
                                '{{cardBillAdress}}',
                            '</div>',
                            '<div class="pay-now j-payBtn-warp">{{cardPayBtn}}</div>',
                        '</section>',
                        '<section class="bill-adress j-billEdit dhm-hide"></section>',
                    '</div>',
                '</div>',
            '</div>',
        ],
        //银行卡弹出层顶部
        cardHeader: [
            '<div class="card-header">',
                '<a class="card-header-back j-card-header-back" href="javascript:;"><span>Back</span></a>',
                '<span class="card-header-title">Add new card</span>',
            '</div>'
        ],
        //银行卡账号
        cardNum: [
            '<div class="cart-num">',
                '<h4 class="cart-numtit">Card : <div class="visamdae"><span></span><span></span><span></span></div></h4>',
                '<div class="cart-numtxt">',
                    '<input class="j-new-cardnumInput" name="payment.selGate.hiddenCardNumber" type="number"  placeholder="Card Number" />',
                    '<div class="new-error-tips"></div>',
                '</div>',
            '</div>'
        ],
        //银行卡有效期
        cardExpDate: [
            '<% var data = obj; %>',
            '<div class="exp-date">',
                '<h4 class="exp-dateit">Expiration Date :</h4>',
                '<div class="j-new-expTime exp-datetxt">',
                    '<div class="exp-day">',
                        //有效期月份
                        '<select class="j-new-cardMonth" name="payment.selGate.month">',
                            '<% for (var i = 1; i < 13; i++) { %>',
                                '<% if (i < 10) { %>',
                                    '<% i = "0" + i; %>',
                                '<% } %>',
                                '<% if (i === 1) {%>',
                                    '<option value="<%=i%>" selected="selected"><%=i%></option>',
                                '<% } else { %>',
                                    '<option value="<%=i%>"><%=i%></option>',
                                '<% } %>',
                            '<% } %>',
                        '</select>',
                        '<div class="new-error-tips"></div>',
                    '</div>',
                    '<div class="exp-smyb">/</div>',
                    '<div class="exp-year">',
                        //有效期年份
                        '<select class="j-new-cardYear" name="payment.selGate.year">',
                            '<% var year = (new Date(data.serverTime)).getFullYear(); %>',
                            '<% for (var i = year; i <= year+15; i++) { %>',
                                '<% var optValue = i.toString().charAt(2)+i.toString().charAt(3); %>',
                                '<% if (i === year) {%>',
                                    '<option value="<%=optValue%>" selected="selected"><%=i%></option>',
                                '<% } else { %>',
                                    '<option value="<%=optValue%>"><%=i%></option>',
                                '<% } %>',
                            '<% } %>',
                        '</select>',
                        '<div class="new-error-tips"></div>',
                    '</div>',
                '</div>',
            '</div>'
        ],
        //银行卡账号安全码，3或4位
        cardSecCode: [
            '<div class="sec-code">',
                '<h4 class="sec-codetit">Security Code :</h4>',
                '<div class="sec-codecon clearfix">',
                    '<input class="j-new-cscInput" name="payment.selGate.securityCode" type="number" value="" placeholder="CVV" />',
                    '<span></span>',
                    '<div class="sec-tips">The 3 or 4 digit security code.</div>',
                    '<div class="new-error-tips"></div>',
                '</div>',
            '</div>'
        ],
        //银行卡账单地址
        cardBillAdress: [
            '<% var data = obj.billingAddress, len = data.length; %>',
            //在有银行卡的情况下，不会使用初始化接口中的运输地址
            '<% if (len > 0) { %>',
                '<h3>',
                    //没有银行卡的情况下才可以编辑账单地址
                    '<% if (obj.cardsCount === 0) { %>',
                        '<a class="j-editBillBtn" href="javascript:;">Edit</a>',
                        '<a class="j-billEdit-cancel dhm-hide" href="javascript:;">Cancel</a>',
                    '<% } %>',
                'Billing Address</h3>',
                '<div class="j-billSave billaddresscon">',
                    '<p><%=data[0].firstName%> <%=data[0].lastName%></p>',
                    '<p><%=data[0].addressOne%></p>',
                    //地址2（非必填项）
                    '<% if (data[0].addressTwo !== "") { %>',
                        '<p><%=data[0].addressTwo%></p>',
                    '<% } %>',
                    '<p><%=data[0].city%></p>',
                    '<p><%=data[0].country%></p>',
                    '<p><%=data[0].state%></p>',
                    '<p><%=data[0].zipCode%></p>',
                    '<p><%=data[0].telephone%></p>',
                    //税号（增值税，部分国家有）
                    '<% if (data[0].vatnum !== "") { %>',
                        '<p><%=data[0].vatnum%></p>',
                    '<% } %>',
                '</div>',
            '<% } %>'
        ],
        //银行卡支付按钮
        cardPayBtn: [
            '<% var data = obj; %>',
            '<p class="pay-now-tit">Should pay : ',
                //如果存在则显示本币支付金额
                '<% if (data.localPays&&data.localPays.length>0) { %>',
                    '<strong><%=data.localPays[0].currency%> <%=data.localPays[0].amount%></strong>',
                //否则，使用美元进行展示
                '<% } else { %>',
                    '<strong>US $<%=data.shouldPay%></strong>',
                '<% } %>',
            '</p>',
            '<input type="button" class="j-new-payBtn pay-now-btn" value="Save and Pay Now" data-validate="newCardPay" />'
        ]
    };
});

