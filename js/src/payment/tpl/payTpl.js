/**
 * module src: payment/tpl/payInitTpl.js
 * 支付信息初始化模板模块
**/
define('appTpl/payTpl', [], function(){
    return {
        //支付流程页面进度提示
        payProcess: [
            '<div class="process-bar process-paySucc">',
                '<span>PLACE ORDER</span>',
                '<span>PAY FOR ORDER</span>',
                '<span>SUCCESS</span>',
            '</div>'
        ],
        //支付订单、支付金额信息
        orderInfo: [
            '<% var data = obj; %>',
            '<div class="total-price clearfix">',
                '<ul>',
                    '<li><span>Order Number : </span><%=data.orderNo%></li>',
                    '<li><span>Total Payment : </span><b>US $<%=data.totalPay%></b>',
                        //如果存在则显示本币支付金额
                        '<% if (data.__localPays&&data.__localPays.length>0) { %>',
                            '<b> (<%=data.__localPays[0].currency%> <%=data.__localPays[0].amount%>)</b>',
                        '<% } %>',
                    '</li>',
                    '<li><span>You should pay : </span>',
                        //如果存在则显示本币支付金额
                        '<% if (data.localPays&&data.localPays.length>0) { %>',
                            '<strong><%=data.localPays[0].currency%> <%=data.localPays[0].amount%></strong>',
                        '<% } else { %>',
                            '<strong>US $<%=data.shouldPay%></strong>',
                        '<% } %>',
                    '</li>',
                '</ul>',
            '</div>'
        ],
        //银行卡的主体内容
        payMain: [
            '<% var data = obj; %>',
            '<div class="pay-subcon">',
                '<div class="chooseCardcon">',
                    '<div class="j-visaCon visa-con">',
                        '{{cardWarp}}',
                    '</div>',
                '</div>',
            '</div>'
        ],
        //银行卡外层包裹容器
        cardWarp: [
            '<% var data = obj; %>',
            '{{cardSupportTypeTip}}',
            '<div class="payment-Warp">',
                //曾经有过银行卡成功支付
                '<% if (data.cardsCount > 0) { %>',
                    '<div class="j-cardListWarp">',
                        '{{cardList}}',
                    '</div>',
                    '{{cardSecCode}}',
                //没有用银行卡成功支付过
                '<% } else { %>',
                    '{{cardNum}}',
                    '{{cardExpDate}}',
                    '{{cardSecCode}}',
                '<% } %>',
                '{{cardDefaultTip}}',
                '<section class="bill-adress">',
                    '<div class="j-cardBillAdressWarp">',
                        '{{cardBillAdress}}',
                    '</div>',
                    '<div class="pay-now j-payBtn-warp">{{cardPayBtn}}</div>',
                '</section>',
                '<section class="bill-adress j-billEdit dhm-hide"></section>',
            '</div>'
        ],
        //第三方支付方式
        cardSupportTypeTip: [
            '<% var data = obj; %>',
            //当前如果有第三方支付方式则进行展示
            '<% if ( data.__payTripartiteTotal > 0 ) { %>',
                //如果支付方式的数量唯一则展示宽度为100%
                '<% if ( data.__payTripartiteTotal === 1 ) { %>',
                    '<div class="otherPaycard2">',
                //否则展示宽度为50%
                '<% } else { %>',
                    '<div class="otherPaycard">',
                '<% } %>',
                    '<h4 class="paycard-tit">Pay via Third Party Payment Platform</h4>',
                    '<ul>',
                        //添加ideal支付方式（必须能够拿得到本币的数据，因为ideal只能用欧元进行结算）
                        '<% if (data.isIdeal === true && (data.__localPays&&data.__localPays.length>0)) { %>',
                            '<li class="ideal j-ideal"><div class="paycerd-div"><span class="card-icon"></span><span class="card-arrow"></span></div></li>',
                        '<% } %>',
                        //添加RBS支付方式
                        '<% if (data.isRbs === true) { %>',
                            '<li class="unionpay j-rbs"><div class="paycerd-div"><span class="card-icon"></span><span class="card-arrow"></span></div></li>',
                        '<% } %>',
                        //添加sofort支付方式
                        '<% if (data.isSofort === true) { %>',
                            '<li class="sofort j-sofort"><div class="paycerd-div"><span class="card-icon"></span><span class="card-arrow"></span></div></li>',
                        '<% } %>',
                        //添加giropay支付方式
                        '<% if (data.isGiropay === true) { %>',
                            '<li class="giropay j-giropay"><div class="paycerd-div"><span class="card-icon"></span><span class="card-arrow"></span></div></li>',
                        '<% } %>',
                    '</ul>',
                '</div>',
            '<% } %>'
        ],
        //银行卡默认提示信息
        cardDefaultTip: [
            '<div class="visa-tips j-visaTipBtn"><a href="javascript:;"></a>Your card number is kept 100% secure and only used for this transaction. DHgate will never reveal your card details to any third party. Our payment system is PCI-DSS Level 1 compliant, which means entire payment process follows the highest security standards and is the equivalent of bank-grade infrastructure. </div>'
        ],
        //银行卡列表
        cardList: [
            '<% var data = obj.cards, len = data.length, expDate, defaultExpDate, cardType; %>',
            '<% if (obj.cardsCount > 0) { %>',
                '<div class="cart-num">',
                    '<h4 class="cart-numtit">',
                        'Card : <div class="visamdae"><span></span><span></span><span></span></div>',
                        '<% if (obj.isPcPay!==false && obj.pcPayUrl!=="") { %>',
                            '<span class="more-payment-top"><var class="pay-line">|</var><a href="<%=obj.pcPayUrl%>">More Methods<span></span></a></span>',                            
                        '<% } %>',
                    '</h4>',
                    '<div class="cart-numtxt">',
                        '<select name="payment.selGate.tdDhpayCardnumberId" class="j-cardnum">',
                            '<% for (var i = 0; i < len; i++) { %>',
                                //银行卡的过期时间
                                '<% expDate = data[i].expireMonth+"/"+data[i].expireYear; %>',
                                '<% cardType = data[i].cardType; %>',
                                '<% if (i === 0) { %>',
                                    //记录默认选择银行卡的过期时间
                                    '<% defaultExpDate = expDate; %>',
                                    '<option value="<%=data[i].cardId%>" expDate="<%=expDate%>" cardType="<%=cardType%>" selected="selected"><%=data[i].cardNo%></option>',
                                '<% } else { %>',
                                    '<option value="<%=data[i].cardId%>" expDate="<%=expDate%>" cardType="<%=cardType%>"><%=data[i].cardNo%></option>',
                                '<% } %>',
                            '<% } %>',
                            '<option value="addNewCard">- Add new card -</option>',
                        '</select>',
                        //展示默认选择银行卡的过期时间
                        '<div class="j-visa-data visa-data"><%=defaultExpDate%></div>',
                        '<div class="error-tips"></div>',
                    '</div>',
                '</div>',
            '<% } %>'
        ],
        //银行卡账号
        cardNum: [
            '<% var data = obj; %>',
            '<div class="cart-num">',
                '<h4 class="cart-numtit">',
                    'Card : <div class="visamdae"><span></span><span></span><span></span></div>',
                    '<% if (data.isPcPay!==false && data.pcPayUrl!=="") { %>',
                        '<span class="more-payment-top"><var class="pay-line">|</var><a href="<%=data.pcPayUrl%>">More Methods<span></span></a></span>',
                    '<% } %>',
                '</h4>',
                '<div class="cart-numtxt">',
                    '<input class="j-cardnumInput" name="payment.selGate.hiddenCardNumber" type="number" placeholder="Card Number" />',
                    '<div class="error-tips"></div>',
                '</div>',
            '</div>'
        ],
        //银行卡有效期
        cardExpDate: [
            '<% var data = obj; %>',
            '<div class="exp-date">',
                '<h4 class="exp-dateit">Expiration Date :</h4>',
                '<div class="j-expTime exp-datetxt">',
                    '<div class="exp-day">',
                        //有效期月份
                        '<select class="j-cardMonth" name="payment.selGate.month">',
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
                        '<div class="error-tips"></div>',
                    '</div>',
                    '<div class="exp-smyb">/</div>',
                    '<div class="exp-year">',
                        //有效期年份
                        '<select class="j-cardYear" name="payment.selGate.year">',
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
                        '<div class="error-tips"></div>',
                    '</div>',
                '</div>',
            '</div>'
        ],
        //银行卡账号安全码，3或4位
        cardSecCode: [
            '<div class="sec-code">',
                '<h4 class="sec-codetit">Security Code :</h4>',
                '<div class="sec-codecon clearfix">',
                    '<input class="j-cscInput" name="payment.selGate.securityCode" type="number" value="" placeholder="CVV" />',
                    '<span></span>',
                    '<div class="sec-tips">The 3 or 4 digit security code.</div>',
                    '<div class="error-tips"></div>',
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
            //data-validate="cardPay"
            //支付时候只会走带有银行卡列表的验证
            '<% if (data.cardsCount > 0) { %>',
                '<input type="button" class="j-payBtn pay-now-btn" value="Pay Now" data-validate="cardPay" />',
            //data-validate="newCardPay"
            //支付时候只会走添加新卡的验证
            '<% } else { %>',
                '<input type="button" class="j-payBtn pay-now-btn" value="Pay Now" data-validate="newCardPay" />',
            '<% } %>'
        ]
    };
});

