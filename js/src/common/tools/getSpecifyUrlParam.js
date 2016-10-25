/**
 * module src: common/tools/getSpecifyUrlParam.js
 * 获取URL指定参数的值
**/
define('tools/getSpecifyUrlParam', ['common/config'], function(CONFIG){
    /**
     * 支持自定义传入待查询数据，并指定对应的匹配规则，配置说明如下：
     * 
     * //自定义配置项
     * options: {
     *     //参数字符串
     *     params: '',
     *     //查询的参数名称
     *     name: '',
     *     //用于查询的正则表达式
     *     reg: null
     * }
    **/
    var getSpecifyUrlParam = function(options) {
            //URL查询字符串（?a=1&b=2）
        var wwwSEARCH = options.params||CONFIG.wwwSEARCH,
            //匹配URL查询部分的正则表达式
            reg,
            //返回值
            value;

        //若不存在查询部分则返回空字符串
        if (!wwwSEARCH) {
            return '';
        }

        //设置正则表达式
        reg = options.reg||new RegExp('.+'+options.name+'=([^&#]*).*', 'i');
        //获取指定参数名的值
        value = wwwSEARCH.match(reg);
        
        //如果带有匹配结果则返回value[1]，否则返回空字符串
        return value!==null?value[1]:'';
    }
    
    return getSpecifyUrlParam;
});