/**
 * module src: search/v1/cateFilter.js
 * search页面的cateFilter模块
 * 打开Categories弹层
 * 打开属性的规格层
 * show more展示更多
**/
define('app/cateFilter', ['common/config', 'lib/backbone', 'appTpl/filtersTpl', 'tools/fastclick','app/getGlobalVariables'], function(CONFIG, Backbone, tpl, FastClick,GetGlobalVariables){
    //model-cateFilter初始化
    var CateFilterModel = Backbone.Model.extend({
        //菜单默认属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1
            };
        }
    });
    //view-cateFilter功能
    var CateFilterView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            //打开Categories弹层
            'click .j-filter-categories': 'openCate',
            //取消Categories弹层
            'click .j-cateCancel': 'hideCate',
            //获取当前选中的类目
            'click .j-cate-list': 'getCurrentValue',
            //打开属性的规格层
            'click .j-attr-btn': 'openAttr',
            //关闭属性的规格层
            'click .j-attrCancel': 'hideAttr',
            //获取当前属性下的规格
            'click .j-attr-scroll li': 'getCurrAttr',
            //展示更多
            'click .j-showMore': 'showMore'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cHtml = this.options.cHtml;
            this.cHide = this.options.cHide;
            this.cAnimateHide = this.options.cAnimateHide;
            this.cAnimateShow = this.options.cAnimateShow;
            this.cCurrentCate = this.options.cCurrentCate;
            this.cCategoriesLayer = this.options.cCategoriesLayer;
            this.cCateListScroll = this.options.cCateListScroll;
            this.cFilterNameLayer = this.options.cFilterNameLayer;
            this.cAttrScroll = this.options.cAttrScroll;
            this.bActive = this.options.bActive;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.FastClick = this.options.FastClick;
            this.cAttrCancel = this.options.cAttrCancel;
            this.cAttrHide = this.options.cAttrHide;
            this.cOtherAttrs = this.options.cOtherAttrs;
            this.cCateList = this.options.cCateList;
            this.cFilterLayercon = this.options.cFilterLayercon;
            this.timer = null;
            //获取全局变量数据
            if(GetGlobalVariables.get()!==''){
                this.getGlobalData = GetGlobalVariables.get().data;
            }
            //获取初始化异步接口数据
            this.modelData = this.options.modelData;
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
                //控制菜单隐藏的样式
                cHide: 'dhm-hide',
                //控制菜单滑动隐藏展示的样式
                cAnimateHide: 'layer-close',
                //控制菜单滑动显示展示的样式
                cAnimateShow: 'layer-open',
                //filters内容外部包裹容器
                cFilterLayercon: '.j-filterLayercon',
                //类目列表
                cCateList: '.j-cate-list',
                //属性规格弹层
                cFilterNameLayer: '.j-filterNameLayer',
                //属性规格弹层滚动区域
                cAttrScroll: '.j-attr-scroll',
                //属性规格弹层关闭按钮
                cAttrCancel: '.j-attrCancel',
                //大于5个需要隐藏的元素
                cOtherAttrs: '.j-otherAttrs',
                //Categories选中类目元素容器
                cCurrentCate: '.j-currentCate',
                //Categories类目包裹容器
                cCategoriesLayer: '.j-categories-layer',
                //当前选中样式
                bActive: 'active',
                //Categories弹层的筛选列表滚动容器
                cCateListScroll: '.j-catelist-scroll',
                //隐藏属性名
                cAttrHide: 'attrHide',
                //数据模型
                model: new CateFilterModel(),
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //阻止点透的函数
                FastClick: FastClick,
                //数据集合
                modelData:''
            };
            $.extend(this.options,options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$body = this.body||$('body');
            this.$window = this.$window||$(window);
            this.$cCurrentCate = $(this.cCurrentCate);
            this.$cCategoriesLayer = $(this.cCategoriesLayer);
            this.$cCateListScroll = $(this.cCateListScroll);
            this.$cFilterNameLayer = $(this.options.cFilterNameLayer);
            this.$cAttrScroll = $(this.options.cAttrScroll);
            this.$cOtherAttrs = $(this.options.cOtherAttrs);
            this.$cCateList = $(this.options.cCateList);
            this.$cFilterLayercon = $(this.cFilterLayercon);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;
            //获取提交数据集合
            if(GetGlobalVariables.get()!==''){
                this.getSpData();
            }
            //屏幕旋转事件
            //链接入口列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setSrollHeight(self.$cCateListScroll);
                    self.setSrollHeight(self.$cAttrScroll);
                }, 500);
            });
            
        },
        //获取提交数据集合
        getSpData:function(){
            this.dataset = this.getGlobalData.sp;
        },
        //控制显示隐藏
        showMore:function(evt){
            var target = $(evt.currentTarget);
            if(target.find('var').hasClass('lessIcon')){
                target.siblings(this.cOtherAttrs).addClass(this.cAttrHide);
                target.find('span').html('Show More');
                target.find('var').removeClass('lessIcon');
            }else{
                target.siblings(this.cOtherAttrs).removeClass(this.cAttrHide);
                target.find('span').html('Show Less');
                target.find('var').addClass('lessIcon');
            }
        },
        //打开Categories类目列表
        openCate: function(evt){
            var target = $(evt.currentTarget);
            if(!this.hasLoadData){
                this.render(target);
            }else{
                this.setSrollHeight(this.$cCateListScroll);
                this.show(this.$cCategoriesLayer);
            }
            
        },
        //取消Categories类目
        hideCate: function(){
            this.hide(this.$cCategoriesLayer);
        },
        //获取当前的类目值
        getCurrentValue: function(evt){
            var target = $(evt.currentTarget),
                targetCid = target.attr('data-cid');
            if(target.hasClass(this.bActive)){
                this.hide(this.$cCategoriesLayer);
                this.hideFilter();
                return;
            }
            this.$cCateListScroll.find('.j-cate-list').removeClass(this.bActive);
           
            //if(target.hasClass(this.bActive)){
               // target.removeClass(this.bActive);
               // targetCid = '';
            //}else{
                //this.$cCateList.removeClass(this.bActive);
                target.addClass(this.bActive);
           // }
            
            this.dataset.at='';
            this.dataset.cid = targetCid; 
            this.submitData(this.dataset);  
        },
         //打开属性弹层
        openAttr:function(evt){
            var target = $(evt.currentTarget);
            this.renderAttrHtml(target);
        },
        //关闭属性弹层
        hideAttr:function(){
            this.hide(this.$cFilterNameLayer);
        },
        //获取数组的某一项的索引
        getIndex:function(arr,val){
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) return i;
            }
            return -1;
        },
        //删除数组的某一项
        removeEle:function(arr,val){
            var index = this.getIndex(arr,val);
            if (index > -1) {
                arr.splice(index, 1);
            }
        },
        //获取当前的属性下的某一规格
        getCurrAttr: function(evt){
            var target = $(evt.currentTarget),
                targetCid = target.attr('data-atcode'),
                hasClickAttr = target.siblings('.active').attr('data-atcode'),
                atAll = this.dataset.at||'',
                arr = [];
                if(atAll!==''){
                    arr = atAll.split('-')
                }
            if(hasClickAttr!==''){this.removeEle(arr,hasClickAttr);}
            target.siblings().removeClass(this.bActive);
            if(target.hasClass(this.bActive)){
                target.removeClass(this.bActive);
                this.removeEle(arr,targetCid);
                this.dataset.at = arr.join('-');
            }else{
                target.addClass(this.bActive);
                if(atAll===''){
                    this.dataset.at=targetCid
                }else{
                    arr.push(targetCid);
                    this.dataset.at = arr.join('-');
                }
                
            }
            
            this.submitData(this.dataset); 
        },
        //提交选中属性
        submitData:function(data){
            data.spinfo = "";
            data.filter = "1";
            this.dataset.pageNum="1";
            //清空suggest处的跟踪码
            this.dataset.scht="";
            window.location.href = '/search.do?' + $.param(data);
        },
        //Categories类目绘制
        render: function(target){
            var tpl = this.tpl,
                currentCatelogid = target.find('.currentWord').attr('data-catalogid'),
                obj = {},
                allcateTpl = '';
            
            //赋值当前选择类目id
            obj.currentId = currentCatelogid;
            //赋值类目列表数据
            obj.cateList = this.modelData.categoryList;
            //赋值all的搜索结果集数量
            obj.countNum = this.modelData.countNum;
            //赋值需要提交的数据
            obj.sp = this.dataset;
            obj.catename = this.getGlobalData&&(this.getGlobalData.catename||''),
            //获取category类目数据
            allcateTpl = this.template(tpl.cateFilter.join(''))(obj);
            //绘制类目列表html
            this.$cCategoriesLayer.html(allcateTpl);
            //设置初始化选中类目
            this.$cCategoriesLayer.find('div'+'[data-'+currentCatelogid+']').addClass(this.bActive);
            //第一次打开弹层需要绘制标示
            this.hasLoadData = true;
            //初始化$dom对象
            this.initElement();
            //设置类目滚动区域高度
            this.setSrollHeight(this.$cCateListScroll);
            //显示层
            this.show(this.$cCategoriesLayer);
        },
       //绘制选中类目的属性规格弹层
        renderAttrHtml: function(target){
            var checkedId = target.attr('data-at'),
                hasImg = target.attr('data-hasImage'),
                attrName = target.attr('data-attrname'),
                //获取当前属性下的规格数据
                attrData = this.modelData.attrResult.resultSubAttr[checkedId],
                tpl = this.tpl,
                attrTpl = '',
                obj = {};
            //此属性下没有任何规格选项
            if(!attrData){return};
            obj.attrData = attrData;
            //属性名
            obj.attrName = attrName;
            //此属性是否是图片展示
            hasImg==='true'?obj.hasImg ="1":obj.hasImg ="0";
            //绘制数据
            attrTpl = this.template(tpl.attrLayer.join(''))(obj);
            //绘制模板
            this.$cFilterNameLayer.html(attrTpl);
            //初始化$dom对象
            this.initElement();
            //设置类目滚动区域高度
            this.setSrollHeight(this.$cAttrScroll);
            //显示层
            this.show(this.$cFilterNameLayer);
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
            //
            $siblings = $ele.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });
            
            $ele.css({height: windowHeight - sumHeight-10});
        },
        //显示弹层
        show: function($ele) {
            var cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;
            
            //先设置display
            $ele.removeClass(cHide);
            
            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $ele.removeClass(cAnimateHide).addClass(cAnimateShow);
            }, 10);
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
        },
        //取消filter弹层
        hideFilter: function(){
            //回到打开弹层的位置
            this.$html.css({'position':'',"height":"","overflow":""});
            this.$body.css({'position':'',"height":"","width":"","top":""});
            //隐藏弹层
            this.hide(this.$cFilterLayercon);
        }
    });
    
    return CateFilterView;
});
