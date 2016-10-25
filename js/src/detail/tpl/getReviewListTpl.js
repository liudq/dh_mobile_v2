/**
 * module src: detail/tpl/getReviewListTpl.js
 * 获取评论列表
**/
define('appTpl/getReviewListTpl', [], function(){
    return {
        //主体内容
        main: [
            '<% var data = obj;%>',
            '<% for (var i = 0, len = data.list.length; i < len;i++){ %>',
                '<div class="datail-reviews-evaluate">',
                    '<ul>',
                        '<% var score = data.list[i].score%>',
                        '<li class="evaluate-from"><span class="evaluate-star"><span style="width:<%=data.list[i].score%>%"></span></span><span class="evaluate-by">By: <%=data.list[i].nickName%></span><%=data.list[i].createdDate%>',
                        '</li>',
                        '<% var imageUrl = data.list[i].imageUrl%>',
                        '<li class="evaluate-picture j-reviewImgBtn">',
                            '<% for (var j = 0; j < imageUrl.length;j++){ %>',
                                '<a href="javascript:;" data-reviewViewImg ="<%=imageUrl[j]%>"><img src="<%=imageUrl[j]%>" alt="" /></a>',
                            '<% } %>',    
                        '</li>',          
                        '<li class="evaluate-praise">',
                            '<%=data.list[i].buyerReviewText%>',
                            '<% if(data.list[i].sellerReviewText !== "") { %>',
                                '<div class="evaluate-praise-box">',
                                    '<span></span>',
                                    '<b>Seller response:</b><%=data.list[i].sellerReviewText%>',
                                '</div>',
                            '<% } %>',
                        '</li>',
                    '</ul>',
                '</div>',
                '<div class="split-line"></div>',
            '<% } %>'
        ]
    };
});