/*
	seckill scirpt for Zhangshuo Guoranhao 
	换购 + 换购详情 + 秒杀 | 秒杀详情 + 预购 | 预购详情
*/

define('seckillGoods',['common','goshopCar'],function(require, exports, module){
	var common = require( 'common' );
	var cart = require( 'goshopCar' );

	// 命名空间

	pub = {};
	
	pub.logined = common.isLogin();// 是否登录 

	pub.PAGE_INDEX = common.PAGE_INDEX; // 索引

	pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数

	pub.moduleId = $('[module-id]').attr( 'module-id' ); // 模块id

	pub.RULE_CODE = ['MSGZ-DESC','YGGX-DESC']; // 状态码使用说明  换购 + 预购  

	pub.GOODS_ID = common.getUrlParam( 'goodsId' ); // 秒杀 | 换购 | 预购    商品ID   // 获取 url 参数

	pub.weixin = common.isWeiXin();


	// !common.storeInfo.getKey() && common.jumpLinkPlain('../index.html'); 

	pub.storeInfo = common.getStoreInfo(); // 获取门店信息

	if( pub.logined ){
		pub.userId = common.user_datafn().cuserInfoid;
		pub.source = "userId" + pub.userId;
		pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
		pub.tokenId = common.tokenIdfn();

		if( pub.moduleId == 'preBuyDetail' ){ // 预购详情加密
			pub.source = "preGoodsId" + pub.GOODS_ID + "-userId" + pub.userId;	
			pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
		}
		pub.userBasicParam = {
			userId : pub.userId,
			source : pub.source,
			sign : pub.sign,
			tokenId : pub.tokenId
		};
	};

/******************************************* 商品秒杀 + 换购 ************************************/

	// 命名空间

	pub.seckill = {};
	var SECKILL = pub.seckill;

	// SECKILL.SYSTEM_TIME = null; // 系统时间

	// SECKILL.BARTER_TIMES = null; // 换购次数

	// SECKILL.GOODS_INFO = null; // 商品信息

	// pub.goodsList = null; // 购物车清单数据

	pub.goodsDetail = {}; // 商品详情
	var GOODS_DETAIL = pub.goodsDetail;

	GOODS_DETAIL.goodsId = pub.GOODS_ID;

	GOODS_DETAIL.pageIndex = 1;

	GOODS_DETAIL.pageSize = 10;

	// GOODS_DETAIL.imgGot = true;


	// 必须是严格的日期模式
	SECKILL.parseDate = function( time ){
		return new Date( time.trim().replace(/\-/g,'\/') );
	};
	pub.preZero = function( data ){
		if( !isNaN(data) ){
			if(+data < 10 ) 
				return '0'+ data;
			return data;
		}
	};
	// 日期格式化
	SECKILL.dateFormat = function( time ){
		if (time > 0) {
			var days = parseInt( time / 1000 / 60 / 60 / 24 );
			var hous = parseInt( time / 1000 / 60 / 60 % 24 );
			var min = parseInt( time / 1000 / 60 % 60 );
			var sec = parseInt( time / 1000 % 60 );
			return days + "天" + pub.preZero( hous ) + "小时" + pub.preZero( min ) + "分" + pub.preZero( sec ) + "秒";
		}
	};
	// 倒计时
	SECKILL.countDown = function(){
		var time,_this,cle;
		var list = $(".zs-list");
		var timeDeal = function(){
			var clientTime = new Date().getTime();
			var time_difference = clientTime - SECKILL.SYSTEM_TIME;
			var time;
			list.length == $('.isEnd').length && clearTimeout( timer );
			list.not('.isEnd').each(function(){
				_this = $(this);
				time = _this.attr("time");
				if( (time - time_difference)<0){
					_this.addClass('isEnd').html("秒杀进行中").css("color","#f1640e");
					var str = _this.attr('id');
					$("."+str).html("立即秒杀").addClass("float_right1");
				}else{
					_this.html( "秒杀开始：" + SECKILL.dateFormat((time - time_difference)) ).css("color","#f1640e");
				}
			})
		}
		timeDeal();
		var timer = setInterval( timeDeal, 1000 );
	};
	GOODS_DETAIL.goods_comment_list = {};

	GOODS_DETAIL.goods_comment_list.init = function(){
		common.ajaxPost({
			method : 'goods_comment_list',
			goodsId : GOODS_DETAIL.goodsId,
			pageNo : GOODS_DETAIL.pageIndex,
			pageSize : GOODS_DETAIL.pageSize
		},function( d ){
			if( d.statusCode == '100000' ){
				GOODS_DETAIL.isLast = d.data.isLast;
				GOODS_DETAIL.isLast && GOODS_DETAIL.loadMore.html('没有更多数据');
				if(d.data.objects.length == 0 ){ GOODS_DETAIL.loadMore.off('click').html('暂无评论'); return; }
				GOODS_DETAIL.loadMore.before($('#goods-comment-data').tmpl( d.data ));
			}else{
				GOODS_DETAIL.loadMore.html('暂无评论').off('click');
			}
			$('.comment-star[starNum]').each(function(){
				var 
				i,html='',
				$this = $(this),
				starNum = parseInt( +$this.attr('starNum') / 2 );
				for( i = 0; i < 5; i++ ){
					html += '<span class="' + ( i < starNum ? 'selected' : '' )+ '"></span>';
				} 
				$this.html( html );	
			});
		},function(){
			GOODS_DETAIL.loadMore.hide();
		});
	}

	SECKILL.apiHandle = {
		init : function(){
			SECKILL.apiHandle.grh_desc.init( pub.RULE_CODE[0] ); // 换购说明
		},
		// 换购机会
		user_barter_chance : {

			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'user_barter_chance',
					firmId : pub.storeInfo.id
				}),function( d ){
		 			d.statusCode == '100000' && $('.seckill_notice span').html( SECKILL.BARTER_TIMES = d.data ? d.data.count : '0' );
				});
			}
		},
		// 换购列表
		barter_list :{
			init : function(){
				common.ajaxPost({
					method : 'barter_list',
					firmId : pub.storeInfo.id,
	 				websiteNode : pub.storeInfo.websiteNode
				},function( d ){
					d.statusCode == '100000' && SECKILL.apiHandle.barter_list.apiData( d );
				});
			},
			apiData : function( d ){
				var adInfoList = d.data.adInfoList;
				common.bannerShow( adInfoList, ".seckill_box2 .index_banner", function( d ){
 					var html = '', i = 0;
 					for ( i in d ){
						html += '<div class="swiper-slide lazy" ><a href="' + ( d[i].linkUrl == '' ? 'javascript:void(0)' : d[i].linkUrl ) + '"><img src="' + d[i].adLogo + '" /></a></div>'
					}
					return html;
				},'.seckill_box1 .swiper-p2');

		        var 
		        html = '',
		        bool1 = true,
		        bool2 = true,
		        pagination = d.data.pagination,
		        old = !$.isArray( d.data.oldBarterGoodsList ) ? [] : d.data.oldBarterGoodsList; // 确保返回值为空

		        pagination = !$.isArray( pagination ) ? []  : pagination;
		       
		        var mergeData = pagination.concat( old );

		        if( old.length == 0 && pagination.length == 0 ) return;
		        
		        $.each( mergeData,function( i, v ){
		        	if( v.status == 1 ){
		        		if( bool1 ){
			        		html += '<div class="seckill_main_box_today_tit">本期换购</div>';
			        		bool1 = false;
		        		}
		        	}else{
		        		if( bool2 ){
			        		html += '<div class="seckill_main_box_tomorrow_tit">往期回顾</div>';
			        		bool2 = false;
		        		}
		        	}
		        		html += '<div class="seckill_main_box_center">'
		        	if( v.status == 1 ){
			       	    html += '<dl class="clearfloat" data-id="' + v.id + '" goods-id="' + v.goodsId + '" data-spec-info="' + v.specInfo + '" data-name="' + v.goodsName + '" data-price="' + v.nowPrice + '" data-logo="' + v.goodsLogo + '" data-max-num="' + v.buyNumber + '" data-package-num="' + v.packageNum + '">'
			     	}else{
			     		html += '<dl class="clearfloat" data-id="' + v.id + '" >'
			     	}    
			     	    html += '<dt><img src="' + v.goodsLogo + '"></dt>'
			       	    html += '<dd>'
			       	    html += '<div class="sekill_good_name">'
			       	    html += '<span class="float_left">' + v.goodsName + '</span>'
			       	if( v.status == 1 ){
			       	    html += '<span class="float_right stock">剩余' + ( v.initNum - v.saleNum ) + '件</span>'
			       	}
			       	    html += '</div>'
			       	    html += '<div class="sekill_good_specifications">' + v.specInfo + '</div>'
			       	    html += '<div class="sekill_good_specifications1">' + v.goodsDescribe + '</div>'
			       	    html += '<div class="sekill_good_bottom clearfloat">'
			       	    html += '<div class="float_left">'
			       	    html += '<span class="new_price font_color">￥' + v.nowPrice + '</span>'
			       	    html += '<span class="old_price">￥' + v.nomalPrice + '</span>'           	    
			       	    html += '</div>'
			       	if( v.status == 1 ){
			       	    if ( v.packageNum >= 0 ) {
			       	    	html += '<div class="float_right float_right1 float_right2 zs-barter">立即换购</div>'
			       	    }else{
			       	    	html += '<div class="float_right">没有了</div>'
			       	    }
			       	}
			       	    html += '</div>'   
			       	    html += '</dd>'
			       	    html += '</dl>'           	   
			       	    html += '</div>'
		        });
		        $('.seckill_box2 .seckill_main_box_wrap').html( html );
			}
		},
		grh_desc : {
			init : function( RULE_CODE ){
				common.ajaxPost({
					method : 'grh_desc',
					code : RULE_CODE
				},function( d ){
					if( d.statusCode = "100000" ){
						var str = d.data.desc;
						$('.alert_title').html( d.data.title );
						$('.alert_content').html( str.replace(/\r\n/g, "<br>") );  
	    			}
				});
			}
		},
		// 秒杀列表
		kill_goods_list : {
			init : function(){
				common.ajaxPost({
					method : 'kill_goods_list',
					firmId : pub.storeInfo.id,
	 				websiteNode : pub.storeInfo.websiteNode
				}, function( d ){
					d.statusCode == '100000' && (function(){
						pub.weixin && (function(){
			 				common.weixin.config( location.href.split('#')[0] );
			 				common.weixin.share( d.data.customShare );
			 			}());
						SECKILL.apiHandle.kill_goods_list.apiData( d );
					}());
				});
			},
			apiData : function( d ){
				// 轮播处理 待优化
				common.bannerShow( d.data.adInfoList, '.seckill_box1 .index_banner', function( d ){ 
					var html = '', i = 0;
 					for ( i in d ){
						var link = d[i].linkUrl;
						link == "" ? link = 'javascript:void(0)' : link = d[i].linkUrl;
						html += '<div class="swiper-slide lazy"><a href="' + link + '"><img src="' + d[i].adLogo + '" /></a></div>'
					}
					return html;
				}, '.seckill_box1 .swiper-p1');

				// 服务器当前时间
				SECKILL.SYSTEM_TIME = SECKILL.parseDate( d.data.newDate ||  ( d.data.killGoodsDetailList ? d.data.killGoodsDetailList[0].newDate : '' ) );

				// $.isArray(killGoodsDetailList) && (  );
				var 
				killGoodsDetailList = d.data.killGoodsDetailList,
				pastKillGoodsDetailList = !$.isArray( d.data.pastKillGoodsDetailList ) ? [] : d.data.pastKillGoodsDetailList,
				html = '',
				bool1 = true,
				bool2 = true;

				killGoodsDetailList = !$.isArray(killGoodsDetailList) ? [] : killGoodsDetailList;
				var mergeData = killGoodsDetailList.concat( pastKillGoodsDetailList );
				if( mergeData.length == 0 ) return;
				$.each( mergeData, function( i, v ){
						if( v.status == 1 ){
							if( bool1 ){
				        		html += '<div class="seckill_main_box_today_tit">本周秒杀</div>'; bool1 = false;
							}
			        	}else{
			        		if( bool2 ){
				        		html += '<div class="seckill_main_box_tomorrow_tit">往期回顾</div>'; bool2 = false;
			        		}
			        	}
				        	html += '<div class="seckill_main_box_today_wrap">'
				        if( v.status == 1 ){
				        	html += 	'<ul class="seckill_main_box_tit">'
				        	html +=			'<li id = "cl' + i + '" time = "' + ( SECKILL.parseDate( v.startTime ) - SECKILL.SYSTEM_TIME ) + '" data-startTime="' + v.startTime + '" class="zs-list">秒杀开始</li>'
				        	html += 	'</ul>'
				        }else{
				        	html +='<div class="seckill_main_box_tit">' + v.startTime.substring(0,16)+'</div>'	
				        }
				        	html += 	'<div class="seckill_main_box_center">'
			        	if( v.status == 1 ){
			        		html += 		'<dl class="clearfloat" data-id="' + v.id  + '" goods-id="' + v.id + '" data-spec-info="' + v.specInfo + '" data-name="' + v.goodsName + '" data-price="' + v.nowPrice + '" data-logo="' + v.goodsLogo + '"  data-nomal-price="' + v.nomalPrice + '">'
			        	}else{	
			        		html += 		'<dl class="clearfloat" data-id="' + v.id + '" >'
			        	}
		        		    html += 			'<dt><img src="' + v.goodsLogo + '"></dt>'
		        	  	    html += 			'<dd>'
		        	  	    html += 				'<div class="sekill_good_name">' + v.goodsName + '</div>'
		        	  	    html += 				'<div class="sekill_good_specifications">' + v.specInfo + '</div>'
		        	  	    html += 				'<div class="sekill_good_specifications1">' + v.goodsDescribe + '</div>'
		        	  	    html +=					'<div class="sekill_good_bottom clearfloat">'
		        	  	    html +=						'<div class="float_left">'
		        	  	    html += 						'<span class="new_price font_color">￥' + v.nowPrice + '</span>'
		        	  	    html += 						'<span class="old_price">￥' + v.nomalPrice + '</span>'           	    
		        	  	    html +=						'</div>'
				        if( v.status == 1 ){  	    
				        	if ( SECKILL.parseDate( v.startTime ) > SECKILL.SYSTEM_TIME ) {
				        	  	    html += 				'<div class="float_right cl' + i + '">即将开始</div>'
				        	} else{
				        	  	if ( v.secBuyNum <= 0) {
				        	  	    html += 				'<div class="float_right">秒杀光了</div>'
				        	  	}else{
				        	  	    html += 				'<div class="float_right float_right1 enableKill">立即秒杀</div>'
				        	  	}
				        	}
				        }
		        	  	    html += 				'</div>'   
		        	  	    html += 			'</dd>'
		        	  	    html += 		'</dl>'           	   
		        	  	    html += 	'</div>'
			        		html += '</div>'
				});
				$('.seckill_box1 .seckill_main_box_wrap').html( html );
		        $('.seckill_main_box_today_tit')[0] && SECKILL.countDown();
			}
		},
		// 秒杀
		click_kill : {
			init : function(){
				common.ajaxPost($.extend( {},pub.userBasicParam, {
					method : 'click_kill',
	    			goodsId : pub.GOODS_ID
				}),function( d ){
					if( d.statusCode == "100000" ){
						var goodsInfo = SECKILL.GOODS_INFO;
						cart.addgoods( goodsInfo.id, goodsInfo.name, goodsInfo.price, goodsInfo.logo, goodsInfo.specifications, goodsInfo.maxBuyNum, goodsInfo.packageNum, goodsInfo.oldPrice, 2 );
						common.prompt( "秒杀成功！" );
						cart.style_change();
					}else{
						common.prompt( d.statusStr );
					}
				});
			}
		},
		// 秒杀商品详情
		kill_goods_details : {
			init : function(){
				common.ajaxPost({
					method : 'kill_goods_details',
					goodsId : pub.GOODS_ID
				},function( d ){

					var killGoodsDetail = d.data.killGoodsDetail || d.data.pastkillGoodsDetail;
					
					common.bannerShow( killGoodsDetail, '.goodsDetails_img_box', function( data ){
						var i,  html = '', imgArr = data.goodsPics.trim().split(/\s*@\s*/);
						imgArr[ imgArr.length - 1 ] == '' && imgArr.pop();
						for ( i in imgArr ) {
							html += '<div class="swiper-slide lazy"><img src="' + imgArr[ i ] + '" width="100%" /></div>'
						}
						return html;
					});
					SECKILL.GOODS_INFO =  {
						id : killGoodsDetail.id,
						name : killGoodsDetail.goodsName,
						price : killGoodsDetail.nowPrice,
						specifications : killGoodsDetail.specInfo,
						logo : killGoodsDetail.goodsLogo,
						oldPrice : killGoodsDetail.nomalPrice,
						status : 1,
						count : '1'
					};
					if ( d.data.killGoodsDetail ) {

						SECKILL.SYSTEM_TIME = SECKILL.parseDate( d.data.newDate );

						var diffTime = SECKILL.parseDate( killGoodsDetail.startTime ) - SECKILL.SYSTEM_TIME;

						$(".zs-list").attr("time", diffTime);

						if ( diffTime > 0 ) {
							$('.gd_number button').addClass("float_right").html("即将开始");
						}else{
							$('.gd_number button').addClass("float_right1").html("立即秒杀");
						}
						SECKILL.countDown();
					}else{
						$(".zs-list").attr("time",0).html("活动已結束").css("color","red");
					}

					//展示商品信息
					$('.gd_goodName').html( killGoodsDetail.goodsName );

					killGoodsDetail.goodsContext && $('.goodsDetails_box2_').show().find('li.goods-detail-info').html( killGoodsDetail.goodsContext );
					$('.gd_specification').html( killGoodsDetail.specInfo );		
					$('.gd_price').html('<span>￥' + killGoodsDetail.nowPrice + '</span>&nbsp;&nbsp;<del>￥' +  killGoodsDetail.nomalPrice + '</del>');	
					// console.log( d );
				},function( d ){
					common.prompt(d.statusStr);
				},function(){
					GOODS_DETAIL.goods_comment_list.init();
				});
			}
		}
	};
	SECKILL.eventHandle = {

		init : function(){

			var tabNum = common.seckill.getItem() || 1; // 获取存储的tab
			// tab 切换
			$('.seckill_tab_box').on('click','li.tab_list',function(){
				var 
				$this = $(this),
				isCur = $this.is('.actived'),
				index = $this.index();
				if( !isCur ){
					$this.addClass('actived').siblings().removeClass('actived');
					common.seckill.setItem( index + 1 + '');
					$('.seckill_box > div').eq( index ).fadeIn( 300 ).siblings().hide();
					var json = { 0 : ['barter_list','hide'], 1 : ['kill_goods_list','fadeIn'] };
					SECKILL.apiHandle[ json[ index ][ 0 ] ].init(); 
					$(".footer_wrap")[json[index][1]](); 
				}
			});
			
			$('.seckill_tab_box .tab_list').eq( tabNum - 1 ).trigger('click');
    		common.alertShow( '.seckill_notice .float_right' ); // 弹窗
			common.alertHide();
			common.jumpLinkSpecial( ".header_left", "../index.html" ); // 回首页

			//点击商品跳转到商品详情
			$(document).on('click','dl',function(e){
				common.stopEventBubble(e);
				var index = $('.seckill_tab_box li.actived').index();
				var pathName = ['seckillDetaila.html?goodsId=','seckillDetail.html?goodsId='][index];
				// alert($(this).attr("data-id"))
				common.jumpLinkPlain( pathName + $(this).attr("data-id") );
			});
			// 可以秒杀
			$('.seckill_box1 .seckill_main').on('click','.enableKill',function(e){
				common.stopEventBubble(e);
				if ( pub.logined ) {
					var $this = $(this),
					node = $this.parents('[data-id]')
					goodsId = node.attr('data-id');
					SECKILL.GOODS_INFO = {
					    id : goodsId,
					    name : node.attr('data-name'),
					    price : node.attr('data-price'),
					    specifications : node.attr('data-spec-info'),
					    logo : node.attr('data-logo'),
					    oldPrice : node.attr('data-nomal-price'), 
					    count : "1"
				    };
				    pub.GOODS_ID = goodsId;
				    SECKILL.apiHandle.click_kill.init();
				}else{
					common.jumpMake.setItem( '2' );
					common.jumpLinkPlain( "login.html" );
				}
			});
			// 点击换购
			SECKILL.eventHandle.clickBarter(); 
		},
		
		clickBarter : function(){

			//点击换购
			$('.zs-box').on('click','.zs-barter',function(e){
				common.stopEventBubble(e);
				if ( pub.logined ) {
					if( SECKILL.BARTER_TIMES > 0 ){ // 换购次数

						var seckill_good = [];

						if( pub.moduleId == 'seckill' ){ // 换购列表
							var $this = $(this),
							node = $this.parents('[data-id]');
							seckill_good = [{
							    id : node.attr( 'data-id' ),
							    name : node.attr( 'data-name' ),
							    price : node.attr( 'data-price' ),
							    specifications : node.attr( 'data-spec-info' ),
							    logo : node.attr( 'data-logo' ),
							    status : 1,
							    count : "1"
						    }];
						}else{
							seckill_good.push( SECKILL.GOODS_INFO );
						}
					    common.orderType.setItem( '2' );
					    common.seckillGood.setItem( common.JSONStr( seckill_good ) );
					    common.jumpLinkPlain( 'order_set_charge.html' );
					}else{
						common.prompt( "购物满99元才有机会哟!" );
					}
				}else{
					if ( pub.moduleId != 'seckill' ){
						common.jumpMake.setItem( "12" );
						common.goodid.setItem( pub.GOODS_ID );
					}else{
						common.jumpMake.setItem( "2" );
					}
					common.jumpLinkPlain( "login.html" );
				}
			});
		}
	};
	SECKILL.init = function(){

		SECKILL.apiHandle.barter_list.init(); // 换购列表
		pub.logined ? SECKILL.apiHandle.user_barter_chance.init() : $('.seckill_notice span').html( "0" );  // 换购机会 

		// 购物车初始化
		cart.style_change();
		SECKILL.apiHandle.init();
		SECKILL.eventHandle.init();
	};



	/******************************************* 商品秒杀 商品详情  ************************************/


	// 详情模块 命名空间

	pub.detail = {};

	var PUB_DETAIL = pub.detail;

	// 秒杀 命名空间

	PUB_DETAIL.seckill = {};

	// 接口处理命名空间
	PUB_DETAIL.seckill.apiHandle = {
		init : function(){}
	};

	// 事件命名空间
	PUB_DETAIL.seckill.eventHandle = {
		init : function(){
			// 点击秒杀
			$('.goodsDetails_box1').on('click',".float_right1",function(e){
				common.stopEventBubble(e);
				// 点击秒杀 调用接口
				pub.logined ? SECKILL.apiHandle.click_kill.init() : (function(){
					common.jumpMake.setItem( "3" );
					common.goodid.setItem( pub.GOODS_ID );
					common.jumpLinkPlain( "login.html" );
				}());
			});
		}
	}



	PUB_DETAIL.seckill.init = function(){
		PUB_DETAIL.seckill.apiHandle.init();
		PUB_DETAIL.seckill.eventHandle.init();
	};




	

	/******************************************* 换购  商品详情 ************************************/

	// 换购 详情命名空间

	PUB_DETAIL.barter = {};
	var BARTER = PUB_DETAIL.barter;

	// 接口数据处理
	BARTER.apiHandle = {
		init : function(){}
	};

	// 事件处理
	BARTER.eventHandle = {
		init : function(){
			SECKILL.eventHandle.clickBarter(); // 点击换购
		},
	};

	BARTER.init = function(){
		// 换购机会
		BARTER.eventHandle.init();
		BARTER.apiHandle.init();
	};

	PUB_DETAIL.eventHandle = {
		init : function(){
			
			PUB_DETAIL.eventHandle.tempInit(); // 临时处理  
			// 返回上一页
			common.jumpLinkSpecial(".header_left",function(){
				window.history.back();
			});
		},
		// 所有详情
		tempInit : function(){
			$(window).on('resize',function(){
				GD.ww = $(window).width();
				GD.wh = $(window).height();
			});
			$('.preview-modal').on('click',function(){
				$(this).hide();
				$('body').removeClass('locked');
				$(document).off('touchstart touchmove');
			});

			GOODS_DETAIL.loadMore = $('#goods-comment-data-box').find('.clickmore');
			//返回顶部
			window.onscroll = function(){
				var scroll = document.body.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
				var isHide = $('.toTop').is(':hidden');
				if( scroll >= 600 ){
					isHide && $('.toTop').show();			
				}else{
					!isHide && $('.toTop').hide();
				}
			};

			$('.toTop').on('click', function(){
				$('html,body').animate({
					scrollTop : 0
				},500) 
			});
			$('.switch-tab .switch-list').click(function(){
				var $this = $(this),
				i = $this.index(),
				isCur = $this.is('.actived');
				if( isCur ) return;
				$this.addClass('actived').siblings().removeClass('actived');
				$('.switch-content').find('li').eq( i ).show().siblings().hide();
			});
			GOODS_DETAIL.loadMore.click(function(){
				if( !GOODS_DETAIL.isLast ){
					// GOODS_DETAIL.imgGot = true;
					GOODS_DETAIL.pageIndex++;
					GOODS_DETAIL.goods_comment_list.init();
				}else{
					$(this).off('click').html('没有更多数据');
				}
			});
			GOODS_DETAIL.ww = $(window).width();
			GOODS_DETAIL.wh = $(window).height();
			$('#goods-comment-data-box').on('click','.comment-img img',function(){
				var $this = $(this);
				var prevImgs = [];
				if( pub.weixin ){
					$this.parent().find('img').each(function(){
						var src = $(this).attr('src');
						src && prevImgs.push( src ) ;
					});
					common.wx.previewImage({
						current: $this.attr('src'),
						urls: prevImgs
					});
				}else{
					// 非微信环境图片预览
					var nw = $this[0].naturalWidth;
					var nh = $this[0].naturalHeight;
					var src = $this.attr('src');
					var wRate = nw / GOODS_DETAIL.ww;
					var hRate = nh / GOODS_DETAIL.wh;
					var scale = hRate > wRate ? 1/hRate : 1/wRate;
					var style = 'transform:translate3d(-50%,-50%,0) scale(' + scale + ');-webkit-transform:translate3d(-50%,-50%,0) scale(' + scale + ');-moz-transform:translate3d(-50%,-50%,0) scale(' + scale + ');-o-transform:translate3d(-50%,-50%,0) scale(' + scale + ');-ms-transform:translate3d(-50%,-50%,0) scale(' + scale + ');';
					$('.preview-modal').html('<img src="' + src + '" alt="" style="' + style + '"/>').show();
					$('body').addClass('locked');
					$(document).on('touchstart',function( e ){
						$(document).on('touchmove',function( e ){
							e.preventDefault();
						});
					});
				}
			});
			
		},

	};

	// 秒杀 和 换购 共同接口 详情
	PUB_DETAIL.apiHandle = {
		init : function(){
			PUB_DETAIL.apiHandle.goods_show.init();
		},
		goods_show : {
			init : function(){
				common.ajaxPost({
					method : 'goods_show',
					goodsId : pub.GOODS_ID
				},function( d ){
					if ( d.statusCode == "100000" ) {
						var goodsInfo = d.data.goodsInfo;
						pub.weixin && (function(){
			 				common.weixin.config( location.href.split('#')[0] );
			 				common.weixin.share({
								title : goodsInfo.goodsName,
								desc : goodsInfo.goodsDescribe + "\n￥" + goodsInfo.nowPrice + "/" + goodsInfo.specInfo ,
							    link : window.location.href, // 分享链接
							    imgUrl : goodsInfo.goodsLogo
							});
			 			}());
						PUB_DETAIL.apiHandle.goods_show.apiData( d );
					}
				},function( d ){
					common.prompt( d.statusStr );
				},function(){
			        GOODS_DETAIL.goods_comment_list.init();
				})
			},
			apiData : function( d ){
				var goodsInfo = d.data.goodsInfo,
					killGoodsDetail = d.data.killGoodsDetail;
					// 轮播 秒杀 + 换购
					common.bannerShow( goodsInfo, '.goodsDetails_img_box', function( data ){
						var i,  html = '', imgArr = data.goodsPics.trim().split(/\s*@\s*/);
						imgArr[ imgArr.length - 1 ] == '' && imgArr.pop();
						for ( i in imgArr ) {
							html += '<div class="swiper-slide lazy"><img src="' + imgArr[ i ] + '" width="100%" /></div>'
						}
						return html;
					});
				  
					SECKILL.GOODS_INFO =  {
						id : goodsInfo.id,
						name : goodsInfo.goodsName,
						price : goodsInfo.nowPrice,
						specifications : goodsInfo.specInfo,
						logo : goodsInfo.goodsLogo,
						oldPrice : goodsInfo.nomalPrice,
						status : 1,
						count : '1'
					};

				// if( pub.moduleId == 'seckillGoodsDetail' ){
					// if ( killGoodsDetail ) {
					// 	SECKILL.SYSTEM_TIME = SECKILL.parseDate( killGoodsDetail.newDate );
					// 	$(".zs-list").attr("time", SECKILL.parseDate( killGoodsDetail.startTime ) - SECKILL.SYSTEM_TIME );
					// 	if ( killGoodsDetail.startTime.replace(/\-/g, "\/") > killGoodsDetail.newDate.replace(/\-/g, "\/")) {
					// 		$('.gd_number button').addClass("float_right").html("即将开始");
					// 	} else{
					// 		$('.gd_number button').addClass("float_right1").html("立即秒杀");
					// 	};
					// 	SECKILL.countDown();
					// }else{
					// 	$(".zs-list").attr("time",0).html("活动已結束").css("color","red");;
					// }
					// //展示商品信息
					// $('.gd_goodName').html( goodsInfo.goodsName );
				// }else{
					if ( goodsInfo.status == "1" ) {
						$('.gd_goodName').find(".float_left").html( goodsInfo.goodsName );
						$('.gd_goodName').find(".float_right.stock").html("剩余" + ( goodsInfo.initNum -  goodsInfo.saleNum) + "件")
						if ( goodsInfo.packageNum <= 0) {
							$('.gd_number button').addClass("float_right").html("换购光了");
						} else{
							$('.gd_number button').addClass("float_right1 zs-barter").html("立即换购");
						}
					} else{
						$('.gd_goodName').html( goodsInfo.goodsName );
						$('.gd_number button').hide();
					};
				// }

				goodsInfo.goodsContext && $('.goodsDetails_box2_').show().find('li.goods-detail-info').html( goodsInfo.goodsContext );
				$('.gd_specification').html( goodsInfo.specInfo );		
				$('.gd_price').html('<span>￥' + goodsInfo.nowPrice + '</span>&nbsp;&nbsp;<del>￥' + goodsInfo.nomalPrice + '</del>');	

			}
		}
	};

	PUB_DETAIL.init = function(){
		switch( pub.moduleId ){
			case 'barterGoodsDetail' : (function(){
				BARTER.init(); 
				PUB_DETAIL.apiHandle.init();
			}()); break; // 换购详情初始化
			case 'seckillGoodsDetail' : (function(){
				SECKILL.apiHandle.kill_goods_details.init();
				PUB_DETAIL.seckill.init(); 
				cart.style_change();
			}()); break; // 秒杀详情初始化
		}
		PUB_DETAIL.eventHandle.init();
	}

/******************************************** 预购模块 *************************************/
	
	// 命名空间

	pub.preBuy = {};
	var PRE_BUY = pub.preBuy; 

	// 预购列表 
	PRE_BUY.ACTIVITY_STATUS = { 
		'willbegin' : [1,'活动未开始','#65a032'],
		'book' : [2,'活动进行中','#65a032'],
		'bookend' : [2,'活动进行中','#65a032'],
		'notretainage' : [2,'活动进行中','#65a032'],
		'end' : [3,'活动已结束','#b2b2b2']
	};

	PRE_BUY.apiHandle = {
		init : function(){
			PRE_BUY.apiHandle.pre_goods_list.init();
		},

		// 预购商品列表
		pre_goods_list : {
			init : function(){
				common.ajaxPost({
					method : 'pre_goods_list',
					firmId : pub.storeInfo.id,
	 				websiteNode : pub.storeInfo.websiteNode
				},function( d ){
					d.statusCode == "100000" && (function(){
						pub.weixin && (function(){
			 				common.weixin.config( location.href.split('#')[0] );
			 				common.weixin.share( d.data.customShare );
			 			}());
						PRE_BUY.apiHandle.pre_goods_list.apiData( d );
	 				}());
				})
			},
			apiData : function( d ){
				// 轮播
				var data = d.data;
 				data.adInfoList != "" && data.adInfoList.length != "0" && common.bannerShow( data.adInfoList, '.index_banner', function( d ){
 					var html = '', i = 0;
 					for ( i in d ){
						html += '<div class="swiper-slide lazy"><a href="' + ( d[i].linkUrl == '' ? 'javascript:void(0)' : d[i].linkUrl ) + '"><img src="' + d[i].adLogo + '" /></a></div>'
					}
					return html;
 				});
 				var preGoodsList = !$.isArray( d.data.preGoodsList ) ? [] : d.data.preGoodsList;
 				if( preGoodsList == 0 ){ return; }
 				preGoodsList.forEach(function(v ,i){
 					if( v.goodsInfo != null ){
	 					var html = '';
	 					html += '<dl class="clearfloat" data="' + v.id + '">'
	 					html += '	<dt><img src="' + v.goodsInfo.goodsLogo + '"/></dt>'
	 					html += '	<dd>'
	 					html += '		<div class="pre_good_name">' + v.goodsInfo.goodsName+'</div>'
	 					html += '		<div class="pre_good_specifications">' + v.goodsInfo.specInfo + '</div>'
	 					html += '		<div class="pre_good_specifications1">' + v.goodsInfo.goodsDescribe + '</div>'
	 					html += '		<div class="pre_good_price clearfloat">'
	 					html += '			<p class="clearfloat"><span>定金：</span><span class="font_color">￥' + v.frontMoney + '</span></p>'
	 					html += '			<p class="clearfloat"><span>尾款：</span><span class="font_color">￥' + v.retainage + '</span></p>'
	 					html += '		</div>'
	 					html += '	</dd>'
	 					html += '</dl>'
	 					var 
	 					preStatus = PRE_BUY.ACTIVITY_STATUS[ preGoodsList[i].preStatus ];
	 					boxNode = $('.pre_goods_box' + preStatus[0] );
	 					boxNode.show().find('.pre_active_tit').html( preStatus[1] ).css("background-color",preStatus[2]);
		 				boxNode.find('.active_goods_box').append( html );
 					}
 				});
			}
		}
	};

	PRE_BUY.eventHandle = {
		init : function(){
			common.jumpLinkSpecial(".header_left","../index.html"); //点击返回首页
			$(".pre_goods_box").on('click',"dl",function(){
				common.jumpLinkPlain( "preDetails.html?goodsId=" + $(this).attr("data") );
			});
		},
	};
	PRE_BUY.init = function(){
		PRE_BUY.apiHandle.init();
		PRE_BUY.eventHandle.init();
	}

/******************************************** 预购详情模块 *************************************/	

	// 命名空间

	pub.preBuyDetail = {};
	var PRE_BUY_DETAIL = pub.preBuyDetail;

	PRE_BUY_DETAIL.PRE_GOODS_COUNT = 1; // 预购商品数量

	// 预购详情  状态
	PRE_BUY_DETAIL.PRE_STATUS = {
		'willbegin' : ['活动未开始','#b2b2b2'],
		'book' : ['支付定金','#fe7831'],
		'bookend' : ['待付尾款','#b2b2b2'],
		'notretainage' : ['支付尾款','#fe7831'],
		'end' : ['活动结束','#b2b2b2']
	};

	// 预购详情接口数据处理
	PRE_BUY_DETAIL.apiHandle = {
		init : function(){
			SECKILL.apiHandle.grh_desc.init.call( PRE_BUY_DETAIL.apiHandle.grh_desc, pub.RULE_CODE[1] ); // 规则
			PRE_BUY_DETAIL.apiHandle.pre_good_show.init(); // 详情信息列表展示
		},
		pre_good_show : {
			init : function(){
				common.ajaxPost({
					method : 'pre_good_show',
					preGoodsId : pub.GOODS_ID // 商品id
				},function( d ){
					if ( d.statusCode == "100000" ) {

						var 
						preGoods = d.data.preGoods,
						goodsInfo = preGoods.goodsInfo;

						common.bannerShow( goodsInfo, '.goodsDetails_img_box', function( data ){
							var i, html = '',
							imgArr = data.goodsPics.trim().split(/\s*@\s*/);

							imgArr[ imgArr.length - 1 ] == '' && imgArr.pop();
							
							for ( i in imgArr ) {
								html += '<div class="swiper-slide lazy"><img src="' + imgArr[ i ] + '" width="100%" /></div>'
							}
							return html;
						});

						//本地商品数量
						$(".gd_number .minus_num").show().next('.show_num').show().html("1").attr("dataId",goodsInfo.id);
						//添加存储数据到元素
						$('.good_box1_box11').attr({
							'data' : goodsInfo.id,
							'dataname' : goodsInfo.goodsName,
							'dataprice' : goodsInfo.nowPrice,
							'datalogo' : goodsInfo.goodsLogo,
							'dataspecInfo' : goodsInfo.specInfo,
							'datamax' : goodsInfo.maxBuyNum,
							'datapackagenum' : goodsInfo.packageNum
						});	

						function substr( str ){ // 临时函数
							return ( str + '' ).substring(5,16);
						}

						//展示商品信息
						$('.gd_goodName').html( goodsInfo.goodsName );
						$('.gd_specification').html( goodsInfo.specInfo );
						$('.pre_gd_price').html('定金：<span class="font_color">￥' + preGoods.frontMoney + '</span>&nbsp;&nbsp;&nbsp;&nbsp;尾款：<span class="font_color">￥' + preGoods.retainage + '</span>');		
						$(".pre_goods_details dl").eq(0).find("dd").html( substr( preGoods.frontMoneyStart ) + " —— " + substr( preGoods.frontMoneyEnd ) ).end().end().eq(1).find("dd").html( substr( preGoods.retainageStart ) + " —— " + substr( preGoods.retainageEnd ) );
						goodsInfo.goodsContext && $('.goodsDetails_box2_').show().find('li.goods-detail-info').html(goodsInfo.goodsContext);
						pub.weixin && (function(){
			 				common.weixin.config( location.href.split('#')[0] );
			 				common.weixin.share({
								title : goodsInfo.goodsName,
								desc : goodsInfo.goodsDescribe + "\n￥" + goodsInfo.nowPrice + "/" + goodsInfo.specInfo ,
							    link : window.location.href, // 分享链接
							    imgUrl : goodsInfo.goodsLogo
							});
			 			}());

						var tempData = PRE_BUY_DETAIL.PRE_STATUS[ preGoods.preStatus ]; 

						!tempData && ( preGoods.preStatus = 'end' ); // 查找不到 给默认值end
						
						$('.pre_pay_btn').html(tempData[0]).css("background",tempData[1]).addClass( preGoods.preStatus );
					}
				},function( d ){
					common.prompt( d.statusStr );
				},function(){
	 				GOODS_DETAIL.goods_comment_list.init();
				})
			}
		},
		save_pre_order_rcd : { // 生成支付订单
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'save_pre_order_rcd',
					preGoodsId : pub.GOODS_ID,
					buyNum : '' + PRE_BUY_DETAIL.PRE_GOODS_COUNT,
					firmId : pub.storeInfo.id
				}),function( d ){
					switch( +d.statusCode ){
		 				case 100000 : (function(){
		 					common.historyReplace( 'PreOrder_management.html' );
		 					common.orderCode.setItem( d.data.orderCode );
							common.jumpLinkPlain( 'order_pay.html?search=pre' ); //跳转到支付页面
		 				}()); break;
		 				case 100716 : common.prompt("已有预购订单"); break;
		 			}
				});
			}
		},
		pre_shop_cart_submit : {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'pre_shop_cart_submit',
					pickUpMethod : common.PICK_UP_METHOD,
					preGoodsId : pub.GOODS_ID
				}),function( d ){
					switch( +d.statusCode ){
		 				case 100000 : PRE_BUY_DETAIL.apiHandle.pre_shop_cart_submit.apiData( d ); break;
		 				case 100713 : common.prompt( "未参与预购活动" ); break;
		 				default : common.prompt( d.statusStr );
		 			}
				})
			},
			apiData : function( d ){
				common.historyReplace( 'PreOrder_management.html' );
				common.orderCode.setItem( d.data.order.preOrderCode );
				common.jumpLinkPlain( ['order_set_charge.html','order_pay.html'][ +d.data.order.isSavePreOrder ] );
				common.orderType.setItem( "3" );
			}
		}

	};

	// 预购详情事件处理
	PRE_BUY_DETAIL.eventHandle = {
		init : function(){
			PUB_DETAIL.eventHandle.tempInit.call( PRE_BUY_DETAIL.eventHandle ); // 继承秒杀换购方法
			// 返回上一页
			common.jumpLinkSpecial(".header_left","pre.html");

			common.alertShow( '.pre_rule' ); // 规则弹窗
			common.alertHide();

			$('.pre_pay_btn').on('click',function(){

				var $this = $(this),
				bool = $this.is('.willbegin') || $this.is('.bookend') || $this.is('.end');

				if( bool ){
					$this.off('click');
					return;
				}
				if( pub.logined ){
					$this.is('.book') && PRE_BUY_DETAIL.apiHandle.save_pre_order_rcd.init(); // 生成支付订单
					$this.is('.notretainage') && PRE_BUY_DETAIL.apiHandle.pre_shop_cart_submit.init();  // 支付尾款
				}else{
					common.jumpMake.setItem("4");
					common.goodid.setItem( pub.GOODS_ID );
					common.jumpLinkPlain('login.html');
				}
			});

			//增加商品
			$(".add_num").on('click',function(){
				var 
				$this = $(this),
				node = $this.parents('[datamax]'),
				datamax = node.attr("datamax"), //限购
				datapackagenum = node.attr("datapackagenum"); //库存
				if ( PRE_BUY_DETAIL.PRE_GOODS_COUNT < datapackagenum ) { // 库存
					if( +datamax != 0 ){ // 限购
						if( PRE_BUY_DETAIL.PRE_GOODS_COUNT < datamax ){
							$this.prev('.show_num').html( ++PRE_BUY_DETAIL.PRE_GOODS_COUNT );
						}else{
							common.prompt( "该商品限购" + datamax + "件" );
						}
					}else{
						$this.prev('.show_num').html( ++PRE_BUY_DETAIL.PRE_GOODS_COUNT );
					}
				} else{
					common.prompt( "库存不足" );
				}
			});

			//减少商品
			$('.minus_num').on('click',function(){
				PRE_BUY_DETAIL.PRE_GOODS_COUNT > 1 &&  $(this).next('.show_num').html( --PRE_BUY_DETAIL.PRE_GOODS_COUNT );
			});

		}
	};

	PRE_BUY_DETAIL.init = function(){
		PRE_BUY_DETAIL.eventHandle.init();
		PRE_BUY_DETAIL.apiHandle.init();
	}

	// 父模块
	pub.init = function(){
 		$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
 		switch( pub.moduleId ){
 			case 'seckill' : SECKILL.init(); break; 
 			case 'preBuy' : PRE_BUY.init(); break; 
 			case 'preBuyDetail' : PRE_BUY_DETAIL.init(); break; 
 			default : PUB_DETAIL.init();
 		}
		common.footerNav(function( i ){
			var url = ['../index.html','moregoods.html','cart.html','my.html'];
			common.jumpLinkPlain(url[i]);
		});
	}





















	module.exports = pub;
	
});