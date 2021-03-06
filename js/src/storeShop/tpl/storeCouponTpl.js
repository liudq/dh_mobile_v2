
//最终页中店铺coupon列表展示
define('appTpl/storeCouponTpl', [], function(){
	return {
		//店铺中coupon列表展示
		sCouponWarp: [
			'<% var data = obj; %>',
			'<div class="dCouponList">',
				'{{sCouponTitle}}',

				'<div class="coupons">',
					'{{sCouponItem}}',
				'</div>',
			'</div>'
		],
		sCouponTitle: [
			'<% var data = obj;%>',
			'<div class="coupon-title store-arrow-right">Store Coupons <span>(<%=data.couponList.length%>)</span></div>',
		],
		sCouponItem: [
			'<% var data = obj;%>',
			'<% var data1 = obj.couponList;%>',
			'<% for (var i = 0, len = data1.length; i < len; i++) { %>',
				'<% if(data1[i].totalNumber - data1[i].usedNumber === 0) { %>',
					'<a href="javascript:;" class="j-usableCoupon outOf" data-couponcode="<%=data1[i].couponCode%>">',
						'<% if(data1[i].platform === "3") { %>',
							'<span class="appCoupon">App Coupon</span>',
						'<% } %>',
						'<span class="c-discount"><b><%=data.currencyText%><%=data1[i].couponAmount%></b>  OFF <%=data.currencyText%><%=data1[i].minOrderAmount%>+</span>',
						'<span class="c-state">Out Of Coupons</span>',
					'</a>',
				'<% } else { %>',
					'<% if(data1[i].ifBuyerBind === false) { %>',
						'<a href="javascript:;" class="j-usableCoupon usable" data-couponcode="<%=data1[i].couponCode%>">',
							'<% if(data1[i].platform === "3") { %>',
								'<span class="appCoupon">App Coupon</span>',
							'<% } %>',
							'<span class="c-discount"><b><%=data.currencyText%><%=data1[i].couponAmount%></b>  OFF <%=data.currencyText%><%=data1[i].minOrderAmount%>+</span>',
							'<span class="c-state">Get Now</span>',
						'</a>',
					'<% } else if(data1[i].ifBuyerBind === true) { %>',
						'<a href="javascript:;" class="j-usableCoupon received" data-couponcode="<%=data1[i].couponCode%>">',
							'<% if(data1[i].platform === "3") { %>',
								'<span class="appCoupon">App Coupon</span>',
							'<% } %>',
							'<span class="c-discount"><b><%=data.currencyText%><%=data1[i].couponAmount%></b>  OFF <%=data.currencyText%><%=data1[i].minOrderAmount%>+</span>',
							'<span class="c-state">Received</span>',
						'</a>',
					'<% } %>',
				'<% } %>',
			'<% } %>'
		],
		////店铺弹出层中的coupon列表展示
		lCouponWarp: [
			'<div class="allCoupons">',
				'<nav>',
					'<div id="J_sCouponNav" class="tit store-arrow-left">',
						'<a href="javascript:;" class="j-back-left backLeft"></a>',
						'<a href="javascript:;">Store Coupons</a>',
						/*'<a href="javascript:;" class="j-back close"></a>',*/
					'</div>',
				'</nav>',
				'<article class="J_couponListLayer">',
					'{{lCouponItem}}',
				'</article>',
				'<div class="note">Note: One coupin per single order, excluding shipping cost.</div>',
			'</div>'
		],
		lCouponItem: [
			'<% var data = obj;%>',
			'<% var data1 = obj.couponList;%>',
			'<% for (var i = 0, len = data1.length; i < len; i++) { %>',
				'<% if(data1[i].totalNumber - data1[i].usedNumber === 0) { %>',
					'<a class="singleCoupon clearfix outOf" data-couponcode="<%=data1[i].couponCode%>">',
						'<span class="sCoupon-detail">',
							'<% if(data1[i].platform === "3") { %>',
								'<span class="sAppCoupon">App Coupon</span>',
							'<% } %>',
							'<p class="cOff"><b><%=data.currencyText%><%=data1[i].couponAmount%></b> OFF <%=data.currencyText%><%=data1[i].minOrderAmount%>+</p>',
							'<p>Coupon Expires: <%=data1[i].expiresTime%></p>',
							'<p>Issued/Total: <b class="issued"><%=data1[i].usedNumber%></b>/<%=data1[i].totalNumber%></p>',
						'</span>',
						'<span class="sCoupon-btn">',
							'<p>Out of</p>',
							'<p>Coupons</p>',
						'</span>',
					'</a>',
				'<% } else { %>',
					'<% if(data1[i].ifBuyerBind === false) { %>',
						'<a class="singleCoupon clearfix usable" data-couponcode="<%=data1[i].couponCode%>">',
							'<span class="sCoupon-detail">',
								'<% if(data1[i].platform === "3") { %>',
									'<span class="sAppCoupon">App Coupon</span>',
								'<% } %>',
								'<p class="cOff"><b><%=data.currencyText%><%=data1[i].couponAmount%></b> OFF <%=data.currencyText%><%=data1[i].minOrderAmount%>+</p>',
								'<p>Coupon Expires: <%=data1[i].expiresTime%></p>',
								'<p>Issued/Total: <b class="issued"><%=data1[i].usedNumber%></b>/<%=data1[i].totalNumber%></p>',
							'</span>',
							'<span class="sCoupon-btn">',
								'Get Now',
							'</span>',
						'</a>',
					'<% } else if(data1[i].ifBuyerBind === true) { %>',
						'<a class="singleCoupon clearfix received" data-couponcode="<%=data1[i].couponCode%>">',
							'<span class="sCoupon-detail">',
								'<p class="cOff"><b><%=data.currencyText%><%=data1[i].couponAmount%></b> OFF <%=data.currencyText%><%=data1[i].minOrderAmount%>+</p>',
								'<p>Coupon Expires: <%=data1[i].expiresTime%></p>',
								'<p>Issued/Total: <b class="issued"><%=data1[i].usedNumber%></b>/<%=data1[i].totalNumber%></p>',
							'</span>',
							'<span class="sCoupon-btn">',
							'</span>',
						'</a>',
					'<% } %>',
				'<% } %>',
			'<% } %>'
		]

	}
})
