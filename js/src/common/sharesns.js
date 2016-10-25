/**
 * module src: common/sharesns.js
 * SNS分享
 *
 * 说明：
 * WWW平台代码，这里只是按照require规范进行封装
**/

/**
 * SNS 分享公共方法
 * Date: 2014-02-19
 */

/**
 * [loadPage sns分享方法]
 * @param  {[string]} site            [分享到哪个sns网站]
 * @param  {[string]} pageTitle       [页面标题]
 * @param  {[string]} pageDescription [页面描述]
 *
 */
define('common/sharesns', ['common/config'], function(CONFIG){
    var description = "";
    var title = window.document.title;
    function loadPage(site, pageTitle, pageDescription) {

        var rawURL = window.location.href;
        var rawCanonicalURL = $('#canonicalUrl').attr('href');
        if (rawCanonicalURL == undefined) {
            if (rawURL.indexOf("#") > 0) {
                rawURL = rawURL.substring(0, rawURL.indexOf("#"))
            }
        } else {
            rawURL = rawCanonicalURL
        }
        var media = "";
        if(site == "pinterest"){
            media = $('#firstBImage >span >img').attr("src");
        }
        if(media != "" && media != undefined){
            media = encodeURIComponent(media);
        }
        var currentURL = encodeURIComponent(rawURL);
        title = encodeURIComponent(pageTitle || title);
        var bodytext = encodeURIComponent(pageDescription);
        var newURL;
        var go = true;
        if(site == 'email'){
            (function(){
                var A = document.createElement('a');
                A.setAttribute('href','mailto:?subject=Your friend recommends this product (via DHgate.com)&body='+pageTitle.replace(/\&+|\@+|\'+|"+/g,'')+currentURL);
                A.setAttribute('style','display:none;');
                A.innerHTML = 'email';
                document.body.appendChild(A);
                A.click();
            })();
            return;
        }
        switch (site) {
        case "del.icio.us":
            newURL = "https://delicious" + ".com/post?" + "title=" + title + "&url=" + currentURL;
            break;
        case "digg":
            newURL = "http://digg" + ".com/submit?phase=2&" + "url=" + currentURL + "&title=" + title + "&bodytext=" + bodytext + "&topic=tech_deals";
            break;
        case "reddit":
            newURL = "http://reddit" + ".com/submit?" + "url=" + currentURL + "&title=" + title;
            break;
        case "furl":
            newURL = "http://www.furl" + ".net/savedialog.jsp?" + "t=" + title + "&u=" + currentURL;
            break;
        case "rawsugar":
            newURL = "http://www.rawsugar" + ".com/home/extensiontagit/?turl=" + currentURL + "&tttl=" + title;
            break;
        case "stumbleupon":
            newURL = "http://www.stumbleupon" + ".com/submit?url=" + currentURL + "&title=" + title;
            break;
        case "blogmarks":
            break;
        case "facebook":
            newURL = "http://www.facebook" + ".com/share.php?src=bm&v=4" + "&u=" + currentURL + "&t=" + title;
            break;
        case "technorati":
            newURL = "http://technorati" + ".com/faves?sub=favthis&add=" + currentURL;
            break;
        case "spurl":
            newURL = "http://www.spurl" + ".net/spurl.php?v=3" + "&title=" + title + "&url=" + currentURL;
            break;
        case "simpy":
            newURL = "http://www.simpy" + ".com/simpy/LinkAdd.do?title=" + title + "&href=" + currentURL;
            break;
        case "ask":
            break;
        case "google":
            newURL = "http://www.google" + ".com/bookmarks/mark?op=edit&output=popup" + "&bkmk=" + currentURL + "&title=" + title;
            break;
        case "netscape":
            newURL = "http://www.netscape" + ".com/submit/?U=" + currentURL + "&T=" + title + "&C=" + bodytext;
            break;
        case "slashdot":
            newURL = "http://slashdot" + ".org/bookmark.pl?url=" + rawURL + "&title=" + title;
            break;
        case "backflip":
            newURL = "http://www.backflip.com/add_page_pop.ihtml?" + "title=" + title + "&url=" + currentURL;
            break;
        case "bluedot":
            newURL = "http://bluedot" + ".us/Authoring.aspx?" + "u=" + currentURL + "&t=" + title;
            break;
        case "kaboodle":
            newURL = "http://www.kaboodle" + ".com/za/selectpage?p_pop=false&pa=url" + "&u=" + currentURL;
            break;
        case "squidoo":
            newURL = "http://www.squidoo" + ".com/lensmaster/bookmark?" + currentURL;
            break;
        case "twitter":
            newURL = "https://twitter" + ".com/intent/tweet?status=" + title + ":+" + currentURL;
            break;
        case "pinterest":
            newURL = "http://pinterest" + ".com/pin/create/button/?url=" + currentURL + "&media=" + media + "&description=" + title;
            break;
        case "vk":
            newURL = "http://vk" + ".com/share.php?url=" + rawURL;
            break;
        case "bluedot":
            newURL = "http://blinkbits" + ".com/bookmarklets/save.php?" + "v=1&source_url=" + currentURL + "&title=" + title;
            break;
        case "blinkList":
            newURL = "http://blinkbits" + ".com/bookmarklets/save.php?" + "v=1&source_url=" + currentURL + "&title=" + title;
            break;
        case "linkedin":
            newURL = "http://www.linkedin" + ".com/cws/share?" + "url=" + currentURL + "&title=" + title;
            break;
        case "googleplus":
            newURL = "https://plus.google" + ".com/share?" + "url=" + currentURL;
            break;
        case "browser":
            bookmarksite(pageTitle, rawURL);
            go = false;
            break;
        }
        if (go == true) {
            window.open(newURL, "bookmarkWindow")
        }
    }
    
    //页面底部SNS分享按钮
    $('.j-foot-share')[0]&&$('.j-foot-share li').on('click', footSns);
    function footSns(ev) {
        var $target = $(ev.target);
        loadPage($target.attr('data-type'), title, description);
    }
});
