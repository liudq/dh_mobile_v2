/**
 * module src: newUserCoupons/tpl/newUserCouponTpl.js
 * 新人注册送大礼包活动模版
 **/
define('appTpl/newUserCouponTpl', [], function(){
    return {
       banner: [
           '<div class="banner"></div>',
       ],
       defaultState: [
           '<% var data = obj; %>',
           '<div class="j-couponPackage con">',
                '<div class="j-default box">',
                    '<div class="text">',
                        '<dl>',
                            '<dt>Great news for new App users!</dt>',
                            '<dd class="description">We\'re giving away $22 in coupons to buyers who have yet to register, or make their first purchase with DHgate. </dd>',
                            '<dd class="but">',
                                '<span class="down">',
                                    '<a class="j-bindCoupon" href="javascript:;">Claim My Coupons</a>',
                                    '<% if(data.version === true) { %>',
                                        '<a class="j-shareCoupon" href="javascript:;">Share to Win Coupons</a>',
                                    '<% } %>',
                                '</span>',
                            '</dd>',
                        '</dl>',
                    '</div>',
                '</div>',
           '</div>',
       ],
       receivedState: [
           '<% var data = obj; %>',
           '<div class="j-couponPackage con">',
                '<div class="j-received box">',
                    '<div class="text">',
                        '<dl>',
                            '<dt>Hooray! Coupon pack received!</dt>',
                            '<dd class="description">Check your coupons in the "My Account" section, under "Coupons" </dd>',
                            '<dd class="but">',
                                '<p><span>or</span></p>',
                                '<span class="down">',
                                   '<% if(data.version === true) { %>',
                                        '<a class="j-shareCoupon" href="javascript:;">Share to Win Coupons</a>',
                                   '<% } %>',
                                '   <a class="j-continue" href="javascript:;">Continue Shopping</a>',
                                '</span>',
                            '</dd>',
                        '</dl>',
                    '</div>',
                '</div>',
           '</div>',
       ],
        updataNotes: [
            '<div class="content">',
                '<div class="text">',
                    '<ul>',
                        '<li>Oops, your current version of the DHgate mobile App is outdated. Make sure you\'re using the latest version of the App, so you don\'t miss out on the sweetest deals.</li>',
                        '<li class="downWarp"><span class="down"><a class="j_update" href="javascript:;">Update Now</a></span> </li>',
                        '<li>We\'re always working on improvements in order to meet your best expectations. Please keep your DHgate App version updated, so that you\'re able to experience all the latest functions, and special features that makes in-App shopping so much easier, and more enjoyable!</li>',
                    '</ul>',
                '</div>',
            '</div>'
        ]
    };
});

