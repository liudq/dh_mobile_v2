/**
 * module src: common/goTop.js
 * 返回顶部模块
 **/
define('common/goTop',['common/config','tpl/goTopTpl'],function(CONFIG,tpl){
    var GoTop = function (options) {
        //配置对象初始化
        this.setOptions(options);
        this.cHide = this.options.cHide;
        this.cGoTop = this.options.cGoTop;
        this.speed = this.options.speed;
        this.timer = null;
        this.timer1 = null;

        //初始化$dom对象
        this.initElement();
        //初始化事件
        this.initEvent();
        //渲染数据
        this.render();
    };

    //注册静态方法和属性
    $.extend(GoTop,{
        //初始化入口
        init: function(options){
            return new GoTop(options);
        }
    });

    //注册原型方法和属性
    $.extend(GoTop.prototype,{
        //自定义配置对象
        setOptions: function(options) {
            this.options = {
                //控制返回顶部元素展示和隐藏的className
                cHide: 'dhm-hide',
                //点击返回顶部元素
                cGoTop: '.j-goTop',
                //控制返回顶部的速度
                speed: 5
            };
            $.extend(this.options,options||{});
        },
        //初始化$dom对象
        initElement: function() {
            this.$body = this.$body||$('body');
            this.$window = this.$window||$(window);
            this.$cGoTop = $(this.cGoTop);
        },
        //添加绑定事件
        initEvent: function() {
            //添加滚动事件
            this.$window.on('scroll', $.proxy(this.scroll,this));
            //添加返回顶部的按钮点击事件
            this.$body.on('click', this.cGoTop, $.proxy(this.goTop,this));
        },
        //渲染模版
        render: function() {
            //页面绘制
            this.$body.append(_.template(tpl.join('')));
            //重新初始化$dom对象
            this.initElement();
            //绘制时判断是否需要展示
            this.scroll();
        },
        //滚动控制展示隐藏
        scroll: function() {
            var $window = this.$window,
                $wHeight = $window.height(),
                $scrollTop = $window.scrollTop(),
                cHide = this.cHide,
                $cGoTop = this.$cGoTop;

            //清除定时器，阻止多次触发
            if (this.timer1) {
                clearTimeout(this.timer1);
            }

            //执行上增加50毫秒的延迟
            this.timer1 = setTimeout(function(){
                if($scrollTop > $wHeight){
                    $cGoTop.removeClass(cHide);
                } else {
                    $cGoTop.addClass(cHide);
                }
            }, 50);
        },
        //回到顶部
        goTop: function() {
            this.timer = setInterval($.proxy(function(){
                var $window = this.$window,
                    scrollTop = $window.scrollTop(),
                    speedtop = scrollTop/5;
                $window.scrollTop(scrollTop - speedtop);
                if (scrollTop <= 0) {
                    clearInterval(this.timer);
                }
            },this), this.speed);
        }
    });
    
    return GoTop;
})
