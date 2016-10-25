/**
 * module src: detail/v1/share.js
 * 将当前浏览页面地址分享到第三方平台
**/
define('app/share', ['common/config'], function(CONFIG){
        //页面标题
    var title = encodeURIComponent(document.title),
        //页面地址
        url = window.location.href;
    
    //删除页面地址中的锚点
    if (url.indexOf("#") > 0) {
        url = url.substring(0,url.indexOf("#"));
    }
    //对页面地址进行编码
    url = encodeURIComponent(url);
        
    return {
        //初始化入口
        init: function(options) {
            //查看是否有外部配置传入
            if (typeof options === 'undefined') {
                options = {};
            }
            //$根节点
            this.$el = options.$el||$('body');
            //第三方分享平台地址
            this.thirdPartyUrl = options.thirdPartyUrl||{
                facebook:   ["http://m.facebook.com/sharer.php?&u=",url,"&t=",title].join(''),
                twitter:    ["https://mobile.twitter.com/home?status=",title,"+-+",url].join(''),
                google:     ["http://www.google.com/bookmarks/mark?op=edit&output=popup&bkmk=",url,"&title=",title].join(''),
                pinterest:  ["http://pinterest.com/pin/create/button/?url=",url,"&media=&description=",title].join(''),
                vk:         ["http://vk.com/share.php?url=",url].join(''),
                linkedin:   ["http://www.linkedin.com/cws/share?url=",url,"&title=",title].join(''),
                mail:       ["mailto:?subject=Check out what I found on DHgate!&body=Hi! I found this on DHgate and thought you might like it! Check it out now:",url].join('')
            };
            //初始化事件
            this.initEvent();
        },
        //事件初始化
        initEvent: function() {
            this.$el.on('click', '.j-detailShare a', $.proxy(this.jump, this));
        },
        //跳转到三方网站进行分享
        jump: function(evt) {
            var name = $(evt.currentTarget).attr('data-name');
            window.open(this.thirdPartyUrl[name], "bookmarkWindow");
        }
    };
});