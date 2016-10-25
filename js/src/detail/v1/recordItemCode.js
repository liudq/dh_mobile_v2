/**
 * module src: detail/v1/recordItemCode.js
 * 将当前浏览产品的itemcode写入cookie
**/
define('app/recordItemCode', ['common/config'], function(CONFIG){
    return {
        set: function(itemCode) {
            var cookieValue,
                itemcodeArry,
                hash = {},
                newArr = [];
            
            //对旧有cookie做下线处理，删除.m.dhgate.com域下item_recentvisit的cookie值
            if (location.hostname === "m.dhgate.com") {
				$.cookie('item_recentvisit', itemCode, {
                    path: '/',
                    expires: -1,
                    domain: '.m.dhgate.com'
                });
			}
            
            //获取根域下item_recentvisit的cookie值
			cookieValue = $.cookie("item_recentvisit");
            //item_recentvisit这个cookie不存在则在根域下进行创建
			if (cookieValue === undefined) {
                //直接创建cookie并写入当前浏览产品的itemCode
				$.cookie('item_recentvisit', itemCode, {
                    path: '/',
                    expires: 7,
                    domain: '.dhgate.com'
                });
            //反之，将itemCode添加到item_recentvisit中
			} else {
                //容错处理，删除cookie值中不必要的双引号
                cookieValue = cookieValue.replace(/"/g, '');
                //item_recentvisit存储的itemCode转为数组
				itemcodeArry = cookieValue.split(",");
                //当前浏览产品的itemCode插入到数组的第一项
				itemcodeArry.unshift(itemCode);
                //进行排重处理
				for (var i = 0; i < itemcodeArry.length; i++) {
                    if (!hash[itemcodeArry[i]]) {
                        newArr.push(itemcodeArry[i]);
                        hash[itemcodeArry[i]] = true;
                    }
			    }
                //只记录最近浏览过的三个产品的itemCode
				if(newArr.length > 3) {
					newArr.pop();
				}
                //更新item_recentvisit的cookie值
				$.cookie("item_recentvisit", newArr.join(','), {
                    path :'/',
                    expires: 7,
                    domain:".dhgate.com"
                });
			}
        }
    }
});