/**
 * module src: seach/v1/sortBy.js
 * sortby搜索模块
**/
define('app/sortBy', ['common/config', 'lib/backbone', 'appTpl/sortByTpl', 'tools/fastclick','app/getGlobalVariables'], function(CONFIG, Backbone, tpl, FastClick,GetGlobalVariables){
    //model-sortby搜索模块
    var SortByModel = Backbone.Model.extend({
        //sortby搜索属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: 200,
                //sortBy筛选
                list: [
                {
                    //数据类型
                    dataStype: 'up',
                    //当前索引
                    dataSort: 1,
                    //当前内容
                    title: 'Best Match'
                },
                {
                    dataStype: 'up',
                    dataSort: 2,
                    title: 'Price: Low to Hight'
                },
                {
                    dataStype: 'down',
                    dataSort: 2,
                    title: 'Price: High to Low'
                },
                {
                    dataStype: 'down',
                    dataSort: 3,
                    title: 'Bestselling'
                },
                // {
                //     dataStype: 'up',
                //     dataSort: 4,
                //     title: 'Recently Listed'
                // },
                // {
                //     dataStype: 'up',
                //     dataSort: 5,
                //     title: 'Positive Feedback'
                // },
                {
                    dataStype: 'down',
                    dataSort: 6,
                    title: 'Customer Reviews'
                }]
            };
        }
    });
    
    //view-sortby搜索模块
    var SortByView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            //打开sortBy弹层
            'click .j-sortByBtn':'openSortBy',
            //关闭sortBy弹层
            'click .j-sortBack': 'hideSortBy',
            //提交选中排序
            'click .j-sortLayyer li':'submitData'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.cHtml = this.options.cHtml;
            this.cHide = this.options.cHide;
            this.cAnimateHide = this.options.cAnimateHide;
            this.cAnimateShow = this.options.cAnimateShow;
            this.cSortByLayer = this.options.cSortByLayer;
            this.cSortByScroll = this.options.cSortByScroll;
            this.template = this.options.template;
            this.model = this.options.model;
            this.FastClick = this.options.FastClick;
            //获取全局变量数据
            if(GetGlobalVariables.get()!==''){
                this.getGlobalData = GetGlobalVariables.get().data;
            }
             //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();

        },
        //$dom对象初始化
        initElement: function() {
            this.$body = this.body||$('body');
            this.$html = this.$html||$('html');
            this.$window = this.$window||$(window);
            this.$cSortByLayer = $(this.options.cSortByLayer);
            this.$cSortByScroll = $(this.options.cSortByScroll);
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
                    self.setSrollHeight(self.$cSortByScroll);
                }, 500);
            });    
        },
         //获取数据集合
        getSpData: function(){
            this.dataset = this.getGlobalData.sp;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //html样式
                cHtml: '.list-htmlOverflow',
                //控制整个区域显示隐藏的className
                cHide: 'dhm-hide',
                //控制菜单滑动隐藏展示的样式
                cAnimateHide: 'layer-close',
                //控制菜单滑动显示展示的样式
                cAnimateShow: 'layer-open',
                //展示sortBy弹层元素
                cSortByLayer: '.j-sortLayyer',
                //展示sortBy弹层滚动区域
                cSortByScroll: '.j-sort-scroll',
                //模板
                template: _.template(tpl.join('')),
                //数据模型
                model: new SortByModel(),
                //阻止点透的函数
                FastClick: FastClick
            };
            $.extend(true, this.options, options||{});
        },
        //数据渲染
        render: function() {
            var dataSortIndex = this.dataset.sinfo||'1',
                dataStype = this.dataset.stype||'up';
            //页面绘制
            this.$cSortByLayer.html(this.template(this.model.attributes));
            //初始化$dom对象
            this.initElement();
            //设置初始化的选中状态
            this.$cSortByScroll.find('li'+'[data-'+dataStype+dataSortIndex+']').addClass('active');
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
            //$ul同辈元素集合
            $siblings = $ele.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });
            
            $ele.css({height: windowHeight - sumHeight-10});
        },
        //打开SortBy弹层
        openSortBy: function() {
            //第一次打开需要绘制弹层
            if(!this.hasLoadData){
                this.render();
            }
            //设置SortBy弹层的默认高度
            this.setSrollHeight(this.$cSortByScroll);
            this.show(this.$cSortByLayer);
        },
        //取消SortBy弹层
        hideSortBy: function(){
            this.hide(this.$cSortByLayer);
        },
        //提交当前选中的排序内容
        submitData: function(evt){
            var target = $(evt.currentTarget);
            if(target.hasClass('active')){return;}
           
            target.addClass('active').siblings().removeClass('active');
            this.dataset.sinfo = target.attr("data-sinfo");
            this.dataset.stype = target.attr("data-stype");
            this.dataset.spinfo = "";
            this.dataset.filter = "1";
            this.dataset.pageNum="1";
            //清空suggest处的跟踪码
            this.dataset.scht="";
            window.location.href = '/search.do?' + $.param(this.dataset); 
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
        }
    });
    
    return SortByView;
});

