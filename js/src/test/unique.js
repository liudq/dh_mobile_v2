/**
 * Created by liudongqing on 16/9/18.
 */
/*排重方法*/
function unique(arr){
    var ret = [];
    var hash = {};
    for(var i = 0;i<arr.length;i++){
        var item = arr[i];
        var key = typeof (item) + item;
        if(hash[key] !== 1){
            ret.push(item);
            hash[key] = 1;
        }
    }
    return ret;
}
/*序列化地址栏参数*/
function getNews() {
    var url = location.search.indexOf(1);
    var params = url.split("&");
    var newObj = {};
    for (var i=0;i<params.length;i++) {
        var key = params[i].split("=")[0];
        var value = params[i].split("=")[1];
        newObj[key] = value;
    }
    return newObj;
}
/*第二种方法*/
function getNews(){
    var args = {};
    var url = location.search.indexOf(1);
    var match = null;
    var reg = /(?:([^&]+)=([^&]+))/g;
    while((match = reg.exec(url)) !== null){
        args[match[1]] = match[1];
    }
    return args;
}
/*得出年月日十分秒时间格式*/
function parseDate(){

    with(new Date()){
        var t = function(a){
            return a<10?("0"+a):a;
        }
        return getFullYear() + "年" + t(getMonth() + 1) + "月" + t(getDate()) + "日" + t(getHours())+ "时" + t(getMinutes()) + "分" + t(getSeconds())+ "秒";

    }
}