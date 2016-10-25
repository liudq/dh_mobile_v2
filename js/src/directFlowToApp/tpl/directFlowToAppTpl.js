/**
 * module src: directFlowToApp/tpl/directFlowToAppTpl.js
 * wap-app切流引导页模版模块
 **/
define ('appTpl/directFlowToAppTpl',[],function(){
    return {
        warp: [
            '<div class="dhAppDownloadWrap">',
                '<div class="dhAppTitle">',
                    '<h1>Save More on Our App</h1>',
                    '<p>Exclusive deals and discounts, </p>',
                    '<p>only on our App!</p>',
                    '<img src="http://css.dhresource.com/mobile_v2/directFlowToApp/image/app-show.png" width="295px" height="274px">',
                '</div>',
                '<div class="j-download"></div>',
                '<div class="continueVisit">',
                    '<a class="j-visit" href="javascript:;">Continue to visit</a>',
                '</div>',
                '<div class="dhAppDes">',
                    '<p class="enjoy">Get DHgate App to enjoy</p>',
                    '<p class="arrow"></p>',
                    '<ul class="desList">',
                        '<li class="sm"><span href="javascript:;">Save More</span></li>',
                        '<li class="es"><span href="javascript:;">Easy Search</span></li>',
                        '<li class="sp"><span href="javascript:;">Safe Pay</span></li>',
                        '<li class="et"><span href="javascript:;">Easy Tracking</span></li>',
                        '<li class="im"><span href="javascript:;">Instant Messaging</span></li>',
                    '</ul>',
                '</div>',
                '<div class="j-download"></div>',
            '</div>'
        ],
        androidDownload: [
            '<div class="androidDownload">',
                '<a class="google" href="javascript:;"></a>',
                '<a class="site" href="javascript:;"></a>',
            '</div>',
        ],
        iosDownload: [
            '<div class="iosDownload">',
                '<a class="ios" href="javascript:;"></a>',
            '</div>'
        ]
    }
})