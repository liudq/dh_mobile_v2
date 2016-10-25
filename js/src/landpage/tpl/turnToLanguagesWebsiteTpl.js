/**
 * module src: landpage/tpl/turnToLanguagesWebsiteTpl.js
 * 跳转到其他多语言站点的入口下拉列表模板
**/
define('appTpl/turnToLanguagesWebsiteTpl', [], function(){
    return [
        '<div id="J_shadow" class="shadow"></div>',
            '<div id="J_languageCont" class="language">',
            '<ul>',
                '<li class="tit">Select a Language</li>',
                '<li data-name="en"><a href="http://m.dhgate.com">English (EN)</a></li>',
                '<li data-name="es"><a href="http://m.es.dhgate.com">Español (ES)</a></li>',
                '<li data-name="pt"><a href="http://m.pt.dhgate.com">Português (PT)</a></li>',
                '<li data-name="ru"><a href="http://m.ru.dhgate.com">Русский (RU)</a></li>',
                '<li data-name="fr"><a href="http://m.fr.dhgate.com">Français (FR)</a></li>',
                '<li data-name="de"><a href="http://m.de.dhgate.com">Deutsch (DE)</a></li>',
                '<li data-name="it"><a href="http://m.it.dhgate.com">Italiano (IT)</a></li>',
            '</ul>',
            '<a class="j-languageCancel" href="javascript:;">Cancel</a>',
        '</div>'
    ];
});