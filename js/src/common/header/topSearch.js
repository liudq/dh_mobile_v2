/**
 * module src: common/header/topSearch.js
 * 页面顶部搜索
 *
 * 说明：
 * 包含了，“最近搜索关键词”、“热门关键词”、
 * “推荐搜索关键词”，这三部分功能。
**/

define('common/header/topSearch', ['common/config', 'common/header/recentKeyWord', 'common/header/hotKeyWord', 'common/header/suggest', 'tools/fastclick'], function(CONFIG, RecentKeyWord, HotKeyWord, Suggest, FastClick){
    //view-页面顶部搜索
    var TopSearchView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-topSearchBtn': 'jumpSearch',
            'click #J_searchList ul li': 'selectKeyWord',
            'focus #J_searchInput': 'defaultSuggest',
            'click #J_searchBtn': 'showSearchLayyer',
            'keyup #J_searchInput': 'querySuggest',
            'click #J_searchList .j-suggetAttrList': 'selectAttr',
            'click #J_searchCl': 'close',
            'click #J_searchDel': 'deleteText'
        },
        //初始化入口
        initialize: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.recentKeyWord = this.options.recentKeyWord;
            this.hotKeyWord = this.options.hotKeyWord;
            this.suggest = this.options.suggest;
            this.cHtml = this.options.cHtml;
            this.cSearch = this.options.cSearch;
            this.cSectionActive = this.options.cSectionActive;
            this.cSearchWarp = this.options.cSearchWarp;
            this.dSearchInput = this.options.dSearchInput;
            this.cNormal = this.options.cNormal;
            this.cActive = this.options.cActive;
            this.cInputText = this.options.cInputText;
            this.dSearchList = this.options.dSearchList;
            this.cHide = this.options.cHide;
            this.cSearchfixedShadow = this.options.cSearchfixedShadow;
            this.cSearchKey = this.options.cSearchKey;
            this.dCloseBtn = this.options.dCloseBtn;
            this.dDeleteBtn = this.options.dDeleteBtn;
            this.dSearchBtn = this.options.dSearchBtn;
            this.cCateId = this.options.cCateId;
            this.cTagName = this.options.cTagName;
            this.cSchtypeId = this.options.cSchtypeId;
            this.FastClick = this.options.FastClick;
            this.timer = null;
            
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //最近搜索关键词
                recentKeyWord: new RecentKeyWord(),
                //热门关键词
                hotKeyWord: new HotKeyWord(),
                //推荐搜索关键词
                suggest: new Suggest(), 
                //html样式
                cHtml: 'dhm-htmlOverflow',
                //search区域根节点
                cSearch:'#J_search',
                //搜索激活时改变整体定位
                cSectionActive: 'section-active',
                //搜索框外层包裹容器
                cSearchWarp: '.j-search-box',
                //搜索输入框
                dSearchInput: '#J_searchInput',
                //搜索框默认样式
                cNormal: 'search-mar0',
                //搜索框激活样式
                cActive: 'search-mar',
                //搜索框文字输入样式
                cInputText: 'inputtext',
                //关键词列表外层包裹容器
                dSearchList: '#J_searchList',
                //关键词列表隐藏样式
                cHide: 'dhm-hide',
                //关闭按钮
                dCloseBtn: '#J_searchCl',
                //删除搜索内容按钮
                dDeleteBtn: '#J_searchDel',
                //点击顶部搜索图标进行搜索的按钮
                dSearchBtn:'#J_searchBtn',
                //关键词对应属性
                cTagName: '#tagId',
                //fixed遮罩层解决fixed元素bug
                cSearchfixedShadow: '.j-searchfixedShadow',
                //隐藏域类目赋值
                cCateId: '#cateId',
                //搜索下拉列表key值
                cSearchKey:'.j-searchKey',
                //suggest下的跟踪区域
                cSchtypeId: '#schtypeId',
                //阻止点透的函数
                FastClick: FastClick
            };
            $.extend(true, this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$html = $('html');
            this.$window = $(window);
            this.$body = this.body||$('body');
            this.$cSearch = $(this.cSearch);
            this.$cSearchWarp = $(this.cSearchWarp);
            this.$cSearchfixedShadow = $(this.cSearchfixedShadow);
            this.$dSearchInput = $(this.dSearchInput);
            this.$dSearchList = $(this.dSearchList);
            this.$dCloseBtn = $(this.dCloseBtn);
            this.$dDeleteBtn = $(this.dDeleteBtn);
            this.$dSearchBtn = $(this.dSearchBtn);
            this.$cCateId = $(this.cCateId);
            this.$cTagName = $(this.cTagName);
            this.$cSchtypeId = $(this.cSchtypeId);
        },
        //事件初始化
        initEvent: function() {
            var self = this,
                timer = this.timer;
            
            //阻止关闭按钮点透
            this.$dCloseBtn[0]&&this.FastClick.attach(this.$dCloseBtn[0]);
            //阻止删除按钮点透
            this.$dDeleteBtn[0]&&this.FastClick.attach(this.$dDeleteBtn[0]);
            //阻止搜索图标按钮点透
            this.$dSearchBtn[0]&&this.FastClick.attach(this.$dSearchBtn[0]);
            //屏幕旋转事件
            //关键词列表容器适配，横/竖屏下不同的可视高度
            this.$window.on('orientationchange', function(){
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.setSearchItemListStyle();
                }, 500);
            });
            //初始化设置搜索框的placehoder值
            this.setPlacehoder();
        },
        //初始化设置搜索框的placehoder值
        setPlacehoder:function(){
            this.$dSearchInput.attr('placeholder',$.lang["Head_shoppingFor"]);
        },
        //搜索关键词跳转
        jumpSearch: function() {
            //写入本地缓存
            this.recentKeyWord.events.trigger('addItem', [$.trim(this.$dSearchInput.val())]);
            //提交表单
            this.$cSearch.find('form').submit();
        },
        //根据选择的关键词进行跳转
        selectKeyWord: function(ev) {
            var target = $(ev.currentTarget),
                //用自定义属性取关键词为了避免谷歌浏览器用户选择是否翻译的时候，选择去翻译之后出现的乱码关键词
                targetVal = target.attr('data-key').replace(/<\/?[^>]*>/g,''),
                cateName = target.find('.j-cateName'),
                submitForm = this.$cSearch.find('form');
                submitUrl = submitForm.attr('action');
            //判断当前点击对象是否是点击的类目
            if(cateName.length){
                //给类目隐藏域赋值
                this.$cCateId.val(cateName.attr('data-cid'));
                //点击关键词的关联类目标记ss2
                this.$cSchtypeId .val('ss2');
            }else{
                //点击相关键词标记ss1
                this.$cSchtypeId .val('ss1');
            }
            //给关键词隐藏域赋值
            this.$dSearchInput.val(targetVal);
            //搜索跳转
            this.jumpSearch();
        },
        //选择推荐出的关键词属性
        selectAttr:function(ev){
            var target = $(ev.currentTarget),
                targetVal = target.attr('data-attrName'),
                keVal = target.closest('li').attr('data-key').replace(/<\/?[^>]*>/g,'');
            //给属性隐藏域赋值
            this.$cTagName.val(targetVal);
            //点击相关属性标记ss3
            this.$cSchtypeId .val('ss3');
            //给关键词隐藏域赋值
            this.$dSearchInput.val(keVal+' '+targetVal);
            ev.stopPropagation();  
            //搜索跳转
           this.jumpSearch();
        },
        //设置整个搜索展示样式
        setSearchStyle: function(flag) {
            //打开
            if (flag) {
                //设置html/body样式
                this.$html.addClass(this.cHtml);
                //改变搜索区域定位样式
                this.$cSearch.addClass(this.cSectionActive);
                //显示关闭按钮
                this.$dCloseBtn.removeClass('dhm-hide');
                //搜索输入样式被激活
                this.$cSearchWarp.removeClass(this.cNormal).addClass(this.cActive);
                //添加文字输入样式
                this.$dSearchInput.addClass(this.cInputText);
            //关闭
            } else {
                //关闭搜索关键词列表
                this.resetSearchList();
                //隐藏关闭按钮
                this.$dCloseBtn.addClass('dhm-hide');
                //搜索输入样式重置为默认样式
                this.$cSearchWarp.removeClass(this.cActive).addClass(this.cNormal);
                //html/body样式重置为默认样式
                this.$html.removeClass(this.cHtml);
                //改变搜索区域定位样式为默认状态
                this.$cSearch.removeClass(this.cSectionActive);
                //删除文字输入样式
                $.trim(this.$dSearchInput.val())===''?this.$dSearchInput.removeClass(this.cInputText):false;
                //搜索框失去焦点
                this.$dSearchInput[0].blur();
            }
        },
        //设置搜索框删除文本按钮样式
        setDeleteStyle: function(flag) {
            //显示
            if (flag) {
                this.$dDeleteBtn.removeClass(this.cHide);
            //隐藏
            } else {
                this.$dDeleteBtn.addClass(this.cHide);
            }
        },
        //设置搜索关键词列表样式
        setSearchItemListStyle: function() {
            var $ul = this.$dSearchList.find('ul'),
                $siblings,
                $parentSiblings,
                windowHeight = this.$window.height()*1,
                sumHeight = 0;

            //不存在则跳出
            if (!$ul[0]) {
                return;
            }

            //$ul同辈元素集合
            $siblings = $ul.siblings();
            $.each($siblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });
            
            //$ul父节点同辈元素集合
            $parentSiblings = $ul.parent().siblings();
            $.each($parentSiblings, function(index, ele){
                sumHeight += $(ele).outerHeight()*1;
            });

            $ul.css({height: windowHeight - sumHeight});
        },
        //重置搜索关键词列表展示状态
        resetSearchList: function() {
            this.$dSearchList.addClass(this.cHide).html('');
        },
        //默认推荐[最近搜索关键词|热门关键词]
        defaultSuggest: function(ev) {
           
            var recentKeyWord = this.recentKeyWord,
                hotKeyWord = this.hotKeyWord,
                suggest = this.suggest,
                $target = $(ev.target);

            //设置打开样式
            this.setSearchStyle(true);
            //添加遮罩
            this.addMaskLayyer();
            this.$cSearchfixedShadow.removeClass('dhm-hide');
            //首先查看搜索输入框内容为空
            if ($.trim($target.val()) === '') {
                //查看是否存有本地数据
                if (recentKeyWord.localValue) {
                    //绘制最近搜索关键词列表
                    recentKeyWord.events.trigger('render');
                
                //反之
                } else {
                    //绘制热门关键词列表
                    hotKeyWord.trigger('render');
                }
            
            //绘制推荐搜索关键词列表
            } else {
                suggest.trigger('render', this.getParam($target));
            }
        },
        addMaskLayyer:function(){
            var fixedShadow = '<div class="j-searchfixedShadow dhm-hide" style="position:fixed;width:100%;height:100%;bottom:0;z-index:92;background:#fff;"></div>';
            
            if(!this.$cSearchfixedShadow[0]){
                this.$body.append(fixedShadow);
                this.$cSearchfixedShadow = $('.j-searchfixedShadow');
            }
        },
        showSearchLayyer:function(){
            //隐藏搜索框
            this.$cSearch.removeClass('dhm-hide');
            //触发隐藏搜索框的focus事件
            this.$dSearchInput.trigger('focus');
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //查询推荐
        querySuggest: function(ev) {
            var $target = $(ev.target);
            
            //控制删除按钮展示
            $target.val()!==''?this.setDeleteStyle(true):this.setDeleteStyle(false);
            
            //绘制推荐搜索关键词列表
            this.suggest.trigger('render', this.getParam($target));
        },
        //搜索关键词查询参数
        getParam: function($ele) {
            return {
                data: {
                    key: $.trim($ele.val()),
                    cid: '',
                    client:'wap'
                }
            };
        },
        //关闭
        close: function(ev) {
            //关闭遮罩层
            this.$cSearchfixedShadow.addClass('dhm-hide');
            //设置关闭样式
            this.setSearchStyle(false);
            this.$dSearchBtn[0]&&this.$cSearch.addClass('dhm-hide');
            //hack：阻止android浏览器中的点透
            CONFIG.preventClick();
        },
        //删除搜索框内容
        deleteText: function() {
            //清空搜索输入框
            this.$dSearchInput.val('');
            //隐藏删除按钮
            this.setDeleteStyle(false);
            //重置列表搜索关键词列表
            this.resetSearchList();
        }
    });
    
    return TopSearchView;
});

