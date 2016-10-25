/*
* 格式化时间 DD-MM-YYYY HH:MM
* */
define('app/formatTime',[],function(){
    return {
        get: function(time) {
            var date = new Date(time),
                year = date.getFullYear(),
                month = date.getMonth()+1,
                day = date.getDate(),
                hours = date.getHours(),
                Minutes = date.getMinutes();
            return (day<10?("0" + day):day) + '-' + (month<10?("0" + month):month) + '-' + year + ' ' + (hours<10?("0" + hours):hours) + ':' + (Minutes<10?("0" + Minutes):Minutes);
        }
    }
})