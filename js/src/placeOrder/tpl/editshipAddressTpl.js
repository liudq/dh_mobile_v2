/**
 * module src: placeOrder/tpl/editshipAddressTpl.js
 * 点击更改运输地址信息
**/
define('appTpl/editshipAddressTpl', [], function(){
    return {
        //头部外层包裹容器
        header: [
                '<header class="header-back clearfix">',
                   '<a href="javascript:void(0);" class="det-back j-editShipAddress-back"><span>Back</span></a>',
                   '<span class="det-hdtitle">Edit Address</span>',
                '</header>'
        ],
        //编辑运输地址主体内容
        shippingAddressEditMain: [
            '<div class="bill-edit">',
                '{{name}}',
                '{{email}}',
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
                    '<input class="j-billEdit-firstname" type="text" name="firstname" value="<%=data.firstName%>" />',
                    '<div class="edit-error-tips"></div>',
                '</div>',
                '<div class="conctact-txttwo">',
                    '<h4><span class="red">*</span> Last Name :</h4>',
                    '<input class=" j-billEdit-lastname" type="text" name="lastname" value="<%=data.lastName%>" />',
                    '<div class="edit-error-tips"></div>',
                '</div>',
            '</div>'
        ],
        //邮箱地址
        email:[
            '<% var data = obj, action = data.__action, usertype = data.__usertype; %>',
            //只有在游客添加运输地址的情况下才展示email表单项
            '<% if (action==="add" && usertype===true) { %>',
                '<div class="bill-txt">',
                    '<h4><span class="red">*</span> Email :</h4>',
                    '<input class="j-email-value" type="text" name = "email" value="" />',
                    '<div class="edit-error-tips"></div>',
                '</div>',
            '<% } %>'
        ],
        //地址1
        address1: [
            '<% var data = obj; %>',
            '<div class="bill-txt">',
                '<h4><span class="red">*</span> Address Line 1 :</h4>',
                '<input class="j-billEdit-address1" type="text" name="addressline1" value="<%=data.addressOne%>" />',
                '<div class="edit-error-tips"></div>',
                '<div class="sec-tips">Street name, company name, c/o.</div>',
            '</div>'
        ],
        //地址2
        address2: [
            '<% var data = obj; %>',
            '<div class="bill-txt">',
                '<h4>Address Line 2 :</h4>',
                '<input class="j-billEdit-address2" type="text" name="addressline2" value="<%=data.addressTwo%>" />',
                '<div class="edit-error-tips"></div>',
                '<div class="sec-tips">Apartment, suite, unit, building, floor, etc.</div>',
            '</div>'
        ],
        //城市
        city: [
            '<% var data = obj; %>',
            '<div class="bill-txt">',
                '<h4><span class="red">*</span> City :</h4>',
                '<input class="j-billEdit-city" type="text" name="city" value="<%=data.city%>"  />',
                '<div class="edit-error-tips"></div>',
            '</div>'
        ],
        //国家列表
        countrys: [
            '<% var data = obj.countrys, len = data.length; %>',
            '<% if (len > 0 && data[0].countryid !== "") { %>',
                '<div class="bill-txt">',
                    '<h4><span class="red">*</span> Country :</h4>',
                    '<select name="country" class="j-billEdit-country" data-type="countrys">',
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
                '<div class="bill-txt">',
                    '<h4><span class="red">*</span> State/Province/Region :</h4>',
                    '<select class="j-billEdit-state" name="state" data-type="states">',
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
            '<div class="bill-txt">',
                '<h4><span class="red">*</span> Zip/Postal Code :</h4>',
                '<input class="j-billEdit-zipcode" type="text" name="postalcode" value="<%=data.zipCode%>" />',
                '<div class="edit-error-tips"></div>',
            '</div>'
        ],
        //手机号码
        telephone: [
            '<% var data = obj; %>',
            '<div class="telephone">',
                '<h4><span class="red">*</span> Mobile No./ Phone :</h4>', 
                '<div class="telephone-inner">',
                    '<div class="areacode"><input class="j-billEdit-areacode" type="text" readonly="readonly" name="areacode" value=""></div>',
                    '<div class="telephonecode"><input class="j-billEdit-telephone" type="text" name="mobilephone" value="<%=data.telephone.replace(/^\\d[\\d ]*\\-(.*)/, \"$1\")%>" /></div>',
                '</div>',
                '<div class="edit-error-tips"></div>',
            '</div>'
        ],
        //税号（增值税）
        vatNumber: [
            '<% var data = obj; %>',
            //税号（增值税，部分国家展示）
            '<% if (data.vatnum !== "") { %>',
                '<div class="j-billEdit-vatNumber-warp bill-txt">',
            //反之，隐藏
            '<% } else { %>',
                '<div class="j-billEdit-vatNumber-warp bill-txt dhm-hide">',
            '<% } %>',
                '<h4><span class="red">*</span> VAT Number :</h4>',
                '<input class="j-billEdit-vatNumber" type="text" name="vatNumber" value="<%=data.vatnum%>" />',
                '<div class="edit-error-tips"></div>',
                '<div class="sec-tips">The VAT Number, i.e. Value Added Tax Number, includes the CPF NO. for people or CNPJ NO. for companies. If its required by the delivery country for goods customs clearance, you have to provide the VAT Number to ensure the delivery success to you. </div>',
            '</div>'
        ],
        //保存运输地址编辑按钮
        save: [
            '<% var data = obj, action = data.__action, usertype = data.__usertype; %>',
            //只有在游客添加运输地址的情况下才验证email表单项
            '<% if (action==="add" && usertype===true) { %>',
                '<div class="billEdit-save-btn j-saveBillBtn"><input data-validate="saveEmail" type="button" value="Save"></div>',
            '<% } else {  %>',
                '<div class="billEdit-save-btn j-saveBillBtn"><input data-validate="save" type="button" value="Save"></div>',
            '<% } %>'
        ]
    }
});
