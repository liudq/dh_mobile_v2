/**
 * module src: seach/v1/tpl/sortByTpl.js
**/
define('appTpl/sortByTpl', [], function(){
    return [
        '<% var data = obj.list, len = data.length,activeIndex = obj.activeIndex;%>',
        '<div class="sort-refine-titlecon">',
	        '<a href="javascript:;" class="back j-sortBack"><var></var>Back</a>',
	        '<span class="sortRe-title">Sort</span>',
	    '</div>',
	    '<div class="bestmatch j-sort-scroll">',
	        '<ul>',
	            '<% for (var i = 0; i < len; i++) { %>',
	                '<li data-stype="<%=data[i]["dataStype"]%>" data-sinfo="<%=data[i]["dataSort"]%>" data-<%=data[i]["dataStype"]%><%=data[i]["dataSort"]%>="1"><%=data[i]["title"]%><var></var></li>',
	            '<% } %>',
	        '</ul>',
	    '</div>'
    ];
});
