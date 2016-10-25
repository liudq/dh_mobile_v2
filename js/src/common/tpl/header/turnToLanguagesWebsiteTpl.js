/**
 * module src: common/tpl/header/turnToLanguagesWebsiteTpl.js
 * 跳转到其他多语言站点的入口下拉列表模板
**/
define('tpl/header/turnToLanguagesWebsiteTpl', [], function(){
    return {
        //外层包裹容器
        warp: [
            '<div class="language-laye">',
                '<div id="J_languageCont" class="language-box">',
                    '{{list}}',
                    '<p class="laye-Cancel j-languageCancel"><a rel="nofollow" href="javascript:;"><%=$.lang["cancel"]%></a></p>',
                '</div>',
            '</div>'
        ],
        //多语言入口列表
        list: [
            '<ul>',
                '<li><a href="http://m.dhgate.com" rel="nofollow">English (EN)</a></li>',
                '<li><a href="http://m.es.dhgate.com" rel="nofollow">Español (ES)</a></li>',
                '<li><a href="http://m.pt.dhgate.com" rel="nofollow">Português (PT)</a></li>',
                '<li><a href="http://m.ru.dhgate.com" rel="nofollow">Русский (RU)</a></li>',
                '<li><a href="http://m.fr.dhgate.com" rel="nofollow">Français (FR)</a></li>',
                '<li><a href="http://m.de.dhgate.com" rel="nofollow">Deutsch (DE)</a></li>',
                '<li><a href="http://m.it.dhgate.com" rel="nofollow">Italiano (IT)</a></li>',
                '<li><a href="http://m.tr.dhgate.com" rel="nofollow">Türk (TR)</a></li>',
            '</ul>'
        ],
        //遮罩层
        shadow: [
            '<div id="J_shadow" class="language-shadow dhm-hide"></div>'
        ]
    };
});
