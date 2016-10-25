/**
 * module src: payment/tpl/editBillingAddressTpl.js
 * 编辑账单地址模板
**/
define('appTpl/editBillingAddressTpl', [], function(){
    return {
        //编辑账单地址的主体内容
        billEditMain: [
            '<div class="bill-edit">',
                '{{name}}',
                '{{address1}}',
                '{{address2}}',
                '{{city}}',
                '<div class="j-countrys-warp">{{countrys}}</div>',
                '<div class="j-states-warp">{{states}}</div>',
                '{{zipcode}}',
                '{{telephone}}',
                '{{vatNumber}}',
                '{{save}}',
            '</div>'
        ],
        //联系人的姓名
        name: [
            '<% var data = obj; %>',
            '<div class="contact-name">',
                '<div class="conctact-txtone">',
                    '<h4><span class="red">*</span> First Name :</h4>',
                    '<input class="j-billEdit-firstname" type="text" name="payment.newGate.address.firstname" value="<%=data.firstName%>" />',
                    '<div class="edit-error-tips"></div>',
                '</div>',
                '<div class="conctact-txttwo">',
                    '<h4><span class="red">*</span> Last Name :</h4>',
                    '<input class=" j-billEdit-lastname" type="text" name="payment.newGate.address.lastname" value="<%=data.lastName%>" />',
                    '<div class="edit-error-tips"></div>',
                '</div>',
            '</div>'
        ],
        //地址1
        address1: [
            '<% var data = obj; %>',
            '<div class="bill-txt clearfix">',
                '<h4><span class="red">*</span> Address Line 1 :</h4>',
                '<input class="j-billEdit-address1" type="text" name="payment.newGate.address.addressline1" value="<%=data.addressOne%>" />',
                '<div class="edit-error-tips"></div>',
                '<div class="sec-tips1">Street name, company name, c/o.</div>',
            '</div>'
        ],
        //地址2
        address2: [
            '<% var data = obj;  %>',
            '<div class="bill-txt clearfix">',
                '<h4>Address Line 2 :</h4>',
                '<input class="j-billEdit-address2" type="text" name="payment.newGate.address.addressline2" value="<%=data.addressTwo%>" />',
                '<div class="edit-error-tips"></div>',
                '<div class="sec-tips1">Apartment, suite, unit, building, floor, etc.</div>',
            '</div>'
        ],
        //城市
        city: [
            '<% var data = obj; %>',
            '<div class="bill-txt clearfix">',
                '<h4><span class="red">*</span> City :</h4>',
                '<input class="j-billEdit-city" type="text" name="payment.newGate.address.city" value="<%=data.city%>"  />',
                '<div class="edit-error-tips"></div>',
            '</div>'
        ],
        //国家列表
        countrys: [
            '<% var data = obj.countrys, len = data.length; %>',
            '<% if (len > 0 && data[0].countryid !== "") { %>',
                '<div class="bill-txt1 clearfix">',
                    '<h4><span class="red">*</span> Country :</h4>',
                    '<select name="payment.newGate.address.country" class="j-billEdit-country" data-type="countrys">',
                        '<% for (var i = 0; i < len; i++) { %>',
                            '<% if (!data[i].selected) { %>',
                                '<option value="<%=data[i].countryid%>" data-callingcode="<%=data[i].callingcode%>"><%=data[i].name%></option>',
                            '<% } else { %>',
                                '<option value="<%=data[i].countryid%>" data-callingcode="<%=data[i].callingcode%>" selected="selected"><%=data[i].name%></option>',
                            '<% } %>',
                        '<% } %>',
                    '</select>',
                    '<div class="edit-error-tips"></div>',
                '</div>',
            '<% } %>'
        ],
        //州省份列表
        states: [
            '<% var data = obj.states, len = data.length; %>',
            '<% if (len > 0 && data[0].provinceid !== "") { %>',
                '<div class="bill-txt1 clearfix">',
                    '<h4><span class="red">*</span> State/Province/Region :</h4>',
                    '<select class="j-billEdit-state" name="payment.newGate.address.state" data-type="states">',
                        '<% for (var i = 0; i < len; i++) { %>',
                            '<% if (!data[i].selected) { %>',
                                '<option value="<%=data[i].provinceid%>"><%=data[i].name%></option>',
                            '<% } else { %>',
                                '<option value="<%=data[i].provinceid%>" selected="selected"><%=data[i].name%></option>',
                            '<% } %>',
                        '<% } %>',
                    '</select>',
                    '<div class="edit-error-tips"></div>',
                '</div>',
            '<% } %>'
        ],
        //邮政编码
        zipcode: [
            '<% var data = obj; %>',
            '<div class="bill-txt clearfix">',
                '<h4><span class="red">*</span> Zip/Postal Code :</h4>',
                '<input class="j-billEdit-zipcode" type="text" name="payment.newGate.address.postalcode" value="<%=data.zipCode%>" />',
                '<div class="edit-error-tips"></div>',
            '</div>'
        ],
        //手机号码
        telephone: [
            '<% var data = obj; %>',
            '<div class="telephone clearfix">',
                '<h4><span class="red">*</span> Mobile No./ Phone :</h4>', 
                '<div class="telephone-inner">',
                    '<div class="areacode"><input class="j-billEdit-areacode" type="text" readonly="readonly" name="payment.newGate.address.areacode" value=""></div>',
                    '<div class="telephonecode"><input class="j-billEdit-telephone" type="text" name="payment.newGate.address.mobilephone" value="<%=data.telephone.replace(/^\\d[\\d ]*\\-(.*)/, \"$1\")%>" /></div>',
                '</div>',
                '<div class="edit-error-tips"></div>',
            '</div>'
        ],
        //税号（增值税）
        vatNumber: [
            '<% var data = obj; %>',
            //税号（增值税，部分国家展示）
            '<% if (data.vatnum !== "") { %>',
                '<div class="j-billEdit-vatNumber-warp bill-txt clearfix">',
            //反之，隐藏
            '<% } else { %>',
                '<div class="j-billEdit-vatNumber-warp bill-txt clearfix dhm-hide">',
            '<% } %>',
                '<h4><span class="red">*</span> VAT Number :</h4>',
                '<input class="j-billEdit-vatNumber" type="text" name="payment.newGate.address.vatNumber" value="<%=data.vatnum%>" />',
                '<div class="edit-error-tips"></div>',
                '<div class="sec-tips1">The VAT Number, i.e. Value Added Tax Number, includes the CPF NO. for people or CNPJ NO. for companies. If its required by the delivery country for goods customs clearance, you have to provide the VAT Number to ensure the delivery success to you. </div>',
            '</div>'
        ],
        //保存账单地址按钮
        save: [
            '<div class="billEdit-save-btn j-saveBillBtn"><input data-validate="save" type="button" value="Save Billing Address"></div>'
        ]
    };
});