/**
 * module src: detail/v1/proTab.js
 * 控制[短描|长描|评论]的展示
**/
define('app/proTab', ['common/config'], function(CONFIG){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cTabShowBtn = this.options.cTabShowBtn;
            this.cTabCloseBtn = this.options.cTabCloseBtn;
            this.cTabLayerWarp = this.options.cTabLayerWarp;
            this.cTabBtnList = this.options.cTabBtnList;
            this.cTabContentList = this.options.cTabContentList;
            this.cTabCurrent = this.options.cTabCurrent;
            this.cHtml = this.options.cHtml;
            this.cHide = this.options.cHide;
            this.cAnimateHide = this.options.cAnimateHide;
            this.cAnimateShow = this.options.cAnimateShow;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||$('html');
            this.$body = this.body||$('body');
            this.$window = this.$window||$(window);
            this.$cTabShowBtn = this.$cTabShowBtn||$(this.cTabShowBtn);
            this.$cTabCloseBtn = this.$cTabCloseBtn||$(this.cTabCloseBtn);
            this.$cTabLayerWarp = this.$cTabLayerWarp||$(this.cTabLayerWarp);
            this.$cTabBtnList = this.$cTabBtnList||$(this.cTabBtnList);
            this.$cTabContentList = this.$cTabContentList||$(this.cTabContentList);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;

            //展示弹出层
            this.$body.on('click', '.j-tabShowBtn', $.proxy(this.showLayer, this));
            //隐藏弹出层
            this.$body.on('click', '.j-tabCloseBtn', $.proxy(this.hideLayer, this));
            //TAB[短描|长描|评论]内容切换
            this.$body.on('click', '.j-tabBtnWarp li[data-type]', $.proxy(this.showTabContent, this));
            //屏幕旋转事件
            //运费列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange, resize', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setTabContentStyle();
                }, 500);
            });
        },
        setOptions: function(options) {
            this.options = {
                //根节点
                el: 'body',
                //TAB弹出层展示按钮
                cTabShowBtn: '.j-tabShowBtn',
                //TAB弹出层关闭按钮
                cTabCloseBtn: '.j-tabCloseBtn',
                //TAB弹出层外层包裹容器
                cTabLayerWarp: '.j-tabLayerWarp',
                //TAB包含的所有项类型列表
                cTabBtnList: '.j-tabBtnWarp li[data-type]',
                //TAB所有项对应的内容列表
                cTabContentList: '.j-tabContent',
                //TAB当前展示项选中状态的className
                cTabCurrent: 'current',
                //html样式
                cHtml: 'dhm-htmlOverflow',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //控制弹出层滑动隐藏展示的样式
                cAnimateHide: 'close-layer1',
                //控制弹出层滑动显示展示的样式
                cAnimateShow: 'open-layer1'
            };
            $.extend(true, this.options, options||{});
        },
        //设置页面样式
        setPageStyle: function(flag) {
            var $html = this.$html,
                $body = this.$body,
                cHtml = this.cHtml;

            //展示时
            if (flag === true) {
                //临时记录页面垂直滚动条的距离顶部的距离
                this.__scrollY = parseInt(this.$window.scrollTop());
                $html.addClass(cHtml);
                $body.css({'margin-top':-this.__scrollY});
            //隐藏时
            } else {
                $html.removeClass(cHtml);
                $body.attr({style:''});
                window.scroll(0, this.__scrollY);
            }
        },
        //设置TAB内容列表样式
        setTabContentStyle: function() {
            var cTabContentList = this.cTabContentList,
                $cTabContentList = this.$cTabContentList,
                windowHeight = this.$window.height()*1;

            $.each($cTabContentList, function(index, content){
                //TAB所对应的内容列表包裹容器
                var $content = $(content),
                    //自身节点padding[top|bottom]的总和
                    paddingHeight = ($content.outerHeight()-$content.height())*1,
                    //相邻节点总高度
                    sumHeight = 0;

                //计算$content相邻节点的高度
                $.each($content.siblings().not(cTabContentList), function(index, sibling){
                    sumHeight += $(sibling).outerHeight()*1;
                });
                //可视高度=窗口可视高度-相邻节点高度总和-自身节点paddingY轴上的高度总和
                $content.css({height: windowHeight - sumHeight - paddingHeight});
            });
        },
        //展示弹出层
        showLayer: function(evt) {
            var $cTabLayerWarp = this.$cTabLayerWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;

            //展示对应TAB内容
            this.showTabContent(evt);
            //设置弹出层展示时的页面样式
            this.setPageStyle(true);
            //先设置display
            $cTabLayerWarp.removeClass(cHide);
            //设置TAB内容列表样式
            this.setTabContentStyle();

            //延时一段时间，然后再滑动显示展示
            setTimeout(function(){
                $cTabLayerWarp.removeClass(cAnimateHide).addClass(cAnimateShow);
            }, 10);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //隐藏弹出层
        hideLayer: function() {
            var $cTabLayerWarp = this.$cTabLayerWarp,
                cHide = this.cHide,
                cAnimateHide = this.cAnimateHide,
                cAnimateShow = this.cAnimateShow;

            //设置弹出层隐藏时的页面样式
            this.setPageStyle(false);

            //先滑动隐藏展示
            $cTabLayerWarp.removeClass(cAnimateShow).addClass(cAnimateHide);

            //延时一段时间，然后再设置display
            //说明：
            //因为在样式中滑动设置的是500ms完成，
            //所以这里的延时时间设置为510ms
            setTimeout(function(){
                $cTabLayerWarp.addClass(cHide);
            }, 510);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //展示对应TAB的内容
        showTabContent: function(evt) {
            var $cTabBtnList = this.$cTabBtnList,
                $cTabContentList = this.$cTabContentList,
                type = $(evt.currentTarget).attr('data-type'),
                cTabCurrent = this.cTabCurrent,
                cHide = this.cHide,
                $currentEle;

            //重置TAB选择状态
            $cTabBtnList.removeClass(cTabCurrent);
            //给当前选择项添加选中状态
            for (var i = 0, len = $cTabBtnList.length; i < len; i++) {
                $currentEle = $($cTabBtnList[i]);
                if ($currentEle.attr('data-type') === type) {
                    $currentEle.addClass(cTabCurrent);
                    break;
                }
            }
            //重置TAB内容展示状态
            $cTabContentList.addClass(cHide);
            //展示对应当前选择项内容
            for (var i = 0, len = $cTabContentList.length; i < len; i++) {
                $currentEle = $($cTabContentList[i]);
                if ($currentEle.attr('data-type') === type) {
                    $currentEle.removeClass(cHide);
                    break;
                }
            }
        }
    };
});