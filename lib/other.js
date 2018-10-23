/*
* 	other scirpt for Zhangshuo Guoranhao
* 	评价 + 订单支付结果 + 充值说明 + 充值记录  
*/ 
define('other',['common','zipImage'],function(require, exports, module){

	var common = require('common');

	// 命名空间

	pub = {};

	pub.zipImage = require('zipImage');
	pub.moduleId = $( '[module-id]' ).attr( 'module-id' );

	pub.logined = common.isLogin(); // 是否登录

	!common.storeInfo.getKey() && common.jumpLinkPlain('../index.html'); 

	if( pub.logined ){
		pub.tokenId = common.tokenIdfn(); 
		pub.orderCode = common.orderCode.getItem();
		pub.source = "orderCode" + pub.orderCode;
		pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
		pub.userBasicParam = {
			tokenId : pub.tokenId,
			sign : pub.sign,
			source : pub.source,
			orderCode: pub.orderCode,
		};
	}else{
		pub.moduleId != 'rechargeExplain' && common.jumpLinkPlain( '../index.html' ); // 未登录回到首页
	}
	pub.PAGE_INDEX = common.PAGE_INDEX; // 索引
	pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数

/******************************************* 订单评价 *************************************/

	// 命名空间

	pub.evaluate = {};

	var EV = pub.evaluate;
	EV.starNum = 5;
	EV.goodWrapApi = null;
	
	// 接口处理
	EV.apiHandle = {
		init : function(){},
		order_comment : {
			init : function(){
				common.ajaxPost({
					method : 'order_comment',
					orderCode : $('[ordercode]').eq(0).attr('ordercode'),
					service : EV.sumComment[0],
					goods : EV.sumComment[1],
					speed : EV.sumComment[2],
					goodsComments : EV.goodWrapApi
				},function( d ){
					d.statusCode == '100000' && (function(){
						common.historyReplace( '../index.html' );
						window.location.replace('html/order_management.html');
					}());
				});
			}
		},
		comment_img_upload : {

			init : function( $listNode ){

				$.post(common.API,{
					method : 'comment_img_upload',
					orderCode : EV.orderCode,
					goodsId : EV.goodsId,
					suffix : EV.suffix,
					imgStr : EV.imgStr
				},function( d, status, xhr ){
					if( status == 'success' && d.statusCode == '100000' ){
						$listNode.before( '<li class="upload-list"><img src="' + d.data + '" alt=""><span class="img-delete"></span></li>' );
					}else{
						common.tip( d.statusStr );
					}
				},'json');
			},
		}
	};
	// 事件处理
	EV.eventHandle = {
		init : function(){

			$('.comment-box').on('propertychange input','textarea',function(){
				var $this = $(this)[0];
				$this.style.height = $this.scrollHeight + 'px';
			});
			$('.comment-box').on('click','.slideDown',function(){
				var $this = $(this),
				uploadBoxNode = $this.parents('.ul-box').next(),
				isShow = $this.parents('.ul-box').next().is(':visible');
				isShow ? (function(){
					uploadBoxNode.slideUp();
					$this.removeClass('actived');
				}()) : (function(){
					uploadBoxNode.slideDown();	
					$this.addClass('actived');
				}());
			});

			$('.comment-box').on('touchstart','.zs-star',function(){
				var $this = $(this);
				$this.parent().find('.zs-star').removeClass('selected');
				$this.nextAll('.zs-star').addClass('selected');
			});

			$('#publish-btn').click(function(){

				EV.sumComment = [];

				var goodWrap = []; // 保存接口数据

				$('.comment-all-op').each(function(){
					var $this = $(this);
					EV.sumComment.push( (EV.starNum - $this.find('.selected').length) * 2 );
				});
				$('.comment-gooods-list').each(function(){
					var $this = $(this);
					var imgArr = [];
					var json = {};
					$this.find('.upload-list').not('.upload-oprate').each(function(){
						imgArr.push( $(this).children('img').attr('src') );
					});
					json.goodsId = $this.attr('goodid');
					json.service = ( EV.starNum - $this.find('.selected').length ) * 2;
					json.comment = $this.find('textarea').val();

					json.pics = imgArr.join('@');
					goodWrap.push( json );
				});
				EV.goodWrapApi = common.JSONStr( goodWrap );
				EV.apiHandle.order_comment.init();
			});

			EV.fileReaderFn = function ( file, $listNode ){
				var fileReader = new FileReader();
				fileReader.readAsDataURL( file );
				fileReader.onloadend = function( e ){
					EV.imgStr = this.result.split(',').pop();
					EV.apiHandle.comment_img_upload.init( $listNode );
				};
			};

			$('.comment-box').on('change','input[type="file"]',function(e){
				var _this = $(this),
				$this = _this[0],
				$listNode = _this.parents('.upload-oprate'),
				files = $this.files[0],
				listNode = _this.parents('[goodid]');
				EV.suffix = files.name.split('.').pop();
				EV.goodsId = listNode.attr('goodid');
				EV.orderCode = listNode.attr('ordercode');
				if( files.size < 51200 ){
					EV.fileReaderFn( files, $listNode );
				}else{
					pub.zipImage(files).then(function (result) {
						EV.imgStr = result.base64.split(',').pop();
						EV.apiHandle.comment_img_upload.init( $listNode );
			        }).catch(function(){
			        	EV.fileReaderFn( files, $listNode );
			        });
				}
			});
			common.jumpLinkSpecial('.header_left','order_management.html');

			$('.comment-box').on('click','.img-delete',function(){
				var $this = $(this);
				var node = $this.parent('.upload-list').remove();
				node = null;
			});

			




		},
	};

	EV.init = function(){
		$('#comment-goodsInfo-box').html( $('#comment-goodsInfo-data-box').tmpl( common.JSONparse( common.commentInfo.getItem() ) ) );
		EV.eventHandle.init();
	};

/**************************** 订单支付结果 模块 **********************************/
	// 命名空间

	pub.payRusult = {};
	var PR = pub.payRusult;

	PR.apiHandle = {
		init : function(){
			PR.apiHandle.unitDeal.init();
		},
		unitDeal : {
			init : function(){
				common.ajaxPost($.extend({
					method : PR.METHOD,
				},pub.userBasicParam),function( d ){
					d.statusCode == "100000" ? PR.apiHandle.unitDeal.apiData( d ) : common.prompt( d.statusStr );
				});
			},
			apiData : function( d ){
				d = d.data.orderInfo ? d.data.orderInfo : d.data;
				if ( d.orderStatus == "3" || d.payStatus == '2' ) {
					$(".result_status").addClass("result_bg").html("订单支付成功！");
					$(".result_goto").html("查看订单").css("background","#93c01d").on("click",function(){
						d.payStatus == '2' && common.jumpLinkPlain( "preOrderDetail.html" );
						d.orderStatus == '3' && common.jumpLinkPlain( "orderDetails.html" );
			    	})
				} else{
					$(".result_status").addClass("result_bg2").html("订单支付失败！");
					$('.result_message').remove();

					$(".result_goto").html("返回重新支付").css("background","#fe7831").on("click",function(){
			    		common.jumpLinkPlain( 'order_pay.html' );
			    	})
				};
		    	$(".result_detail ul li").eq(0).html("订单号:" + d.orderCode ).next().html("实付款:<span class='font_color'>￥" + d.realPayMoney + "</span>");
		    	$(".result_message").show();
			}
		}
	};

	PR.eventHandle = {
		init : function(){
			common.jumpLinkSpecial(".header_left",function(){
				common.jumpLinkPlain( (PR.isDeposit ? "PreOrder_management.html" : "order_management.html") )
			});
		}
	};
	// 支付结果 模块 初始化
	PR.init = function(){
		PR.isDeposit = pub.orderCode.substring(8,10) == "07";
		PR.METHOD = PR.isDeposit ? 'pre_order_details' : 'order_details';
		PR.apiHandle.init();
		PR.eventHandle.init();
	};

/**************************** 充值说明 模块 **********************************/
	// 命名空间
	pub.payExplain = {};
	var PE = pub.payExplain;
	
	PE.apiHandle = {
		init : function(){
			PE.apiHandle.month_card_type_list.init();
		},
		month_card_type_list : {
			init : function(){
				common.ajaxPost({
					method : 'month_card_type_list',
	 				websiteNode : pub.storeInfo.websiteNode
				},function( d ){
					d.statusCode == '100000' ? PE.apiHandle.month_card_type_list.apiData( d ) : common.prompt( d.statusStr );
				});
			},
			apiData : function( d ){
				var 
				html = ''      	
				d = d.data;
		    	for(var i in d.monthCardType){
		    		html += '<div class="month_discount_detail clearfloat">'
		    		html += '    <div class="discount_detail_intr">' + d.monthCardType[i].policyName + '</div>'        		
		    		html += '    <div class="discount_detail_intr">' + d.monthCardType[i].extraMoney + '</div>'        	  
		    		html += '</div>'
		    	}

		    	!!d.grhAdDesc && $('.month_service_intro').show().html( d.grhAdDesc.desc.replace(/\r\n/g, "<br/>") );
		    	!!d.grhCouponDesc && $('.month_copon_instruction').show().html( d.grhCouponDesc.desc.replace(/\r\n/g, "<br/>") );
		    	!!d.adInfo && $('.month_service_banner').css( 'background','url(' + d.adInfo.adLogo + ')' ); 
		    	$('.month_discount_content').html( html );
			    	
			}
		}
	};
	PE.eventHandle = {
		init : function(){
			common.jumpLinkSpecial( '.header_left', document.referrer );
			common.jumpLinkSpecial('.discount_pay',function(){
				pub.logined ? common.jumpLinkPlain( 'month_recharge.html?search=recharge' ) : (function(){
				   	common.jumpMake.setItem( "7" );
				   	common.jumpLinkPlain( "login.html" );
				}());
			});
		}
	};

	PE.init = function(){
		pub.storeInfo = common.JSONparse( common.storeInfo.getItem() ); // 获取门店信息
		PE.apiHandle.init();
		PE.eventHandle.init();
	};

/**************************** 充值记录 模块 **********************************/

	pub.rechargeRecord = {};
	var RR = pub.rechargeRecord;

	RR.payWay = {
		"2" : { text : '支付宝充值' },
		"3" : { text : '微信充值' },
		"4" : { text : '快捷充值' },
		"5" : { text : '充值卡充值'},
		"8" : { text : '系统充值' }
	};
	RR.apiHandle = {
		init : function(){
			pub.userId = common.user_datafn().cuserInfoid;
			pub.source = "userId" + pub.userId;
			pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();

			RR.apiHandle.user_recharge_rcd.init();
		},
		user_recharge_rcd : {
			init : function(){
				common.ajaxPost({
					method : 'user_recharge_rcd',
					userId : pub.userId,
					pageNo : pub.PAGE_INDEX,
					pageSize : pub.PAGE_SIZE,
					tokenId : pub.tokenId,
					sign : pub.sign,
					source : pub.source
				},function( d ){
					d.statusCode == "100000" && RR.apiHandle.user_recharge_rcd.apiData( d );
				});
			},
			apiData : function( d ){
				var html='';
				pub.isLast = d.data.lastPage;
				pub.lodemore.show().html( pub.isLast ? '没有更多数据了' : '点击加载更多数据' );
		        if( !$.isArray( d.data.list ) || d.data.list.length == 0 ){
		        	pub.lodemore.show().html('没有更多数据了'); return;
		        }
				d.data.list.forEach(function( v, i ){
					html += '<div class="fruit_get_content clearfloat">'
					html += '<div class="fruit_get_content_left">' + v.payTime.substring(0,10) +'</div>'
					html += '<div class="fruit_get_content_center">' + RR.payWay[ v.paymentMethod ].text + '</div>'
					html += '<div class="fruit_get_content_right">￥' + v.money + '</div>'
					html += '</div>'
				});
				$('.fruit_get_contain').append( html );
			}
		}
	};

	RR.eventHandle = {
		init : function(){
			pub.lodemore.on('click',function(){				
				if( !pub.isLast ){
					pub.PAGE_INDEX ++ ;
					RR.apiHandle.user_recharge_rcd.init();
				}				
			});
			common.jumpLinkSpecial('.header_left','month_recharge.html?search=recharge');
		}
	};

	RR.init = function(){
		pub.lodemore = $('.lodemore');
		RR.apiHandle.init();
		RR.eventHandle.init();

	};
 	pub.apiHandle = {};
	pub.eventHandle = {};
 	pub.init = function(){
 		switch( pub.moduleId ){
 			case 'evaluate' : EV.init(); break; // 评价
 			case 'payResult' : PR.init(); break; // 支付结果
 			case 'rechargeExplain' : PE.init(); break; // 充值说明
 			case 'rechargeRecord' : RR.init(); break; // 充值记录
 		}
 	};

	module.exports = pub;	

});	
