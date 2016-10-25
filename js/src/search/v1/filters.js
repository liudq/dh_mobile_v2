/**
 * module src: search/v1/filter.js
 * search页面的filter模块
 * 功能如下：
 * filter弹层操作
 * 筛选移动专享的产品
 * list和Gallary模式的切换
 * 价格区间和minOrder弹层
 * filter弹层Free Shipping、Mobile Exclusive Deals、vip、Single-piece各种开关事件
 * 重置所选选项
**/
define('app/filters', ['common/config', 'lib/backbone', 'appTpl/filtersTpl', 'tools/fastclick', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog','app/getGlobalVariables'], function(CONFIG, Backbone, tpl, FastClick,tip,dataErrorLog,GetGlobalVariables){
    //model-filter初始化
    var FiltersModel = Backbone.Model.extend({
        //search列表属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //一级类目
                categoryList:[{
                    //类目Id
                    catalogid:'',
                    //类目名字
                    catalogname: '',
                    //类目搜索结果数
                    count: '',
                    //二级类目
                    subCatelog:[{
                        catalogid:'',
                        catalogname: '',
                        count: '',
                        //三级类目
                        subCatelog:[{
                            catalogid:'',
                            catalogname: '',
                            count: '',
                            //四级类目
                            subCatelog:[{
                                catalogid:'',
                                catalogname: '',
                                count: ''
                            }]
                        }]
                    }]
                }],
                attrResult:{
                    //选中的类目id
                    catalogid:'',
                    //选中的类目名字
                    catalogname:'',
                    //选中类目下的属性名称
                    resultList:[{
                        //属性名字
                        name:'',
                        //属性id
                        atcode:'',
                        //是否有图片
                        hasImage:'',
                        //搜索结果集
                        count:'',
                        //是否选中
                        isChecked:'',
                        //选中的属性规格名字
                        checkedName:'',
                        //选中的属性规格id
                        checkedCode:''
                    }],
                    resultSubAttr:{
                        //attrValId是属性id
                        'attrValId':[{
                            //属性规格名
                            name: '',
                            //属性规格图片
                            image: '',
                            //属性规格搜索结果集
                            count: '',
                            //属性规格是否被选中
                            checked: '',
                            //属性规格id
                            atcode: ''
                        }]
                    }
                }
            };
        },
        /**
         * 初始化入口
         * argument[0|1]:
         * 0: [attributes]
         * 1: [options]
        **/
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                ajaxOptions: {
                    //url: 'http://css.dhresource.com/mobile_v2/css/search/html/attr2.do',
                    url: '/mobileApiWeb/wap-PageSearchV2-ajaxData.do',
                    data: {
                        version: 1.0,
                        language:CONFIG.countryCur,
                        client: 'wap'
                    },
                    type: 'GET',
                    dataType: 'json',
                    async: true,
                    cache: false,
                    //发送到服务器的数据，将自动转换为请求字符串格式
                    //例如：{foo:["bar1", "bar2"]} 转换为 "&foo=bar1&foo=bar2"
                    //在此处显示告诉$.ajax()需要对象序列化，这样就不需要设置
                    //Backbone.emulateJSON = true
                    processData: true
                }
            };
            $.extend(true, this.options, options||{});
        },
        //设置生成模型的url
        urlRoot: function() {
            return CONFIG.wwwURL + this.ajaxOptions.url;
            //return this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            //请求异常的时候“dataErrorLog”会捕获“__params”
            this.__params = $.extend(true, {}, this.ajaxOptions, options||{});
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            //console.log(res)
            var obj = {},self = this;
            
            obj.code = res.state==='0x0000'?200:-1;
            obj.categoryList = [],
            obj.attrResult = {},
            obj.attrResult.resultList = [],
            obj.attrResult.resultSubAttr = {};

            if (obj.code !== -1) {
                //类目列表直接赋值
                obj.categoryList = res.data.categoryList||'';
                
                //选中类目的属性名赋值
                if(res.data.attrResult&&res.data.attrResult.resultList){
                    //选中类目id和name
                    obj.attrResult.catalogid = res.data.attrResult.catalogid||'';
                    obj.attrResult.catalogname = res.data.attrResult.catalogname||'';
                    $.each(res.data.attrResult.resultList, function(index, pro){
                        var __obj = {};

                        __obj.name = pro.name;
                        __obj.atcode = pro.atcode;
                        __obj.hasImage = pro.hasImage;
                        __obj.count = pro.count;
                        __obj.isChecked = pro.isChecked;
                        __obj.checkedName = pro.checkedName;
                        __obj.checkedCode = pro.checkedCode;

                        obj.attrResult.resultList.push(__obj);
                    }); 
                }
                
                //每个属性的对应规格
                if(res.data.attrResult&&res.data.attrResult.resultSubAttr){
                    $.each(res.data.attrResult.resultSubAttr, function(name, pro){
                        obj.attrResult.resultSubAttr[name] = res.data.attrResult.resultSubAttr[name];
                    });
                }
                
            }
            
            /**文档地址：http://192.168.76.42:8090/pages/viewpage.action?pageId=2326552
             * 最终将其格式化为：
             {
                //状态码
                code: 200,
                //一级类目
                categoryList:[{
                    //类目Id
                    catelogid:'',
                    //类目名字
                    catelogname: '',
                    //类目搜索结果数
                    count: '',
                    //二级类目
                    subCatelog:[{
                        catelogid:'',
                        catelogname: '',
                        count: '',
                        //三级类目
                        subCatelog:[{
                            catelogid:'',
                            catelogname: '',
                            count: '',
                            //四级类目
                            subCatelog:[{
                                catelogid:'',
                                catelogname: '',
                                count: ''
                            }]
                        }]
                    }]
                }],
                attrResult:{
                    //选中的类目id
                    catalogid:'',
                    //选中的类目名字
                    catelogname:'',
                    //选中类目下的属性名称
                    resultList:[{
                        //属性名字
                        name:'',
                        //属性id
                        atcode:'',
                        //是否有图片
                        hasImage:'',
                        //搜索结果集
                        count:'',
                        //是否选中
                        isChecked:'',
                        //选中的属性规格名字
                        checkedName:'',
                        //选中的属性规格id
                        checkedCode:''
                    }],
                    resultSubAttr:{
                        //attrValId是属性id
                        'attrValId':[{
                            //属性规格名
                            name: '',
                            //属性规格图片
                            image: '',
                            //属性规格搜索结果集
                            count: '',
                            //属性规格是否被选中
                            isChecked: '',
                            //属性规格id
                            atcode: ''
                        }]
                    }
                }
            };
            **/
           //console.log(obj)
            return obj;
        }
    });

    //view-filter功能
    var FiltersView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            //打开filter弹层
            'click .j-filterBtn': 'openFilter',
            //取消filter弹层
            'click .j-filterCancel': 'hideFilter',
            //页面上筛选移动专享的按钮，data-value=1是筛选移动专享产品，否则不是
            'click .j-mobile-exclusive': 'mobileExclusive',
            //list和Gallary模式的切换
            'click .j-toggle-style': 'listToGallary',
            //打开价格区间和minOrder弹层
            'click .j-rangeBtn': 'openRangePrice',
            'click .j-minOrderBtn': 'openRangePrice',
            //关闭价格区间和minOrder弹层
            'click .j-priceCancel': 'hideRangePrice',
            //价格区间的输入框校验
            'keyup .j-rangePriceLayyer .j-pricetxt': 'checkRule',
            //校验minorder输入框
            'keyup .j-minOrderPrice': 'checkMinOrderRule',
            //点击价格提交按钮
            'click .j-rangePriceBtn': 'submitPrce',
            //点击min order提交
            'click .j-minOrderSubmit': 'submitMinOrder',
            //开关事件
            'click .j-switchBtn': 'switchState',
            //Related searches显示的展开折叠
            'click .j-moreLink': 'moreLink',
            //重置所选选项
            'click .j-resetBtn': 'reset'

        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cHtml = this.options.cHtml;
            this.cHide = this.options.cHide;
            this.cAnimateHide = this.options.cAnimateHide;
            this.cAnimateShow = this.options.cAnimateShow;
            this.cFilterLayercon = this.options.cFilterLayercon;
            this.cFilterListScroll = this.options.cFilterListScroll;
            this.cOpenDeals = this.options.cOpenDeals;
            this.cProductList = this.options.cProductList;
            this.cChangeStyle = this.options.cChangeStyle;
            this.model = this.options.model;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.FastClick = this.options.FastClick;
            this.timer = null;
            this.cRangePriceLayyer = this.options.cRangePriceLayyer;
            this.cPriceScroll = this.options.cPriceScroll;
            this.dRangePriceBtn = this.options.dRangePriceBtn;
            this.nMinPrice = this.options.nMinPrice;
            this.nMaxPrice = this.options.nMaxPrice;
            this.nMinOrderPrice = this.options.nMinOrderPrice;
            this.cNav = this.options.cNav;
            this.cfixedShadow = this.options.cfixedShadow;
            this.dataErrorLog = this.options.dataErrorLog;
            this.cLoading = this.options.cLoading;
            this.cToggeleList = this.options.cToggeleList;
            this.cErrorTips = this.options.cErrorTips;
            //获取全局变量数据
            if(GetGlobalVariables.get()!==''){
                this.getGlobalData = GetGlobalVariables.get().data;
            }
            //成功回调给cateFilter模块使用数据
            this.successAfter = this.options.successAfter;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //html样式
                cHtml: '.list-htmlOverflow',
                //filters内容外部包裹容器
                cFilterLayercon: '.j-filterLayercon',
                //控制菜单隐藏的样式
                cHide: 'dhm-hide',
                //控制菜单滑动隐藏展示的样式
                cAnimateHide: 'layer-close',
                //控制菜单滑动显示展示的样式
                cAnimateShow: 'layer-open',
                //导航栏
                cNav:'.j-nav',
                //产品外层包裹容器
                cProductList: '#J_list',
                //filter弹层的筛选列表滚动容器
                cFilterListScroll: '.j-filter-listScroll',
                //切换list和gallery按钮元素
                cToggeleList: '.j-toggle-style',
                //开关的打开状态样式
                cOpenDeals: 'openDeals',
                //产品包裹容器有dh-list代表是list展示，没有是gallery展示
                cChangeStyle: 'dh-list',
                //价格区间弹层
                cRangePriceLayyer: '.j-rangePriceLayyer',
                //价格滚动层
                cPriceScroll: '.j-priceScroll',
                //价格区间按钮
                dRangePriceBtn: '.j-rangePriceBtn',
                //价格区间最小价格
                nMinPrice: '.j-minPrice',
                //价格区间最大价格
                nMaxPrice: '.j-maxPrice',
                //错误提示
                cErrorTips: '.j-error-tips',
                //min order价格
                nMinOrderPrice: '.j-minOrderPrice',
                //遮盖其他定位为fixed的元素层
                cfixedShadow: '.j-fixedShadow',
                //loading层
                cLoading: '.j-loading',
                //数据模型
                model: new FiltersModel(),
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //阻止点透的函数
                FastClick: FastClick,
                //对外暴露的api在请求成功返回调用
                successAfter: $.noop,
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(this.options,options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$body = this.body||$('body');
            this.$window = this.$window||$(window);
            this.$cFilterLayercon = $(this.cFilterLayercon);
            this.$cFilterListScroll = $(this.cFilterListScroll);
            this.$cRangePriceLayyer = $(this.cRangePriceLayyer);
            this.$cPriceScroll = $(this.cPriceScroll);
            this.$dRangePriceBtn = $(this.dRangePriceBtn);
            this.$nMinPrice = $(this.nMinPrice);
            this.$nMaxPrice = $(this.nMaxPrice);
            this.$nMinOrderPrice = $(this.nMinOrderPrice);
            this.$cProductList = $(this.cProductList);
            this.$cNav = $(this.cNav);
            this.$cfixedShadow = $(this.cfixedShadow);
            this.$cLoading = $(this.cLoading);
            this.$cToggeleList = $(this.cToggeleList);
            this.$cErrorTips = $(this.cErrorTips);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);   
            //获取提交数据集合
            if(GetGlobalVariables.get()!==''){
                this.getSpData();
            }
            //设置滚动条初始化比较值的大小为悬浮层到浏览器顶部的高度
            this.historyScrollHeight = 106;
            //控制导航栏的悬浮
            this.$window.on('scroll', $.proxy(this.navShow, this));
            //初始化获取filter的类目以及类目属性数据
            this.model.fetch({data:this.dataset});
            //屏幕旋转事件
            //链接入口列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setSrollHeight(self.$cFilterListScroll);
                    self.setSrollHeight(self.$cPriceScroll);
                }, 500);
            });
            
        },
        //导航悬浮
        navShow:function(){
           var scrollTop = this.$window.scrollTop();
           if(scrollTop > 106){
                
                //向上显示悬浮层，向下隐藏悬浮层
                if(scrollTop>this.historyScrollHeight){
                    
                    this.$cProductList.css({paddingTop:"0"}); 
                    this.$cNav.removeClass('navActive');
                    this.$cNav.removeClass('animated fadeInUp').addClass('fadeOutDown');
                }else{
                    this.$cProductList.css({paddingTop:"43px"});
                    this.$cNav.addClass('navActive');
                    this.$cNav.removeClass('animated fadeOutDown').addClass('animated fadeInUp'); 
                }
                this.historyScrollHeight = scrollTop;
                
            }else{
                this.$cProductList.css({paddingTop:"0"}); 
                this.$cNav.removeClass('navActive'); 
            }
        },
        //获取提交数据集合
        getSpData:function(){
            this.dataset = this.getGlobalData.sp;
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            //关闭loading
            this.$cLoading.addClass(this.cHide);
            //绘制页面
            this.getAjaxData = model.attributes;
            //成功之后给回调函数传值
            this.successAfter(model.attributes);
            //捕获异常
            if (model.get('code') === -1) {
                //如果不是0x0000返回的数据的话，首次加载赋值一下this.otherCode，方便点击filter的时候再次取数据
                //并且如果是点击filter异常时候需要去掉loading并且报异常提示
                if(this.otherCode==="1"){
                   //关闭loading
                    this.$cLoading.addClass(this.cHide);
                    //展示数据接口错误信息【点击ok，关闭提示】
                    tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message}); 
                }
                
                //捕获异常
                try{
                    throw('success(): data is wrong');
                }catch(e){
                    //异常数据收集
                    this.dataErrorLog.events.trigger('save:dataErrorLog', {
                        message: e,
                        url: this.model.__params.url,
                        params: this.model.__params.data,
                        result: response
                    });
                }
                this.otherCode ="1";
            }
        },
        //拉取数据失败回调
        error: function(model, response, options) {
           //如果是点击filter异常时候需要去掉loading并且报异常提示
            if(this.errorData==="1"){
                 //关闭loading
                this.$cLoading.addClass(this.cHide);
                //展示数据接口错误信息【点击ok，关闭页面】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
            }
           
            //捕获异常
            try{
                throw('error(): request is wrong');
            }catch(e){
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
            //第一次网络异常的时候记录一下，方便点击filter的时候再次取数据
            this.errorData="1";
        },
        //切换list和gallary展示
        listToGallary:function(evt){
            //vt：1是列表展示否则是gallery展示
            this.$cToggeleList.hasClass("active")? this.dataset.vt = '0' : this.dataset.vt = '1';
            this.submitData();
        },
        //移动专享产品的筛选
        mobileExclusive:function(evt){
            var target = $(evt.currentTarget);
            if(target.hasClass(this.cOpenDeals)){
                target.removeClass(this.cOpenDeals);
                this.dataset.mobileonlydeal = '0';
            }else{
                target.addClass(this.cOpenDeals);
                this.dataset.mobileonlydeal = '1';
            }
            this.dataset.pageNum="1";
            this.dataset.filter = "1";
            this.submitData();
        },
        //设置弹层的高度
        setSrollHeight: function($ele) {
            var $siblings,
                windowHeight = this.$window.height()*1,
                sumHeight = 0;
            
            //不存在则跳出
            if (!$ele[0]) {
                return;
            }
            //同辈元素集合
            $siblings = $ele.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });
            
            $ele.css({height: windowHeight - sumHeight});
        },
        //打开filter弹层
        openFilter: function() {
            //如果初始化获取类目数据的接口报异常，需要点击的时候再次取一下数据
            if(this.errorData==="1"||this.otherCode==="1"){
                //打开loading
                this.$cLoading.removeClass(this.cHide);
                this.model.fetch({data:this.dataset});
                this.errorData = "0";
                this.otherCode = "0";
            }
            if(!this.getAjaxData){return;}
            //记录一下当前导航的位置，便于back的时候回到这个位置
            this.scrollTop = this.$window.scrollTop();
            //解决弹层打开回到顶部的bug
            this.$html.css({'position':'fixed',"height":"100%","overflow":"hidden"});
            this.$body.css({'position':'fixed',"height":"100%","width":"100%","top":-this.scrollTop});
            if(!this.hasload){
               this.render(this.getAjaxData); 
            }else{
                //设置filter弹层的默认高度
                this.setSrollHeight(this.$cFilterListScroll);
                //展示弹层
                this.show(this.$cFilterLayercon);
            }
            
        },
        //取消filter弹层
        hideFilter: function(){
            //回到打开弹层的位置
            this.$html.css({'position':'',"height":"","overflow":""});
            this.$body.css({'position':'',"height":"","width":"","top":""});
            window.scroll(0,this.scrollTop);
            //隐藏弹层
            this.hide(this.$cFilterLayercon);
        },
        //校验当前输入框的数字是否符合规则
        checkRule:function(evt){
            var target = $(evt.currentTarget),
                targetVal = $.trim(target.val()),
                numbers = parseFloat(targetVal);
            if (!numbers || numbers < 0) {
                if(numbers==0)return;
                target.val('')
            }
        },
        //校验minorder的输入框是否是数字且不是0开头的
        checkMinOrderRule:function(evt){
            var target = $(evt.currentTarget);
            target.val(target.val().replace(/\D|^0/g,''));
        },
        //提交当前输入的价格
        submitPrce: function(){
            var minVal = $.trim(this.$nMinPrice.val()),
                maxVal = $.trim(this.$nMaxPrice.val());
            //判断最小价格是否大于最大价格，大于提示错误，重写填写
            if(parseFloat(minVal)>parseFloat(maxVal)){
                this.$cErrorTips.show();
                return;
            }
            this.dataset.minPrice = minVal;
            this.dataset.maxPrice = maxVal;
            this.dataset.ftype="price";
            this.dataset.pageNum="1";
            this.dataset.filter = "1";
            this.submitData();
        },
        //提交minorder数字
        submitMinOrder:function(){
            var minOrderVal = $.trim(this.$nMinOrderPrice.val());
            if(parseFloat(this.dataset.singleonly)===1){
                this.dataset.singleonly="";
            }
            this.dataset.minOrder = minOrderVal;
            this.dataset.pageNum="1";
            this.dataset.filter = "1";
            this.submitData();
        },
        //切换按钮的状态并提交状态
        switchState:function(evt){
            var target = $(evt.currentTarget),
                switchStyle = target.find('span');
               
            if(switchStyle.hasClass(this.cOpenDeals)){
                switchStyle.removeClass(this.cOpenDeals)
                switchStyle.attr('swtichVal','0');
            }else{
                switchStyle.addClass(this.cOpenDeals);
                switchStyle.attr('swtichVal','1');
            }
            //Free Shipping
            if(target.attr('data-style')==='fs'){
                this.dataset.fs=switchStyle.attr('swtichVal');
            //mobileonlydeal
            }else if(target.attr('data-style')==='mobileonlydeal'){
                this.dataset.mobileonlydeal=switchStyle.attr('swtichVal');
            //vip
            }else if(target.attr('data-style')==='vip'){
                this.dataset.vip=switchStyle.attr('swtichVal');
            //singleonly
            }else if(target.attr('data-style')==='singleonly'){
                this.dataset.singleonly=switchStyle.attr('swtichVal');
            }
            this.dataset.pageNum="1";
            this.dataset.filter = "1";
            this.submitData();
        },
        //提交选中选项
        submitData:function(){
            
            this.dataset.spinfo="";
            //清空suggest处的跟踪码
            this.dataset.scht="";
            window.location.href = '/search.do?' + $.param(this.dataset);
        },
        //重置选中选项
        reset:function(){
            this.dataset.filter = "";

            //key不为空代表是从关键词进来
            if(!this.dataset.key){
                this.dataset={"cid":this.dataset.cid};  
            }else{
                this.dataset={"key":this.dataset.key};
            }
            this.dataset.spinfo="";
            //清空suggest处的跟踪码
            this.dataset.scht="";
            window.location.href = '/search.do?' + $.param(this.dataset);
        },
        //绘制价格区间和minorder的弹层内容
        openRangePrice:function(evt){
            var target = $(evt.currentTarget),
                style = target.attr('data-style'),
                tpl = this.tpl;
            //'1'是价格区间 '0'是minorder
            if(style==='1'){
                var minPrice = target.find('.currentWord').attr('data-minprice')||'',
                    maxPrice = target.find('.currentWord').attr('data-maxprice')||'',
                    arrData = [minPrice,maxPrice],
                    priceRangeTpl = this.template(tpl.priceRange.join(''))(arrData);

                this.$cRangePriceLayyer.html(priceRangeTpl);
            }else{
                var minOrder = target.find('.currentWord').attr('data-minorder')||'',
                    minOrderTpl = this.template(tpl.minOrder.join(''))(minOrder);
                this.$cRangePriceLayyer.html(minOrderTpl);
            }
            //初始化$dom对象
            this.initElement();
            this.setSrollHeight(this.$cPriceScroll);
            this.show(this.$cRangePriceLayyer);
        },
        //隐藏价格区间弹层
        hideRangePrice:function(){
            this.hide(this.$cRangePriceLayyer);
        },
        //绘制filter内容和Categories类目
        render: function(data){
            var tpl = this.tpl;
                data.sp = this.dataset,
                data.catename = this.getGlobalData&&(this.getGlobalData.catename||''),
                //获取best match排序的名字
                data.sinfoName = this.getGlobalData&&(this.getGlobalData.sinfoName||''),
                //获取所有类目的数量
                data.countNum = this.getGlobalData&&(this.getGlobalData.totalCounts||''),
                //判断是vip的话才显示vip
                isVipBuyer = this.getGlobalData&&this.getGlobalData.isvipbuyer,
                filterTpl = '';

            //判断是vip的话才显示vip
            isVipBuyer==='1'?data.isVip = '1':data.isVip = '0';
            //获取filter弹层数据
            filterTpl = this.template(tpl.filterLayer.join(''))(data);
            //绘制页面
            this.$cFilterLayercon.html(filterTpl);
            //绘制一次页面
            this.hasload = true;
            //初始化$dom对象
            this.initElement();
            //设置filter弹层的默认高度
            this.setSrollHeight(this.$cFilterListScroll);
            //展示弹层
            this.show(this.$cFilterLayercon);
        },
        //Related searches显示的展开折叠
        moreLink: function(evt){
            var target = $(evt.currentTarget),
                hideDiv = target.siblings('.j-moreRelated');
                
            if(hideDiv.hasClass(this.cHide)){
                hideDiv.removeClass(this.cHide);
                target.html("- Fewer");
            }else{
                hideDiv.addClass(this.cHide);
                target.html("+ More");
            }
        },
        //显示弹层
        show: function($ele) {
            var cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow,
                self = this;
            
            //先设置display
            $ele.removeClass(cHide);

            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $ele.removeClass(cAnimateHide).addClass(cAnimateShow);
            },30);
        },
        //隐藏弹层
        hide: function($ele) {
            var cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;

           //bug:从右侧向左侧滚动的时候弹层会出现滚动条，这是由于弹层默认放到右侧占据物理位置，先打开弹层再执行动画，因此就会出现滚动条.
            //$ele.css({"position":"fixed"});
            //先滑动隐藏展示
            $ele.removeClass(cAnimateShow).addClass(cAnimateHide);
           
            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                $ele.addClass(cHide);
            }, 510);
            
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        }
    });
    
    return FiltersView;
});
