/*
 * module src:storeShop/storeCoupon.js
 * 店铺coupon模块
 * */
define('app/storeCoupon',['common/config', 'lib/backbone', 'appTpl/storeCouponTpl'],function(CONFIG, Backbone, tpl){
	//model 店铺coupon信息
	var storeCouponModel = Backbone.Model.extend({
		//店铺coupon初始化属性[attributes]
		defaults:function(){
			return {
				//状态码
				code: 200,
				currencyText: '',//价格类型
				couponList: [{
					couponCode: '',//coupon编号
					couponAmount: '',//coupon 金额
					minOrderAmount: '',//使用coupon的最小订单金额
					startDate: '',//活动开始时间
					endDate: '',//活动结束时间
					totalNumber: '',//获取优惠券的人数控制(0:不控制；>0前几个买家可以获取)
					usedNumber: '',//coupon已经被领取的个数
					ifBuyerBind: '',//当前用户是否已经领过该coupon
					validday: '',//优惠券有效期
					couponStartDate: '',//优惠券获赠时间
					couponEndDate: '',//优惠券到期时间
					valid: ''//是否是有效的活动 1：有效活动；0：已被删除活动
				}]
			}
		},
		initialize: function() {
			//自定义配置对象初始化
			this.setOptions(arguments[1]);
			this.ajaxOptions = this.options.ajaxOptions;
		},
		//设置自定义配置
		setOptions:function(options){
			this.options = {
				ajaxOptions:{
					//url:'/mobile_v2/css/storeShop/html/coupon.do',
					url: '/mobileApiWeb/coupon-Coupon-getSellerCoupon.do',
					data:{
						//通用接口参数
						client:'wap',
						language:'en'
					},
					type:'GET',
					dataType:'json',
					async:true,
					cache:false,
					processData:true
				}
			};
			$.extend(true,this.options,options||{});
		},
		//设置生成模型的url
		urlRoot: function() {
			return this.ajaxOptions.url;
		},
		//为适配non-RESTful服务端接口，重载model.sync
		sync: function(method, model, options) {
			//发送请求
			return Backbone.sync.call(this, null, this, $.extend(true, {}, this.ajaxOptions, {url: this.url()}, options));
		},

		//server原始数据处理，并写入模型数据，在fetch|save时触发
		parse: function(res) {
			/**
			 * parse（数据格式化）
			 *
			 * 接口地址：
			 * /mobileApiWeb/coupon-Coupon-getSellerCoupon.do
			 * 接口文档地址：https://dhgatemobile.atlassian.net/wiki/pages/viewpage.action?pageId=29818888
			 *
			 * 原始数据结构
			 {
				 "data":{
					 "currencyText":"US $", //价格类型
					 "resultList":[
						 {
							 "campaignId":"123123", //活动id
							 "campaignName":5.0, //活动名称
							 "couponCode":"123123", //coupon编号
							 "couponAmount":12, //coupon 金额
							 "minOrderAmount":100, //使用coupon的最小订单金额
							 "startDate":1123456454//活动开始时间
							 "endDate":321345646, //活动结束时间
							 "platform":"all", //使用平台,0 all;1 PC;2 Mobile;3 App;4 Wap;5 英文站专用;6 俄文站专用;7 法文站专用;8 西班牙站专用;9 葡萄牙站专用;10 德文站专用;11 意大利站专用;
							 "totalNumber":200, //获取优惠券的人数控制(0:不控制；>0前几个买家可以获取)
							 "usedNumber":150, //coupon已经被领取的个数
							 "ifBuyerBind":true, //当前用户是否已经领过该coupon
							 "validday":7, //优惠券有效期
							 "couponStartDate":1231546542, //优惠券获赠时间
							 "couponEndDate":12546561686, //优惠券到期时间
							 "valid":"1" //是否是有效的活动 1：有效活动；0：已被删除活动
						 }
				 ]
				 },
				 "message":"Success","serverTime":1454307909079,"state":"0x0000"}
			 }
			 */
			var obj = {},
				_self = this;
			obj.code = (res.state==='0x0000'?200:-1);
			obj.currencyText = '';
			obj.couponList =[];
			if (obj.code !== -1) {
				//初始接口里面传过来的coupon list
				if(res.data){
					obj.currencyText = (res.data.currencyText).charAt(res.data.currencyText.length - 1);
					if(res.data.resultList) {
						$.each(res.data.resultList, function (index, pro) {
							var __obj2 = {};
							__obj2.couponCode = pro.couponCode;
							__obj2.couponAmount = pro.couponAmount;
							__obj2.minOrderAmount = pro.minOrderAmount;
							__obj2.startDate = pro.startDate;
							__obj2.endDate = pro.endDate;
							__obj2.totalNumber = pro.totalNumber;
							__obj2.usedNumber = pro.usedNumber;
							__obj2.ifBuyerBind = pro.ifBuyerBind;
							__obj2.validday = pro.validday;
							__obj2.platform = pro.platform;
							__obj2.couponStartDate = pro.couponStartDate;
							__obj2.couponEndDate = pro.couponEndDate;
							__obj2.expiresTime = _self.expiresTime(pro.endDate,pro.validday);
							obj.couponList.push(__obj2);
						});
					}
				};
			}
			return obj;
		},
		//优惠券有效日期
		expiresTime:function(endtime,validity){
			//优惠券有效日期=活动结束日期+优惠券有效期xx天
			var time = endtime + validity*24*60*60*1000;
			var year = new Date(time).getFullYear();
			var month = new Date(time).getMonth();
			var day = new Date(time).getDate();
			var monthArray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] ;
			var timeDetail = monthArray[month]+'  '+day+', '+year;
			return timeDetail;
		}
	});
	//view coupon列表初始化
	var storeCouponView = Backbone.View.extend({
		//根节点
		el:'body',
		events:{
			'click .coupon-title':'openCouponLayer',
			'click .usable':'bindCoupon',
			'click .j-back':'closelayer',
			'click .j-back-left':'closelayer'
		},

		//初始化入口
		initialize: function(options) {
			//配置对象初始化
			this.setOptions(options);
			this.$dRoot = $(this.options.$dRoot);
			this.SCouponBtn = $(this.options.SCouponBtn);
			this.sCouponTitleBtn = $(this.options.sCouponTitleBtn);
			this.sCouponListWrap = $(this.options.sCouponListWrap);
			this.sCouponlayer = $(this.options.sCouponlayer);
			this.sCouponClose = $(this.options.sCouponClose);
			this.sCouponBack = $(this.options.sCouponBack);
			this.usable = $(this.options.usable);
			this.couponCode = this.options.couponCode;
			this.template = this.options.template;
			this.tpl = this.options.tpl;
			this.model = this.options.model;
			this.successCallback = this.options.successCallback;

			//初始化$dom对象
			this.initElement();
			//拉取业务数据 data参数中的itemCode
			this.model.fetch({data:this.getParams()});
			//初始化事件
			this.initEvent();
		},
		//$dom对象初始化
		initElement: function() {
			this.$dRoot = this.$dRoot || $(this.$dRoot);
			this.$SCouponBtn = this.$SCouponBtn || $(this.SCouponBtn);
			this.$sCouponTitleBtn = this.$sCouponTitleBtn || $(this.sCouponTitleBtn);
			this.$sCouponListWrap = this.$sCouponListWrap || $(this.sCouponListWrap);
			this.$sCouponlayer = this.$sCouponlayer || $(this.sCouponlayer);
			this.$sCouponClose = this.$sCouponClose || $(this.sCouponClose);
		},
		//设置自定义配置
		setOptions: function(options) {
			this.options = {
				$dRoot:'body',
				SCouponBtn: '.j-storeCoupon',//store-coupon 入口1
				sCouponTitleBtn:'.coupon-title',//store-coupon 入口2
				sCouponListWrap:'.j-store-coupons',//最终页入口2中的coupon列表外层
				sCouponUsable:'.j-usableCoupon',//最终页中可用coupon
				sCouponlayer:'#J_sCouponLayer',//store coupon 弹窗
				sCouponBack:'.j-back-left',//back
				sCouponClose:'.j-back',//关闭
				usable:".usable",//可用的coupon
				couponCode:this.GetQueryString('couponCode'),
				//模板引擎
				template: _.template,
				//模板
				tpl: tpl,
				//数据模型
				model: new storeCouponModel(),
				//success()对外成功时的回调
				successCallback: $.noop
			};
			$.extend(true, this.options, options||{});
		},
		//事件初始化
		initEvent: function() {
			//监听数据同步状态
			this.listenTo(this.model, 'sync', this.success);
			this.listenTo(this.model, 'error', this.error);
			if(!this.hasload){
				this.display=this.getDiv();
			}
		},
		success:function(model,response,options){
			if(model.get('code') === 200 && model.get('couponList').length>0){
				this.render(model.attributes);
				this.successCallback(model);
				$('.j-store-coupons').css('display','block');
				if(this.couponCode!== null){
					this.triggerBindCoupon();
				}
			}
		},
		error: function(){
			try{throw('error(): request is wrong');}catch(e){}
		},
		//获取参数
		getParams:function(){
			var supplierid = $('.nlsy').attr('data-supplierid');
			return  $.extend(true, {}, {supplierid:supplierid});
		},
		//绑定领取coupon接口
		triggerBindCoupon:function(){
			this.bindCoupon(this.couponCode);
		},
		//获取url中参数
		GetQueryString:function(name) {
			var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if(r!=null) return unescape(r[2]); return null;
		},
		//页面整体渲染
		render: function(data) {
			//数据可用则绘制页面
			if (data.code !== -1) {
				this.renderStoreCoupon(data);
			}
		},
		//店铺页面的coupon列表
		renderStoreCoupon:function(data){
			var template = this.template,
				tpl = this.tpl,
				//店铺中coupon列表
				sCouponWarp = template(tpl.sCouponWarp.join(''))(data),
				sCouponTitle = template(tpl.sCouponTitle.join(''))(data),
				sCouponItem = template(tpl.sCouponItem.join(''))(data),
				//店铺中弹层coupon列表
				lCouponWarp = template(tpl.lCouponWarp.join(''))(data),
				lCouponItem = template(tpl.lCouponItem.join(''))(data);
			sCouponWarp = sCouponWarp.replace(/\{\{sCouponTitle\}\}/, sCouponTitle).replace(/\{\{sCouponItem\}\}/, sCouponItem);
			lCouponWarp = lCouponWarp.replace(/\{\{lCouponItem\}\}/, lCouponItem);
			this.$sCouponListWrap.html(sCouponWarp);
			this.$sCouponlayer.html(lCouponWarp)
			this.hasload = true;
		},
		//领取coupon
		bindCoupon:function(evt){
			var _self = this,
				tCouponCode = evt.currentTarget?$($(evt.currentTarget).closest('a')[0]).attr('data-couponcode'):evt;
			//已登录
			if (this.isLogin) {
				this.fetchBindCoupon({
					params: {
						client: 'wap',
						couponCode: tCouponCode,
						couponSource: 'WAP_StorePage'
					},
					successCallback: $.proxy(function() {
						//变更状态
						_self.changeCouponStatus(evt,true);
					}, this),
					doneCallback: $.proxy(function() {
						alert("Sorry, we're currently out of coupons.");
						//变更状态
						_self.changeCouponStatus(evt,false);
					},this),
					alreadyCallback: $.proxy(function() {
						alert("You already got this coupon.");
						//变更状态
						_self.changeCouponStatus(evt,true);
					},this)
				});
				//未登录
			} else {
				this.getLoginStatus({
					successCallback: $.proxy(function() {
						this.isLogin = true;
						this.fetchBindCoupon({
							params: {
								client: 'wap',
								couponCode: tCouponCode,
								couponSource: 'WAP_StorePage'
							},
							successCallback: $.proxy(function() {
								//变更状态
								_self.changeCouponStatus(evt,true);
							}, this),
							doneCallback: $.proxy(function() {
								alert("Sorry, we're currently out of coupons.");
								//变更状态
								_self.changeCouponStatus(evt,false);
							},this),
							alreadyCallback: $.proxy(function() {
								alert("You already got this coupon.");
								//变更状态
								_self.changeCouponStatus(evt,true);
							},this)
						});
					}, this)
				},tCouponCode);
			}
		},
		//执行coupon绑定操作
		fetchBindCoupon: function(options) {
			$.ajax({
				type: 'GET',
				url:'/mobileApiWeb/coupon-Coupon-bindCouponToBuyer.do',
				async: true,
				cache: false,
				dataType: 'json',
				data: options.params,
				context: this,
				success: function(res){
					if (res.data && res.state === '0x0000') {
						options.successCallback&&options.successCallback();
					} else if(res.state === '0x0511'){//已经领光了
						options.doneCallback&&options.doneCallback();
					} else if(res.state === '0x0505'){//用户已经存在该coupon
						options.alreadyCallback&&options.alreadyCallback();
					} else {
						alert("Something went wrong. Please try again.");
					}
				}
			});
		},
		//变更对应选择的coupon状态
		changeCouponStatus:function(evt,status){
			var couponcode = evt.currentTarget?$(evt.currentTarget).closest('a').attr('data-couponcode'):evt,
				$eles = $("a[data-couponcode='" + couponcode+"']");
				console.log($("a[data-couponcode"));
			$.each($eles, function(index, coupon){
				var $d = $(coupon);
				$d.removeClass('usable').addClass('received');
				if ($d.hasClass('j-usableCoupon')) {
					// status 为false的时候 显示out of coupons
					if(status === false) {
						$d.find('.c-state').html("Out of Coupons");
						$d.removeClass('usable').addClass('outOf');
					} else {
						$d.find('.c-state').html("Received");
						$d.removeClass('usable').addClass('received');
					}
				} else if ($d.hasClass('singleCoupon')) {
					// status 为false的时候 显示out of coupons
					if(status === false){
						$d.find('.sCoupon-btn').html('<p>Out Of</p><p>Coupons</p>');
						$d.removeClass('usable').addClass('outOf');
					} else {
						$d.find('.sCoupon-btn').html('');
						$d.removeClass('usable').addClass('received');
						$d.find('.issued').html(parseInt($d.find('.issued')[0].innerHTML)+1);
					}
				}
			});
		},
		//进入页面coupon弹层
		openCouponLayer:function(evt){
			var _self = this,
				target = $(evt.currentTarget),
				top = document.body.scrollTop;
			target.attr('vtop',top);
			_self.translateX(this.sCouponlayer,0,true);
		},
		//关闭层
		closelayer:function(evt){
			this.translateX(this.sCouponlayer,"100%",false);
		},
		//获取登录状态
		getLoginStatus:function(options,couponCode){
			var couponCode = couponCode;
			$.ajax({
				url:'/buyerislogin.do',
				type: 'GET',
				async: true,
				cache: false,
				dataType:'text',
				context: this,
				error: function(){},
				success: function(data){
					if(data != undefined && data.trim()==="true"){//登录
						options.successCallback&&options.successCallback();
					}else{//未登录
						var href=window.location.href.replace(window.location.hash,'').replace(window.location.search,'') + '?couponCode=' + couponCode;
						location.href = 'http://m.dhgate.com/login.do?returnURL='+href;
					}
				}
			});
		},
		getDiv:function(){
			var $div=$("body").children("div,header,footer");
			var opt={};
			$div.each(function(i,e){
				var s=e.style.display;
				opt[i+"-"+s]=e;
			});

			return [$div,opt];
		},
		ifShow:function(flag,$dom){
			if(flag){
				this.display[0].hide();
				if($dom){
					$dom.show();
				}
			}else{
				for(var k in this.display[1]){
					this.display[1][k].style.display= k.split("-")[1];
				}
				if($dom){
					$dom.hide();
				}
			}
		},
		translateX:function($ele,x,flag){
			var self= this;
			var style=$ele.get(0).style;

			style.webkitTransitionDuration=style.MozTransitionDuration=style.msTransitionDuration=style.OTransitionDuration=style.transitionDuration = '500ms';
			style.webkitTransform=style.transform=style.MozTransform='translateX('+x+')';
			if(flag){
				setTimeout(function(){
					window.scroll(0,0);
					self.ifShow(true,$ele);  //所有元素都隐藏
					var h=Math.max($ele.height(),$(window).height());
					$("body").css({height:h,'overflow-y':'hidden'});
					$ele.css({"position":"absolute","height":h});
				},800);
				$('.base-store').css("display","none !important");
				$('.j-store-coupons').css("display","none !important");
				$('.navs').css("display","none !important");
				$('.j-store-list').css("display","none !important");
				$('.allContent').css("display","none !important");
				$('.goTop').css("display","none !important");
			}else{
				this.ifShow(false,this.sCouponlayer);  //所有元素显示
				$('.base-store').css("display","block !important");
				$('.j-store-coupons').css("display","block");
				$('.navs').css("display","block !important");
				$('.j-store-list').css("display","block !important");
				$('.allContent').css("display","block !important");
				$('.goTop').css("display","block !important");
				$("body").css({height:"auto",'overflow-y':'visible'});
				$ele.css({"position":"fixed","height":"100%","display":"block"});
			}

		}
	});
	return storeCouponView;
})