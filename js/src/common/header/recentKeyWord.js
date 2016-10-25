/**
 * module src: common/header/recentKeyWord.js
 * 页面顶部搜索：最近搜索关键词
 *
 * 说明：
 * 本地存储数据需要兼容线上旧有应用，再介于
 * backbone.localStorage.js结合backbone的实
 * 现方式，估该模块实现采用传统的“原型类”的
 * 方式进行开发，所以并不依赖backbone，对于
 * localStorage的存取，由于线上存的数据并非
 * JSON格式的字符串，所以这里的数据操作只能
 * 自己通过对原生的localStorage api封装进行
 * 操作，今后整个模块在实现上还有很大的优化
 * 空间。
**/
define('common/header/recentKeyWord', ['common/config', 'lib/underscore', 'tpl/header/recentKeyWordTpl', 'tools/fastclick'], function(CONFIG, _, tpl, FastClick){
    var RecentKeyWord = function(options) {
        //配置对象初始化
        this.setOptions(options);
        this.dRoot = this.options.dRoot;
        this.cHide = this.options.cHide;
        this.cCloseBtn = this.options.cCloseBtn;
        this.FastClick = this.options.FastClick;
        //本地存储名称
        this.localName = this.options.localName;
        //本地存储数据
        this.localValue = this.getItem(this.localName);
        //事件对象
        this.events = $({});
        //模板
        this.template = this.options.template
        
        
        //调用初始化入口
        this.init();
    };
    
    $.extend(RecentKeyWord.prototype, {
        setOptions: function(options) {
            this.options = {
                //存储数据的属性名称，与线上保持一致
                localName: 'DHMSearchData',
                //根节点
                dRoot: '#J_searchList',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //关闭按钮
                cCloseBtn: '.j-historyClose',
                //模板
                template: _.template(tpl.join('')),
                //阻止点透的函数
                FastClick: FastClick
            };
            $.extend(true, this.options, options||{});
        },
        //初始化入口
        init: function(options) {
            this.initElement();
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$dRoot = this.$dRoot||$(this.dRoot);           
            this.$cCloseBtn = $(this.cCloseBtn);
        },
        //事件初始化
        initEvent: function() {
            this.$dRoot.on('click', this.cCloseBtn, {name: this.localName}, $.proxy(this.clearItem, this));
            this.events.on('render', $.proxy(this.render, this));
            this.events.on('addItem', $.proxy(this.addItem, this));
        },
        //数据解析
        parse: function() {
            var value = this.toArray(this.getItem(this.localName));
            return {
                //-1表示没有对应的本地存储数据
                code: value.length>0?200:-1,
                //针对特殊情况如果数据大于7条，则只取前7条数据
                list: value.length>7?value.splice(7):value
            }
        },
        //数据格式化
        toArray: function(data) {
            //_uniq有序去重
            return typeof data==='string'?_.uniq(data.match(/[^-]+/g)||[]):[];
        },
        //获取数据
        getItem: function(name) {
            return localStorage.getItem(name);
        },
        //添加数据
        addItem: function(ev, value) {
                //本地存储名称
            var name = this.localName,
                //获取当前本地存储数据转为数组
                localValue = this.toArray(this.getItem(name)),
                //查找本地存储数据中与待添加项相重复的索引值
                index = $.inArray(value, localValue);

            //删除与新增数据相同的重复项
            //说明：
            //index>-1?1:0 
            //如果没有查到则不删除任何项
            localValue.splice(index, index>-1?1:0);

            //将新增数据添加到数组的开头
            localValue.unshift(value);
          
            //最多存放7条数据，并以分隔符“-”连接数组各项
            //例如：mp4-xxxxl-good-ddd-fff-eee-ggg
            //说明：
            //这种数据格式极其丑陋，以后请务必要将其优化
            //成存储json格式的字符串
            localValue.length>7&&localValue.splice(7);
            value = localValue.join('-');
            
            //写入本地存储
            if(CONFIG.isLocalStorageNameSupported()){
                return localStorage.setItem(name, value);
            }
            
        },
        //删除数据
        clearItem: function(ev) {
            delete this.localValue;
            localStorage.removeItem(ev.data.name);
            this.close();
        },
        //数据渲染
        render: function() {
            var data = this.parse();
            
            //数据绘制
            data.code===200?this.$dRoot.html(this.template(data)).removeClass(this.cHide):this.close();
            
            //重新初始化$dom对象
            this.initElement();
            
            //阻止关闭按钮点透
            this.FastClick.attach(this.$cCloseBtn[0]);
        },
        //关闭
        close: function() {
            this.$dRoot.addClass(this.cHide).html('');
        }
    });
    
    return RecentKeyWord;
});
