/**
 * module src: newUserCoupons/bindCouponPackage.js
 * 领取coupon大礼包模块
 **/
define('app/bindCouponPackage', ['common/config', 'lib/backbone', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG,Backbone,tip,dataErrorLog){
    //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: false,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
    //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: CONFIG.wwwURL + '/mobileApiWeb/coupon-Coupon-bindCouponPackage4NewBuyer.do',
            data: {}
        };
    return {
        get: function(sessionKey,client) {
            //自动提示弹层
            var  $autoLayerWarp = $('.j-auto-layer'),
                //隐藏元素
                cHide = 'dhm-hide',
                self = this;
            __params.data = {
                sessionKey: sessionKey,
                client: client,
                clientextra: 'wapinapp'
            };
            //打开loading
            tip.events.trigger('popupTip:loading', true);

            $.ajax({
                type: 'POST',
                url: __params.url,
                data: __params.data,
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //领取成功 或者领取完 内容更新
                    if(res.state === '0x0000' || res.state === '0x0505'){
                        self.changeState();
                    //session失效重新登录
                    } else if(res.state === '0x0002'){
                        try {
                            //ios APP
                            toLogin("clicked");
                        } catch(e) {
                            //andoird APP
                            if (window.order && window.order.toLogin) {
                                window.order.toLogin("clicked");
                            }
                        }
                    }else {
                        tip.events.trigger('popupTip:autoTip', {
                            message: self.getPopupTip(res), callback: function () {
                                $autoLayerWarp.removeClass(cHide).animate({opacity: 1}, 500);
                                setTimeout(function () {
                                    $autoLayerWarp.animate({opacity: 0}, 500, function () {
                                        $autoLayerWarp.addClass(cHide);
                                    });
                                }, 1200);
                            }
                        });

                    }
                    //如领取不成功 统一捕获异常
                    if(res.state !== '0x0000'){
                        //捕获异常
                        try {
                            throw('success(): data is wrong');
                        } catch(e) {
                            //异常数据收集
                            dataErrorLog.events.trigger('save:dataErrorLog', {
                                message: e,
                                url: __params.url,
                                params: __params.data,
                                result: res
                            });
                        }
                    }
                },
                error: function() {
                    //关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //展示数据接口错误信息【点击ok，关闭提示】
                    tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
                    //捕获异常
                    try {
                        throw('error(): request is wrong');
                    } catch(e) {
                        //异常数据收集
                        dataErrorLog.events.trigger('save:dataErrorLog', {
                            message: e,
                            url: __params.url,
                            params: __params.data
                        });
                    }
                }
            });
        },
        //获取不同状态下对应的提示文案
        getPopupTip: function(res) {
            var tip = '';
            //不符合领取条件
            if (res.state === '0x0502') {
                tip = 'Sorry, you are not eligible.';
            //已经领取完了
            } else if (res.state === '0x0511') {
                tip = 'Oops, all of the coupon packs have been taken.';
            //活动结束
            } else if (res.state === '0x0501') {
                tip = 'Sorry, you just missed it. This campaign has expired.';
            //接口请求失败或者未领取完
            } else {
                tip = 'Something went wrong. Please try again!';
            };
            return tip;
        },
        //绑定成功之后改变按钮文字和状态
        changeState: function() {
            var claimBtn = $('.j-bindCoupon'),
                down = claimBtn.closest('.down'),
                but = claimBtn.closest('.but'),
                description = but.prev('.description'),
                title = description.prev('dt'),
                box = claimBtn.closest('.box');
            claimBtn.removeClass('j-bindCoupon').addClass('j-continue').text('Continue Shopping');
            but.prepend('<p><span>or</span></p>');
            description.text('Check your coupons in the "My Account" section, under "Coupons" ');
            title.text('Hooray! Coupon pack received!');
            box.removeClass('j-default').addClass('j-received');

        }
    }
});