/**
 * module src: exclusivedeals/tpl/exclusiveTpl.js
 * 移动专享价专区模板模块
**/
define('appTpl/exclusiveTpl', [], function(){
    return {
        //主体内容
        main: [
            //专区内容分类标签外层包裹容器
            '{{exclusiveClassificationWarp}}',
            //推荐产品外层包裹容器
            '<div class="content j-justForYouWarp">',
                '<div class="pro-list"><ul>{{exclusiveRecommendProduct}}</ul></div>',
            '</div>',
            //类目列表产品外层包裹容器
            '{{categorysProductWarp}}'
        ],
        //专区内容分类标签外层包裹容器
        exclusiveClassificationWarp: [
            '<div class="allcate-tit j-exclusiveClassification">',
                '<div class="allcate-iscroll">',
                    '<div class="allcate-iscroll-inner j-allcate-iscroll">',
                        '<div class="allcate-iscroll-box">',
                            '<a class="current" href="javascript:;" data-type="j-justForYouWarp" data-status="init"><%=$.lang["Exclusivedeals_justforyou"]%></a>',
                            '{{categorysTitle}}',
                        '</div>',
                    '</div>',
                '</div>',
                //如果没有类目信息则不展示
                '<% var data = obj; %>',
                '<% if (data.categorys.length > 0) { %>',
                    '<span class="allcate-more j-allcateBtn"></span>',
                '<% } %>',
            '</div>'
        ],
        //类目标题列表
        categorysTitle: [
            '<% var data = obj; %>',
            '<% for (var i = 1, len = data.categorys.length; i < len; i++) { %>',
                '<a href="javascript:;" data-type="j-categoryListWarp-<%=data.categorys[i].id%>"><%=data.categorys[i].name%></a>',
            '<% } %>'
        ],
        //类目列表产品外层包裹容器
        categorysProductWarp: [
            '<% var data = obj; %>',
            '<% for (var i = 0, len = data.categorys.length; i < len; i++) { %>',
                '<div class="content dhm-hide j-categoryListWarp-<%=data.categorys[i].id%>">',
                    '{{loading}}',
                    '<div class="pro-list"><ul></ul></div>',
                '</div>',
            '<% } %>'
        ],
        //专区推荐产品外层包裹容器（数据重置使用）
        exclusiveRecommendProductWarp: [
            '<div class="pro-list"><ul>{{exclusiveRecommendProduct}}</ul></div>',
        ],
        //专区推荐产品
        exclusiveRecommendProduct: [
            '<% var data = obj; %>',
            '<% for (var i = 0, len = data.recommendProducts.length; i < len; i++) { %>',
                '<li>',
                    //直降
                    '<% if (data.recommendProducts[i].promoType === "1") { %>',
                        '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_1", {val: data.recommendProducts[i].discount})%></span>',
                    //打折
                    '<% } else if (data.recommendProducts[i].promoType === "2") { %>',
                        '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_0", {val: data.recommendProducts[i].discount})%></span>',
                    //VIP直降
                    '<% } else if (data.recommendProducts[i].promoType === "3") { %>',
                        '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_3", {val: data.recommendProducts[i].discount})%></span>',
                    //VIP打折
                    '<% } else if (data.recommendProducts[i].promoType === "4") { %>',
                        '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_2", {val: data.recommendProducts[i].discount})%></span>',
                    //APP独享
                    '<% } else if (data.recommendProducts[i].promoType === "5") { %>',
                        //默认就是APP独享
                    //APP VIP独享
                    '<% } else if (data.recommendProducts[i].promoType === "6") { %>',
                        '<span class="off-ico2"><%=$.lang["COMMON_Discount_4"]%></span>',
                    '<% } %>',
                    //展示上放不下计量单位
                    //'<a href="<%=data.recommendProducts[i].url%>">',
                    //    '<div class="pro-img"><img src="<%=data.recommendProducts[i].imageUrl%>"></div>',
                    //    '<div class="pro-text"><%=data.recommendProducts.curreny%><%=$.lang.replaceTplVar("Exclusivedeals_prices", {curreny: data.recommendProducts[i].curreny, prices: data.recommendProducts[i].prices, measure: "<span>"+data.recommendProducts[i].measure+"</span>"})%></div>',
                    //'</a>',
                    '<a href="<%=data.recommendProducts[i].url%>#mobilex-<%=data.pageNum<2?i+1:(data.pageNum-1)*20+i+1%>-hot">',
                        '<div class="pro-img"><img src="<%=data.recommendProducts[i].imageUrl%>"></div>',
                        '<div class="pro-text"><%=data.recommendProducts.curreny%><%=$.lang.replaceTplVar("Exclusivedeals_prices", {curreny: data.recommendProducts[i].curreny, prices: data.recommendProducts[i].prices})%></div>',
                    '</a>',
                '</li>',
            '<% } %>'
        ],
        //类目推荐产品
        categoryProduct: [
            '<% var data = obj; %>',
            '<% for (var i = 0, len = data.length; i < len; i++) { %>',
                '<li>',
                    //直降
                    '<% if (data[i].promoType === "1") { %>',
                        '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_1", {val: data[i].discount})%></span>',
                    //打折
                    '<% } else if (data[i].promoType === "2") { %>',
                        '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_0", {val: data[i].discount})%></span>',
                    //VIP直降
                    '<% } else if (data[i].promoType === "3") { %>',
                        '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_3", {val: data[i].discount})%></span>',
                     //VIP打折
                    '<% } else if (data[i].promoType === "4") { %>',
                        '<span class="off-ico2"><%=$.lang.replaceTplVar("COMMON_Discount_2", {val: data[i].discount})%></span>',
                    //APP独享
                    '<% } else if (data[i].promoType === "5") { %>',
                        //默认就是APP独享
                    //APP VIP独享
                    '<% } else if (data[i].promoType === "6") { %>',
                        '<span class="off-ico2"><%=$.lang["COMMON_Discount_4"]%></span>',
                    '<% } %>',
                    //展示上放不下计量单位
                    //'<a href="<%=data[i].url%>">',
                    //    '<div class="pro-img"><img src="<%=data[i].imageUrl%>"></div>',
                    //    '<div class="pro-text"><%=data.curreny%><%=$.lang.replaceTplVar("Exclusivedeals_prices", {curreny: data[i].curreny, prices: data[i].prices, measure: "<span>"+data[i].measure+"</span>"})%></div>',
                    //'</a>',
                    '<a href="<%=data[i].url%>#mobilex-<%=data[i].pageNum<2?i+1:(data[i].pageNum-1)*20+i+1%>-<%=data[i].categoryId%>">',
                        '<div class="pro-img"><img src="<%=data[i].imageUrl%>"></div>',
                        '<div class="pro-text"><%=data.curreny%><%=$.lang.replaceTplVar("Exclusivedeals_prices", {curreny: data[i].curreny, prices: data[i].prices})%></div>',
                    '</a>',
                '</li>',
            '<% } %>'
        ],
        //提示信息（专区推荐）
        tips: [
            '<div class="pro-tip"><%=$.lang["Exclusivedeals_nothing"]%></div>'
        ],
        //提示信息（类目推荐）
        tipsCategory: [
            '<% var data = obj; %>',
            '<div class="pro-tip"><%=$.lang.replaceTplVar("Exclusivedeals_nothing1", {name: data.name})%></div>'
        ],
        //loading状态
        loading: [
            '<div class="pro-load j-pro-load"><span></span></div>'
        ]
    };
});

