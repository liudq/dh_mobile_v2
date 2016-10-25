/**
 * module src: home/main.js
 * 入口文件
**/
define('app/main', [
        'common/langLoader', 
        'common/appSpread', 
        'common/header/buyerUserInfo', 
        'common/header/topMenuInit', 
        'common/header/topMenuOneCategories', 
        'common/header/turnToLanguagesWebsite', 
        'common/header/topSearch', 
        'common/sharesns', 
        'common/tc',
        'app/dailyDeals', 
        'app/youMyLike',
        'app/swiper',
        'app/lazyload',
        'app/userAttention'
    ], function(
        langLoader, 
        appSpread, 
        BuyerUserInfo, 
        TopMenuInit, 
        TopMenuOneCategories, 
        turnToLanguagesWebsite, 
        TopSearch, 
        sharesns,
        tc,
        DailyDeals, 
        YouMyLike,
        Swiper,
        Lazyload,
        UserAttention
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
                    //ga('send', 'event', 'mhp1601', 'dload'); 
                    ga('send', 'event', 'mhp1601', 'download');
                }
                
            }
        });
        //BC类用户打标
        new UserAttention();
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
        
        //每日优惠商品
        new DailyDeals({
            animateCallback: function() {
                var $dailyscrollWrap = $('.js-scroll');
                var dailyaLiWidth = $dailyscrollWrap.find('li').size() * $dailyscrollWrap.find('li').outerWidth(true);
                $dailyscrollWrap.find('ul').css({
                    width : dailyaLiWidth + 'px'
                });
            }
        });

        //猜你喜欢的推荐产品
        new YouMyLike({
            lazyloadCallback:function(){
                $(".j-youMyLike .lazy").lazyload({
                    threshold: '420',
                    load:function(){
                        $(this).closest('.pro-img').addClass('hasload');
                    }
                });
            }
        });
       
        // 首页banner图片切换
        (function(){
        var swiper = new Swiper('.js-bannerSilde', {
             loop: true,
            autoplay:5000,
            autoplayDisableOnInteraction : false,
            pagination: '.swiper-pagination',
            paginationClickable: true,
            preloadImages: false,
            lazyLoading: true,
            updateOnImagesReady:true,
            onLazyImageReady:function(){
                 $('.js-bannerSilde').addClass('hasload');
            }
        });
            var timer = null;
            $(window).on('orientationchange', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    swiper.onResize();
                }, 500);
            });
        }());
        
        
        // New Arrivals
        if($('.js-newsArrival-scroll').length){
            //延时加载图片
            setTimeout(function(){
                var $scrollWrap = $('.js-newsArrival-scroll');
                var aLiWidth = $scrollWrap.find('li').size() * $scrollWrap.find('li').outerWidth(true);
                $scrollWrap.find('ul').css({
                    width : aLiWidth + 'px'
                });
                $(".js-newsArrival-scroll .lazy").lazyload({
                    load:function(){
                        $(".js-newsArrival-scroll img").each(function(){
                            $(this).parent().addClass('hasload');
                            var originalSrc =$(this).attr('data-original');
                            $(this).attr('src',originalSrc);
                        });
                    }
                });
            }, 2000);
        }
        
        // Best Selling Items
        if($('.js-bestSell-scroll').length){
            //延时加载图片
            setTimeout(function(){
                var $bestscrollWrap = $('.js-bestSell-scroll');
                var bestaLiWidth = $bestscrollWrap.find('li').size() * $bestscrollWrap.find('li').outerWidth(true);
                $bestscrollWrap.find('ul').css({
                    width : bestaLiWidth + 'px'
                });
                $(".js-bestSell-scroll .lazy").lazyload({
                    load:function(){
                        $(".js-bestSell-scroll img").each(function(){
                            $(this).parent().addClass('hasload');
                            var originalSrc =$(this).attr('data-original');
                            $(this).attr('src',originalSrc);
                        });
                    }
                });
            }, 2000);
        }

        //GA
        (function(global){
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

                global['ga']('create', 'UA-425001-12', 'auto');
                global['ga']('set', 'dimension2', '201601-1');
                global['ga']('send', 'pageview');
        }(window));

        //D1：dhta.js
        (function(){
            tc.init({
                loadScriptUrl: 'http://www.dhresource.com/dhs/fob/js/common/track/dhta.js',
                loadScriptSuccess: function() {
                    //D1代码主体部分
                    try{
                        _dhq.push(["setVar", "pt", "main"]);
                        _dhq.push(["event", "Public_S0003"]);
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

            global['fbq']('init', '601438189994555');
            global['fbq']('track', 'PageView'); 
        })(window);

        //Google Code for Smart Pixel List Remarketing List
        (function(){
            try{
                var cDiv = document.createElement('div'),
                    cImg = document.createElement('img'),
                    RMKTParams = {
                        ET: 'Home Page'
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
        //Sociomantic Star
        (function(global){
            try{
                (function(){     
                    var s   = document.createElement('script');
                    var x   = document.getElementsByTagName('script')[0];
                    s.type  = 'text/javascript'; s.async = true; 
                    s.src   = ('https:'==document.location.protocol?'https://':'http://') + 'us-sonar.sociomantic.com/js/2010-07-01/adpan/dhgate-us-m'; 
                    x.parentNode.insertBefore( s, x );
                })();
            }catch(e){}
        }(window));
        // foresee 
        (function (g) {
            var d = document, i, am = d.createElement('script'), h = d.head || d.getElementsByTagName("head")[0],
            aex = {
                "src": "//gateway.answerscloud.com/dhgate/production/gateway.min.js",
                "type": "text/javascript",
                "async": "true",
                "data-vendor": "acs",
                "data-role": "gateway"
            };
            for (var attr in aex) { am.setAttribute(attr,aex[attr]); }
            h.appendChild(am);
            g['acsReady'] = function () {var aT = '__acsReady__', args = Array.prototype.slice.call(arguments, 0),k = setInterval(function () {if (typeof g[aT] === 'function') {clearInterval(k);for (i = 0; i < args.length; i++) {g[aT].call(g, function(fn) { return function() { setTimeout(fn, 1) };}(args[i]));}}}, 50);};
        })(window);    
    });
});
