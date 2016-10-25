/**
 * module src: detail/v1/preprocessingSyncData.js
 * 预处理后端模板页面同步出来的业务数据
**/
define('app/preprocessingSyncData', ['common/config', 'checkoutflow/popupTip', 'checkoutflow/dataErrorLog', 'tools/fastclick'], function(CONFIG, tip, dataErrorLog, FastClick){
        //收集请求后端接口异常数据
    var dataErrorLog = new dataErrorLog({
            flag: true,
            url: '/mobileApiWeb/biz-FeedBack-log.do'
        }),
        //请求异常的时候“dataErrorLog”会捕获“__params”
        __params = {
            url: window.location.href,
            data: {}
        };
    
    return {
        //初始化入口
        init: function(options) {
            //解决click事件的300毫秒延时
            //阻止大多数设备上的点透问题
            FastClick.attach($('body')[0]);
            //成功回调
            this.successCallback = options.successCallback;
            //拉取数据
            this.fetch();
        },
        //拉取同步数据
        fetch: function() {
            //原始数据
            var __DHDETAIL = window.DHDETAIL||{};
            /**
             * 同步数据接口中几个核心字段有：
             * productId/supplierid/itemCode/measureName，
             * 以上字段均为“添加购物车”、“立即购买”接口所
             * 必需的参数，在无法从同步数据接口中取得时，
             * 将抛出异常提示用户；
            **/
            if (!__DHDETAIL.data || !__DHDETAIL.data.productId || !__DHDETAIL.data.supplierid || !__DHDETAIL.data.itemCode || !__DHDETAIL.data.measureName) {
                //抛出异常【点击ok，刷新页面】
                tip.events.trigger('popupTip:dataErrorTip', {action:'refresh',message:'Service exception.'});
                //捕获异常
                try {
                    throw('error(): Service exception.');
                } catch(e) {
                    //异常数据收集
                    dataErrorLog.events.trigger('save:dataErrorLog', {
                        message: e,
                        url: __params.url,
                        params: __params.data,
                        result: __DHDETAIL
                    });
                }
                return;
            }

            //其他情况的异常捕获
            if (__DHDETAIL.state !== '0x0000') {
                //捕获异常
                try {
                    throw('success(): data is wrong');
                } catch(e) {
                    //异常数据收集
                    dataErrorLog.events.trigger('save:dataErrorLog', {
                        message: e,
                        url: __params.url,
                        params: __params.data,
                        result: __DHDETAIL
                    });
                }
            }

            //原始数据处理
            this.parse(__DHDETAIL.data);
        },
        //设置显示的最大最小价格
        setDisplayPrice: function(res, isVip) {
            var obj = {};
            //非VIP、无促销，显示价格为原价
            if (isVip===false && !res.promoDto) {
                obj.minPrice = res.minPrice;
                obj.maxPrice = res.maxPrice;
            //VIP，显示价格为VIP价格
            } else if (isVip===true && res.vipDto) {
                obj.minPrice = res.vipDto.minVipPrice;
                obj.maxPrice = res.vipDto.maxVipPrice;
            //非VIP、有促销，显示价格为促销价
            } else if (isVip===false && res.promoDto) {
                obj.minPrice = res.promoDto.promoMinPrice;
                obj.maxPrice = res.promoDto.promoMaxPrice;
            }

            //查看最大价和最小价格是否相等（显示为单价）
            obj.isEqual = (obj.minPrice === obj.maxPrice) ? true : false;

            return obj;
        },
        //设置删除的最大最小价格
        setDeletePrice: function(res, isVip) {
            var obj = {};
            //非VIP、无促销，不需要显示任何价格
            if (isVip===false && !res.promoDto) {
                obj = '';
            //[VIP、无促销|非VIP、有促销]，显示原价
            } else if ((isVip===true&&!res.promoDto) || (isVip===false&&res.promoDto)) {
                obj.minPrice = res.minPrice;
                obj.maxPrice = res.maxPrice;
            //VIP、有促销，显示价格为促销价
            } else if (isVip===true && res.promoDto) {
                obj.minPrice = res.promoDto.promoMinPrice;
                obj.maxPrice = res.promoDto.promoMaxPrice;
            }

            //查看最大价和最小价格是否相等（显示为单价）
            obj.isEqual = (obj.minPrice === obj.maxPrice) ? true : false;
            
            return obj;
        },
        /**
         * parse（数据格式化）
         *
         * 原始数据结构；
         * {
         *     data: {
         *         //买家id
         *         buyerId: "ff8080814cd68ab5014cfe031a596581",
         *         //由buyerId换算出来的用户id
         *         uid: "1163900761",
         *         //卖家id
         *         supplierid: "ff8080812969b39f01296a6cb715353d",
         *         //由supplierid换算出来的商户id
         *         sid: "1422176495",
         *         //产品id
         *         productId: "ff8080814e3ee590014eb9ab52cd0c4b",
         *         //产品名称
         *         productName: "2016 Wedding Dresses Real Image Luxury Crystal Bridal Gowns Beads Sheer Long Sleeves Wedding Dress Crystals Backless",
         *         //产品编号
         *         itemCode: 248375094,
         *         //展示类目id
         *         cateDispId: "002002001",
         *         //产品是否可售
         *         istate: true,
         *         //是否可以运达到当前目的国家
         *         isShipto: true,
         *         //产品最小价
         *         minPrice: 110.76,
         *         //产品最大价
         *         maxPrice: 179.92,
         *         //最小购买数量
         *         minOrder: 1,
         *         ///**
         *          //* 是否按包卖（1:按件卖，>1按包卖）
         *          //* lot=1：一件为一包也就是按件卖
         *          //* lot=5：五件为一包也就是按包卖
         *         ///**
         *         lot: 5,
         *         //购买产品单数计量单位
         *         measureName: "Piece",
         *         //购买产品复数计量单位
         *         plural: "Pieces",
         *         //促销相关信息
         *         promoDto: {
         *             //促销截止时间
         *             promEndDate: 1466524740000,
         *             //促销类型
         *             typeId: 5,
         *             //促销最小价格
         *             promoMinPrice: 100.02,
         *             //促销最大价格
         *             promoMaxPrice: 120.01
         *         },
         *         //VIP相关信息
         *         vipDto: {
         *             //VIP最小价格
         *             minVipPrice: 94.94,
         *             //VIP最大价格
         *             maxVipPrice: 117.56
         *         },
         *         //sku弾层默认展示的缩略图
         *         thumbList: [
         *             "http://www.dhresource.com/600x600/f2/albu/g4/M01/7F/73/rBVaEFdfXZqASZ16AAH5qOf2Qsk950.jpg"
         *         ],
         *         //首屏原图列表
         *         oriImgList: [
         *             "http://www.dhresource.com/0x0/f2/albu/g3/M01/2C/DF/rBVaHFanNWmAF9h5AAGaea2IgLc908.jpg",
         *             "http://www.dhresource.com/0x0/f2/albu/g3/M01/C8/EF/rBVaHFWwjaaACyG3AAMukjxUsCs655.jpg",
         *             "http://www.dhresource.com/0x0/f2/albu/g3/M01/D9/ED/rBVaHVWwjaWAQR-TAAGiai4vNp0170.jpg",
         *             "http://www.dhresource.com/0x0/f2/albu/g3/M00/2F/D1/rBVaHVWwjaaAWfXHAAYbKWVGJ5E326.jpg",
         *             "http://www.dhresource.com/0x0/f2/albu/g3/M00/E5/D3/rBVaHFWwjaaAA93fAARCUexQiwQ019.jpg",
         *             "http://www.dhresource.com/0x0/f2/albu/g3/M00/5F/87/rBVaHFWwjaWARKAfAAHYKIV155A869.jpg",
         *             "http://www.dhresource.com/0x0/f2/albu/g3/M01/A3/64/rBVaHFWwjaWAPfkrAAMJe99IBgA527.jpg",
         *             "http://www.dhresource.com/0x0/f2/albu/g3/M00/A2/21/rBVaHVWwjaWAOuQYAAFuFzsQPCw742.jpg"
         *         ],
         *         //第三方统计代码相关信息
         *         thirdParty: {
         *             //发布类目id
         *             catepubid: "002001001",
         *             //一级类目名称
         *             firstCateName: "Hair Products",
         *             //二级类目名称
         *             secondCateName: "Hair Extensions",
         *             //三级类目名称
         *             thirdCateName: "Hair Wefts",
         *             //类目路径
         *             cateDispPath: [
         *                 "Hair Products",
         *                 "Hair Extensions",
         *                 "Hair Wefts"
         *             ],
         *             //短描
         *             shortDescription: "1.100% human hair 2. Double weft ,no shedding no tangle 3. Unprocessed hair 4.Factory supply directly high quality"
         *         }
         *     },
         *     message: "Success",
         *     serverTime: 1445829278080,
         *     state: "0x0000"
         * }
        **/
        parse: function(res) {
            var obj = {};
            //是否为VIP用户
            obj.isVip = CONFIG.b2b_buyer_lv==='1'&&res.vipDto?true:false;
            //买家id
            obj.buyerId = res.buyerId||CONFIG.b2b_buyerid;
            //用户id
            obj.uid = res.uid||'';
            //卖家id
            obj.supplierid = res.supplierid;
            //商户id
            obj.sid = res.sid||'';
            //展示类目id
            obj.cateDispId = res.cateDispId||'';
            //产品id
            obj.productId = res.productId;
            //产品名称
            obj.productName = res.productName;
            //产品编号
            obj.itemCode = res.itemCode;
            //产品是否可售
            obj.istate = res.istate;
            //产品是否可运达
            obj.isShipto = res.isShipto;
            //显示的最大最小价格
            obj.displayPrice = this.setDisplayPrice(res, obj.isVip);
            //删除的最大最小价格
            obj.deletePrice = this.setDeletePrice(res, obj.isVip);
            //最小购买数量
            obj.minOrder = res.minOrder;
            /**
             * 是否按包卖（1:按件卖，>1按包卖）
             * lot=1：一件为一包也就是按件卖
             * lot=5：五件为一包也就是按包卖
            **/
            obj.lot = res.lot;
            //购买产品单数计量单位
            obj.measureName = res.measureName;
            //购买产品复数计量单位
            obj.plural = res.plural;
            //促销类型
            obj.promoTypeId = res.promoDto?res.promoDto.typeId:-1;
            //促销截止时间
            obj.promEndDate = res.promoDto?res.promoDto.promEndDate:-1;
            //sku弾层默认展示的缩略图
            obj.thumbList = res.thumbList||[];
            //首屏原图列表
            obj.oriImgList = res.oriImgList||[];
            //发布类目id
            obj.catepubid = res.thirdParty&&(res.thirdParty.catepubid||'');
            //一级类目名称
            obj.firstCateName = res.thirdParty&&(res.thirdParty.firstCateName||'');
            //二级类目名称
            obj.secondCateName = res.thirdParty&&(res.thirdParty.secondCateName||'');
            //三级类目名称
            obj.thirdCateName = res.thirdParty&&(res.thirdParty.thirdCateName||'');
            //类目路径
            obj.cateDispPath = res.thirdParty&&(res.thirdParty.cateDispPath||[]);
            //短描
            obj.shortDescription = res.thirdParty&&(res.thirdParty.shortDescription||'');

            //删除全局变量
            delete window.DHDETAIL;
            
            /**
             * 最终将其格式化为：
             * {
             *     isVip: false,
             *     buyerId: '',
             *     uid: '',
             *     supplierid: '',
             *     cateDispId: '',
             *     productId: '',
             *     productName: '',
             *     itemCode: -1,
             *     istate: true,
             *     isShipto: true,
             *     displayPrice: {
             *         minPrice: -1,
             *         maxPrice: -1,
             *         isEqual: false
             *     },
             *     deletePrice: {
             *         minPrice: -1,
             *         maxPrice: -1,
             *         isEqual: false
             *     },
             *     minOrder: -1,
             *     lot: -1,
             *     measureName: '',
             *     plural: '',
             *     promoTypeId: -1,
             *     promEndDate: -1,
             *     thumbList: [],
             *     oriImgList: [],
             *     catepubid: '',
             *     firstCateName: '',
             *     secondCateName: '',
             *     thirdCateName: '',
             *     cateDispPath: [],
             *     shortDescription: ''
             * }
            **/
            this.successCallback&&this.successCallback(obj);
        }
    };
});