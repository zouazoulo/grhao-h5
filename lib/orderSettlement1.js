/*
* orderSettlement scirpt for Zhangshuo Guoranhao
*/ 
define('orderSettlement1',['common','goshopCar','LArea'],function(require, exports, module){

	var common = require( 'common' );
	var cart = require( 'goshopCar' );
	var area = require('LArea');
	// 命名空间

	pub = {};
	pub.addrDtd = $.Deferred();
	pub.logined = common.isLogin(); // 是否登录

	!common.storeInfo.getKey() && common.jumpLinkPlain('../index.html'); 
	
	if( pub.logined ){
		pub.userData = common.user_datafn();
		pub.userId = pub.userData.cuserInfoid;
		pub.source = "userId" + pub.userId;
		pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
		pub.tokenId = common.tokenIdfn();
		pub.userBasicParam = {
			userId : pub.userId,
			source : pub.source,
			sign : pub.sign,
			tokenId : pub.tokenId
		}
	}else{
		common.jumpLinkPlain('../index.html'); // 未登录跳转首页
	}


	// pub.goodsList = null; // 普通商品 购物车商品列表

	pub.hasCouponId = common.sortCouponId.getKey(); // 存在优惠券id

	pub.dom = common.getUrlParam('dom');

	if( pub.dom ){
		pub.dom = pub.dom.substr(0,3) == 'dom';
	}

	if( pub.hasCouponId ){
		pub.couponId = common.sortCouponId.getItem();
		common.sortCouponId.removeItem();
	}else{
		pub.couponId = null;
	}
	// pub.addrId = null; // 地址id
	// pub.pickUpMethod = null; // 取货方式 1.门店自提，2.送货上门
	// pub.orderCode = null; // 预购商品 订单编号
	// pub.goodsId = null; // 预购 + 秒杀 + 换购 商品id
	// pub.remarks = null; // 备注
	pub.isApp = common.isApp(); // 获取 app 环境

	// pub.orderParamInfo = null;
	pub.couponInfo = [
		{ text : '立减优惠：', key : 'derateAmount' , sign :"-￥" }, // 1
		{ text : '折扣优惠：', key : 'derateAmount', sign : "-￥" }, // 2
		{ text : '赠送果币：', key : 'offScore', sign : "个"}, // 3
		{ text : '赠送优惠券：', key : 'offItemVal', sign : '元'}, // 4
	];
	// 页面box之前切换
	pub.switchInput = function( title, node1, node2, tit ){
		tit = tit || title;
		$('.header_title').html( tit );
		document.title = title;
		$( node1 ).fadeOut(100,function(){
			$( node2 ).fadeIn(200);
		});
	};
	// 普通 命名空间
	pub.plain = {};
	var PLAIN = pub.plain;
	// 普通 接口数据处理
	PLAIN.apiHandle = {
		init : function(){
			PLAIN.apiHandle.shop_cart_submit.init();
		},
		shop_cart_submit : {
			init : function(){
				common.ajaxPost($.extend({},{
					method : 'shop_cart_submit_two',
					goodsList : pub.goodsInfoApi, // 接口 所需字段
					pickUpMethod : pub.pickUpMethod,
					couponId : pub.couponId,
				},pub.userBasicParam), function( d ){
					d.statusCode == "100000" && PLAIN.apiHandle.shop_cart_submit.apiData( d );
				});
			},
			apiData : function( d ){
				var 
				orderInfo = d.data.order, // 订单商品信息
				couponInfolist = d.data.CouponInfolist, // 优惠券 
				couponInfoCount = d.data.couponCanUseCount, //可用优惠卷数量
				time = d.data.time, // 时间
				calendar = d.data.calendar; // 日期
				PLAIN.apiHandle.shop_cart_submit.goodsPriceInfo( orderInfo , couponInfolist ); // 商品价格信息

				!!calendar && !!time && PLAIN.apiHandle.shop_cart_submit.dispatchTime( calendar, time ); // 派送时间
				
				!!couponInfolist && pub.orderType == "1" && PLAIN.apiHandle.shop_cart_submit.couponList( couponInfolist ,pub.couponId); // 优惠券列表
				
				$(".set_coupon_box_item_text").data('data',couponInfolist).attr("couponInfoCount",couponInfoCount);
				if (pub.couponId) {
					
				}else{
					if (couponInfoCount > 0) {
						$(".set_coupon_box_item_text").html(couponInfoCount+"张可用优惠卷");
					}else{
						$(".set_coupon_box_item_text").html("无可用优惠卷").addClass("color_999");
					}
				}
				
				
			},
			// 优惠券列表
			couponList : function( couponInfolist , couponId){
				var selectCoupon = $('.select_coupon'),
					couponBox = selectCoupon.find(".main"),
					html1 = '',
					html2 = '';
					
				if ( $.isArray(couponInfolist) && couponInfolist.length != 0) {
					couponInfolist.forEach(function( v, i ){
						if (v.isCanUse > 0) {
							if(couponId == v.id){
								html1 +='<div class="coupon_list_item active" data-name="'+v.couponName+'" data-id="'+v.id+'" data-money="'+v.couponMoney+'">'
							}else{
								html1 +='<div class="coupon_list_item" data-name="'+v.couponName+'" data-id="'+v.id+'" data-money="'+v.couponMoney+'">'
							}
							html1 +='	<div class="coupon_list_item_top clearfloat">'
							html1 +='		<div class="float_left">'
							html1 +='			<p>'+v.couponName+'</p>'
							html1 +='			<p>有效期至：'+v.endTime+'</p>'
							html1 +='		</div>'
							html1 +='		<div class="float_right"></div>'
							html1 +='	</div>'
							html1 +='	<div class="coupon_list_item_bg"><img src="../img/coupon_bg.png"></div>'
							html1 +='	<div class="coupon_list_item_bottom">'
							html1 +='		<p>'+v.applyTo+'</p>'
							
							/*
							html1 +='		<p class="color_F73A3A">不可用原因：不在当前门店</p>'
							*/
							
							html1 +='	</div>'
							html1 +='</div>'
						}else{
							html2 +='<div class="coupon_list_item">'
							html2 +='	<div class="coupon_list_item_top clearfloat">'
							html2 +='		<div class="float_left">'
							html2 +='			<p>'+v.couponName+'</p>'
							html2 +='			<p>有效期至：'+v.endTime+'</p>'
							html2 +='		</div>'
							html2 +='		<div class="float_right"></div>'
							html2 +='	</div>'
							html2 +='	<div class="coupon_list_item_bg"><img src="../img/coupon_bg.png"></div>'
							html2 +='	<div class="coupon_list_item_bottom">'
							html2 +='		<p>'+v.applyTo+'</p>'
							if (v.notApplicable) {
								html2 +='		<p class="color_F73A3A">'+v.notApplicable+'</p>'
							}
							html2 +='	</div>'
							html2 +='</div>'
						}
					});
					
					if (html1) {
						html1 = '<p class="title">可用优惠卷</p>' + html1; 
						couponBox.find(".cuopon_management_contain1").html(html1)
					}
					
					if (html2) {
						html2 = '<p class="title">不可用优惠卷</p>' + html2;
						couponBox.find(".cuopon_management_contain2").html(html2)
					}
					
					
					
				}else{
					//couponBox.html("暂无优惠卷");	
				}
				
			},
			// 配送时间
			dispatchTime : function( cal, t ){

				var time = {}, dataFormat = function( param ){
					var arr = [];
					param.forEach(function( v, i ){
						var obj = {code : 'code'};
						obj.name = v;
						arr.push( obj );
					});
					return arr;
				},calendar = dataFormat( cal );

				time.code = dataFormat( t );
				$.dtd.resolve( [calendar,time],2 );
				$(".set_delivery_box").show();
			},
			// 商品价格信息
			goodsPriceInfo : function( orderInfo , dataList){
				var 
				listBoxNode = $(".order_set_list"),
				listNode = listBoxNode.find('li');
				var curNode = listNode.eq(0).show().find(".float_right").html( "￥" + orderInfo.goodsMoney).parent() // 商品总价
				pub.storeInfo.type != 5 && curNode.next().show().find(".float_right").html( "￥" + orderInfo.postCost ); // 运费
				
				//是否是首单
				if (orderInfo.orderType == "1") {
					if (orderInfo.firstOrderOff != '' && orderInfo.firstOrderOff > 0) {
						$(".order_first_free").find(".float_right").html("-￥"+orderInfo.firstOrderOff).end()
						$(".order_first_free").css("display","block")
					} 
				}
				//优惠券金额
				(function(){
					pub.orderType == "3" ? listNode.eq(2).hide() : (function(){
						listNode.eq(2).show().find(".float_left").html(getCouponText(dataList));
						listNode.eq(2).show().find(".float_right").html( orderInfo.couponMoney > 0 ? "-￥" + orderInfo.couponMoney : "-￥0" );
					})();
				}());
				// 优惠券优惠价格信息
				(function(){
					if( 0 < orderInfo.couponStrategy && orderInfo.couponStrategy < 5  ){
						var couponInfo = pub.couponInfo[ +orderInfo.couponStrategy - 1 ];
						listNode.eq(3).show().find(".float_left").html( couponInfo.text ).next().show().html(function(){
							var sign = couponInfo.sign;
							if( sign == '-￥' ) 
								return sign + (orderInfo[couponInfo.key] ? orderInfo[couponInfo.key] : '');
							return (orderInfo[couponInfo.key] ? orderInfo[couponInfo.key] : '') + sign;
						});
					}else{
						listNode.eq(3).hide();
					}
				}());
				listNode.eq(5).show().find(".float_right").html( "￥" + orderInfo.realPayMoney );
				$(".order_submit_money").html( orderInfo.realPayMoney );
				listBoxNode.show();
				
				
				function getCouponText (dataList){
					if (pub.couponId) {
						if(dataList && dataList.length != 0){
							for (var i in dataList) {
								if (pub.couponId == dataList[i].id) {
									return dataList[i].couponName;
								}
							}
							return "优惠卷";
						}
						
					}else{
						return "优惠卷";
					}
				}
				
			},
		},
	};
	// 普通商品 列表
	PLAIN.goodList = function(){
		var html = '';
		pub.goodsList.forEach(function( v, i){
			if( v.status == 1 ){
				html += '<dl class="gds_box clearfloat">'
				html += '   <dt>'
				html += '		<img src="' + v.logo+'"/>'
				html += v.type == 2 ? '<img class="gds_goods_te" src="../img/icon_miao_s.png"/>' : '';
				html += pub.orderType == "2" ? '<img class="gds_goods_te" src="../img/icon_te_s.png"/>' : '';
				html += '	</dt>'
			    html += '	<dd>'
				html += '	    <div class="gds_right_top">' + v.name + '</div>'
				html += '	    <div class="gds_right_center clearfloat">'
				html += '		    <div class="gds_goods_mess float_left">' + v.specifications + '</div>'
				html += '		    <div class="gds_num_price float_right clearfloat">'
				html += '	            <p class="gds_price float_right">￥<span>' + common.toFixed( v.count * v.price ) + '</span></p>'
				html += '	            <p class="gds_num float_right">X<span>' + v.count + '</span></p>'
				html += '           </div>'
				html += '	    </div>'
				html += '	    <div class="gds_right_bottom">'
				html += '			<p class="float_left"><span class="font_color">￥' + v.price + '</span></p>'
				html += '			<p class="float_left"><span class="font_color"></span></p>'
				html += '</div>'
				html += '    </dd>'
			    html += '</dl>'
		    }
		});
		$(".order_goods_contain_details").html( html );
	};
	// 普通商品初始化
	PLAIN.init = function(){
		pub.goodsInfoApi = cart.goodlist1(); // 接口字段
		pub.goodsList = cart.goodlist2(); // 购物车商品列表
		PLAIN.apiHandle.init(); // 接口初始化
		PLAIN.goodList(); 
	};

	// 换购 命名空间
	pub.barter = {};
	var BARTER = pub.barter;
	BARTER.buyNumber = "1"; // 换购数量设置
	BARTER.goodList = function(){ // 换购商品 列表
		PLAIN.goodList(); 
	};
	BARTER.goodsPriceInfo = function(){ // 换购商品 价格信息
		var 
		price = common.JSONparse( pub.goodsList[0].price ),
		listBoxNode = $( ".order_set_list" ),
		listNode = listBoxNode.find('li');

		listBoxNode.find('.group').hide(); // 优惠卷金额 + 立减优惠 + 包月卡优惠
		listNode.eq(0).show().find(".float_right").html( "￥" + price) // 总价
				.parent().next().show().find(".float_right").html("￥0"); //运费
		listNode.eq(5).show().find(".float_right").html("￥" + price ); //合计、总计
		$(".order_submit_money").html( price );
		listBoxNode.show();
	};
	BARTER.init = function(){ // 换购初始化
		pub.goodsList = common.JSONparse( common.seckillGood.getItem() ); // 换购商品信息;
		pub.goodsId = pub.goodsList[0].id; // 接 换购商品 id
		this.goodList(); // 换购商品 列表
		this.goodsPriceInfo(); // 换购商品 价格信息
	};

	// 预购 命名空间
	pub.pre = {};
	var PRE = pub.pre;
	// PRE.source = null; // 预购商品
	// PRE.sign = null; // 预购商品
	// 预购接口数据处理
	PRE.apiHandle = {
		pre_order_details : {
			init : function(){
				common.ajaxPost({
					method : 'pre_order_details',
					tokenId : pub.tokenId,
					orderCode : pub.orderCode,
					source : PRE.source,
					sign : PRE.sign
				},function( d ){
					d.statusCode == "100000" &&  PRE.apiHandle.pre_order_details.apiData( d );
				});	
			},
			apiData : function( d ){
				d = d.data; // 商品信息列表
				pub.goodsId = d.preGoodsId; // 预购商品ID
				PRE.goodList( d ); // 预购商品信息列表
				PRE.apiHandle.pre_shop_cart_submit.init(); // 预购结算购物车
			}
		},
		pre_shop_cart_submit : {
			init : function(){
				var self = this;
				common.ajaxPost( $.extend({},{
					method : 'pre_shop_cart_submit',
					pickUpMethod : pub.pickUpMethod,
					preGoodsId : pub.goodsId,
				},pub.userBasicParam),function( d ){
					d.statusCode == "100000" && PLAIN.apiHandle.shop_cart_submit.apiData.call( self, d ); // 借用普通商品 
				});
			}
		}
	};
	// 预购商品 列表
	PRE.goodList = function( list ){
		var html = '';
		html += '<dl class="gds_box clearfloat">'
		html += '   <dt>'
		html += '		<img src="' + list.goodsInfo.goodsLogo + '"/>'
		html += '		<img class="gds_goods_te" src="../img/icon_yu_s.png"/>'
		html += '	</dt>'
	    html += '	<dd>'
		html += '	    <div class="gds_right_top">' + list.goodsInfo.goodsName + '</div>'
		html += '	    <div class="gds_right_center clearfloat">'
		html += '		    <div class="gds_goods_mess float_left">' + list.goodsInfo.specInfo + '</div>'
		html += '		    <div class="gds_num_price float_right clearfloat">'
		html += '	            <div class="gds_price float_right">X<span>' + list.buyNum + '</span></div>'
		html += '	            <div class="gds_num float_right">￥<span>' + common.toFixed( list.retainage ) + '</span></div>'
		html += '           </div>'
		html += '	    </div>'
		html += '		<div class="gds_right_bottom">'
		html += '			<p class="float_left">'
		html += '				<span>定金：</span><span class="font_color">￥' + list.preGoods.frontMoney + '</span>'
		html += '			</p>'
		html += '			<p class="float_left">'
		html += '				<span>尾款：</span><span class="font_color">￥' + list.preGoods.retainage + '</span>'
		html += '			</p>'
		html += '		</div>'
		html += '    </dd>'
	    html += '</dl>'
	    $(".order_goods_contain_details").append(html);
	};
	// 预购初始化
	PRE.init = function(){
		pub.orderCode = common.orderCode.getItem();
		PRE.source = 'preOrderCode' + pub.orderCode;
		PRE.sign = common.encrypt.md5( PRE.source + "key" + common.secretKeyfn() ).toUpperCase();
		PRE.apiHandle.pre_order_details.init();
	};

	// 公共接口
	pub.apiHandle = {
		// 门店信息初始化
		storeInfo : {
			init : function(){
				pub.storeInfo = common.getStoreInfo();
				if( pub.storeInfo.type == 5 ){
					$('.set_charge_contact_right').find('.take_own').hide().prev().addClass('actived').html('自助售货机');
					$('.set_job_time,.set_order_remark').hide(); // 隐藏提货方式 // 隐藏营业时间 // 备注隐藏
					pub.pickUpMethod = 1;
				}
				pub.firmId = pub.storeInfo.id; // 获取门店ID
				node = $(".set_charge_address2");
				$(".set_charge_con").show();
				node.find('.take_goods_phone').html( pub.storeInfo.firmName )
					.end().find('.set_address_bottom').html( "地址：" + pub.storeInfo.address )
					.end().find('.set_job_time').html( "营业时间：" + pub.storeInfo.pickUpTime );
			}
		},
		// 默认地址
		address_default_show : {
			init : function(){
				common.ajaxPost($.extend({},{
					method : 'address_default_show'
				}, pub.userBasicParam ),function( d ){
					switch( +d.statusCode ){
						case 100000 : pub.AddrInfoRender( d.data ); break; // 配送地址渲染
						case 100300 : 
						case 100505 : $('.set_charge_address1').find('.group1').hide().next().show().html( "请选择收货地址" ); break;
					};
				},function( d ){
					common.prompt( d.statusStr );
				},function(){
					pub.addrDtd.resolve();
				});
			}
		}
	};
	// 地址渲染
	pub.AddrInfoRender = function( d ){
		if (!d.latitude && !d.longitude ) {
			$('.set_charge_address1').find('.group1').hide().next().show().html( "请选择收货地址" );
		}else{
			pub.addrId = d.id; // 接收地址ID
			$('.set_charge_contact').attr( 'addr-id', pub.addrId ); // 暂存 ID
			$('.set_charge_address1').find('.set_address_top').show().find('.take_goods_name').html( d.consignee )
			.next().html( d.mobile ).parent().next().html( d.provinceName + d.cityName + d.countyName + d.street );
		}
		common.addressData.getKey() && common.addressData.removeItem();
		pub.addrDtd.resolve();
	};
	// 公共事件处理函数
	pub.eventHandle = {
		init : function(){
			// 回退
			common.jumpLinkSpecial(".header_left",function(){
				common.addType.removeItem();
				pub.dom ? window.location.replace('../index.html') : (function(){
					$(".orderSettlement").is(":hidden") ? pub.switchInput("订单结算",".select_coupon",".orderSettlement") : window.history.back() ;
				})();
			});
			
			
			
			// 优惠券说明 
			$("#coupon_msg").on("click",function(){
				common.dialog.init({btns : [{ klass : 'dialog-confirm-btn', txt : '知道了'}]}).show('特价商品不参与优惠卷计算',function(){});
		   	});

			$('.set_coupon_box1_top').on('click',function(){
				$('.set_coupon_box1_bottom').toggle();
			});
			// 优惠券
			$(".set_coupon_box1_bottom").on('click',"p",function(){
				var 
				$this = $(this),
				couponName = $this.html();
				pub.couponId = $this.attr( "data" );
				common.sortCouponId.setItem( pub.couponId ); // 存优惠券ID
				$(".set_coupon_box1_top").html( couponName ).next('.set_coupon_box1_bottom').hide();
				
			});

			//优惠卷
			$('.set_coupon_box_item').on("click",".set_coupon_box_item_text",function(){
				var couponId = $(this).attr("couponId");
				pub.switchInput("选择优惠卷",".orderSettlement",".select_coupon")
			})
			$(".cuopon_management_contain1").on("click",".coupon_list_item",function(){
				var _this = $(this),
					isActive = _this.is(".active"),
					couponName = _this.attr("data-name"),
					couponId = _this.attr("data-id"),
					couponMoney = _this.attr("data-money");
				if(!isActive){
					_this.addClass("active").siblings().removeClass("active");
					$(".select_coupon_top").removeClass("active");
					$(".set_coupon_box_item_text").html("<span>"+couponName+"</span>");
					$(".set_coupon_box_item_text").attr({"couponId":couponId,"couponName":couponName,"couponMoney":couponMoney});
					pub.couponId = couponId;
					PLAIN.apiHandle.shop_cart_submit.init(); // 优惠券请求
					pub.switchInput("订单结算",".select_coupon",".orderSettlement")
				}else{
					pub.switchInput("订单结算",".select_coupon",".orderSettlement")
				}
			})
			$(".select_coupon_top").on("click",function(){
				var _this = $(this),
					isActive = _this.is(".active");
				if (isActive) {
					var couponInfoCount = _this.attr("couponinfocount");
					if (couponInfoCount > 0) {
						$(".set_coupon_box_item_text").html(couponInfoCount+"张可用优惠卷")
					}else{
						$(".set_coupon_box_item_text").html("无可用优惠卷").addClass("color_999")
					}
				}else{
					_this.addClass("active");
				}
				pub.couponId = null;
				PLAIN.apiHandle.shop_cart_submit.init(); // 优惠券请求
				pub.switchInput("订单结算",".select_coupon",".orderSettlement")
			})
			
			// 配送方式切换
			$('.set_charge_contact li').on('click',function(){
				var 
				$this = $(this),
				isCur = $this.is('.actived'),
				index = $this.index();
				$this.addClass('actived').siblings().removeClass('actived');
				$('.set_charge_address').eq( index ).show().siblings().hide();
				var tabIndex = $('.set_charge_contact_right').find('li.actived').index();
				if( !isCur ){
					pub.addrId = index == 0 ? '' : $('.set_charge_contact').attr('addr-id');
					pub.pickUpMethod =  tabIndex == -1 ? '' : '' + ( tabIndex + 1 );
					common.addType.setItem( index );
					switch( +common.orderType.getItem() ){
						case 1 : PLAIN.apiHandle.shop_cart_submit.init(); break; // 普通
						case 3 : PRE.apiHandle.pre_shop_cart_submit.init(); break; // 预购
					}
				} 
			});

			// 选择配送地址
			common.jumpLinkSpecial('.set_charge_address1',function(){
				common.addType.setItem( "1" );
				common.jumpLinkPlain( "address_management.html" );
			});

			// 提交订单
			$('.order_submit').on('click','.confirm-submit',function(){
				var $this = $(this);
				$this.removeClass('confirm-submit');
				var tabIndex = $('.set_charge_contact_right').find('li.actived').index();

				$this.html('提交中 ...');

				if( pub.storeInfo.type != 5 ){ // 非机器
					pub.pickUpMethod =  tabIndex == -1 ? '' : '' + ( tabIndex + 1 );
					pub.remarks = $(".set_order_remark input").val(); // 备注
				}
				// 普通 + 换购 + 预购 公共参数
				pub.orderParamInfo = {
					pickUpMethod : pub.pickUpMethod,
					addrId : pub.addrId,
					firmId : pub.firmId,
					orderFrom : pub.orderFrom,
					message : pub.remarks,
				};
				switch( Number( pub.orderType ) ){
					case 1 : PLAIN.submit(); break; // 普通 提交
					case 2 : BARTER.submit(); break; // 换购 提交
					case 3 : PRE.submit(); break; // 预购提交
				}
			});
		},
	};

	// 普通订单提交
	PLAIN.submit = function(){
		common.ajaxPost($.extend({
			method : 'order_submit_two',
			couponId : pub.couponId,
			juiceDeliverTime : $('#person_area').val(),
			goodsList : pub.goodsInfoApi
		},pub.userBasicParam, pub.orderParamInfo ),function( d ){
			switch( +d.statusCode ){
				case 100000 : (function(){
					common.orderCode.setItem( d.data.orderCode );
					common.orderBack.setItem( '1' );
					var goodsCart = common.JSONparse( common.good.getItem() );
					for(var i = 0; i < goodsCart.length; i++ ){
						if( goodsCart[i].status == 1 ){
							goodsCart.splice(i,1);
							i--;
						}
					}
					common.good.setItem( common.JSONStr( goodsCart ) ); // 存储数据
					common.first_data.removeItem();
					common.two_data.removeItem();
					common.addType.removeItem();
					if (d.data.orderStatus == 3) {
						common.jumpLinkPlain( "order_management.html" );
					}else{
						common.historyReplace( 'order_management.html' );
						common.jumpLinkPlain( "order_pay.html" );
					}
				}()); break;
				case 100711 : common.prompt("地址不在配送范围"); break;
				case 100718 : common.prompt("请选择配货时间"); break;
				default : common.prompt( d.statusStr );
			}
		},function( d ){
			common.prompt( d.statusStr );
		},function(){
			pub.submitBtn.addClass( 'confirm-submit' ).html('订单提交');
		});
	};

	// 换购商品 提交
	BARTER.submit = function(){
		common.ajaxPost($.extend( {
			method : 'barter_order_submit',
			goodsId : pub.goodsId,
			buyNumber : BARTER.buyNumber,
		},pub.userBasicParam, pub.orderParamInfo ),function( d ){
			switch( +d.statusCode ){
				case 100000 : (function(){
					common.orderCode.setItem( d.data.orderCode );
					common.orderBack.setItem( "1" );
					common.seckillGood.removeItem();
					common.addType.removeItem();
					common.historyReplace( 'order_management.html' );
					common.jumpLinkPlain( "order_pay.html" );
				}()); break;
				case 100711 : common.prompt("地址不在配送范围"); break;
				default : common.prompt( d.statusStr ); 
			}
		},function( d ){
			common.prompt( d.statusStr );
		},function(){
			pub.submitBtn.addClass( 'confirm-submit' ).html('订单提交');
		});
	};

	
	// 预购订单 提交
	PRE.submit = function(){
		common.ajaxPost($.extend({
			method : 'pre_order_submit',
			preOrderCode : pub.orderCode,
			couponId : pub.couponId
		}, pub.userBasicParam, pub.orderParamInfo ),function( d ){
			switch( +d.statusCode ){
				case 100000 : (function(){
					common.orderCode.setItem( d.data.orderCode );
					common.addType.removeItem();
					common.historyReplace( 'PreOrder_management.html' );
					common.jumpLinkPlain( "order_pay.html" );
				}()); break;
				case 100711 : common.prompt( "地址不在配送范围" ); break;
				default : common.prompt( d.statusStr );
			}
		},function( d ){
			common.prompt( d.statusStr );
		},function(){
			pub.submitBtn.addClass( 'confirm-submit' ).html('订单提交');
		});
	};
	// 换肤
	pub.apiHandle.change_app_theme = {
		init:function(){
			if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
				$(".order_goods_contain_details,.order_submit").addClass("skin"+sessionStorage.getItem("huanfu"))
			}
		}
	}
	// 模块初始化
	pub.init = function(){
		if (!common.huanfu.getKey()) {
			common.change_app_theme();
			common.defHuanfu.done(function(){
				pub.apiHandle.change_app_theme.init();
			})
		}else{
			pub.apiHandle.change_app_theme.init();
		}
		pub.apiHandle.storeInfo.init(); // 门店信息
		pub.orderType = common.orderType.getItem() || 1; // 接收订单类型  主要指商品类型1.普通，2 换购，3.预购
		pub.tabIndex = common.addType.getKey() ? common.addType.getItem() : 0;// 配送方式 tab 索引
		pub.orderFrom = 'H5'; // 生成订单来源方式
		pub.submitBtn = $('.order_submit_right'); // 提交按钮节点

		// 自动选择 取货方式
		if( common.addType.getKey() ){
			pub.tabIndex == 0  && ( pub.addrId = '' );
			pub.pickUpMethod = pub.tabIndex == 0 ? '1' : '2';
			$('.set_charge_contact_right','.set_charge_contact').find('li').eq( +pub.tabIndex ).addClass('actived');
			$('.set_charge_con').find('.set_charge_address').eq( +pub.tabIndex ).show().siblings().hide();
		}

		// 用户配送地址
		if( common.addType.getKey() && common.addressData.getKey() ){
			pub.AddrInfoRender( common.JSONparse( common.addressData.getItem() ) ); // 地址数据渲染
		}else{
			pub.apiHandle.address_default_show.init(); // 地址获取
		}

		pub.addrDtd.done(function(){
			switch( Number( pub.orderType ) ){
				case 1 : PLAIN.init(); break; // 普通商品
				case 2 : BARTER.init(); break; // 换购
				case 3 : PRE.init(); break; // 预购
			}
		});
		pub.eventHandle.init();
		
	};
	module.exports = pub;
});