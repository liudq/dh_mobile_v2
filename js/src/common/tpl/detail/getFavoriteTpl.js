/**
 * module src: common/detail/getFavoriteTpl.js
 * 获取收藏模板模块
**/
define('tpl/detail/getFavoriteTpl', [], function(){
    return [
        '<% var data = obj.data,isFavState = obj.data.favorite;%>',
        //已收藏状态
        '<% if (isFavState==="1") {  %>',
            '<span class="slider-collection j-favBtn"><span class="slider-icon slider-icon2 j-favStyle"></span><span class="j-num"><%=data.count%></span></span>',
        //未收藏状态
        '<% }else{ %>',
            '<span class="slider-collection j-favBtn"><span class="slider-icon j-favStyle"></span><span class="j-num"><%=data.count%></span></span>',
        '<% } %>'
    ];
});
