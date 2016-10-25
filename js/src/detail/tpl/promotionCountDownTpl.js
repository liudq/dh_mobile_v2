/**
 * module src: detail/tpl/promotionCountDownTpl.js
 * 获取促销时间模板
**/
define('appTpl/promotionCountDownTpl', [], function(){
    return [
    '<% var data = obj,day = parseInt(obj.day);%>',
    '<% if(day>=1){%>',
        '<span><var><%=data.day%>',
        '<% if(day>1){%>Days<%}else {%>Day<%}%></var>',
        '<% if(parseInt(obj.hour)>=1){%>',
            '<var><%=data.hour%>',
            '<% if(hour>1){%>hours<%}else {%>hour<%}%></var>',
        '<%}%>',
        '</span>',
    '<%}else {%>',
        '<span><var><%=data.hour%>h</var><var><%=data.minute%>m</var><var><%=data.second%>s</var></span>',
    '<%}%>',
    'left'
    ];
});