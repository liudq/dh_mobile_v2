/**
 * module src: detail/v1/promotionCountDown.js
 * 促销倒计时数据绘制功能模块
**/
define('app/promotionCountDown', ['common/config','lib/backbone','appTpl/promotionCountDownTpl'], function(CONFIG,Backbone,tpl){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cTimeleftWrap = this.options.cTimeleftWrap;
            this.remainingTime = this.options.remainingTime;
            this.template = this.options.template;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$cTimeleftWrap = $(this.cTimeleftWrap);
        },
        //事件初始化
        initEvent: function() {
            //绘制数据
            this.render(this.remainingTime);
        },
        setOptions: function(options) {
            this.options = {
                //时间包裹容器
                cTimeleftWrap: '.j-timeLeft',
                //模板
                template: _.template,
                //促销截止时间
                remainingTime:-1
            };
            $.extend(true, this.options, options||{});
        },
        //绘制数据
        render:function(data){
            if(!data.second){this.$cTimeleftWrap.hide();}
            var data = this.template(tpl.join(''))(data);
            this.$cTimeleftWrap.html(data);
        }
    };
});