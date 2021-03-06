/**
 * module src: seach/v1/tpl/filtersTpl.js
 * 包含了filter弹层内容、价格区间弹层内容、minOrder弹层内容、类目列表弹层内容、属性规格弹层内容
**/
define('appTpl/filtersTpl', [], function(){
    return {
    	//filter弹层内容
    	filterLayer: [
    		'<% var data = obj.attrResult.resultList,len = data.length,sp = obj.sp,isVip = obj.isVip;%>',
			'<div class="sort-refine-titlecon">',
		        '<a href="javascript:;" class="back j-filterCancel"><var></var>Back</a>',
		        '<span class="sortRe-title">Refine</span>',
		        '<a href="javascript:;" class="resetBtn j-resetBtn">Reset</a>',
		    '</div>',
		    '<div class="sortRefineCon j-filter-listScroll">',
		    	//best match排序部分
		       '<div class="module j-sortByBtn">Sort<span class="currentWord"><span><%=obj.sinfoName%></span><span class="English-errow"></span></span></div>',
		       //对应类目下的属性部分
		       '<div class="hasAttrs">',
		       	//'<% if (obj.categoryList.length) {%>',
		       		'<div class="module j-filter-categories">Categories',
		       		//如果命中具体类目，则展示具体类目，否则展示all
			        '<% if (obj.catename!=="") {%>',
			        	'<span class="currentWord" data-catalogid ="<%=sp.cid%>"><span><%=obj.catename%>',
			        '<% }else{%>',
			        	'<span class="currentWord" data-catalogid="0"><span>All',
			        '<% } %>',
			         '</span><span class="English-errow"></span></span></div>',
			     //'<% }else{ %>',
			     		//'<div class="module j-filter-categories">Categories<span class="currentWord" ><span class="English-errow"></span></span></div>',
			     //'<% } %>',   
		        '<% if (len !== 0) { %>',
		            '<% for (var i = 0; i < len; i++) {%>',
		            //属性大于5条隐藏其余的
		            '<% if (i>=5) { %>',
		            	'<div class="module nomarginTop attrHide j-otherAttrs j-attr-btn"',
		            '<% }else{ %>',
		            	'<div class="module nomarginTop j-attr-btn"',
		            '<% } %>',
		            	'data-at="<%=data[i].atcode%>" data-hasImage="<%=data[i].hasImage%>" data-attrName = "<%=data[i].name%>"><%=data[i].name%>',
		            	//如果当前属性有选中的记录一下选中属性的code和name
			            '<% if (data[i].isChecked===true) { %>',
			            	'<span class="currentWord" data-checkedCode="<%=data[i].checkedCode%>"><span><%=data[i].checkedName%>',
			            '<% }else{ %>',
			            	'<span class="currentWord"><span>Any',
			            '<% } %>',
			            	'</span><span class="English-errow"></span></span></div>',
		        	'<% } %>',
		        	//属性大于5条隐藏其余的，展示show more
		        	'<% if (len>5) {%>',
		        		'<div class="attr-showmore j-showMore" style="display:block">',
		        	'<% }else{ %>',
		            	'<div class="attr-showmore j-showMore" style="display:none">',
		            '<% } %>',
		            	'<a href="javascript:;"><span>Show More</span><var></var></a></div>',
		        '<% } %>',
		        '</div>',
		        //价格部分
		        '<div class="module j-rangeBtn" data-style="1">Price<span class="currentWord" data-minPrice="<%=sp.minPrice%>" data-maxPrice="<%=sp.maxPrice%>">',
		        '<% if (sp.minPrice) {%>',
		        	'<span>US $<%=sp.minPrice%> - <%=sp.maxPrice%></span>',
		        '<% }else{ %>',
		        	'<span>Any</span>',
		        '<% } %>',
		        '<span class="English-errow"></span></span></div>',
		        //是否免运费
		        '<div class="module j-switchBtn" data-style="fs">Free Shipping',
		        '<% if (sp.fs && sp.fs==="1") {%>',
		        	'<span class="closeDeals openDeals">',
		        '<% }else{ %>',
		        	'<span class="closeDeals">',
		        '<% } %>',
		        '</span></div>',
		        //是否是移动专享价
		        '<div class="module nomarginTop j-switchBtn" data-style="mobileonlydeal">Mobile Exclusive Deals',
		        '<% if (sp.mobileonlydeal && sp.mobileonlydeal==="1") {%>',
		        	'<span class="closeDeals openDeals">',
		        '<% }else{ %>',
		        	'<span class="closeDeals">',
		        '<% } %>',
		        '</span></div>',
		        //是否是vip
		        '<% if (isVip!=="0") {%>',
			        '<div class="module nomarginTop j-switchBtn" data-style="vip">Prime Items',
				        '<% if (sp.vip && sp.vip==="1") {%>',
				        	'<span class="closeDeals openDeals"></span>',
				        '<% }else {%>',
				        	'<span class="closeDeals"></span>',
			        	'<% } %>',
			        '</div>',
			     '<% } %>',
		        //是否是singleonly
		        '<div class="module j-switchBtn" data-style="singleonly">Single-piece',
		        '<% if (sp.singleonly && sp.singleonly==="1") {%>',
		        	'<span class="closeDeals openDeals">',
		        '<% }else{ %>',
		        	'<span class="closeDeals">',
		        '<% } %>',
		        '</span></div>',
		        //min order部分 如果singleonly是打开状态 minorder值是1，如果singleonly是关闭状态，取minorder值
		        '<% if (sp.singleonly && sp.singleonly==="1") {%>',
		        	'<div class="module nomarginTop j-minOrderBtn" data-style="0">Min.Order<span class="currentWord" data-minOrder="1">',
			        	'<span>1 <span class="minOrder-unit">Unit(s)</span></span></span></div>',
		        '<% }else{ %>',
		        	'<div class="module nomarginTop j-minOrderBtn" data-style="0">Min.Order<span class="currentWord" data-minOrder="<%=sp.minOrder%>">',
			        '<% if (sp.minOrder) {%>',
			        	'<span><%=sp.minOrder%> <span class="minOrder-unit">Unit(s)</span></span>',
			    	'<% }else{%>',
			    		'<span>All</span>',
			    	'<% } %>',
			    	'</span></div>',
		        '<% } %>',
		    	'<div class="btoheight"></div>',
		    '</div>'
    	],
        //price弹层内容
    	priceRange: [
    		'<% var data = obj;%>',
	    	'<div class="sort-refine-titlecon">',
		        '<a href="javascript:;" class="back j-priceCancel"><var></var>Back</a>',
		        '<span class="sortRe-title">Price</span>',
		    '</div>',
		    '<div class="priceCon j-priceScroll">',
			    '<div class="price-minorder">',
			        '<input type="number" class="min j-minPrice j-pricetxt" placeholder="Min." value="<%=data[0]%>" />-<input type="number" class="max j-maxPrice j-pricetxt" placeholder="Max." value="<%=data[1]%>" /><input type="button" class="done j-rangePriceBtn" value="Done" />',
			        '<div class="error-tips dhm-hide j-error-tips">The Maximum price cannot be lower than the minimum price.</div>',
			    '</div>',
		    '</div>'
    	],
    	//min order弹层内容
    	minOrder: [
    		'<% var data = obj;%>',
	    	'<div class="sort-refine-titlecon">',
		        '<a href="javascript:;" class="back j-priceCancel "><var></var>Back</a>',
		        '<span class="sortRe-title">Min. Order</span>',
		    '</div>',
		    '<div class="minOrderCon j-priceScroll">',
			    '<div class="price-minorder">',
			        'Less than<input type="number" class="min-ordertxt j-minOrderPrice" value="<%=data%>" /><span class="minOrder-unit">Unit(s)</span><input type="button" class="done j-minOrderSubmit" value="Done" />',
			    '</div>',
		    '</div>'
    	],
    	//属性规格弹层的内容
    	attrLayer: [
    		'<% var data = obj.attrData,len = data.length,hasImg = obj.hasImg,attrName = obj.attrName;%>',
    		'<% if (len) {%>',
		       	'<div class="sort-refine-titlecon">',
	        		'<a href="javascript:;" class="back j-attrCancel"><var></var>Back</a>',
	        		'<span class="sortRe-title"><%=obj.attrName%></span>',
	    		'</div>',
	    		//hasImg=1是属性规格是图片的展示形式，否则是文字的展示形式
	    		'<% if (hasImg==="1") {%>',
				    '<ul class="filterAttrCon clearfix j-attr-scroll">',
				    '<% for (var i = 0; i < len; i++) { %>',
				    	'<% if (data[i].checked===true) {  %>',
					        '<li class="active"',
				    	'<% }else{%>',
					    	 '<li',
				    	'<% } %>',
				    	' data-atcode = "<%=data[i].atcode%>">',
				            '<div class="filterAttrImg"><img  src="http://www.dhresource.com/<%=data[i].image%>"></div>',
				            '<div class="attr-text"><%=data[i].name%></div>',
				        '</li>',
				    '<% } %>',
				    '</ul>',
			    '<% }else{ %>',
			    '<div class="bestmatch j-attr-scroll">',
			        '<ul>',
			        	'<% for (var i = 0; i < len; i++) { %>',
			        		'<% if (data[i].checked===true) { %>',
			        			'<li class="active" data-atcode = "<%=data[i].atcode%>"><%=data[i].name%>',
			        			//有数量的显示数量
			        			'<% if (data[i].count) { %>',
			        				'<em>(<%=data[i].count%>)</em>',
			        			'<% } %>',
			        			'<var></var></li>',
			        		'<% }else{ %>',
			        			'<li data-atcode = "<%=data[i].atcode%>"><%=data[i].name%>',
			        			'<% if (data[i].count) { %>',
			        				'<em>(<%=data[i].count%>)</em>',
			        			'<% } %>',
			        			'<var></var></li>',
			        		'<% } %>',
			        	'<% } %>',
			        '</ul>',
			    '</div> ',
		    '<% } %>',
		    '<% } %>'
    	],
    	//类目列表内容
    	cateFilter:[
    		'<% var data = obj.cateList, len = data.length,currentId = obj.currentId;%>',
    		'<div class="sort-refine-titlecon">',
		        '<a href="javascript:;" class="back j-cateCancel"><var></var>Back</a>',
		        '<span class="sortRe-title">Categories</span>',
		    '</div>',
		    '<div class="categoriesCon j-catelist-scroll">',
		    //如果当前的类目列表length不存在，从关键词进来的时候带all，如果类目不为空弹层展示all+当前类目，如果是从类目进来弹层仅仅展示当前类目
		    	'<% if (!len) { %>',
		    		'<% if (obj.sp.key) { %>',
		    		'<div class="allCateTitle j-cate-list"  data-cid ="" data-0="1">All<var></var></div>',
		    			'<% if (obj.catename!=="") {%>',
					    	'<div class="catelist"><div class="oneCate j-cate-list active" data-cid = "<%=obj.sp.cid%>" data-<%=obj.sp.cid%>="1"><%=obj.catename%><var></var></div></div>',
				    	'<% } %>',
				    '<% }else{%>',
				    	'<div class="catelist"><div class="oneCate j-cate-list active" data-cid = "<%=obj.sp.cid%>" data-<%=obj.sp.cid%>="1"><%=obj.catename%><var></var></div></div>',
			    	'<% } %>',
		    	'<% }else{%>',
		    		'<% if (obj.sp.key) { %>',
				    	'<div class="allCateTitle j-cate-list"  data-cid ="" data-0="1">All',
				    	'<% if (obj.countNum) { %>',
				    		'<em>(<%=obj.countNum%>)</em>',
				    	'<% } %>',
				    	'<var></var></div>',
			    	'<% } %>',
		    	'<% } %>',
		    	
		    	//存在一级展示
			    '<% for (var i = 0; i < len; i++) { %>',
			    	'<% if (len>=2) { %>',
			    	'<div class="catelist noMuti">',
			    	'<% }else{%>',
			    	'<div class="catelist">',
			    	'<% } %>',
			    		'<div class="oneCate j-cate-list" data-cid = "<%=data[i].catalogid%>" data-<%=data[i].catalogid%>="1"><%=data[i].catalogname%>',
			    			'<% if (data[i].count) { %>',
			    				'<em>(<%=data[i].count%>)</em>',
			    			'<% } %>',
			    		'<var></var></div>',
			    		//存在二级展示
			    		'<% if (data[i].subCatalog) { %>',
			    			'<div class="catelist">',
				                '<% for (var j = 0; j < data[i].subCatalog.length; j++) { %>',
				                //通过判断一级类目大于2个以及二级类目大于5个才显示showmore 
				                '<% if (j>=5&&len>=2) { %>',
									'<div class="twoCate attrHide j-cate-list j-otherAttrs"',
								'<% }else{%>',
									'<div class="twoCate j-cate-list"',
								'<% } %>',
								'data-cid = "<%=data[i].subCatalog[j].catalogid%>" data-<%=data[i].subCatalog[j].catalogid%>="1"><%=data[i].subCatalog[j].catalogname%>',
									'<% if (data[i].subCatalog[j].count) { %>',
					    				'<em>(<%=data[i].subCatalog[j].count%>)</em>',
					    			'<% } %>',
								'<var></var></div>',
									//存在三级展示
									'<% if (data[i].subCatalog[j].subCatalog) { %>',
										'<div class="catelist">',
											'<% for (var m = 0,mData = data[i].subCatalog[j].subCatalog; m < mData.length; m++) { %>',
													'<div class="threeCate j-cate-list" data-cid = "<%=mData[m].catalogid%>" data-<%=mData[m].catalogid%>="1"><%=mData[m].catalogname%>',
													'<% if (mData[m].count) { %>',
									    				'<em>(<%=mData[m].count%>)</em>',
									    			'<% } %>',
													'<var></var></div>',
												//存在四级展示
												'<% if (data[i].subCatalog[j].subCatalog[m].subCatalog) { %>',
													'<div class="catelist">',
														'<% for (var n = 0,nData = data[i].subCatalog[j].subCatalog[m].subCatalog; n < nData.length; n++) {  %>',
														
															'<div class="fourCate j-cate-list" data-cid = "<%=nData[n].catalogid%>" data-<%=nData[n].catalogid%>="1"><%=nData[n].catalogname%>',
															'<% if (nData[n].count) { %>',
											    				'<em>(<%=nData[n].count%>)</em>',
											    			'<% } %>',
															'<var></var></div>',
														'<% } %>',
													'</div>',
												'<% } %>',
												//存在四级展示
											'<% } %>',
										'</div>',
									'<% } %>',
									//存在三级展示
				                 '<% } %>',
				                 //通过判断一级类目大于2个以及二级类目大于5个才显示showmore
				                 '<% if (data[i].subCatalog.length>5&&len>=2) { %>',
									'<div class="attr-showmore j-showMore"><a href="javascript:;"><span>Show More</span><var></var></a></div>',
								'<% } %>',
				            '</div>',
			        	'<% } %>',
			        	//存在二级展示
				    '</div>',
				//存在一级展示
			    '<% } %>',
			    '<div class="btoheight"></div>',
		    '</div>'
		       
		            
    	]
    };
});
