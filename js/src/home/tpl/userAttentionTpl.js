/**
 * module src: home/tpl/userAttentionTpl.js
 * BC类用户打标模版
 **/
define('appTpl/userAttentionTpl',[],function(){

    return {
        userAttention:[
            '<div class="userTypeLayer"></div>',
            '<div class="userAttentionWarp">',
                '<p class="aTitle"><%=$.lang["UTYPE_title"]%></p>',
                '<div class="atten wholesale" user-type="B">',
                    '<span class="wt"><%=$.lang["UTYPE_wholesale"]%></span>',
                    '<span class="wd"><%=$.lang["UTYPE_wh_des"]%></span>',
                '</div>',
                '<div class="atten personalUse" user-type="C">',
                    '<span class="pt"><%=$.lang["UTYPE_personal"]%></span>',
                    '<span class="pd"><%=$.lang["UTYPE_pe_des"]%></span>',
                '</div>',
                '<div class="description">',
                    '<p><%=$.lang["UTYPE_youcan1"]%></p>',
                    '<p><%=$.lang["UTYPE_youcan2"]%></p>',
                '</div>',
                '<span class="done default"><%=$.lang["UTYPE_done"]%></span>',
            '</div>'
        ]
    }
});