/**
 * module src: mycoupon/gotoTop.js
 * 返回顶部模块
**/
define('app/gotoTop', ['common/config', 'lib/backbone'], function(CONFIG, Backbone){
    //model-返回顶部
    var GotoTopModel = Backbone.Model.extend({
        //返回顶部属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1
            }
        }
    });

    //view-返回顶部
    var GotoTopView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-goTop': 'gotoapp'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.cGoTop = this.options.cGoTop;
            this.model = this.options.model;
            this.$window = this.$window||$(window);
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //初始化$dom对象
        initElement:function(){
            this.$window = this.$window||$(window);
            this.$cGoTop = $(this.options.cGoTop);
        },
        //初始化事件
        initEvent:function(){
            this.$window.on('scroll', $.proxy(this.show, this));
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //数据模型
                model: new GotoTopModel(),
                //返回顶部元素
                cGoTop: '.j-goTop'
            };
            $.extend(true, this.options, options||{});
        },
        //大于两屏显示
        show:function(){
            var scrollTop = this.$window.scrollTop(),
                wHeight = this.$window.height();
            
            scrollTop > wHeight*2?this.$cGoTop.show():this.$cGoTop.hide();
        },
        //返回顶部
        gotoapp:function(){
            setTimeout(function(){window.scroll(0,0)}, 50);
        }
    });

    return GotoTopView;
});
