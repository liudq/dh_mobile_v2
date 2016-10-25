/**
 * module src: getCoupon/bindCoupon.js
 * 绑定coupon模块
**/
define('app/bindCoupon', ['common/config', 'checkoutflow/popupTip'], function(CONFIG,tip){
    return {
        get: function(target) {
                //当前couponCode
            var couponCode = target.attr('data-currentcode'),
                //自动提示弹层
                $autoLayerWarp = $('.j-auto-layer'),
                //隐藏元素
                cHide = 'dhm-hide',
                self = this;

             //打开loading
             tip.events.trigger('popupTip:loading', true);

            $.ajax({
                type: 'POST',
                url: '/mobileApiWeb/coupon-Coupon-bindPtOrAppCoupon.do',
                //url:'coupon-Coupon-bindPtOrAppCoupon.do',
                data: {
                    couponCode:couponCode,
                    client:"wap",
                    version:1.0
                },
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //用户已经存在该coupon
                    tip.events.trigger('popupTip:autoTip',{message:res.message,callback:function(){
                        $autoLayerWarp.removeClass(cHide).animate({opacity:1}, 500);
                        setTimeout(function(){
                            $autoLayerWarp.animate({opacity:0}, 500, function(){
                                $autoLayerWarp.addClass(cHide);
                                self.changeState(res,target);
                            });
                        }, 1000);
                    }});
                },
                error: function(){
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //展示数据接口错误信息【点击ok，关闭提示】
                    tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
                }
            });
        },
        changeState:function(res,target){
                //获取coupon状态容器
            var $cCouponState = target.find('dt'),
                //获取当前剩余coupon的容器
                $cCurrentCouponNum = target.find('.j-currentCouponNum');
            //领取成功
            if (res.state==='0x0000') {
                target.addClass('outof2');
                $cCouponState.html('');
                $cCurrentCouponNum.html(res.data.coupon.usedNumber);
            //已经领光
            }else if(res.state==='0x0511'){
                target.addClass('outof');
                $cCouponState.html('Out of<br>Coupons');
                $cCurrentCouponNum.html(res.data.coupon.usedNumber);
            }
        }
    };
});
