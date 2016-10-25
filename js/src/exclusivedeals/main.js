/**
 * module src: exclusivedeals/main.js
 * 入口文件
**/
define('app/main', [
        'common/langLoader',
        'app/exclusiveRecommend',
        'app/displayClassify'
    ], function(
        langLoader,
        ExclusiveRecommend,
        DisplayClassify
    ){
    //加载完语言包之后再执行其他逻辑
    langLoader.get(function(){
        //向页头顶部搜索添加移动专享价搜索参数
        (function(){
            $('.j-search-box').append('<input name="mobileonlydeal" type="hidden" value="1">');
        }());
    
        //专区推荐产品
        new ExclusiveRecommend({
            //拉取数据成功回掉
            successCallback: function(model){
                //展示更多分类列表
                var displayClassify = new DisplayClassify({
                    //设置“DisplayClassifyModel”数据模型的“defaults”
                    modelDefaults: $.extend(true, {}, {
                        code: 200,
                        categorys: $.extend(true, [], model.get('categorys'))
                    })
                });

                //关闭展示更多分类列表
                this.openCallback = function(tab) {
                    displayClassify.trigger('DisplayClassifyView:close', tab);
                };
            }
        });
    });
});