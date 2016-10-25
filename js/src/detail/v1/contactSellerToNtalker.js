/**
 * module src: common/contactSellerToNtalker.js
 * 通过NTALKER与卖家进行联系
**/
define('app/contactSellerToNtalker', ['common/config', 'common/ntalker'], function(CONFIG, ntalker){
    return {
        init: function(options) {
            //初始化配置对象
            this.setOptions(options);
            this.el = this.options.el;
            this.uid = this.options.uid;
            this.sid = this.options.sid;
            this.supplierId = this.options.supplierId;
            this.productId = this.options.productId;
            this.productName = this.options.productName;
            
            //初始化$dom对象
            this.initElement();
            //初始化事件
            this.initEvent();
        },
        setOptions: function(options) {
            this.options = {
                //根节点
                el: 'body',
                //由buyerId换算出来的用户id
                uid: '',
                //由supplierid换算出来的商户id
                sid: '',
                //卖家id
                supplierId: '',
                //产品id
                productId: '',
                //产品名称
                productName: ''
            };
            $.extend(true, this.options, options||{});
        },
        //$dom对象初始化
        initElement: function() {
            this.$el = this.$el||$(this.el);
        },
        //事件初始化
        initEvent: function() {
            this.$el.on('click', '.j-ntalker', $.proxy(this.open, this));
        },
        //打开NTALKER聊天框
        open: function() {
            ntalker.events.trigger('Ntalker:open', {
                uid: this.uid,
                sid: this.sid,
                supplierId: this.supplierId,
                productId: this.productId,
                productName: this.productName
            });
        }
    };
});