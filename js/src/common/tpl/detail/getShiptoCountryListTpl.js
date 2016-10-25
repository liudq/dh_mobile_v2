/**
 * module src: common/detail/getShiptoCountryListTpl.js
 * 获取目的国家列表模板模块
**/
define('tpl/detail/getShiptoCountryListTpl', [], function(){
    return {
        //主体内容
        main: [
            '<% var data = obj; %>',
            '<div class="datail-country-layer close-layer2 dhm-hide j-shiptoCountryWarp">',
                '<div class="product-title-top j-shiptoCountryClose"><a href="javascript:;"><span class="title-top-icon"></span>Country</a></div>',
                '<div class="country-content j-shiptoCountryContent">',
                    '{{countryList}}',
                '</div>',
            '</div>'
        ],
        //运达目的国家列表
        countryList: [
            '<% var data = obj; %>',
            //热门国家列表
            '<div class="layer-tit country-tit">Popular</div>',
            '<% $.each(data.popular, function(index, country){ %>',
                '<ul class="country-list">',
                    //设置默认选中的运达目的国家
                    '<% if (data.currentWhitherCountryId !== country.whitherCountryId) { %>',
                        '<li data-whitherCountryId="<%=country.whitherCountryId%>" data-whitherCountryName="<%=country.whitherCountryName%>"><%=country.whitherCountryName%></li>',
                    '<% } else { %>',
                        '<li data-whitherCountryId="<%=country.whitherCountryId%>" data-whitherCountryName="<%=country.whitherCountryName%>"><%=country.whitherCountryName%><span></span></li>',
                    '<% } %>',
                '</ul>',
            '<% }); %>',
            //除热门国家外的其他国家列表
            '<% $.each(data.all, function(letter, items){ %>',
                '<div class="layer-tit country-tit"><%=letter%></div>',
                '<ul class="country-list">',
                    '<% $.each(items, function(index, country){ %>',
                        //设置默认选中的运达目的国家
                        '<% if (data.currentWhitherCountryId !== country.whitherCountryId) { %>',
                            '<li data-whitherCountryId="<%=country.whitherCountryId%>" data-whitherCountryName="<%=country.whitherCountryName%>"><%=country.whitherCountryName%></li>',
                        '<% } else { %>',
                            '<li data-whitherCountryId="<%=country.whitherCountryId%>" data-whitherCountryName="<%=country.whitherCountryName%>"><%=country.whitherCountryName%><span></span></li>',
                        '<% } %>',
                    '<% }) %>',
                '</ul>',
            '<% }) %>'
        ]
    };
});
