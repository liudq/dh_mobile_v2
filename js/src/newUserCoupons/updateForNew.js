
/**
 * module src: newUserCoupons/updateForNew.js
 * 新人注册送大礼包，提示用户更新页面
 **/
define('app/updateForNew', ['common/config','checkoutflow/popupTip', 'lib/backbone','appTpl/newUserCouponTpl'], function(CONFIG, tip, Backbone, tpl){
    //view-提示用户更新页面模块
    var updateForNewView = Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j_update': 'updateApp'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.newPacksNotes = this.options.newPacksNotes;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.type = this.options.type;
            this.androidStore = this.options.androidStore;
            this.iosStore = this.options.iosStore;
            //对象初始化
            this.initElement();
            //渲染页面
            this.render();
        },
        //$dom对象初始化
        initElement: function() {
            this.$newPacksNotes = $(this.newPacksNotes);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //提示下载页面的包裹层
                newPacksNotes:'.j-couponContent',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //设备类型
                type: CONFIG.isAndroid?"android":"ios",
                //android APP下载地址
                androidStore: 'http://www.dhresource.com/mobile/dhgate_buyer.apk',
                //ios APP下载地址
                iosStore: 'https://itunes.apple.com/us/app/dhgate-shop-smart-shop-direct/id905869418?l=zh&ls=1&mt=8'
            };
            $.extend(true, this.options, options||{});
        },
        //数据渲染
        render: function() {
            //关闭loading
            tip.events.trigger('popupTip:loading', false);
            var newpacksNotes = this.template(this.tpl.updataNotes.join(''))();
            this.$newPacksNotes.append(this.template(newpacksNotes));
            this.resizeHeight();
        },
        //改变高度使整体高度自适应
        resizeHeight: function(){
            var html = $('html'),
                body = $('body'),
                text = $('.text'),
                bodyHeight = $(window).height();
            html.css('width','100%').css('height','100%');
            body.css('width','100%').css('height','100%');
            text.css('height',bodyHeight - 110);
        },
        //跳转到相应下载页面
        updateApp: function(event) {
            var target = $(event.target);
            if(this.type === 'android') {
                target.attr('href',this.androidStore);
            } else {
                target.attr('href',this.iosStore);
            }
        }
    });
    return updateForNewView;
});
