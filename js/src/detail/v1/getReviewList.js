/**
 * module src: common/detail/getReviewList.js
 * 获取评论列表
**/
define('app/getReviewList', ['common/config','appTpl/getReviewListTpl','checkoutflow/popupTip','checkoutflow/dataErrorLog'], function(CONFIG,tpl,tip,dataErrorLog){
    //model-评论列表
    var reviewListModel = Backbone.Model.extend({
        //默认展示评论列表初始化属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //评论总数
                reviewCount: -1,
                //评论列表
                list: [{
                    //评分
                    score: -1,
                    //买家昵称
                    nickName: '',
                    //评价日期
                    createdDate: '',
                    //买家评论内容
                    buyerReviewText: '',
                    //买家上传的评论图片地址
                    imageUrl: [],
                    //卖家回复评论
                    sellerReviewText: ''
                }]
            };
        },
        /**
         * 初始化入口
         * argument[0|1]:
         * 0: [attributes]
         * 1: [options]
        **/
        initialize: function() {
            //自定义配置对象初始化
            this.setOptions(arguments[1]);
            this.ajaxOptions = this.options.ajaxOptions;
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //$.ajax()配置对象
                ajaxOptions: {
                    url: CONFIG.wwwURL + '/mobileApiWeb/item-Item-loadReviewPage.do',
                    //url: 'review.json',
                    data: {
                        version: '3.3',
                        client: 'wap'
                    },
                    type: 'GET',
                    dataType: 'json',
                    async: true,
                    cache: false,
                    //发送到服务器的数据，将自动转换为请求字符串格式
                    //例如：{foo:["bar1", "bar2"]} 转换为 "&foo=bar1&foo=bar2"
                    //在此处显示告诉$.ajax()需要对象序列化，这样就不需要设置
                    //Backbone.emulateJSON = true
                    processData: true
                }
            };
            $.extend(true, this.options, options||{});
        },
        //设置生成模型的url
        urlRoot: function() {
            //return CONFIG.wwwURL + this.ajaxOptions.url;
            return this.ajaxOptions.url;
        },
        //为适配non-RESTful服务端接口，重载model.sync
        sync: function(method, model, options) {
            //请求异常的时候“dataErrorLog”会捕获“__params”
            this.__params = $.extend(true, {}, this.ajaxOptions, options||{});
            //发送请求
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {
            /**
             * parse（数据格式化）
             *
             * 接口地址：
             * /mobileApiWeb/item-Item-loadReviewPage.do
             * 接口文档地址：http://192.168.76.42:8090/display/MOB/02.+Item3.0
             *
             * 原始数据结构
             * {
             *     "data": {
             *         //分页信息
             *         "pageBean": {
             *             "count": 1,
             *             "endNo": 16,
             *             "nextPageNo": 1,
             *             "page": 1,
             *             "pageSize": 16,
             *             "pages": 1,
             *             "prePageNo": 1,
             *             "startNo": 1
             *         },
             *         //评论列表
             *         "resultList": [{
             *             "buyerNickname": "lolita_1439442696612",
             *             "buyerid": "ff8080814f1a8598014f257879bf681c",
             *             "buyerlevel": "0",
             *             "canBeReplied": false,
             *             "cateDispId": "002002026",
             *             "content": "juste wahouuuuu",
             *             "countryFullname": "France",
             *             "countryid": "FR",
             *             "createdDateText": "Sep 8,2015",
             *             "createddate": 1441723335000,
             *             "fromSite": "en",
             *             "helpfulcount": 2,
             *             "helplesscount": 0,
             *             "isAnonymity": "1",
             *             "isShare": "0",
             *             "prodquicktype": "0",
             *             "productid": "ff80808144aa7ac30144cf064a237dd3",
             *             "reprotIsExit": false,
             *             "reviewType": "1",
             *             "reviewid": 81614546,
             *             "rfxid": "ff8080814f17c848014f25e0616c10cd",
             *             "rfxproductid": "ff8080814f17c848014f25e0635b10d5",
             *             "score": 4,
             *             "status": "R",
             *             "supplierid": "ff80808131f62343013205c127012850",
             *             "tdAttachDto": {
             *                 "delStatus": "0",
             *                 "id": "ff8080814fa1c099014fad6845954085",
             *                 "imageUrl": "review_1115053290_00.jpg;",
             *                 "imgMap": {
             *                     "img0": "http://www.dhresource.com/review_1115053290_00.jpg"
             *                 },
             *                 "reviewId": 81614546
             *             },
             *             "responseDTO": {
             *                 "content": "All buyers confirmed the shoes are great quality, I don't know why this guy don't like them.."
             *             }
             *         }]
             *     },
             *     //调用接口返回成功或错误的信息
             *     "message":"Success",
             *     //服务器时间
             *     "serverTime":1444460214692,
             *     //状态码
             *     "state":"0x0000"
             * }
            **/
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            //评论列表
            obj.list = [];
            if (obj.code !== -1) {
                //评论总数
                obj.reviewCount = res.data.pageBean.count;
                $.each(res.data.result||[], function(index, review){
                    var __obj = {};
                        __obj.imageUrl = [];
                    __obj.score = review.score*20;
                    __obj.nickName = review.buyerNickname;
                    __obj.createdDate = review.createdDateText;
                    __obj.buyerReviewText = review.content;
                    if (review.tdAttachDto !== undefined) {
                        $.each(review.tdAttachDto.imgMap||[], function(index, url){
                            __obj.imageUrl.push(url);
                        })
                    }
                    __obj.sellerReviewText = review.responseDTO !== undefined ? review.responseDTO.count :'';
                    obj.list.push(__obj);
                });
            }
            /**
             * 最终将其格式化为：
             * {
             *     code: -1,
             *     reviewCount: -1,
             *     list: [{
             *         score: -1,
             *         nickName: '',
             *         createdDate: '',
             *         buyerReviewText: '',
             *         imageUrl: [],
             *         sellerReviewText: ''
             *     }]
             * }
            **/
            return obj;
        }
    });

    //view-评论列表
    var reviewListView =Backbone.View.extend({
        //根节点
        el: 'body',
        //backbone提供的事件集合
        events: {
            'click .j-review-more': 'reviewMore'
        },
        //初始化入口
        initialize: function(options){
            //配置对象初始化
            this.setOptions(options);
            this.pageNum = this.options.pageNum;
            this.cJReviewCon = this.options.cJReviewCon;
            this.cJReviewMore = this.options.cJReviewMore;
            this.itemcode = this.options.syncData.itemCode;
            this.productId = this.options.syncData.productId;
            this.template = this.options.template;
            this.tpl = this.options.tpl;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;

            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
            
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //设置当前页数
                pageNum: 1,
                //获取评论列表外层包裹容器
                cJReviewCon:'.j-review-con',
                //评论列表showMore按钮
                cJReviewMore:'.j-review-more',
                //产品编号
                itemcode: -1,
                //产品id
                productId: '',
                //模板引擎
                template: _.template,
                //模板
                tpl: tpl,
                //数据模型
                model: new reviewListModel(),
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: true,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                //关闭loading
                tip.events.trigger('popupTip:loading', false);
                //绘制页面
                this.render(model.attributes);          
            } else {
                //数据异常，关闭loading
                tip.events.trigger('popupTip:loading', false);
                //展示数据接口错误信息【点击ok，关闭提示】
                tip.events.trigger('popupTip:dataErrorTip', {action:'close',message:response.message});
                //捕获异常
                try {
                    throw('success(): data is wrong');
                } catch(e) {
                    //异常数据收集
                    this.dataErrorLog.events.trigger('save:dataErrorLog', {
                        message: e,
                        url: this.model.__params.url,
                        params: this.model.__params.data,
                        result: response
                    });
                }
            }
        },
        //拉取数据失败回调
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
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
        },
        //$dom对象初始化
        initElement: function() {
            this.$cJReviewCon = $(this.cJReviewCon);
            this.$cJReviewMore = $(this.cJReviewMore);
        },
        //事件初始化
        initEvent: function() {
             //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //拉取当前页评论数据
        reviewMore: function(){
            //打开loading
            tip.events.trigger('popupTip:loading', true);
            //拉取数据
            this.model.fetch({data:{
                itemcode: this.itemcode,
                productId: this.productId,
                pageNum: ++this.pageNum
            }});
        },
        //页面整体渲染
        render: function(data) {
            //模板引擎
            var template = this.template,
                //模板
                tpl = this.tpl,
                //主体内容模板
                main = template(tpl.main.join(''))(data);

            //页面绘制        
            this.$cJReviewCon.append(main);
            //移除showMore按钮
            this.hideShowMore();
        },
        //移除showMore按钮
        hideShowMore: function(){
            var len = this.model.get('list').length,
                reviewCount = (this.pageNum-1)*10+len;
            if (reviewCount >= this.model.get('reviewCount')) {
                this.$cJReviewMore.remove();
            }
        }
    });
    
    return reviewListView;
});