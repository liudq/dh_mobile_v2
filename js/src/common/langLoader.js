/**
 * module src:  common/langLoader.js
 * 加载国际化语言包
 * EN/ES/PT/RU/FR/DE/IT/TR
**/
define('common/langLoader', ['common/config'], function(CONFIG){
    //语言包加载器
    var langLoader = function() {}

    //注册静态方法和属性
    $.extend(langLoader, {
        //根节点
        $el: $('body'),
        //初始化入口
        init: function() {
            return new langLoader();
        },
        //语言包缓存
        cache: null,
        //标记是否已经拉取过语言包数据
        flag: false
    });

    //注册原型方法和属性
    $.extend(langLoader.prototype, {
        //添加队列
        add: function(func) {
            langLoader.$el.queue('langLoader', $.proxy(func, window));
        },
        //执行队列
        run: function(name) {
            var $el = langLoader.$el;
            if (!$el.queue(name).length) {
                return false;
            }
            $el.dequeue(name);
            this.run(name);
        },
        //获取语言包数据
        get: function(callback) {
            //命中缓存数据则直接执行
            if (langLoader.cache !== null) {
                callback();
            //否则添加到队列中，随后在ajax:success()中得到执行
            } else {
                this.add(callback);
            }

            if (!langLoader.flag) {
                $.ajax({
                    type: 'GET',
                    url: '//js.dhresource.com/mobile_v2/common/lang/common_msg_'+CONFIG.countryCur+'.js?v='+CONFIG.version,
                    context: this,
                    async: true,
                    cache: true,
                    dataType: 'script',
                    success: function(res) {
                        //写入缓存
                        this.cache = 'y';
                        //执行队列中的所有回调函数
                        this.run('langLoader');
                    }
                });
            }

            //改变flag状态
            langLoader.flag = true;
        }
    });

    return langLoader.init();
});
