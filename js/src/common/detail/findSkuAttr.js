/**
 * module src: common/detail/findSkuAttr.js
 * 获取当前产品下的所有sku数据
 *
 * 返回的结果集包含三个主要部分：
 * 1、属性组列表:
 * [
 *     ['red'],
 *     ['s','m','l','xl','xxl']
 *     ...
 * ]
 * 2、sku属性值的拆分组合；
 * {
 *     "10": "N",
 *     "24": "N",
 *     "31": "N",
 *     "40": "N",
 *     ...
 *     "10_24_31_40": ["价格区间"...],
 *     "10_24_32_40": ["价格区间"...]
 *     ...
 * }
 * 3、每一条sku对应的价格区间
 * [
 *     {
 *     numLowerLimit: 1,
 *     numUpperLimit: 4,
 *     originalPrice: 63.91,
 *     discountPrice: 57.68
 *     }
 *     ...
 * ]
 *
 * sku算法 from internet:
 * url: http://www.360doc.com/content/15/1117/09/19704850_513756751.shtml
 * url: https://gist.github.com/shepherdwind/3074516
 * url: http://jsfiddle.net/cctvu/9Y54x/
**/

define('common/detail/findSkuAttr', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog'], function(CONFIG, tip, dataErrorLog){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: '/mobileApiWeb/item-Item-getDetailItemDto.do',
            //url: 'item-Item-getDetailItemDto.do',
            data: {}
        };

    //获取对象的key
    var getObjKeys = function(obj) {
        if (obj !== Object(obj)) {
            //数据异常，关闭loading
            tip.events.trigger('popupTip:loading', false);
            //展示数据错误信息【点击ok，刷新页面】
            tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Invalid object.'});
            //捕获异常
            try {
                throw('error(): Invalid object.');
            } catch(e) {
                //异常数据收集
                dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: __params.url,
                    params: __params.data
                });
            }
        }
        var keys = [];
        for (var key in obj)
            if (Object.prototype.hasOwnProperty.call(obj, key))
                keys[keys.length] = key;
        return keys;
    };

    //从数组中生成指定长度的组合
    var arrayCombine = function(targetArr) {
        if(!targetArr || !targetArr.length) {
            return [];
        }

        var len = targetArr.length;
        var resultArrs = [];

        //所有组合
        for(var n = 1; n < len; n++) {
            var flagArrs = getFlagArrs(len, n);
            while(flagArrs.length) {
                var flagArr = flagArrs.shift();
                var combArr = [];
                for(var i = 0; i < len; i++) {
                    flagArr[i] && combArr.push(targetArr[i]);
                }
                resultArrs.push(combArr);
            }
        }

        return resultArrs;
    };

    //获得从m中取n的所有组合
    var getFlagArrs = function(m, n) {
        if(!n || n < 1) {
            return [];
        }

        var resultArrs = [],
            flagArr = [],
            isEnd = false,
            i, j, leftCnt;

        for (i = 0; i < m; i++) {
            flagArr[i] = i < n ? 1 : 0;
        }

        resultArrs.push(flagArr.concat());

        while (!isEnd) {
            leftCnt = 0;
            for (i = 0; i < m - 1; i++) {
                if (flagArr[i] == 1 && flagArr[i+1] == 0) {
                    for(j = 0; j < i; j++) {
                        flagArr[j] = j < leftCnt ? 1 : 0;
                    }
                    flagArr[i] = 0;
                    flagArr[i+1] = 1;
                    var aTmp = flagArr.concat();
                    resultArrs.push(aTmp);
                    if(aTmp.slice(-n).join("").indexOf('0') == -1) {
                        isEnd = true;
                    }
                    break;
                }
                flagArr[i] == 1 && leftCnt++;
            }
        }
        return resultArrs;
    };

    //把组合的key放入结果集SKUResult
    var add2SKUResult = function(combArrItem, sku) {
        var key = combArrItem.join("_");
        //if(SKUResult[key]) {//SKU信息key属性
        //    SKUResult[key].id.push(sku.id);
        //} else {
        //    SKUResult[key] = {
        //        id : [sku.id]
        //    };
        //}
        SKUResult[key] = 'N';
    };

    //初始化得到SKU计算后的结果集
    var initSKU = function() {
        var i,
            j,
            skuKeys = getObjKeys(skuData);

        for(i = 0; i < skuKeys.length; i++) {
                //一条SKU信息key
            var skuKey = skuKeys[i],
                //一条SKU信息value
                sku = skuData[skuKey],
                //一条SKU对应的属性值拆分
                skuKeyAttrs = skuKey.split("_"),
                //一条SKU对应的属性值个数
                len = skuKeyAttrs.length;

            //对每个SKU信息key属性值进行拆分组合
            var combArr = arrayCombine(skuKeyAttrs);
            for(j = 0; j < combArr.length; j++) {
                add2SKUResult(combArr[j], sku);
            }

            //结果集接放入SKUResult
            SKUResult[skuKey] = $.extend({}, sku);
        }

        //更新skus字段
        serverParseData.skus = SKUResult;

        //释放内存
        skuData = null;
        SKUResult = null;
    };

        //API接口原始数据处理后的集合
    var serverParseData = {},
        //所有SKU结果信息
        skuData = {},
        //保存计算后的组合结果信息
        SKUResult = {};

    return {
        //初始化入口
        init: function(options) {
            this.fetch(options);
        },
        //获取需要传递的参数数据
        getParams: function(options) {
            var obj = {
                //通用接口参数
                client: 'wap',
                version: '0.1',
                //产品编号
                itemcode: options.itemcode
            };

            //__params捕获传递过来的参数数据
            $.extend(__params.data, obj);

            return obj;
        },
        //拉取sku相关数据
        fetch: function(options) {
            $.ajax({
                type: 'GET',
                url: __params.url,
                data: this.getParams(options),
                async: true,
                cache: false,
                dataType: 'json',
                context: this,
                success: function(res) {
                    //0x0000等于200成功状态
                    if (res.state==='0x0000') {
                        //取得格式化后的sku业务数据
                        this.parse(res);
                        //深拷贝sku原始数据
                        $.extend(true, skuData, serverParseData.skus);
                        //取得计算后的sku数据
                        initSKU();
                        //执行外部依赖逻辑
                        options.successCallback&&options.successCallback(serverParseData);
                    } else {
                        //数据异常，关闭loading
                        tip.events.trigger('popupTip:loading', false);
                        //展示数据接口错误信息【点击ok，关闭提示】
                        tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:res.message});
                        //捕获异常
                        try {
                            throw('success(): data is wrong');
                        } catch(e) {
                            //异常数据收集
                            dataErrorLog.events.trigger('save:dataErrorLog', {
                                message: e,
                                url: __params.url,
                                params: __params.data,
                                result: res
                            });
                        }
                    }
                },
                error: function() {
                    //数据异常，关闭loading
                    tip.events.trigger('popupTip:loading', false);
                    //展示数据接口错误信息【点击ok，关闭提示】
                    tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:'Network anomaly.'});
                    //捕获异常
                    try {
                        throw('error(): request is wrong');
                    } catch(e) {
                        //异常数据收集
                        dataErrorLog.events.trigger('save:dataErrorLog', {
                            message: e,
                            url: __params.url,
                            params: __params.data
                        });
                    }
                }
            });
        },
        //sku属性值排序
        skuAttrValsSort: function(skuAttrVals) {
            var arr = skuAttrVals.split('_');
            arr.sort(function(a, b){
                return parseInt(a) - parseInt(b);
            });
            return arr.join('_');
        },
        /**
         * parse（数据格式化）
         *
         * 接口地址：
         * /mobileApiWeb/item-Item-getDetailItemDto.do
         * 接口文档地址：
         * http://192.168.76.42:8090/display/MOB/02.+Item3.0
         *
         * 原始数据结构；
         * {
         *     "data": {
         *         //产品编号
         *         "itemcode": 239622494,
         *         //属性组列表
         *         "itemAttrList": [{
         *             //属性组id
         *             "attrId": 9999,
         *             //属性组名称
         *             "attrName": "Options",
         *             //属性组中的属性值列表
         *             "itemAttrvalList": [{
         *                 //属性组id
         *                 "attrId": 9999,
         *                 //属性名
         *                 "attrValName": "EU Plug",
         *                 //属性图片地址
         *                 "picUrl": 'http://www.dhresource.com/avim_980524009_00.jpg',
         *                 //属性值id
         *                 "attrValueId": 1000,
         *                 //属性值序号
         *                 "sortVal": 0
         *             }]
         *         }],
         *         //sku列表
         *         "itemSkuRelAttr": [{
         *             //skuId
         *             "skuId": "96420736722034688",
         *             //skuMd5
         *             "skuMd5": "80edd4995ff617b79dabdc0ce6699e58",
         *             //sku对应的属性值拼接
         *             "skuAttrVals": "1001_1002",
         *             //是否可售
         *             "skuSaleStatus": 1,
         *             //库存地国家id
         *             "inventoryLocation": "CN",
         *             //默认库存量
         *             "inventoryNum": 9999,
         *             //限时限量活动：活动库存量
         *             promoLimitNum: 8812,
         *             //限时限量活动：个人可购买的限时限量活动数量
         *             "promoLimitPurchaseNum": 127,
         *             ///**
         *              //* inventoryNum/promoLimitNum/promoLimitPurchaseNum
         *              //* 限时限量活动：单个sku最大购买数量
         *              //* 取上面这三个字段中的最小值
         *             ///**
         *             "minPurchaseNum": 127,
         *             ///**
         *              //* inventoryNum/promoLimitNum/promoLimitPurchaseNum
         *              //* 指出上面这三个字段中的最小值是谁：
         *              //* 1、默认库存量（默认值）
         *              //* 2、活动库存量
         *              //* 3、个人限购数量
         *             ///**
         *             "minInventoryNumFlag": 1,
         *             //sku价格区间列表
         *             "wholesaleQtyRangeList": [{
         *                 //折扣率
         *                 "discount": 0,
         *                 //购买数量下限
         *                 "startQty": 1,
         *                 //购买数量上限
         *                 "endQty": 9,
         *                 //原价
         *                 "originalPrice": 15.89,
         *                 //折扣价
         *                 "promDiscountPrice": 0,
         *                 //VIP价格
         *                 "vipPrice": 0
         *             }]
         *         }]
         *     },
         *     "message": "Success",
         *     "serverTime": 1466410133076,
         *     "state": "0x0000"
         * }
        **/
        parse: function(res) {
            var obj = {},
                self = this,
                //限时限量活动中所有可售sku最大购买数量列表
                maxPurchaseQuantitys = [],
                //所有可售sku库存量列表
                inventoryQuantitys = [];

            //状态码
            obj.code = (res.state==='0x0000'?200:-1);

            if (obj.code !== -1) {
                //产品编号
                obj.itemcode = res.data.itemcode;
                //产品属性组
                obj.attrGroups = [];
                $.each(res.data.itemAttrList||[], function(index, attrGroup){
                    var obj1 = {};
                    //属性组id
                    obj1.id = attrGroup.attrId;
                    //属性组名称
                    obj1.name = attrGroup.attrName;
                    //属性组中的属性值列表
                    obj1.attrs = [];
                    $.each(attrGroup.itemAttrvalList, function(index, attr){
                        var obj2 = {};
                        //属性值名称
                        obj2.name = attr.attrValName;
                        //属性值id
                        obj2.id = attr.attrValueId;
                        //属性图片地址
                        attr.picUrl&&(obj2.imgUrl=attr.picUrl);
                        //写入数据
                        obj1.attrs.push(obj2);
                    });
                    //写入数据
                    obj.attrGroups.push(obj1);
                });

                /**
                 * 产品SKU组合：
                 * 每个sku均包含对应的价格区间
                 * ======================================
                 * obj.skus['attr1[_attr2_attr3]']：
                 * 有属性的sku，包含多种组合；
                 * ======================================
                 * obj.skus['9999']：
                 * 无属性的sku只有一种组合，并且它的key值
                 * 是被指定为'9999'；
                **/
                obj.skus = {};
                $.each(res.data.itemSkuRelAttr||[], function(index, sku){
                    var obj1 = {};
                    //skuId
                    obj1.id = sku.skuId;
                    //skuMd5
                    obj1.Md5 = sku.skuMd5;
                    //sku库存国家id
                    obj1.inventoryCountryId = sku.inventoryLocation;
                    /**
                     * sku库存量:
                     * 如果参与限时限量活动，“sku库存量”取“sku默认库
                     * 存量”和“限时限量活动sku库存量”两者中的最小值；
                     * 如果没有参与限时限量活动，“sku库存量”就是“sku
                     * 默认库存量”；
                     *
                     * sku默认库存量 = sku.inventoryNum；
                     * 限时限量活动sku库存量 = sku.promoLimitNum；
                    **/
                    if (sku.promoLimitNum && sku.promoLimitNum>0) {
                        obj1.inventoryQuantity = Math.min(sku.inventoryNum, sku.promoLimitNum);
                        /**
                         * 限时限量活动中单个sku最大购买数量：
                         * sku.minPurchaseNum = “sku默认库存量”、“限
                         * 时限量活动sku库存量”、“个人可购买的限时限
                         * 量活动剩余数量”三者中的最小值；
                        **/
                        obj1.maxPurchaseQuantity = sku.minPurchaseNum;
                    } else {
                        obj1.inventoryQuantity = sku.inventoryNum;
                    }

                    //sku价格区间
                    obj1.priceRanges = [];
                    $.each(sku.wholesaleQtyRangeList, function(index, priceRange){
                        var obj2 = {};
                        //购买数量下限
                        obj2.numLowerLimit = priceRange.startQty;
                        //购买数量上限
                        obj2.numUpperLimit = priceRange.endQty;
                        //购买数量区间对应的原价
                        obj2.originalPrice = priceRange.originalPrice;
                        //购买数量区间对应的折扣价格
                        if (priceRange.vipPrice && priceRange.vipPrice>0) {
                            //VIP类型
                            obj2.discountPrice = priceRange.vipPrice;
                        } else {
                            //其他促销类型
                            obj2.discountPrice = priceRange.promDiscountPrice;
                        }
                        //写入数据
                        obj1.priceRanges.push(obj2);
                    });
                    
                    //无论产品处于什么状态默认都需要展示的价格区间
                    !obj.defaultPriceRanges&&(obj.defaultPriceRanges=$.extend(true, [], obj1.priceRanges));
                    
                    //过滤不可售的sku组合
                    if (sku.skuSaleStatus !== 0) {
                        //记录所有可售sku最大购买数量
                        maxPurchaseQuantitys.push(obj1.maxPurchaseQuantity||0);
                        //记录所有可售sku库存量
                        inventoryQuantitys.push(obj1.inventoryQuantity);

                        //有属性sku
                        if (obj.attrGroups.length>0 && sku.skuAttrVals!==undefined) {
                            obj.skus[self.skuAttrValsSort(sku.skuAttrVals)] = obj1;
                        //无属性sku
                        } else{
                            obj.skus['9999'] = obj1;
                        }
                    }
                });
                
                //查找可售sku中最大购买数量中的最小值，将其设置为默认展示的最大购买数量
                if (maxPurchaseQuantitys.length > 0) {
                    obj.defaultMaxPurchaseQuantity = Math.min.apply(Math, maxPurchaseQuantitys);
                } else {
                    obj.defaultMaxPurchaseQuantity = 0;
                }
                
                //查找可售sku库存量中的最大值，将其设置为默认展示的库存量
                if (inventoryQuantitys.length > 0) {
                    obj.defaultInventoryQuantity = Math.max.apply(Math, inventoryQuantitys);
                } else {
                    obj.defaultInventoryQuantity = 0;
                }
            }

            /**
             * 最终将其格式化为：
             * {
             *     code: 200,
             *     itemcode: 248424940,
             *     attrGroups: [{
             *         id: 700437,
             *         name: "Color",
             *         attrs: [{
             *             id: 1322942,
             *             name: "2",
             *             imgUrl: "http://www.dhresource.com/avim_980524009_00.jpg"
             *         }]
             *     }],
             *     defaultMaxPurchaseQuantity: 0,
             *     defaultInventoryQuantity: 5000,
             *     defaultPriceRanges: [{
             *         numLowerLimit: 1,
             *         numUpperLimit: 4,
             *         originalPrice: 63.91,
             *         discountPrice: 57.68
             *     }],
             *     skus: {
             *         "1001_1002": {
             *             id: '195434692942811157',
             *             Md5: 'a65af12dd22b4b5a375c480ce679c1ef',
             *             inventoryCountryId: 'CN',
             *             inventoryQuantity: '4999',
             *             maxPurchaseQuantity: '518',
             *             priceRanges: [{
             *                 numLowerLimit: 1,
             *                 numUpperLimit: 4,
             *                 originalPrice: 63.91,
             *                 discountPrice: 57.68
             *             }]
             *         }
             *         ...
             *     }
             * }
            **/
            serverParseData = obj;
        }
    };
});