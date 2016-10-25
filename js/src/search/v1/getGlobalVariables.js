/**
 * module src: search/v1/getGlobalVariables.js
 * 获取全局变量
**/
define('app/getGlobalVariables', ['common/config','checkoutflow/dataErrorLog'], function(CONFIG,dataErrorLog){
       //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        });
    /*此块数据是获取页面上的全局变量便于其他模块使用*/
     // var __DHLISTPARAMS__ = {
     //        "data":{
     //            //筛选所需参数
     //            "sp":{
     //                //排序类型 up\down （默认 up）
     //                "stype": "up",
     //                //排序对象包括：(1:bestmatch 2:price 3:recentlysold 4:operatedate 5:feedback 6:reviews) 
     //                "sinfo": "1",
     //                //只显示vip产品（1:是 0:否） 默认0
     //                "vip": "0",
     //                //所选类目或当前类目 （类目搜索和选中类目时必须传） 默认为空
     //                "cid": "",
     //                //只显示免运费商品 （1：是 0:否） 默认0
     //                "fs": "0",
     //                //最小价保留两位小数 （默认空）
     //                "minPrice": "",
     //                //最大价保留两位小数 （默认空）
     //                "maxPrice": "",
     //                //最小起订量正整数（ 默认空）
     //                "minOrder": "",
     //                //只显示零售 （1:是 0:否） 默认0
     //                "singleonly": "",
     //                //只显示移动专享产品 （1:是 0:否） 默认 0
     //                "mobileonlydeal": "",
     //                //关键词搜索时的关键词 （关键词搜索时必须传）
     //                "key": "",
     //                //相关搜索属性
     //                "at": "",
     //                //是否single piece 1:是
     //                "singleonly":"1",
     //                //是否使用新算法 1:是
     //                "algorithmTag": "",
     //                //用户选择标签
     //                "label":"",
     //                //是否gellery 视图 1：是
     //                "vt":"1",
     //                //是否搜索过滤 1：是
     //                "filter":"1" 
     //            },
     //            //搜索结果数
     //            "totalCounts":"",
     //            //类目名
     //            "catename":"",
     //            //默认排序选中名
     //            "sinfoName":"",
     //            //是否是vip
     //            "isvipbuyer":"",
     //            //跟踪码所需业务数据
     //            "trackParams":{
     //                //所有itemcodes
     //                "itemsCodes":"",
     //                //uid
     //                "uuid":"12312",
     //                //合作用户id
     //                "partnerId":"dfd",
     //                //第一个类目节点名称
     //                "firstCateName":"",
     //                //第二个类目节点名称
     //                "secondCateName":"",
     //                //第三个类目节点名称
     //                "thirdCateName":""
     //            }
                
     //        },
     //        "message": "Success",
     //        "serverTime": 1450162725244,
     //        "state": "0x0000"
     //    }

    return {
        init:function () {
            //初始化捕获异常
            if(typeof __DHLISTPARAMS__ !=='undefined'){
                if(__DHLISTPARAMS__.state!=='0x0000'){
                    this.getError();
                }
            }  
        },
        //返回数据
        get: function() {
            if(typeof __DHLISTPARAMS__ !=='undefined'){
                return __DHLISTPARAMS__
            }else{
                return ''
            }
        },
        //捕获异常
        getError: function(){
            //捕获异常
            try{
                throw('error(): data is wrong');
            }catch(e){
                //异常数据收集
                dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: __DHLISTPARAMS__.message,
                    url: CONFIG.wwwPATHNAME
                });
            }
        }
    };
});
