/**
 * module src: search/v1/main.js
 * 入口文件
**/
define('app/main', [
        'common/config',
        'common/langLoader',
        'common/appSpread', 
        'common/header/buyerUserInfo', 
        'common/header/topMenuInit', 
        'common/header/topMenuOneCategories', 
        'common/header/turnToLanguagesWebsite', 
        'common/header/topSearch', 
        'common/sharesns', 
        'common/recommend/youMyLike', 
        'common/recommend/youViewed',
        'common/tc',
        'app/sortBy',
        'app/filters',
        'app/cateFilter',
        'app/addToFav',
        'app/lazyload',
        'app/gotoTop',
        'app/getGlobalVariables'
    ], function(
        CONFIG,
        langLoader,
        appSpread, 
        BuyerUserInfo, 
        TopMenuInit, 
        TopMenuOneCategories, 
        turnToLanguagesWebsite, 
        TopSearch, 
        sharesns, 
        YouMyLike,
        YouViewed,
        tc,
        SortBy,
        Filters,
        CateFilter,
        AddToFav,
        Lazyload,
        GotoTop,
        GetGlobalVariables
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
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
        
        (function(){
                //最近浏览产品的itemcode字符串列表
            var item_recentvisit = $.cookie('item_recentvisit'),
                //取得itemcode数组列表
                itemcodes = item_recentvisit?item_recentvisit.match(/[^,]+/g):'',
                //搜索关键词
                keyword = CONFIG.wwwSEARCH.match(/(?:\?|&)key=([^#&]+)/i);

            //you my like
            YouMyLike.init({
                el: '.j-recommend-ymlike',
                title: 'You May Like',
                trackingPrefix: '#msyml-',
                api: {
                    param: {
                        //搜索关键词
                        keyword: keyword?keyword[1]:'',
                        //页面类型
                        pageType: 'Srp'
                    }
                }
            });
           
            //you viewed，且曾经浏览过至少一个产品
            if (itemcodes!=='') {
                YouViewed.init({
                    el: '.j-recommend-yviewed',
                    title: 'You Viewed',
                    trackingPrefix: '#msviewed-'
                });
            }

        }());

        //筛选Filters列表
        new Filters({
            successAfter:function(data){
                //筛选类目列表
                new CateFilter({"modelData":data});
            }
        });
        //筛选SortBy列表
        new SortBy();
        //添加收藏
        new AddToFav();
        //图片延迟加载
        $(".j-product-list .lazy").lazyload({
            threshold: '500'
        });
        //返回顶部
        new GotoTop();
        
        //zeroPage==="1"是0结果页面，0结果页面不需要这些跟踪码
        if(typeof zeroPage==='undefined'){
            //初始化捕获一下全局变量的异常
            GetGlobalVariables.init();
            //获取跟踪码所需要数据
            var trackDatas = GetGlobalVariables.get().data.trackParams||'',
                catename = GetGlobalVariables.get().data.catename||'',
                itemcodesArr = (trackDatas.itemsCodes||'').split(','),
                key = $('body').attr('data-keyword');
              
             //D1：dhta.js
            (function(){
                tc.init({
                    loadScriptUrl: 'http://www.dhresource.com/dhs/fob/js/common/track/dhta.js',
                    loadScriptSuccess: function() {
                        //D1代码主体部分
                        try{
                            _dhq.push(["setVar","uuid", trackDatas.uuid||'']);
                            _dhq.push(["setVar","site","wap"]);
                            _dhq.push(["setVar","lang","en"]); // lang指的是语言站点的缩写，如英文站写为en，俄语站写为ru 
                            _dhq.push(["setVar", "pt", "searl" ]);
                            _dhq.push(["setVar", "subpt", "searl" ]);
                            _dhq.push(["event", "Search_U0001"]);
                        } catch(e){}
                    }
                }).loadScript();
            }());
            //Facebook Pixel Code
            (function(global){
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','//connect.facebook.net/en_US/fbevents.js');

                fbq('init', '601438189994555');
                if(key!==''){
                    fbq('track', 'Search', {search_string:key});
                }else{
                    fbq('track', 'Search', {search_string:catename}); 
                }
                fbq('track', 'ViewContent', {content_ids:[itemcodesArr[0],itemcodesArr[1],itemcodesArr[2]], content_type:'product'});
            })(window);
            //Google Code for Smart Pixel List Remarketing List
            (function(){
                try{
                    var cDiv = document.createElement('div'),
                        cImg = document.createElement('img'),
                        RMKTParams = {
                            ET: 'Listing',
                            Pcat1: trackDatas.firstCateName||'',
                            Pcat2: trackDatas.secondCateName||'',
                            Pcat3: trackDatas.thirdCateName||''
                        },
                        _random = '&random='+(new Date()).getTime(),
                        _data='';

                    for (var i in RMKTParams) {
                        _data +=i+'='+RMKTParams[i]+';';
                    };

                    _data = _data.replace(/\;*$/g,'');
                    cDiv.style.display = 'inline';
                    cImg.setAttribute('width','1px');
                    cImg.setAttribute('height','1px');
                    cImg.style.borderStyle = 'none';
                    cImg.src = '//googleads.g.doubleclick.net/pagead/viewthroughconversion/972936895/?value=1.000000&label=3Q1ACNGm3gIQv633zwM&guid=ON&script=0&hl=en&bg=666666&fmt=3&url='+encodeURIComponent(location.href)+'&data='+encodeURIComponent(_data)+_random;
                    cImg.onload = function(){return false;}
                    cDiv.appendChild(cImg);
                    document.getElementsByTagName('body')[0].appendChild(cDiv);
                } catch(e) {}
            }());
            //Criteo
            (function(){
                tc.init({
                    loadScriptUrl: '//static.criteo.net/js/ld/ld.js',
                    loadScriptSuccess: function() {
                        //D1代码主体部分
                        try{
                            window.criteo_q = window.criteo_q || [];
                            window.criteo_q.push(
                                { event: "setAccount", account: trackDatas.partnerId},
                                { event: "setHashedEmail", email: "" },
                                { event: "setSiteType", type: "m" },
                                { event: "viewList", item: [itemcodesArr[0],itemcodesArr[1],itemcodesArr[2]] }
                            );
                        } catch(e){}
                    }
                }).loadScript();
            }());
            //CJ
            (function(){
                try{
                    var MasterTmsUdo = { 
                        'CJ' : {
                            'CTAGID': '10747',
                            'PRODUCT_ID': itemcodesArr.join(',')
                        }
                    };
                    ThirdLabs.load("load",function(){
                        (function(e){var t="1875",n=document,r,i,s={http:"http://cdn.mplxtms.com/s/MasterTMS.min.js",https:"https://secure-cdn.mplxtms.com/s/MasterTMS.min.js"},o=s[/\w+/.exec(window.location.protocol)[0]];i=n.createElement("script"),i.type="text/javascript",i.async=!0,i.src=o+"#"+t,r=n.getElementsByTagName("script")[0],r.parentNode.insertBefore(i,r),i.readyState?i.onreadystatechange=function(){if(i.readyState==="loaded"||i.readyState==="complete")i.onreadystatechange=null}:i.onload=function(){try{e()}catch(t){}}})(function(){});
                    });
                }catch(e){}
            }());
            // Embed Script v1.02
            (function(g) {
                var gateway = document.createElement('script');
                gateway.type = 'text/javascript';
                gateway.async = true;
                gateway.src = '//gateway.answerscloud.com/dhgate/production/gateway.min.js';
                gateway.setAttribute('data-vendor','acs');
                gateway.setAttribute('data-role','gateway');
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(gateway, s);
                g['acsReady'] = function () {var aT = '__acsReady__', args = Array.prototype.slice.call(arguments, 0),k = setInterval(function () {if (typeof g[aT] === 'function') {clearInterval(k);for (i = 0; i < args.length; i++) {g[aT].call(g, function(fn) { return function() { setTimeout(fn, 1) };}(args[i]));}}}, 50);};
            })(window);
            //ga
            (function(){
                try {
                    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
                    ga('create', 'UA-425001-12', 'auto');
                    ga('send', 'pageview', location.pathname + location.search + escape(location.hash));

                } catch(e) {
                    console.log('GA：analytics.js: ' + e.message);
                }
                //根节点
                var $el = $('body');
                //点击filter
                $el.on('click', '.j-filterBtn', function(){
                    ga&&ga('send', 'event', 'MHP', 'sortrefine', 'click');
                });
                //点击sort
                $el.on('click', '.j-sortByBtn', function(){
                    ga&&ga('send', 'event', 'MHP', 'sortrefine', 'sort');
                });
                //点击category
                $el.on('click', '.j-filter-categories', function(){
                    ga&&ga('send', 'event', 'MHP', 'sortrefine', 'category');
                });
                //点击price
                $el.on('click', '.j-rangeBtn', function(){
                    ga&&ga('send', 'event', 'MHP', 'sortrefine', 'price');
                });
                //点击back
                $el.on('click', '.back', function(){
                    ga&&ga('send', 'event', 'MHP', 'sortrefine', 'back');
                });
                //点击minorder
                $el.on('click', '.j-minOrderBtn', function(){
                    ga&&ga('send', 'event', 'MHP', 'sortrefine', 'minorder');
                });
            }());
        }
        
    });
});