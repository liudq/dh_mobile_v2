/**
 * module src: common/tpl/detail/productAttrPopupTpl.js
 * sku弹层 关闭按钮、Confirm按钮、图片
**/
define('tpl/detail/productAttrPopupTpl', [], function(){
    return {
        //主体内容
        main: [
            '<div class="datail-product-attributes j-datail-product-attributes close-layer1 dhm-hide">',
                '<div class="product-title-top j-product-title-top">{{title}}</div>',
                   '<div class="product-img j-product-img">',
                       '<dl>',
                           '<dt class="j-productPicture">{{productPicture}}</dt>',
                           '<dd class="j-priceRange"></dd>',
                       '</dl>',
                   '</div>',
                  '<div class="selectOption-scroll j-selectOption-scroll">',
                     '<div class="j-selectSkuAttrOption"></div>',
                     '<div class="j-priceRangeWarp"></div>',
                  '</div>',
                  '<section class="datail-btn2 j-confirm">{{confirm}}</section>',
            '</div>'
        ],
        //标题
        title: [
            '<a href="javascript:;" rel="nofollow"><span class="title-top-icon"></span>Please Select Options</a>'
        ],
        //产品图
        productPicture: [
          '<% var data = obj; %>',
          '<img src="<%=data.thumbListFirst%>"/>'
        ],
        //sku弾层中的立即购买、添加购物车按钮
        confirm: [
           //标记判断商品是否可售或限时限购个人可购买人数为0时或可购买数量小于最小可购买量按钮置灰 true为可售
            '<% var data = obj; %>',
            //是否为限时限量活动
            '<% if (data.promoTypeId === 2 || data.promoTypeId === 3) { %>',
                //活动库存
                '<% var inventory = data.maxPurchaseQuantity;%>',
            '<% } else { %>',
                //默认库存
                '<% var inventory = data.inventoryQuantity;%>',
            '<% } %>',
            //展示立即购买、添加到购物车按钮
            '<% if (btnType === "select") { %>',
                '<% if (data.istate === false || inventory === 0 || data.isShipto === false) { %>',
                 '<div class="butnow"><a href="javascript:;" rel="nofollow" class="sold">Buy it Now</a></div>',
                 '<div class="addtocart"><a href="javascript:;" rel="nofollow" class="sold">Add to Cart</a></div>',
                '<% } else { %>',
                  '<div class="butnow j-buyItNow"><a href="javascript:;" rel="nofollow">Buy it Now</a></div>',
                  '<div class="addtocart j-addToCart"><a href="javascript:;" rel="nofollow">Add to Cart</a></div>',
                '<% } %>',
            '<% } else if (btnType === "buy") { %>',
                //立即购买
                '<% if (data.istate === false || inventory === 0 || data.isShipto === false) { %>',
                  '<a href="javascript:;" rel="nofollow" class="sold">Confirm</a>',
                '<% } else { %>',
                  '<a href="javascript:;" rel="nofollow" class="j-buyItNow">Confirm</a>',
                '<% } %>',
            '<% } else if (btnType === "cart") { %>',
                //添加到购物车
                '<% if (data.istate === false || inventory === 0 || data.isShipto === false) { %>',
                  '<a href="javascript:;" rel="nofollow" class="sold">Confirm</a>',
                '<% } else { %>',
                  '<a href="javascript:;" rel="nofollow" class="j-addToCart">Confirm</a>',
                '<% } %>',
            '<% } %>'
        ],
        //首图下方展示addToCart和buyItNow按钮
        buyCart: [
            //标记判断商品是否可售或限时限购个人可购买人数为0时或可购买数量小于最小可购买量按钮置灰 true为可售
            '<% var data = obj;%>',
            //是否为限时限量活动
            '<% if (data.promoTypeId === 2 || data.promoTypeId === 3) { %>',
                  //活动库存
                  '<% var inventory = data.maxPurchaseQuantity;%>',
            '<% } else { %>',
                  //默认库存
                  '<% var inventory = data.inventoryQuantity;%>',
            '<% } %>',
            '<% if (data.istate === false || inventory === 0 || data.isShipto === false) { %>',
                  '<div class="butnow butnow-sold"><a href="javascript:;" rel="nofollow">Buy it Now</a></div>',
                  '<div class="addtocart butnow-sold"><a href="javascript:;" rel="nofollow">Add to Cart</a></div>',
            '<% } else { %>',
                  '<div class="butnow j-buySelectSkuAttr" data-skupop="buy"><a href="javascript:;" rel="nofollow">Buy it Now</a></div>',
                  '<div class="addtocart j-cartSelectSkuAttr" data-skupop="cart"><a href="javascript:;" rel="nofollow">Add to Cart</a></div>',
            '<% } %>'
        ],
        //底部滚动条
        bottomScrollBar:[
          '<% var data = obj; %>',
          //是否为限时限量活动
          '<% if (data.promoTypeId === 2 || data.promoTypeId === 3) { %>',
                //活动库存
                '<% var inventory = data.maxPurchaseQuantity;%>',
          '<% } else { %>',
                //默认库存
                '<% var inventory = data.inventoryQuantity;%>',
          '<% } %>',
          '<% if (data.istate === false || inventory === 0 || data.isShipto === false) { %>',
                '<a href="javascript:;" rel="nofollow" class="layer-bottom-but layer-bottom-notbuy">Buy it Now</a>',
                '<a href="javascript:;" rel="nofollow" class="layer-bottom-add layer-bottom-notbuy"> Add to Cart</a>',
          '<% } else { %>',
                '<a href="javascript:;" rel="nofollow" class="layer-bottom-but j-buySelectSkuAttr" data-skupop="buy">Buy it Now</a>',
                '<a href="javascript:;" rel="nofollow" class="layer-bottom-add j-cartSelectSkuAttr" data-skupop="cart"> Add to Cart</a>',
          '<% } %>'
        ]
    };
});