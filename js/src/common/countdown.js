/**
 * module src: common/countdown.js
 * 倒计时模块
**/
define('common/countdown', ['common/config', 'common/serverTime', 'lib/underscore'], function(CONFIG, serverTime, _){
    var CountDown = function(options) {
        //配置对象初始化
        this.setOptions(options);
        this.serverTime = this.options.serverTime*1;
        this.endTime = _.isFunction(this.options.endTime)?this.options.endTime()*1:(new Date(this.options.endTime)).getTime()*1;
        this.runCallback = this.options.runCallback;
        this.timer = null;

        //如果能够从配置中读取到服务器时间则直接启动倒计时
        this.serverTime>0?this.countDown():serverTime.get($.proxy(function(){
            //如果没有在配置中传入服务器时间，则调用
            //'common/serverTime'模块拉取服务器时间
            this.serverTime = arguments[0].time*1;
            //启动倒计时
            this.countDown();
        }, this));
    };

    //注册倒计时静态方法和属性
    $.extend(CountDown, {
        //初始化入口
        init: function(options) {
            return new CountDown(options);
        }
    });

    //注册倒计时原型方法和属性
    $.extend(CountDown.prototype, {
        //自定义配置对象
        setOptions: function(options) {
            this.options = {
                //服务器时间戳
                serverTime: '',
                /**
                 * 截止时间戳
                 * [字符串] typeof endTime === string
                 * 默认接受的字符串为new Date()标准支持的格式
                 * [回调函数] typeof endTime === function
                 * 也可以用自定义方法返回截止时间戳
                **/
                endTime: '',
                //倒计时回调函数
                runCallback: $.noop
            };
            $.extend(this.options, options||{});
        },
        //计算剩余时间
        remainingTime: function() {
                //当前时间
            var serverTime = this.serverTime,
                //截止时间
                endTime = this.endTime,
                //时间差
                difference = this.endTime - this.serverTime,
                //剩余天数
                day = parseInt(difference/(1000*60*60*24)),
                //剩余小时
                hour = parseInt(difference/(1000*60*60)%24),
                //剩余分钟
                minute = parseInt(difference/(1000*60)%60),
                //剩余秒
                second = parseInt(difference/(1000)%60),
                //剩余时间
                time = {};

            //设置的截止时间小于或等于当前时间则结束本次倒计时
            if (endTime - serverTime <= 0) {
                return -1;
            }

            //当天、小时、分钟、秒小于十添加前导零
            time.day = day<10?'0'+day:''+day;
            time.hour = hour<10?'0'+hour:''+hour;
            time.minute = minute<10?'0'+minute:''+minute;
            time.second = second<10?'0'+second:''+second;

            return time;
        },
        //倒计时
        countDown: function() {
            var self = this,
                //剩余时间
                time = this.remainingTime();

            //执行回调
            this.runCallback(time);
            //-1的情况下，终止倒计时
            if (time < 0) {
                return -1;
            }
            //清除计时器
            if (this.timer) {
                clearTimeout(this.timer);
            }
            //每隔1S自动执行一次
            this.timer = setTimeout($.proxy(this.countDown, this), 1000);
            //当前时间自动增加1S
            this.serverTime += 1000;
        }
    });

    return CountDown;
});