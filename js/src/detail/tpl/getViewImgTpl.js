/**
 * module src: detail/tpl/getViewImgTpl.js
 * 获取首屏banner的全屏图片数据
**/
define('appTpl/getViewImgTpl', [], function(){
    return [
    '<% var data = obj;%>',
    '<div class="product-picture-top j-viewImgBack"><a href="javascript:;"></a><span class="title-top-icon"></span><p>Back</p></div>',
    '<div class="swiper-container datail-slider j-imgViewCont">',
        '<ul class="swiper-wrapper">',
            '<% for (var i = 0, len = data.length; i < len;i++){ %>',
                '<li class="swiper-slide">',
                    '<div class="pinch-zoom-container">',
                        '<div class="pinch-zoom j-pinch-zoom">',
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
        '<div class="swiper-pagination swiper-pagination-white j-imgView-pagination"></div>',
    '</div>'
    ];
});