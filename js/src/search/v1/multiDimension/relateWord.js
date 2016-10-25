/**
 * module src: search/multiDimensuon/relateWord.js
 * seo相关关键词位置调整以及线上隐藏功能
**/
define('app/multiDimensuon/relateWord', [], function(){
    return {
        //初始化入口
        init: function(options) {
            //配置对象初始化
            this.setOptions(options);
            this.cPageBettercon = this.options.cPageBettercon;
            this.cRelateWordCon = this.options.cRelateWordCon;
            this.cMoreRelated = this.options.cMoreRelated;
            this.template = this.options.template;
            this.cHide = this.options.cHide;
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        //$dom对象初始化
        initElement: function() {
            this.$body = this.$body||$('body');
            this.$cPageBettercon = $(this.cPageBettercon);
            this.$cRelateWordCon = $(this.cRelateWordCon);
            this.$cMoreRelated = $(this.cMoreRelated);
        },
        //事件初始化
        initEvent: function() {
            //改变位置
            this.changePosition();
            //控制显示隐藏
            this.$body.on('click', '.j-moreLink', $.proxy(this.showToHide, this));
        },
        setOptions: function(options) {
            this.options = {
                //relateWord外层元素
                cPageBettercon: '.j-pageBettercon',
                //relateWord元素
                cRelateWordCon: '.j-relateWordCon',
                //隐藏相关词元素
                cMoreRelated : '.j-moreRelated',
                //隐藏元素
                cHide: 'dhm-hide'
            };
            $.extend(true, this.options, options||{});
        },
        //改变位置
        changePosition:function(){
            this.$cPageBettercon.prepend(this.$cRelateWordCon.html());
        },
        //控制显示隐藏
        showToHide:function(evt){
            var target = $(evt.currentTarget),
                hideDiv = target.siblings('.j-moreRelated');
            if(hideDiv.hasClass(this.cHide)){
                hideDiv.removeClass(this.cHide);
                target.html("- Fewer");
            }else{
                hideDiv.addClass(this.cHide);
                target.html("+ More");
            }
        }
    };
});

