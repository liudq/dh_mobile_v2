/**
 * module src: detail/v1/main.js
 * 入口文件
**/
define('app/main', [
        'common/config',
        'common/getUserInfo',
        'common/langLoader',
        'common/appSpread',
        'common/appopen',
        'common/header/buyerUserInfo',
        'common/header/topMenuInit',
        'common/header/topMenuOneCategories',
        'common/header/turnToLanguagesWebsite',
        'common/header/topSearch',
        'common/sharesns',
        'common/countdown',
        'common/detail/findSkuAttr',
        'common/recommend/youMyLike',
        'common/recommend/youViewed',
        'common/detail/recommended',
        'common/detail/productAttrPopup',
        'common/detail/PriceRange',
        'common/detail/selectSkuAttr',
        'common/coupon/getStoreCouponList',
        'common/coupon/bindStoreCoupon',
        'common/detail/getDefaultShipCostAndWay',
        'common/detail/getShipCostAndWayList',
        'common/detail/getShiptoCountryList',
        'common/detail/addToCart',
        'common/detail/favorite',
        'common/goTop',
        'common/tc',
        'app/recordItemCode',
        'app/preprocessingSyncData',
        'app/getDhCouponList',
        'app/proTab',
        'app/bottomScrollBar',
        'app/contactSellerToNtalker',
        'app/share',
        'app/promotionCountDown',
        'app/imageSlider',
        'app/reviewImgView',
        'app/getReviewList',
    ], function(
        CONFIG,
        getUserInfo,
        langLoader,
        appSpread,
        appopen,
        BuyerUserInfo,
        TopMenuInit,
        TopMenuOneCategories,
        turnToLanguagesWebsite,
        TopSearch,
        sharesns,
        Countdown,
        findSkuAttr,
        YouMyLike,
        YouViewed,
        recommended,
        productAttrPopup,
        PriceRange,
        selectSkuAttr,
        getStoreCouponList,
        bindStoreCoupon,
        getDefaultShipCostAndWay,
        getShipCostAndWayList,
        getShiptoCountryList,
        addToCart,
        Favorite,
        goTop,
        tc,
        recordItemCode,
        preprocessingSyncData,
        getDhCouponList,
        proTab,
        bottomScrollBar,
        contactSellerToNtalker,
        share,
        PromotionCountDown,
        imageSlider,
        reviewImgView,
        getReviewList
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //初始化页面loading样式
        (function(){
            var loadingLang = $('.j-loading-lang'),
                loadingLayerWarp = $('.j-loading-layer-warp');

            loadingLang.html('Please wait.').removeClass('dhm-hide');
            loadingLayerWarp.css({'margin-top': -62});
        }());

        //初始化页面data-error-tip国际化内容
        (function(){
            $('#errorSure').html('OK');
        }());

        //处理完页面同步业务数据后再执行其他业务逻辑
        preprocessingSyncData.init({
            successCallback: function(syncData){
                //将当前浏览产品的itemcode写入cookie
                recordItemCode.set(syncData.itemCode);

                //提示下载APP
                appSpread.init({
                    gaCallback: function(){
                        var cOpenBtn = $('.j-openApp');
                        if(cOpenBtn.attr('des')){
                            ga('send', 'event', 'Checkout-product', 'TDCode', 'dload');
                        }else{
                            //ga('send', 'event', 'mhp1509', 'dload');
                            ga('send', 'event', 'mhp1509', 'download');
                        }
                    }
                });
                //获取买家相关信息，包含用户名、购物车、站内信的数量
                new BuyerUserInfo({
                    //请求成功回调
                    successAfter: function(){
                        //左侧顶部菜单初始化，
                        //依赖：购物车数量，站内信数量，昵称
                        var topMenuInit = new TopMenuInit();

                        //左侧顶部菜单一级类目
                        new TopMenuOneCategories({topMenuInit: topMenuInit});

                        //左侧顶部菜单多语言切换
                        turnToLanguagesWebsite.init();
                    }
                });

                //页面顶部搜索包含：最近搜索关键词、热门关键词、推荐搜索关键词
                new TopSearch();
                //Price on the App
                $('body').on('click','.j-priceOnApp',function(){
                    try {
                        ga('send', 'event', 'Checkout-product', 'TDCode', 'priceonapp');
                    }catch(e){
                        console.log(e.message);
                    }
                    appopen.init();
                });
                //促销倒计时
                if(syncData.promEndDate!==-1){
                    var remainingTimeObj = Countdown.init({endTime:syncData.promEndDate,runCallback:function(time){
                        PromotionCountDown.init({remainingTime:time});
                    }});
                }
                //添加收藏
                new Favorite({itemCode:syncData.itemCode,productId:syncData.productId});
                //首屏banner功能
                imageSlider.init({cOriginalImgData:syncData.oriImgList});
                //reviews缩小图功能
                reviewImgView.init();

                var shipcost,
                    attrPopup;

                //获取默认展示的[运输方式|目的国家|备货地|运达时间]
                shipcost = new getDefaultShipCostAndWay({
                    itemcode: syncData.itemCode,
                    quantity: syncData.minOrder,
                    successCallback: function(model){
                        //注册sku弹层 关闭按钮、Confirm按钮、图片的实例对象
                        this.productAttrPopupInstance = attrPopup;
                        //获取对应目的国家下的运费列表，并将其实
                        //例对象注册到getDefaultShipCostAndWay上
                        this.getShipCostAndWayListInstance = new getShipCostAndWayList({
                            itemcode: syncData.itemCode,
                            quantity: this.quantity||syncData.minOrder,
                            skuId: this.skuId||'',
                            skuMd5: this.skuMd5||'',
                            whitherCountryId: model.get('whitherCountryId'),
                            whitherCountryName: model.get('whitherCountryName'),
                            stockCountryId: model.get('stockCountryId'),
                            updateCallback: this.updateCallback,
                            getDefaultShipCostAndWayInstance: this
                        });

                        //获取目的国家列表
                        new getShiptoCountryList({
                            currentWhitherCountryId: model.get('whitherCountryId'),
                            getDefaultShipCostAndWayInstance: this,
                            getShipCostAndWayListInstance: this.getShipCostAndWayListInstance
                        });
                    }
                });

                /**
                 * 如果同步接口里面没有isShipto个字段，则表
                 * 示后端同步默认运费信息这块时间开销太大，
                 * 会影响到页面首字节加载时间，对于用户体验、
                 * SEO有较一定影响，特别是在后者；
                 * 在这种情况下，后端同步到页面的运费信息并
                 * 非是实时数据，所以前端会在页面初始时以异
                 * 步的方式主动刷新默认展示实时的运费信息；
                 *
                 * 说明：这块最好是能够要求后端同步实时展示
                 * 默认的运费数据，这样体验最好，只是我们在
                 * 此提供了异步方式进行兼容；
                **/
                if (typeof syncData.isShipto === 'undefined') {
                    shipcost.trigger('GetDefaultShipCostAndWayView:upadteShipCostInfo');
                }

                //sku弹层 关闭按钮、Confirm按钮、图片
                attrPopup = new productAttrPopup({
                    syncData: {
                        thumbListFirst: syncData.thumbList[0],
                        istate: syncData.istate,
                        minOrder: syncData.minOrder,
                        promoTypeId: syncData.promoTypeId,
                        isShipto: syncData.isShipto,
                        submitData: {
                            itemCode: syncData.itemCode,
                            productId: syncData.productId,
                            supplierid: syncData.supplierid,
                            unit: syncData.measureName,
                            quantity: syncData.minOrder,
                            impressionInfo: CONFIG.wwwHASH.split("#")[1] !== undefined?CONFIG.wwwHASH.split("#")[1]:''
                        }
                    },
                   originalSyncData: syncData,
                   getDefaultShipCostAndWay: shipcost
                });
                //dhCoupon列表
                new getDhCouponList({
                    syncData: {
                        cateDispId: syncData.cateDispId,
                        itemCode: syncData.itemCode
                    }
                });

                //获取店铺优惠券列表
                new getStoreCouponList({
                    itemCode: syncData.itemCode,
                    supplierid: syncData.supplierid,
                    bindStoreCouponInstance: new bindStoreCoupon()
                });

                //获取评论列表
                new getReviewList({
                    syncData: {
                        itemCode: syncData.itemCode,
                        productId: syncData.productId
                    }
                });

                //控制[短描|长描|评论]的展示
                proTab.init();
                //NTALKER聊天对话框
                contactSellerToNtalker.init({
                    uid: syncData.uid,
                    sid: syncData.sid,
                    supplierId: syncData.supplierid,
                    productId: syncData.productId,
                    productName: syncData.productName
                });
                //将当前浏览页面地址分享到第三方平台
                share.init();

                //返回顶部
                goTop.init();
                //页面底部漂浮工具条
                bottomScrollBar.init();
                //页面底部SEO内容列表展示更多
                (function(){
                    var $body = $('body'),
                        $cResearchList = $body.find('ul[data-status="research-list-hide"]'),
                        $cResearchListMore = $('.j-researchListMore'),
                        cHide = 'dhm-hide';
                    $body.on('click', '.j-researchListMore', function(){
                        //展开
                        if ($cResearchList.hasClass(cHide)) {
                            $cResearchList.removeClass(cHide);
                            $cResearchListMore.html('- Fewer');
                        //收起
                        } else {
                            $cResearchList.addClass(cHide);
                            $cResearchListMore.html('+ More');
                        }
                    });
                }());

                //推荐相关部分
                (function(){
                        //最近浏览产品的itemcode字符串列表
                    var item_recentvisit = $.cookie('item_recentvisit'),
                        //取得itemcode数组列表
                        itemcodes = item_recentvisit?item_recentvisit.match(/[^,]+/g):'';

                    //个性化推荐列表
                    new recommended({
                        pageType: 'Item',
                        itemCode: syncData.itemCode,
                        cateDispId: syncData.cateDispId
                    });

                    //you my like
                    YouMyLike.init({
                        el: '.j-recommend-ymlike',
                        title: 'You May Like',
                        trackingPrefix: '#mymlpd-',
                        api: {
                            param: {
                                //最新一个产品的底级类目号
                                category: syncData.cateDispId,
                                //itemcode-最终页传当前产品，首页和列表页传最近3个浏览过的产品
                                itemID: syncData.itemCode,
                                //页面类型
                                pageType: 'Item'
                            }
                        }
                    });

                    //you viewed，且曾经浏览过至少一个产品
                    if (itemcodes!=='') {
                        YouViewed.init({
                            el: '.j-recommend-yviewed',
                            title: 'You Viewed',
                            trackingPrefix: '#mvdpd-',
                        });
                    }
                }());

                //第三方统计代码相关部分
                (function(window, data){
                    //GA：analytics.js
                    (function(){
                        try{
                            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
                            ga('create', 'UA-425001-12', 'auto');
                            //用来做A/B测试，新版为1，老版为0
                            //ga('set', 'dimension1', '1');
                            ga('send', 'pageview', location.pathname + location.search + escape(location.hash));
                        }catch(e){}
                    }());

                    //D1：dhta.js
                    tc.init({
                        loadScriptUrl: 'http://www.dhresource.com/dhs/fob/js/common/track/dhta.js',
                        loadScriptSuccess: function(){
                            try{
                                    //url-锚点
                                var hash = location.hash,
                                    //站内位置#a-b-c  a部分
                                    clkloc = "",
                                    //站内位置#a-b-c  b部分
                                    pos = "",
                                    //站内位置#a-b-c  c部分
                                    type= "",
                                    //存储[a&b&c]的数组
                                    parts;

                                //示例：主站产品最终页 (s1-2-7|756038726)，s1
                                //对应a部分，2对应b部//分，7|756038726对应c部分；
                                if (hash != '' && hash != null) {
                                    hash = hash.substr(1);
                                    parts = hash.split("-");
                                    clkloc = parts[0];
                                    pos = parts[1];
                                    type = parts[2];
                                }

                                _dhq.push(["setVar", "pic", data.itemCode]);
                                _dhq.push(["setVar", "clkloc", clkloc]);
                                _dhq.push(["setVar", "pos", pos]);
                                _dhq.push(["setVar", "type", type]);
                                //展示类目id
                                _dhq.push(["setVar", "cid", data.cateDispId]);
                                //卖家id
                                _dhq.push(["setVar", "supplierid", data.supplierid]);
                                //发布类目id
                                _dhq.push(["setVar", "catepubid", data.catePubId]);
                                _dhq.push(["setVar", "pt", "prodet"]);
                                _dhq.push(["event", "Item_U0001"]);
                            }catch(e){}
                        }
                    }).loadScript();

                    //Google Code for Smart Pixel List Remarketing List
                    (function(){
                        try{
                            var cDiv = document.createElement('div'),
                                cImg = document.createElement('img'),
                                RMKTParams = {
                                    ET: 'Item',
                                    PageType: 'product',
                                    ProdID: data.itemCode,
                                    Pname1: data.firstCateName.replace("'"," "),
                                    Pname: data.secondCateName.replace("'"," "),
                                    Pname2: data.thirdCateName.replace("'"," ")
                                },
                                _random = '&random='+(new Date()).getTime(),
                                _data='';

                            for (var i in RMKTParams) {
                                _data += i+'='+RMKTParams[i]+';';
                            }
                            _data = _data.replace(/\;*$/g,'');

                            cDiv.style.display = 'inline';
                            cImg.setAttribute('width','1px');
                            cImg.setAttribute('height','1px');
                            cImg.style.borderStyle = 'none';
                            cImg.src = '//googleads.g.doubleclick.net/pagead/viewthroughconversion/972936895/?value=1.000000&label=3Q1ACNGm3gIQv633zwM&guid=ON&script=0&hl=en&bg=666666&fmt=3&url='+encodeURIComponent(location.href)+'&data='+encodeURIComponent(_data)+_random;
                            cImg.onload = function(){return false;}
                            cDiv.appendChild(cImg);
                            document.getElementsByTagName('body')[0].appendChild(cDiv);
                        }catch(e){}
                    }());

                    //CJ
                    (function(){
                        try{
                            window._caq = window._caq || [];
                            (function () {
                                var ca = document.createElement("script");
                                ca.type = "text/javascript";
                                ca.async = true;
                                ca.id = "_casrc";
                                ca.src = "//t.channeladvisor.com/v2/12016266.js";
                                var ca_script = document.getElementsByTagName("script")[0];
                                ca_script.parentNode.insertBefore(ca, ca_script);
                            })();
                        }catch(e){}
                    }());

                    //Facebook Pixel Code
                    (function(){
                        try{
                            var _fbq = window._fbq || (window._fbq = []);
                            if (!_fbq.loaded) {
                                var fbds = document.createElement('script');
                                fbds.async = true;
                                fbds.src = '//connect.facebook.net/en_US/fbds.js';
                                var s = document.getElementsByTagName('script')[0];
                                s.parentNode.insertBefore(fbds, s);
                                _fbq.loaded = true;
                            }
                            _fbq.push(['addPixelId', '816036941799019']);

                            window._fbq = window._fbq || [];
                            window._fbq.push(['track', 'PixelInitialized', {}]);
                        }catch(e){}
                    }());
                    
                    //sociomantic：dhgate-us
                    (function(){
                        var price,
                            amount,
                            valid,
                            url;

                        //展示价
                        if (data.displayPrice !== '') {
                            //区间价
                            if (data.displayPrice.isEqual !== true) {
                                price = data.displayPrice.minPrice+' - '+data.displayPrice.maxPrice;
                            //单价
                            } else {
                                price = data.displayPrice.minPrice;
                            }
                        }
                        //删除价
                        if (data.deletePrice !== '') {
                            //区间价
                            if (data.deletePrice.isEqual !== true) {
                                amount = data.deletePrice.minPrice+' - '+data.deletePrice.maxPrice;
                            //单价
                            } else {
                                amount = data.deletePrice.minPrice;
                            }
                        }
                        //sold out或默认不可运达
                        if (data.istate===false||data.isShipto===false) {
                            valid = new Date().getTime();
                        //默认可售
                        } else {
                            valid = '0';
                        }
                        //当前浏览页面地址
                        url = CONFIG.wwwURL+CONFIG.wwwPATHNAME+CONFIG.wwwSEARCH;
                        
                        window.product = {
                            //产品id
                            identifier: data.itemCode,
                            //类别路径
                            category: data.cateDispPath,
                            //产品名称
                            fn: data.productName,
                            //产品叙述
                            description: data.shortDescription,
                            //产品品牌
                            brand: '',
                            //产品优惠价/打折价
                            price: price,
                            //产品原价/市价
                            amount: amount,
                            //货币
                            currency: 'USD',
                            //产品链接
                            url: url,
                            //产品图片链接
                            photo: data.thumbList[0],
                            //产品有效期
                            valid: valid
                        };
                        
                        (function(){
                            var s = document.createElement('script');
                            var x = document.getElementsByTagName('script')[0];
                            s.type = 'text/javascript';
                            s.async = true;
                            s.src = ('https:'==document.location.protocol?'https://':'http://') + 'ap-sonar.sociomantic.com/js/2010-07-01/adpan/dhgate-us';
                            x.parentNode.insertBefore( s, x );
                        })();
                    }());
                }(window, syncData));
            }
        });
    });
});