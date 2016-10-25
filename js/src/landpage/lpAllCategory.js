//顶部可滑动的类目
$(function() {
    function lpAllCategory(){
        var self = this;
        self.el = $('body');
        //选择类目按钮
        self.cCategoryIcon = $('.j-category-icon');
        //遮罩层
        self.cSlideMask = $('.j-slide-mask');
        //弹层类目
        self.cAllBox = $( '.j-all-box');
        //弹层返回按钮
        self.cFh = $( '.j-fh');
        self.init();
    };
    lpAllCategory.prototype = {
        constructor:lpAllCategory,
        //判断是否支持touch事件
        _eType:function(){
            var isSupportTouch="ontouchend" in document?true:false;
            if(isSupportTouch){
                return 'touchend';
            }else{
                return 'click';
            }
        },
        _domExist:function(id){
            if(!id||!$(id).get(0)){
                console.log(id+" not found dom");
                return false;
            }
            return $(id);
        },
       /* //弹层
        _translate: function ($d, dist, flag) {
            var style = $d.get(0).style;
            style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = '500ms';
            style.webkitTransform = style.MozTransform = 'translateX(' + dist + ')';
            if (dist == 0) {
                $("body").css({'height': $(window).height(), 'overflow': 'hidden'});
                setTimeout(function () {
                    $d.css({"position": "absolute"});
                }, 500);
            } else if (flag) {
                $d.css("position", "fixed");
                $("body").css({'height': $(window).height(), 'overflow': 'hidden'});
            } else {
                $("body").css({'height': 'auto', 'overflow': 'auto'});
                $d.css("position", "fixed");
            }
        },
        //遮罩层
        _shadow: function (scope) {
            var self = scope;
            if (!self.shadowEle) {
                var shadow = document.createElement("div");
                shadow.style.cssText = "display:none;width:100%;height:100%;position:fixed;top:0;left:0;z-index:99;zoom:1;background:#000;opacity:0.3";
                $("body").append(shadow);
                self.shadowEle = $(shadow);
            }
            return self.shadowEle;
        },*/
        //类目弹层
        unfoldCategory: function(){
            var self = this,
                exist = this._domExist;
            var $el = exist(self.el),
                $cCategoryIcon = exist(self.cCategoryIcon),
                $cFh = exist(self.cFh),
                $singleCate = exist(self.cAllBox.find('li'));
            if(!$cCategoryIcon) return;

            $cCategoryIcon.on(self._eType(), $cCategoryIcon,$.proxy(self.openAllCates, this));

            $cFh.on(self._eType(), $cFh, $.proxy(self.CloseCates, this));

            $singleCate.on(self._eType(),$singleCate, $.proxy(self.allboxEffect,this));
        },
       //打开弹层
        openAllCates: function (e){
            var self = this,
                exist = this._domExist;
            var $el = exist(self.el),
                $cSlideMask = exist(self.cSlideMask),
                $cAllBox = exist(self.cAllBox);
            var allHeight = $el.height();
            $cSlideMask.css('height', allHeight).show();
            $cAllBox.css('height',allHeight).addClass('moved');

        },
        //关闭弹层
        CloseCates:  function (e){
            var self = this;
            self.cSlideMask.hide();
            self.cAllBox.removeClass('moved');
            e.preventDefault();
            e.stopPropagation();
        },
        //弹层中效果
        allboxEffect: function(e){
            var $target = $(e.target),
                $parent =$target.parent('li');
            $parent.addClass('current').siblings().removeClass('current');
        },
        //可滑动类目
        mySwip: function(){
            var mySwiper = new Swiper('.swiper-container',{
                paginationClickable: true,
                slidesPerView: 'auto'
            });
        },

        init: function () {
            var self = this;
            self.mySwip();
            self.unfoldCategory();
        }
    }
    new lpAllCategory();
});

