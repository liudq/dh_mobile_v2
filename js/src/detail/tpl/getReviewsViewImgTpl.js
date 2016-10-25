/**
 * module src: detail/tpl/getReviewsViewImgTpl.js
 * 获取ReviewsView大图数据
**/
define('appTpl/getReviewsViewImgTpl', [], function(){
    return [
    '<% var data = obj;%>',
    '<div class="product-picture-top j-reviewViewImgBack"><a href="javascript:;"></a><span class="title-top-icon"></span><p>Back</p></div>',
    '<div class="swiper-container datail-slider j-reviewViewImg">',
        '<ul class="swiper-wrapper">',
            '<% for (var i = 0, len = data.length; i < len;i++){ %>',
                '<li class="swiper-slide">',
                    '<div class="pinch-zoom-container">',
                        '<div class="pinch-zoom j-review-pinch-zoom">',
                            '<div class="zoomImgOtrDv">',
                                '<% if (i === 0){ %>',
                                    '<div class="zoomImgDv"><img src="<%=data[i]%>"></div>',
                               '<%} else{ %>',
                                    '<div class="zoomImgDv"><img data-src="<%=data[i]%>" class="swiper-lazy"></div>',
                                '<% } %>',
                            '</div>',
                        '</div>',
                    '</div>',
               '</li>',
            '<% } %>',
        '</ul>',
        '<div class="swiper-pagination swiper-pagination-white j-review-pagination"></div>',
    '</div>'
    ];
});