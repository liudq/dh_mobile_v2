/**
 * module src: common/header/suggest.js
 * 页面顶部搜索：推荐搜索关键词
**/
define('common/header/suggest', ['common/config', 'lib/backbone', 'tpl/header/suggestTpl', 'tools/fastclick','checkoutflow/dataErrorLog'], function(CONFIG, Backbone, tpl, FastClick,dataErrorLog){
    //model-推荐搜索关键词
    var SuggestModel = Backbone.Model.extend({
        //推荐关键词默认属性[attributes]
        defaults: function() {
            return {
                //状态码
                code: -1,
                //推荐关键词列表
                list: [{
                    key:'',
                    cid:'',
                    cateName:'',
                    labelList:[{
                        labelName:'',
                        labelValue:''
                    }]
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
                    //url: '/api.php?jsApiUrl=http://m.dhgate.com/mobileApiWeb/search-Search-suggest.do',
                    //url: 'http://css.dhresource.com/mobile_v2/css/search/html/wap-PageSearch-getLinkedKey.do',
                    url:'/mobileApiWeb/search-Search-suggest.do',
                    type: 'GET',
                    dataType: 'Json',
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
            return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
        },
        //server原始数据处理，并写入模型数据，在fetch|save时触发
        parse: function(res) {

            /**
             {
                "data": {
                "resultList": [
                    {
                        "key":"123123",
                        "cid":"018",
                        "cateName":"Boy1",
                        "count":1234,
                        "labelList":[{
                            "labelName":"red1",
                            "labelValue":"red1"
                        }]
                    }
                ]},
                "message": "Success",
                "serverTime": 1445826074976,
                "state": "0x0000"
                }
            **/
            var obj = {};
            obj.code = res.state==='0x0000'?200:-1;
            obj.list = [];
            
            if (obj.code !== -1) {
                if(res.data&&res.data.resultList){
                    $.each(res.data.resultList, function(index, pro){
                        var __obj = {}; 

                        __obj.key = pro.key;
                        __obj.cid = pro.cid;
                        __obj.cateName = pro.cateName;
                        __obj.labelList = pro.labelList;

                        obj.list.push(__obj);
                    });
                }
            }
            /**
             * 最终将其格式化为：
             list: [{
                    key:'',
                    cid:'',
                    cateName:'',
                    labelList:[{
                        labelName:'',
                        labelValue:''
                    }]
                }]
            **/
          
            return obj;
        }
    });
    
    //view-推荐搜索关键词
    var SuggestView = Backbone.View.extend({
        //根节点
        el: '#J_searchList',
        //backbone提供的事件集合
        events: {
            'click .j-searchlistClose': 'close'
        },
        //初始化入口
        initialize: function(options) {
            this.setOptions(options);
            this.cCloseBtn = this.options.cCloseBtn;
            this.cHide = this.options.cHide;
            this.cHot = this.options.cHot;
            this.dSearchInput = this.options.dSearchInput;
            this.template = this.options.template;
            this.model = this.options.model;
            this.dataErrorLog = this.options.dataErrorLog;
            this.FastClick = this.options.FastClick;
            /**
             * 缓存key:params，value:result，每次render的时
             * 候会根据当前请求的params是否能够在cache表中
             * 命中对应的数据，如果没有则发起新的数据请求
             * cache = {
             *    'q=shoes&limit=7&c=':   data1
             *    'q=wedding&limit=7&c=': data2
             *    'q=mp3&limit=7&c=':     data3
             *    ...
             * }
            **/
            this.cache = {};
           
            //初始化事件
            this.initEvent();
            //初始化$dom对象
            this.initElement()
            //获取url的key值并赋值给搜索框
            this.setKey();
        },
        //事件初始化
        initEvent: function() {
            this.on('render', this.load, this);
            //监听数据同步状态
            this.listenTo(this.model, 'sync', this.success);
            this.listenTo(this.model, 'error', this.error);
        },
        //$dom对象初始化
        initElement: function() {
            this.$body = this.body||$('body');
            this.$cCloseBtn = $(this.cCloseBtn);
            this.$dSearchInput = $(this.dSearchInput);
        },
        //设置自定义配置
        setOptions: function(options) {
            this.options = {
                //关闭按钮
                cCloseBtn: '.j-searchlistClose',
                //控制显示隐藏的className
                cHide: 'dhm-hide',
                //控制是否添加热门关键词的样式
                cHot: 'search-hot',
                //搜索框
                dSearchInput:'#J_searchInput',
                //模板
                template: _.template(tpl.join('')),
                //数据模型
                model: new SuggestModel(),
                //阻止点透的函数
                FastClick: FastClick,
                //收集请求后端接口数据异常数据
                dataErrorLog: new dataErrorLog({
                    flag: false,
                    url: '/mobileApiWeb/biz-FeedBack-log.do'
                })
            };
            $.extend(true, this.options, options||{});
        },
        //查询参数序列化
        //obj外部传入：{data:{q:'',limit:'',c:''}}
        //obj回调获取：{q:'',limit:'',c:''}
        getParam: function(obj) {
            return $.param(obj.data||obj);
        },
        //拉取数据模型
        load: function(paramsObj) {
            this.cache[this.getParam(paramsObj)]===undefined?this.model.fetch(paramsObj):this.render(null, this.getParam(paramsObj));
        },
        //拉取数据成功回调
        success: function(model, response, options) {
            if (model.get('code') === 200) {
                this.render(this.tplRender(this.getParam(options.data)), null);
            } else {
                //捕获异常
                try{
                    throw('success(): data is wrong');
                }catch(e){
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
        error: function(model, response, options) {
            //try{throw('error(): request is wrong');}catch(e){}
            //捕获异常
            try{
                throw('error(): request is wrong');
            }catch(e){
                //异常数据收集
                this.dataErrorLog.events.trigger('save:dataErrorLog', {
                    message: e,
                    url: this.model.__params.url,
                    params: this.model.__params.data
                });
            }
        },
        //模板渲染
        tplRender: function(key) {
            return (this.cache[key] = this.template(this.model.attributes));
        },
        //页面渲染
        //str非null，表示success回调传递过来的数据
        //key非null，表示命中缓存数据
        render: function(str, key) {
            var cache = key?this.cache[key]:'';

            //如果推荐结果为空则关闭推荐层
            (str||cache)?this.$el.html(str||cache).removeClass(this.cHide).removeClass(this.cHot):this.close();

            //重新初始化$dom对象
            this.initElement();

            //阻止关闭按钮点透
            this.$cCloseBtn[0]&&this.FastClick.attach(this.$cCloseBtn[0]);
        },
        //关闭
        close: function() {
            this.$el.addClass(this.cHide).html('');
        },
        //获取URl上面的参数
        getUrlParam:function(key){
            var url = location.href,
                paraString = url.substring(url.indexOf("?") + 1, url.length).split("&"),
                paraObj = {};

            for (var i = 0, j; j = paraString[i]; i++) {  
               paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);  
            }
            //排除key=wedding+dresses#aa中#aa 把‘+’去掉
            var returnValue = paraObj[key.toLowerCase()];
            if (typeof (returnValue) == "undefined") {  
               return "";  
            } else { 
               return returnValue.replace(/(.+)#.*/, '$1').replace(/\+/g, ' ');  
            }  
        },
        //设置搜索框的默认value值
        setKey:function(){
            var keyVal = this.getUrlParam('key')||'',
                dataKeyWord = this.$body.attr('data-keyword')||'';
          
            //判断url上有无key值，有的话取key值，没有的话
            //if(keyVal!==''){
               // this.$dSearchInput.addClass('inputtext');
                //this.$dSearchInput.val(decodeURIComponent(keyVal).replace('+',' '));
            //}else{
                if(dataKeyWord!==''){
                    this.$dSearchInput.addClass('inputtext');
                    this.$dSearchInput.val(decodeURIComponent(dataKeyWord));
                }else{
                    this.$dSearchInput.removeClass('inputtext');
                } 
            //}
            
        }
    });
    
    return SuggestView;
});
