/**
 * module src: exclusivedeals/displayClassify.js
 * 展示更多分类列表模块
**/
define('app/displayClassify', ['common/config', 'lib/backbone', 'appTpl/displayClassifyTpl', 'ui/iscroll'], function(CONFIG, Backbone, tpl, Iscroll){
    //model-展示更多分类列表
    var DisplayClassifyModel = Backbone.Model.extend({
        //展示更多分类列表属性[attributes]
        defaults: function() {
            return {
                //类目列表
                categorys: [{
                    //类目Id
                    id: '',
                    //类目名称
                    name: ''
                }]
            };
        }
    });

    //view-展示更多分类列表
    var DisplayClassifyView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-allcateBtn': 'control',
            'click .j-allcateInner li': 'selected',
            'click .j-allcateClose': 'control'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cExclusiveWarp = this.options.cExclusiveWarp;
            this.cExclusiveClassification = this.options.cExclusiveClassification;
            this.cAllcateWarp = this.options.cAllcateWarp;
            this.cAllcateInner = this.options.cAllcateInner;
            this.cAllcateBtn = this.options.cAllcateBtn;
            this.cCallcateBox = this.options.cCallcateBox;
            this.cHide = this.options.cHide;
            this.cHtml = this.options.cHtml;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.iscroll = this.options.iscroll;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            //分类列表数据渲染
            this.render(this.model.attributes);
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = this.$html||($('html'));
            this.$window = this.$window||$(window);
            this.$body = this.$el;
            this.$cExclusiveWarp = this.$cExclusiveWarp||$(this.cExclusiveWarp);
            this.$cExclusiveClassification = this.$cExclusiveClassification||$(this.cExclusiveClassification);
            this.$cAllcateWarp = $(this.cAllcateWarp);
            this.$cAllcateInner = $(this.cAllcateInner);
            this.$cAllcateBtn = $(this.cAllcateBtn);
            this.$cCallcateBox = $(this.cCallcateBox);
        },
        //事件初始化
        initEvent: function() {
            //横向分类列表漂浮事件
            this.$window.on('scroll', $.proxy(this.tabFloat, this));
            //对外提供关闭列表的事件
            this.on('DisplayClassifyView:close', this.close, this);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //专区内容外层包裹容器
                cExclusiveWarp: '.j-exclusiveWarp',
                //专区内容分类标签外层包裹容器
                cExclusiveClassification: '.j-exclusiveClassification',
                //展示更多分类列表外层包裹容器
                cAllcateWarp: '.j-allcateWarp',
                //展示更多分类列表包裹容器
                cAllcateInner: '.j-allcateInner',
                //控制列表展示和隐藏的按钮
                cAllcateBtn: '.j-allcateBtn',
                //遮罩层
                cCallcateBox: '.j-allcateBox',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //控制html/body高度的className
                cHtml: 'exclusivedeals-html',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new DisplayClassifyModel(options.modelDefaults),
                //Iscroll实例
                iscroll: new Iscroll('.j-allcate-iscroll', {click: this.iScrollClick(), scrollX: true, scrollY: false})
            };
            $.extend(true, this.options, options||{});
        },
        //判断设备是不是安卓4.4+ 如果是的话增加点击事件 解决安卓4.4以上版本无法点击
        // http://www.bkjia.com/HTML5/905892.html
        iScrollClick: function() {
            if (/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) return false;
            if (/Chrome/i.test(navigator.userAgent)) return (/Android/i.test(navigator.userAgent));
            if (/Silk/i.test(navigator.userAgent)) return false;
            if (/Android/i.test(navigator.userAgent)) {
                var s=navigator.userAgent.substr(navigator.userAgent.indexOf('Android')+8,3);
                return parseFloat(s[0]+s[3]) < 44 ? false : true
            }
        },
        //数据渲染
        render: function(data) {
                //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //外层包裹容器模板
                warp = template(tpl.warp.join(''))(data),
                //分类列表模板
                list = template(tpl.list.join(''))(data),
                //关闭按钮模板
                closeBtn = template(tpl.closeBtn.join(''))(data),
                //遮罩层模板
                mask = template(tpl.mask.join(''))(data);

            warp = warp.replace(/\{\{list\}\}/, list)
                   .replace(/\{\{closeBtn\}\}/, closeBtn)
                   .replace(/\{\{mask\}\}/, mask)
                   ;

            //页面绘制
            this.$el.append(warp);
            //重新初始化$dom对象
            this.initElement();
        },
        //判断列表是否展示
        isShow: function() {
            //true: 展示|false：隐藏
            var flag = false;
            if (this.$cAllcateBtn.hasClass('allcate-more')) {
                flag = true;
            }
            return flag;
        },
        //控制列表展示样式
        setStyle: function(flag) {
            var $html = this.$html,
                cHtml = this.cHtml,
                $window = this.$window,
                $body = this.$body,
                isSafari = this.isSafari,
                $cExclusiveClassification = this.$cExclusiveClassification,
                $cAllcateBtn = this.$cAllcateBtn,
                $cAllcateWarp = this.$cAllcateWarp,
                $cCallcateBox = this.$cCallcateBox,
                wHeight = $window.height(),
                wScrollTop = flag?(this.__wScrollTop = $window.scrollTop()):this.__wScrollTop,
                wHeight,
                warpOffsetTop,
                warpHeight,
                __offsetTop1 = this.__offsetTop1,
                __offsetTop2,
                isCorrect = this.isCorrect;

            //优先处理html/body的样式
            if (flag) {
                $html.addClass(cHtml);
                $body.css({'top': -wScrollTop});
            } else {
                $html.removeClass(cHtml);
                $body.attr({'style': ''});
            }

            //根据__offsetTop1与__offsetTop2来决定接下是否需要修正warpOffsetTop
            if (__offsetTop1&&!this.__offsetTop2) {
                //+1是为了&&运算时排除0为false的情况
                __offsetTop2 = this.__offsetTop2 = $cExclusiveClassification.offset().top + 1;
                isCorrect = this.isCorrect = __offsetTop2>=__offsetTop1?true:false;
            }

            //需要等待html/body样式修改完毕后再读取的数值
            //修正在safari中的offset.top()取值的问题
            warpOffsetTop = isCorrect?$cExclusiveClassification.offset().top+$cExclusiveClassification.outerHeight(true)-wScrollTop:$cExclusiveClassification.offset().top + $cExclusiveClassification.outerHeight(true),
            warpHeight = wHeight - warpOffsetTop;

            //展示时的样式
            if (flag) {
                $cAllcateBtn.removeClass('allcate-more').addClass('allcate-close');
                $cAllcateWarp.css({top: warpOffsetTop, left: 0, height: warpHeight});
                $cCallcateBox.css({top: warpOffsetTop, left: 0, height: warpHeight});
            //隐藏时的样式
            } else {
                //滚动条回到之前的位置
                window.scroll(0, wScrollTop);
                $cAllcateBtn.removeClass('allcate-close').addClass('allcate-more');
            }

            //设置选中项
            this.selected();
        },
        //控制列表的展示与隐藏
        control: function(evt) {
            var flag = evt.target?this.isShow():evt,
                $cAllcateWarp = this.$cAllcateWarp,
                $cCallcateBox = this.$cCallcateBox,
                cHide = this.cHide;

            //展示
            if (flag) {
                $cAllcateWarp.removeClass(cHide);
                $cCallcateBox.removeClass(cHide);
            //隐藏
            } else {
                $cAllcateWarp.addClass(cHide);
                $cCallcateBox.addClass(cHide);
            }

            //设置样式
            this.setStyle(flag);

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //设置选中项
        selected: function(evt) {
            var type,
                $cExclusiveClassification = this.$cExclusiveClassification,
                $cAllcateInner = this.$cAllcateInner,
                tpl = this.tpl.selected,
                tab;

            //当前选择项的类型
            type = evt?$(evt.currentTarget).attr("data-type"):$cExclusiveClassification.find('a.current').attr("data-type");
            //删除之前的选中状态
            $cAllcateInner.find('li.current').removeClass('current').find('a span').remove();
            //添加当前项选中状态
            $cAllcateInner.find('li[data-type="'+type+'"]').addClass('current').find('a').append(tpl);
            //真正的点击切换
            if (evt) {
                //切换数据类型
                tab = $cExclusiveClassification.find('a[data-type="'+type+'"]').trigger('click');
                //隐藏列表
                this.control(false);
                //滚动到对应选择的专区分类标签
                this.iscroll.scrollToElement(tab[0], null, true);
                //返回顶部
                setTimeout(function(){window.scroll(0,0)}, 50);
            }

            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //横向分类列表漂浮
        tabFloat: function() {
            var $cExclusiveWarp = this.$cExclusiveWarp,
                $cExclusiveClassification = this.$cExclusiveClassification,
                $window = this.$window,
                offsetTop = $cExclusiveWarp.offset().top,
                scrollTop = $window.scrollTop();

            //列表展示时跳出
            if (!this.isShow()) {
                return;
            }

            //记录$cExclusiveClassification初次offset().top的值
            if (!this.__offsetTop1) {
                //+1是为了&&运算时排除0为false的情况
                this.__offsetTop1 = $cExclusiveClassification.offset().top + 1;
            }

            //判断是否漂浮
            if (scrollTop > offsetTop) {
                $cExclusiveWarp.css({'padding-top': $cExclusiveClassification.outerHeight(true)});
                $cExclusiveClassification.addClass('allcate-tit-float');
            } else {
                $cExclusiveWarp.css({'padding-top': 0});
                $cExclusiveClassification.removeClass('allcate-tit-float');
            }
        },
        //隐藏列表，对外的关闭方式
        close: function(tab) {
            //隐藏列表
            this.control(false);
            //滚动到对应选择的专区分类标签
            this.iscroll.scrollToElement(tab[0], null, true);
            //返回顶部
            setTimeout(function(){window.scroll(0,0)}, 50);
        }
    });

    return DisplayClassifyView;
});