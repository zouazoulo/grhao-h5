define('order_management',['common'],function(require, exports, module){

	var common = require('common');

	// 命名空间

	pub = {};
	 
	var wx = common.wx;
	pub.logined = common.isLogin(); // 是否登录

	pub.PAGE_INDEX = common.PAGE_INDEX; // 索引

	pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数

	pub.moduleId = $('[module-id]').attr( 'module-id' );  // 模块 id 

	!common.storeInfo.getKey() && common.jumpLinkPlain('../index.html'); 

	if( pub.logined ){
		pub.userId = common.user_datafn().cuserInfoid;
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
		common.jumpLinkPlain( '../index.html' ); // 未登录跳转
	}


	pub.storeInfo = common.getStoreInfo();

	pub.toFixed = common.toFixed; 

	// 页面box之前切换
	pub.switchInput = function( title, node1, node2, tit ){
		tit = tit || title;
		$('.header_title').html( tit );
		document.title = title;
		$( node1 ).fadeOut(100,function(){
			$( node2 ).fadeIn(200);
		});
	};
	//  命名空间   订单管理
	pub.orderManagement = {};
	var OM = pub.orderManagement;

	OM.orderStatusHash = [ '', 1, 3, 4, 7 , 8]; // ''，全部，1，待支付，3，已付款，4，待收货，7，已完成 处理 tab-----8取货中

	OM.orderStatus = null; // 存储当前状态  处理 tab

	OM.isLast = null; // 最后一页 

	OM.tabIndex = common.orderColumn.getItem(); 

	!OM.tabIndex && ( OM.tabIndex = '0' ); // tab 不存在默认设置为 0

	OM.orderStatusLabel = ['订单超时','已退款','退款中','已作废','','待支付','待支付','已付款','待收货','已完成','已完成','已完成','取货中']; // 订单状态标签 -4

	OM.orderCode = null;  // 订单编号

	OM.orderItemStatus = null; // 某一订单的状态

	OM.userBasicParam = {
		userId : pub.userId,
		tokenId : pub.tokenId
	}

	pub.orderArr = [];

	common.dialog.init();

	OM.apiHandle = {
		init : function(){

		},
		order_list : { // 订单列表
			init : function(){
				common.ajaxPost($.extend({
					method : 'order_list',
					orderStatus : OM.orderStatus,
					pageNo : pub.PAGE_INDEX,
					pageSize : pub.PAGE_SIZE
				},pub.userBasicParam),function( d ){
					switch( +d.statusCode ){
						case 100000 : OM.apiHandle.order_list.apiData( d ); break;
						case 100400 : (function(){
							common.clearData();
							common.prompt( '身份验证过期，请重新登录' );
							common.setMyTimeout(function(){
								common.jumpLinkPlain( 'login.html' );
							},2000);
						}()); break; 
						case 100712 : $('.lodemore').html('没有更多数据了').show(); break;
					}	
				});
			},
			apiData : function( d ){
				OM.isLast = d.data.isLast;
				if (pub.PAGE_INDEX == 1) {
					pub.orderArr = d.data.objects;
				}else{
					pub.orderArr = pub.orderArr.concat( d.data.objects );
				}
	       		var html = '', i = 0;
	       		$.each( d.data.objects, function( i, v ){
		       		var isMachineGoods = v.isMachineGoods == 1;
		       		var statusLabel = OM.orderStatusLabel[ +v.orderStatus + 4 ];
	       	    	html += '<div class="order_manage_content" dataCode=' + v.orderCode + ' dataActivityType=' + v.activityType + '>'
	       	   	    html += '   <div class="order_manage_num clearfloat">'
	       	   	    html += '      <div class="order_num_left">订单编号：' + v.orderCode + '</div>'
	       	   	    if( v.pickUpMethod == 1 && v.orderStatus == 4 ) statusLabel = '待取货' ;

	       	   	    html += '      <div class="order_num_right">' + statusLabel + '</div>'

	       	   	    html += '   </div>'
	       	   	    html += '   <div class="order_manage_details">'
	       	   	    html += '       <dl>'
	       	   	    html += '           <dt dataActivityType=' + v.activityType + '>'
	       	   	    html += '                <img class="img_shopLogo" src="' + v.orderLogo + '" alt="" /> '
	       	   	    html += v.activityType == '1' ? '' : v.activityType == '3' ?  
	       	   	    '<img class="img_miaoLogo" src="../img/icon_miao_s.png" alt="" />' : v.activityType == '4' ? 
	       	   	    '<img class="img_miaoLogo" src="../img/icon_yu_s.png" alt="" />' : v.activityType == '6' ? 
	       	   	    '<img class="img_miaoLogo" src="../img/icon_te_s.png" alt="" />' : '';
	       	   	    html += '           </dt>'
	       	   	    html += '           <dd>'
	       	   	    html += '                <div class="manage_details_top">' + v.allGoodsName + '</div>'
	       	   	    html += '                <div class="manage_details_bottom clearfloat">'
	       	   	    html += '                    <div class="manage_bottom_left">'     		   	                       
	       	   	    html += '                        <div class="order_bottom_money clearfloat">'
	       	   	    html += '                            <div class="order_bottom_money_left">￥' + pub.toFixed( v.realPayMoney ) +'</div>'
	       	   	    html += '                            <div class="order_bottom_money_right">共' + v.allGoodsCount + '件商品</div>'
	       	   	    html += '                        </div>'
	       	   	    html += '                    </div>'
	       	   	    html += '                    <div class="manage_bottom_right" dataCode=' + v.orderCode + ' dataOrderMoney=' + v.goodsMoney + ' dataPayMethod=' + v.payMethod + ' dataStatus=' + v.orderStatus + ' >'
	       		    
	       		    if ( v.orderStatus == '1'  || v.orderStatus == '2' )  html += '      <div class="order_sunmit_status" style="background:#f68a42">去支付</div>'
	       		    if ( v.orderStatus == '4' ){
	       		    	html += ['','<div class="order_take_style1">门店自提</div>','<div class="order_take_style2">送货上门</div>'][ +v.pickUpMethod ];
	       		    }
	       		    v.orderStatus == '7'  && ( html += '      <div class="order_sunmit_status" style="background:#93c01d">去评价</div>' )
	       		   	v.orderStatus == '-1' && ( html += '      <div class="order_sunmit_status" style="background:#f25f4f">删除</div>' ) 
	       		      
	       	   	    html += '                    </div>'
	       	   	    html += '                </div>'
	       	   	    html += '            </dd>'
	       	   	    html += '        </dl>'
	       	   	    html += '    </div>' 
	       	   	    html += '</div>'
	       	    }); 

		       	$('.order_manage_contain').append( html ); 
		       	var arr = OM.isLast ? ['removeClass','没有更多数据了'] : ['addClass','点击加载更多数据'];
		       	$('.lodemore').show()[arr[0]]('loadMore').html(arr[1]);
			}
		},

		order_del : { // 订单删除

			init : function(){
				common.ajaxPost($.extend({
					method : 'order_del',
					orderCode : OM.orderCode,
				},OM.userBasicParam),function( d ){
					switch( +d.statusCode ){
						case 100000: $('.order_manage_content[datacode=' + OM.orderCode + ']').remove(); break;
						case 100400: (function(){
							common.clearData();
							common.prompt( '身份验证过期，请重新登录' );
							common.setMyTimeout(function(){
								common.jumpLinkPlain( 'login.html' );
							},2000);
						}()); break;
						default : common.prompt( d.statusStr );
					}
				})
			}
		}
	};


	OM.eventHandle = {

		init : function(){

			// tab切换
			$('.order_manage_list li').on('click',function(){

				var 
				lodemore = $('.lodemore'),
				$this = $(this),
				i = $this.index(),
				isCur = $this.is('.actived');

				if( !isCur ){

					$('.order_manage_contain').empty();// 清空数据

					lodemore.is(':visible') && lodemore.hide();

					$this.addClass('actived').siblings().removeClass('actived');

					OM.orderStatus = OM.orderStatusHash[ i ];

					common.orderColumn.setItem( i );

					pub.PAGE_INDEX = 1; // 页码重置

					OM.apiHandle.order_list.init();
				}

			});

			$('.order_manage_list li').eq( +OM.tabIndex ).trigger('click'); // 触发点击事件

			//  点击加载更多
			$('.management_contain').on('click','.loadMore.lodemore',function( e ){
				common.stopEventBubble( e );
				pub.PAGE_INDEX ++ ;	
				OM.apiHandle.order_list.init();
			});

			// 订单操作处理
			$('.order_manage_contain').on('click','.order_sunmit_status',function(e){
				common.stopEventBubble(e);

				var $this = $(this);

				OM.orderCode = $this.parent().attr('dataCode');

				common.orderCode.setItem( OM.orderCode );

			 	var status = OM.orderItemStatus = $this.parent().attr('dataStatus');

			 	switch( +status ){
			 		case 1 :
			 		case 2 : common.jumpLinkPlain( 'order_pay.html' ); break;
			 		case 7 : (function(){
			 			var listNodeIndex = $this.parents('.order_manage_content').index();
			 			common.orderColumn.removeItem();
			 			common.commentInfo.setItem( common.JSONStr( pub.orderArr[listNodeIndex].orderDetailsList ) );
				    	common.jumpLinkPlain( 'order_evaluation.html' );
			 		}()); break;
			 		case -1 : (function(){
			 			common.dialog.show('确定删除订单？',function(){},function(){
			 				var 
			 				source = OM.userBasicParam.source = "orderCode" + OM.orderCode;
			 				OM.userBasicParam.sign = common.encrypt.md5( source + "key" + common.secretKeyfn() ).toUpperCase();
			 				OM.apiHandle.order_del.init();
			 			});
			 		}()); break;
			 	}
			});
			

		    //点击跳转订单详情页面
			$('.order_manage_contain').on('click','.order_manage_content',function(){

				var $this = $(this),
				activityType = $this.attr('dataactivitytype');
				common.orderBack.setItem( '1' );
				common.orderCode.setItem( $this.attr('dataCode') ); //存储订单编号
				common.jumpLinkPlain( ( activityType == 5 ? 'preOrderDetail.html' : 'orderDetails.html')  );

			}); 

			common.jumpLinkSpecial( ".header_left", function(){
				common.orderColumn.removeItem();
				common.jumpLinkPlain( "my.html" );
			});
		},
	};

	// 订单列表入口
	OM.init = function(){
		OM.eventHandle.init();  // 事件初始化
	};

/************************************* 订单详情模块 **************************/
	
	// 命名空间

	pub.orderDetail = {};
	var OD = pub.orderDetail;

	OD.orderCode = common.orderCode.getItem(); // 订单编号

	OD.source = "orderCode" + OD.orderCode;

	OD.sign = common.encrypt.md5( OD.source + "key" + common.secretKeyfn()).toUpperCase();

	OD.userBasicParam = {
		userId : pub.userId,
		tokenId : pub.tokenId,
		source : OD.source,
		sign : OD.sign
	}

	// 支付方式
	OD.PAY_METHODS = [ '支付方式：支付宝支付', '支付方式：微信支付', '支付方式：快捷支付', '支付方式：账户余额', '', '支付方式：现金支付' ];

	// 优惠方式
	OD.COUPON_TYPE = [
		{ text : '立减优惠', label :'-￥', derateAmount : 'derateAmount'},
		{ text : '折扣优惠', label :'-￥', derateAmount : 'derateAmount'},
		{ text : '赠送果币', label : "个", derateAmount : 'offScore'},
		{ text : '赠送优惠卷', label : '元券', derateAmount : 'offItemVal'}];

	// 费用详情
	OD.MONEY_DETAIL = [ 'goodsMoney', 'postCost', 'couponMoney' ];

	// 提示信息处理
	OD.TIP_MESSAGE = { 
		'refundBtn' : { text : '确定退款？', apiMethod : 'order_refund' }, 
		'unpayOperate' : { text : '确定取消订单？', apiMethod : 'order_cancle' }, 
		'deleteBtn' : { text : '确定删除订单？', apiMethod : 'order_del' }
	};

	// 不同状态 用户操作数据结构
	OD.OPERATE = [
		{ text : '订单超时', className : 'delete-btn',btnText : '删除'}, // -4
    	{ text : '已退款', className : 'hide', btnText : '' }, // -3
    	{ text : '退款中', className : 'hide', btnText : '' }, // -2
    	{ text : '已作废', className : 'delete-btn', btnText : '删除'}, // -1
    	{ text : '',       className : 'hide', btnText : '' }, // 0 
    	{ text : '待支付', className : 'unpay-operate', btnText : '' }, // 1
    	{ text : '待支付', className : 'unpay-operate', btnText : '' }, // 2
    	{ text : '',       className : 'refund-btn', btnText : '退款', pickUpMethod : ['待自提','已付款']}, // 3
    	{ text : '待收货', className : 'hide', btnText : ''}, // 4
    	{ text : '已完成', className : 'hide', btnText : '评论'}, // 5
    	{ text : '已完成', className : 'hide', btnText : ''}, // 6
    	{ text : '已完成', className : 'comment-btn', btnText : '评论'},// 7
		{ text : '取货中', className : 'hide', btnText : ''}]; // 8

    OD.METHOD = null; // 接收方法

    // 删除成功后 地址关联
    OD.URL_RELATED = {
    	'order_refund' : 'orderDetails.html',
    	'order_cancle' : 'order_management.html',
    	'order_del' : 'order_management.html'
    };
    OD.WATMSTATUS = ['取货异常','取货成功','处理完成'];
	// 详情接口处理
	OD.apiHandle = {
		init : function(){
			OD.apiHandle.order_details.init();
			if (common.isWeiXin()) {
				OD.apiHandle.scanQRCode.init();
			}
			
		},
		order_details : {
			init : function(){
				common.ajaxPost($.extend({},OD.userBasicParam,{
					method : 'order_details',
					orderCode : OD.orderCode
				}),function( d ){
					switch( +d.statusCode ){
						case 100000 : OD.apiHandle.order_details.apiData( d ); break;
						case 100400 : (function(){
							common.clearData();
							common.prompt( '身份验证过期，请重新登录' );
							common.setMyTimeout(function(){
								common.jumpLinkPlain( 'login.html' );
							},2000);
						}()); break;
						default : common.prompt( d.statusStr );
					}
				})
			},
			apiData : function( d ){
				var orderInfo = d.data.orderInfo; 
				pub.firmInfo = d.data.firmInfo;
				OD.isMachineGoods = orderInfo.isMachineGoods == 1;
		        $('.orderDetails_no').html( '订单编号：' + orderInfo.orderCode );          
		        $('.create_time').text( '下单时间：' + orderInfo.createTime);
		        $('.order_money').html( '订单金额：￥' + pub.toFixed( orderInfo.realPayMoney ) );

		        orderInfo.paytime != "" && $(".paytime").show().html( "支付时间" + orderInfo.paytime );
		        orderInfo.realSendTime != "" && $(".sendGood_time").show().html( "发货时间" + orderInfo.realSendTime );
		        // 支付方式
		        (function(){
					( 1 < orderInfo.payMethod && orderInfo.payMethod < 7 ) && $('.order_pay').html( OD.PAY_METHODS[ orderInfo.payMethod - 2 ] );
		        	( orderInfo.payMethod < 2 || 6 < orderInfo.payMethod ) && $('.order_pay').hide();
		        })();
		        // 待处理

		        if( orderInfo.pickUpMethod == '1' ){ 
		        	if (OD.isMachineGoods) {
		        		$('.deli_take_good').html('售货机自提');
		        	}else{
		        		$('.deli_take_good').html('门店自提');
		        	}
		        	
		        	$('.take_goods_address').hide().next().show();
		        	$('.set_address_top').html( '店名：' + d.data.firmInfo.firmName );
		        	$('.set_address_bottom').html( d.data.firmInfo.address );
		        	$('.set_job_time_left').html('营业时间：' + d.data.firmInfo.pickUpTime ); 

		        }else if( orderInfo.pickUpMethod == '2' ){
		        	$('.deli_take_good').html( '送货上门' );
		         	$('.take_goods_address').show().next().hide();
		        	$('.goods_person_name').html( orderInfo.customName );
		        	$('.goods_person_phone').html( orderInfo.customMobile );
		        	$('.goods_person_address').html( orderInfo.receiveAddress );
		        };
		        //商品展示
		        var html = '';
		        OD.pickupFail = [];
		        pub.orderArr = orderInfo.orderDetailsList;
		        $.each(orderInfo.orderDetailsList, function( i, v){
		        	v.buyNumber != v.takeAwayNum &&  OD.pickupFail.push( ( v.buyNumber - v.takeAwayNum ) + '&nbsp;件' + v.goodsName );
		        	html += '<dl class="gds_box clearfloat">'
		        	html += '    <dt>'
		        	html += '         <img src="' + v.goodsLogo + '" alt="" />'
		        	html += v.activityType == '4' ? 
		        	'<img class="gds_goods_te" src="../img/icon_te_s.png"/>' : v.activityType == '2' ? 
		        	'<img class="gds_goods_te" src="../img/icon_miao_s.png" alt="" />' : v.activityType == '3' ? 
		        	'<img class="gds_goods_te" src="../img/icon_yu_s.png" alt="" />' :'';
		        	html += '    </dt> '
		        	html += '    <dd>'
		        	html += '         <div class="gds_right_top">' + v.goodsName + '</div>'
		        	html += '	    <div class="gds_right_center clearfloat">'
		        	html += '		    <div class="gds_goods_mess float_left">' + v.specInfo + '</div>'
					html += '		    <div class="gds_num_price float_right clearfloat">'
					html += '	            <p class="gds_num float_right">X<span>' + v.buyNumber +'</span></p>'
					html += '           </div>'
					html += '	    </div>'
		        	html += '         <div class="gds_right_bottom">'
		        	html += '			<p class="float_left"><span class="font_color">￥' + pub.toFixed( v.nowPrice ) + '</span></p>'
		        	html += '         </div>'            	
		        	html += '    </dd>'
		        	html += '</dl>'
		        });
		        
		        if( OD.isMachineGoods ){ // 机器
		        	orderInfo.pickUpMethod == 1 && $('.take_goods_address_contain').hide();
		        	if( orderInfo.orderStatus == 3  ){ // 已支付
		        		// 手机号 和 取货码
			        	$('.pickUpcode-box').show()
			        	.find('.phoneNumber').html('订单号后五位： ' + orderInfo.orderCode.substring(orderInfo.orderCode.length - 5 ,orderInfo.orderCode.length) ).end()
			        	.find('.codeNumber').html('提取码：  ' + orderInfo.pickUpCode );
			        	
			        	if (common.isWeiXin()) {
			        		$('.pickUpcode-box').find("#scanQRCode").show();
			        	}
			        	if (orderInfo.pickUpMethod == 2) {
			        		$('.pickUpcode-box').find(".codeNumber").html("提货码：******");
			        		$('.pickUpcode-box').find("#scanQRCode").hide();
			        	}
			        	
			        	$('.order_notice').show();
			        	$('.order_situation').hide();
		        	}
		        	$('.position-label-box').show().find('.position-txt').html( pub.firmInfo.address ); 
		        }else{
			       
		        }
				$('.order_message').show().html( '留言信息：' + orderInfo.message );
				$(".order_goods_contain_details").html( html );

		        //支付金额运算详情
		        if ( orderInfo.activityType == 2 ) { // 秒杀
		        	$('.list-group1','.order_set_list').show();
		        	$('.my_order_list1 .order_set_list_right').html( '￥' + pub.toFixed( orderInfo.orderDetailsList[0].goodsAllMoney ) );
		        	$('.my_order_list7 .order_set_list_right').html( '￥' + pub.toFixed( orderInfo.realPayMoney ) );
		        } else{

		        	$('.list-group2','.order_set_list').show();
		        	//是否是首单
					if (orderInfo.orderType == "1") {
						if (orderInfo.firstOrderOff != '' && orderInfo.firstOrderOff > 0) {
							$(".order_first_free").find(".float_right").html("-￥"+orderInfo.firstOrderOff).end()
							$(".order_first_free").css("display","block")
						} 
					}
		        	// 优惠券
		        	(function(){
		        		switch( +orderInfo.couponStrategy ){
		        			case 1 :
		        			case 2 :
		        			case 3 :
		        			case 4 : (function(){
					           	var object = OD.COUPON_TYPE[ +orderInfo.couponStrategy - 1 ];
					           	$(".my_order_list5 .order_set_list_left").html( object.text ).next().html(function(){
					             	return object.label == '-￥' ? ( object.label + orderInfo[ object.derateAmount ] ) : ( orderInfo[ object.derateAmount ] + object.label );
					            });
		        			}()); break;
		        			default : $(".my_order_list5").hide();
		        		}
			        })();
			        // 费用详细
			        (function(){
			        	//OD.isMachineGoods && $('.my_order_list2').hide();
			        	orderInfo.pickUpMethod == 1 && $('.my_order_list2').hide();
						OD.MONEY_DETAIL.forEach(function( v, i ){
		        			$('.my_order_list' + ( i + 1 ) + ' .order_set_list_right').html( '￥' + pub.toFixed( orderInfo[ v ] ) );
		        		});
		        		// orderInfo.payMethod == '5' && $('.my_order_list6').show().find('.order_set_list_right').html( '-￥' + pub.toFixed( orderInfo.mothReduceMoney ) );
		            	$('.my_order_list7 .order_set_list_right').html( '￥' + pub.toFixed( orderInfo.realPayMoney ) );
		        	})();
		    	} 
		    	// 用户操作处理
		    	(function(){
		    		var 
		    		text = OD.OPERATE[ +orderInfo.orderStatus + 4 ].text, 
		    		className = OD.OPERATE[ +orderInfo.orderStatus + 4 ].className;
		    		$('.order_status').html( text );
		    		$('.order_situation').addClass( className ).find( '.oprate-btn' ).text( OD.OPERATE[ +orderInfo.orderStatus + 4 ].btnText);
		    		switch( +orderInfo.orderStatus + 3 ){
		    			case 6 : 
			    			(orderInfo.realPayMoney == 0 || orderInfo.realPayMoney == '') ?  $(".order_situation").css("display","none") : ''; break;
		    			case 7 : 
			    			 $('.order_status').html( (OD.isMachineGoods ? '待取货' : OD.OPERATE[ +orderInfo.orderStatus + 4 ].pickUpMethod[ orderInfo.pickUpMethod - 1 ]) ); break;
		    			case 10 :
		    			case 11 : 
		    				OD.isMachineGoods && (function(){ 
		    					var pickupFail = OD.pickupFail;
		    					$('.pickUpcode-label').addClass( ['status-problem','','status-success','status-resolve'][+orderInfo.watmStatus+1] );
			    				$('.pickUpcode-box').show().find('.pickUpcode').html( pickupFail.length != 0 ? pickupFail.join('，<br/>') + '<br/>取货未成功，请联系客服处理！' : '<p style="line-height:100px;text-indent:50px;">商品全部取货成功</p>').end().find('.order_notice').hide();
								var html = '';
								if ( +orderInfo.watmStatus == '1') {
									html += '<p style="line-height:100px;text-indent:50px;">商品全部取货成功</p>'
								} else if ( +orderInfo.watmStatus == '-1'){
									html += pickupFail.join('，<br/>') + '<br/>取货未成功，请联系客服处理！'
								} else if ( +orderInfo.watmStatus == '2'){
									html += pickupFail.join('，<br/>') + '<br/>取货未成功，商家已退款！'
								}
								$('.pickUpcode-box').show().find('.pickUpcode').html( html ).end().find('.order_notice').hide();
		    				}()); break;
		    		}
		    	})();
		    	    
			}
		},
		// 合并接口 统一处理函数
		unify_deal : { // order_refund,order_cancle,order_del
			init : function(){
				common.ajaxPost($.extend( {},OD.userBasicParam,{
					method : OD.METHOD,
					orderCode : OD.orderCode
				}),function( d ){
					switch( Number(d.statusCode) ){
						case 100000 : common.jumpLinkPlain( OD.URL_RELATED[ OD.METHOD ] ); break;
						case 100400 : (function(){
							common.clearData();
							common.prompt( '身份验证过期，请重新登录' );
							common.setMyTimeout(function(){
								common.jumpLinkPlain( 'login.html' );
							},2000);
						}()); break;
						default : common.prompt( d.statusStr );
					}
				})
			}
		},
		scanQRCode:{
			init:function(){
				var url = location.href.split('#')[0];
				
				common.ajaxPost({
					method : 'weixin_config',
			        url : url
				}, function( d ){
					if( d.statusCode == '100200' ){
						alert("操作异常，请重新操作!");
					}else if( d.statusCode == '100000' ){
						var 
						result = d.data,
						appId = result.appId,
						signature = result.signature,
						timestamp = result.timestamp,
						nonceStr = result.nonceStr;
	
						wx.config({
	
						    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
						    appId: appId, // 必填，公众号的唯一标识
						    timestamp : timestamp, // 必填，生成签名的时间戳
						    nonceStr: nonceStr, // 必填，生成签名的随机串
						    signature: signature,// 必填，签名，见附录1
	
						    jsApiList:["scanQRCode"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
						});
						wx.ready(function(){ 
							wx.checkJsApi({
				            	jsApiList: ['scanQRCode'],
				            	success: function (res) {
				 
				            	}
				            })
						});
						wx.error(function(res){
	
							// alert(common.JSONStr(res))// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
						});
					}		
				}, function( d ){
					alert("分享插件升级中。。。");
				});	
			},
			
		},
		scan_login_pick_up : {
			init:function(){
				common.ajaxPost($.extend({},OD.userBasicParam,{
					method : 'scan_login_pick_up',
					uniqueCode : OD.scanQRCodeData.IMEI,//
					randomCode : OD.scanQRCodeData.UUID,//
					orderCode : OD.orderCode
				}),function( d ){
					switch( +d.statusCode ){
						case 100000 : OD.apiHandle.scan_login_pick_up.apiData( d ); break;
						case 100400 : (function(){
							common.clearData();
							common.prompt( '身份验证过期，请重新登录' );
							common.setMyTimeout(function(){
								common.jumpLinkPlain( 'login.html' );
							},2000);
						}()); break;
						default : common.prompt( d.statusStr );
					}
				})
			},
			apiData:function(d){
				/*var data = {
           			title:"扫描二维码提货",
           			node1:".orderDetails",
           			node2:".watmPickUpGoods"
           		};*/
           		pub.switchInput("扫描二维码提货" , ".orderDetails" , ".watmPickUpGoods");
			}
		},
		scan_pick_up : {
			init:function(){
				common.ajaxPost($.extend({},OD.userBasicParam,{
					//2018-06-29 scan_pick_up ---> scan_confirm_pick_up
					method : 'scan_confirm_pick_up',
					uniqueCode : OD.scanQRCodeData.IMEI,
					randomCode : OD.scanQRCodeData.UUID,
					orderCode : OD.orderCode
				}),function( d ){
					console.log(d);
					switch( +d.statusCode ){
						case 100000 : OD.apiHandle.scan_pick_up.apiData( d ); break;
						case 100400 : (function(){
							common.clearData();
							common.prompt( '身份验证过期，请重新登录' );
							common.setMyTimeout(function(){
								common.jumpLinkPlain( 'login.html' );
							},2000);
						}()); break;
						default : common.prompt( d.statusStr );
					}
				})
			},
			apiData:function(d){
				OD.apiHandle.init();
				/*var data = {
           			title:"订单详情",
           			node1:".orderDetails",
           			node2:"#watmPickUpGoods"
           		};
           		common.switchInput(data);*/
           		pub.switchInput("订单详情" , ".watmPickUpGoods" , ".orderDetails");
			}
		},
		

	};

	// 详情事件
	OD.eventHandle = {

		init : function(){
			//设置高度
			var 
			wh = document.documentElement.clientHeight,
			emptyH = $('.empty').height() + $('.empty1').height();
	
			$('.main,.watmPickUpGoods').height( wh - emptyH );
			
			//返回上一级
			common.jumpLinkSpecial('.header_left',function(){
				var 
				mapBox = $('#map-container'),
				isHide= mapBox.is(':hidden');
				if( !isHide ){
					mapBox.hide();
					$('.main_wrap').show();
					$('.header_title').html('订单详情');
				}else{
					common.jumpLinkPlain('./order_management.html');
				}
			});
			
			$('.order_situation').click(function(e){
				common.stopEventBubble(e);
				var 
				key ,
				$this = $(this),
				commentBtn = $this.is('.comment-btn'),
				className = /unite-deal/.test(e.target.className);

				key = $this.is('.delete-btn') ? 'deleteBtn' : 
				$this.is('.refund-btn') ? 'refundBtn' : 
				$this.is('.unpay-operate') ? 'unpayOperate' : '';

				if( className ){
					if( commentBtn ){ 
						common.orderColumn.removeItem();
						common.commentInfo.setItem( common.JSONStr(pub.orderArr) );
						common.jumpLinkPlain( 'order_evaluation.html' );
					}else if( key ){
						OD.METHOD = OD.TIP_MESSAGE[ key ].apiMethod; // 接口方法
						common.dialog.show(OD.TIP_MESSAGE[ key ].text,function(){},function(){
							OD.apiHandle.unify_deal.init();	
						});
					}
				}
				/paying/.test(e.target.className) && common.jumpLinkPlain( 'order_pay.html' ); // 去支付
			});
		
			var historyBool = true;
			var MAP = common.MAP;
			MAP.init();
			$('.position-label-box').click(function(){
				if( OD.isMachineGoods ){
					$('.main_wrap').hide();
					$('#map-container').show();
					$('.header_title').html('门店位置');
					MAP.ins.on('complete',function(){
						MAP.coords.store = [pub.firmInfo.longitude,pub.firmInfo.latitude];
						MAP.ins.setCenter(MAP.coords.store);
						MAP.setMakerCoords( pub.firmInfo.firmName );
					});
					if( historyBool ){
				        window.history.pushState('','','./orderDetails.html');
				        historyBool = false;
			        }
				}
			});
			window.onpopstate = function(){
				$('#map-container').hide();
				$('.main_wrap').show();
				$('.header_title').html('订单详情');	
			};
			/*新增扫一扫 */
			$(".pickUpcode-box").on("click",".scanQRCode",function(){
				try{
					wx.scanQRCode({
		                needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
		                scanType: ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有
		                success: function (res) {
		                    var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
		                    var str = result.substr(1,result.length -2);
		                    var arr = str.split(",");
		                    var h = "{"
				            for (var i in arr ) {
				            	var n = arr[i].split("=");
				            	h += '"'+ String(n[0]).trim() + '":"'+ String(n[1]).trim() + '",'
				            }
				            h = h.substr(0,h.length -1);
				            h += "}";
		                    OD.scanQRCodeData = JSON.parse(h)
		                   	
		                   	if (OD.scanQRCodeData && OD.scanQRCodeData.NAME == 'PUP') {
		                   		
		                   		OD.apiHandle.scan_login_pick_up.init();
		                   	}
		                    //window.location.href = result;//因为我这边是扫描后有个链接，然后跳转到该页面
		                }
					})
				}catch(e){
					//TODO handle the exception
					console.log(e);
				}
			});
			/*提货按钮*/
			$(".watmPickUpGoods").on("click",".btn_box p",function(){
				var className = $(this)[0].className;
				
				if (className == 'confirm_btn') {
					/*common.switchInput({
						title:'订单详情',
						node1:'.orderDetails',
						node2:'.watmPickUpGoods'
					})*/
					OD.apiHandle.scan_pick_up.init();
					
				} else if (className == 'cancle_btn'){
					/*common.switchInput({
						title:'订单详情',
						node1:'.orderDetails',
						node2:'.watmPickUpGoods'
					})*/
					pub.switchInput("订单详情" , ".watmPickUpGoods" , ".orderDetails");
				}
			})
			
		}
	};

	// 订单详情 入口
	OD.init = function(){
		// OD.map = require('myMap');
		OD.apiHandle.init(); // 接口初始化
		OD.eventHandle.init(); // 事件初始化
	}
	// 公共模块

	// 接口处理
	pub.apiHandle = {};

	//换肤
	pub.apiHandle.change_app_theme = {
		init:function(){
			if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
				switch( pub.moduleId ){
					case 'orderManagement' : (function(){
						$(".order_manage_list,.management_contain").addClass("skin"+sessionStorage.getItem("huanfu"))
					})(); break;
					case 'orderDetail' :  (function(){
						$(".order_details,.pickUpcode-box,.position-label-box,.delivery,.take_goods_address_contain,.order_goods_contain_details,.order_set_list").addClass("skin"+sessionStorage.getItem("huanfu"))
					})();  break;
				}
				
			}
		}
	}
	// 事件处理
	pub.eventHandle = {};
	// 初始化
	pub.init = function(){
		if (!common.huanfu.getKey()) {
			common.change_app_theme();
			common.defHuanfu.done(function(){
				pub.apiHandle.change_app_theme.init();
			})
		}else{
			pub.apiHandle.change_app_theme.init();
		}
		switch( pub.moduleId ){
			case 'orderManagement' : OM.init(); break;
			case 'orderDetail' : OD.init(); break;
		}
	};
	module.exports = pub;
})