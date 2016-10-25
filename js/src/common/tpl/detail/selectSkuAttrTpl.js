/**
 * module src: common/tpl/detail/selectSkuAttrTpl.js
 * sku弹层选择sku产品属性
**/
define('tpl/detail/selectSkuAttrTpl', [], function(){
    return {
        //sku产品属性
        selectSkuAttr: [
            '<% var data = obj;%>',
            '<% var dataAttrGroups = data.attrGroups%>',
           	'<% for (var i = 0, len = dataAttrGroups.length; i < len; i++) { %>',
                '<div class="layer-tit"><%=dataAttrGroups[i].name%>:</div>',
                '<div class="options-list j-options-list" data-name="<%=encodeURIComponent(dataAttrGroups[i].name)%>">',
	                '<ul>',
		                '<% var dataAttr = dataAttrGroups[i].attrs%>',
		                '<% for (var j = 0; j < dataAttr.length; j++) { %>',
		                	'<% if (dataAttr[j].imgUrl === undefined) { %>',
		                    	'<li attr_id ="<%=dataAttr[j].id%>" class="j-skuAttr j-skuClick"><span><%=dataAttr[j].name%></span></li>',
		                  	'<% } else { %>',
		                       '<li attr_id ="<%=dataAttr[j].id %>" class="j-skuAttr j-skuClick options-img"><span><img src="<%=dataAttr[j].imgUrl%>" alt="<%=dataAttr[j].name%>" /></span></li>',
			                '<% } %>',
		                '<% } %>',
	                '</ul>',
                '</div>',
            '<% } %>'
        ]
    };
});