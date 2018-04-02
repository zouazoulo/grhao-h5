define('preOrderManagement',['common'],function( require, exports, module ){

	var common = require('common');

	// 命名空间

	pub = {};

	pub.logined = common.isLogin(); // 是否登录

	pub.PAGE_INDEX = common.PAGE_INDEX; // 索引

	pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数

	pub.moduleId = $('[module-id]').attr( 'module-id' );  // 模块 id // preOrderManagement

	pub.toFixed = common.toFixed;

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
	};

	// 命名空间
	
	pub.preOrderManagement = {};
	var PRE_OM = pub.preOrderManagement;

	common.dialog.init();

	PRE_OM.paramListInit = function(){

		PRE_OM.preOrderStatusHash = [ 1, 3, 4, '' ]; // ''，全部，1，定金未支付，3，定金支付待付尾款，4，待收货 tab

		PRE_OM.tabIndex = common.preColumn.getItem() ? common.preColumn.getItem() : '0'; //  tab切换

		// PRE_OM.preOrderStatus = null; // 订单状态

		PRE_OM.lodemore = $('.lodemore'); // 将节点全局

		// PRE_OM.listNode = null; // 列表 item 节点

		// PRE_OM.orderCode = null; // 订单编号

		// PRE_OM.isLast = null;

		PRE_OM.prePayStatus = ['已作废','','待付订金','待付尾款','待付尾款','已完成']; // 订单支付状态

		PRE_OM.orderStatus = {
			'book':[ 1, '去支付' ],// 支付定金
			'notretainage':[ 2, '去支付'], // 支付尾款
			'cancle':[ 3, '删除' ], // 
			'expire':[ 3, '删除' ], // 
			'bookend':[ 4, '付尾款' ], //
			'end':[5,''] 
		};

		// PRE_OM.source = null; // source
		// PRE_OM.sign = null; // sign
	};

	PRE_OM.apiHandle = {

		init : function(){

		},
		pre_order_list : {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'pre_order_list',
					prePayStatus : PRE_OM.preOrderStatus,
					pageNo : pub.PAGE_INDEX,
					pageSize : pub.PAGE_SIZE,
				}),function( d ){
					switch( +d.statusCode ){
						case 100000 : PRE_OM.apiHandle.pre_order_list.apiData( d ); break;
						case 100712 : PRE_OM.lodemore.show().html('没有更多数据了'); break;
						default : common.prompt( d.statusStr );
					}
				});
			},
			apiData : function( d ){
				
				PRE_OM.isLast = d.data.isLast;

				var html = '';
				d.data.objects.forEach(function( v, i ){

					var orderCode = v.orderCodeRetainage ? v.orderCodeRetainage : v.orderCode; // 接收订单编号
					html += '<div class="order_manage_content" data="' + v.payStatus + '"  dataCode="' + orderCode + '">'
					html += '   <div class="order_manage_num clearfloat">'
					 
					html += '       <div class="order_num_left">订单编号：' + orderCode + '</div>'

					html += '       <div class="order_num_right">' + PRE_OM.prePayStatus[ +v.payStatus + 1 ] + '</div>'     			
					
					html += '   </div>'
					html += '   <div class="order_manage_details">'
					html += '       <dl class="clearflaot">'
					html += '            <dt>'	
					html += '                 <img class="img_shopLogo" src="' + v.goodsInfo.goodsLogo + '">'
		            html += '                 <img class="img_miaoLogo" src="../img/icon_yu_s.png" alt="" />'			                
					html += '            </dt>'
					html += '            <dd>'	    			
					html += '                <div class="manage_details_top">' + v.goodsInfo.goodsName + '</div>'
					html += '                <div class="manage_details_bottom clearfloat">'
					html += '                    <div class="manage_bottom_left">'
					html += '                        <div class="preOrder_bottom_price clearfloat">'
					html += '                            <div class="preOrder_bottom_specify">' + v.goodsInfo.specInfo + '</div>'
					html += '                            <div class="preOrder_number" style="float: right;">X<span></xspan>' + v.buyNum + '</div>'
					html += '                        </div>'
					html += '                        <div class="preOrder_bottom_money clearfloat">'
					html += '                            <div class="deposit">定金：' + pub.toFixed( v.preGoods.frontMoney ) + '</div>'
					html += '                            <div class="payment" style="padding-left: 40px;">尾款：' + pub.toFixed( v.preGoods.retainage ) + '</div>'
					html += '                        </div>'
					html += '                    </div>'
					html += '                    <div class="premanage_bottom_right" dataCode="' + orderCode + '" datapreordercode="' + v.orderCodeRetainage + '">'

					html += '<div class="order_sunmit_status' + PRE_OM.orderStatus[ v.preGoods.preStatus ][0] + '">' + PRE_OM.orderStatus[ v.preGoods.preStatus ][1] + '</div>'

					html += '                    </div>'
					html += '                </div>'
					html += '            </dd>'
					html += '       </dl>'
					html += '   </div>'    				    			
					html += '</div>'
				});
				$('.order_manage_contain').html( html );

				var arr = PRE_OM.isLast ? ['removeClass','没有更多数据了'] : ['addClass','点击加载更多数据']; 
				PRE_OM.lodemore.show()[arr[0]]('loadMore').html(arr[1]);
			}
		},
		order_del : {
			init : function(){
				common.ajaxPost({
					method : PRE_OM.orderCode ? 'pre_order_del' : 'order_del',
					orderCode : PRE_OM.orderCode,
					tokenId : pub.tokenId,
					sign : PRE_OM.sign,
					source : PRE_OM.source
				},function( d ){
					if( d.statusCode == '100000' ){
						var node = PRE_OM.listNode.remove();
						node = null;
					}else{
						common.prompt( d.statusStr );
					}
				})
			}
		}
	};

	PRE_OM.eventHandle = {
		init : function(){
			$('.myOrder_man_item','.myOrder_management_top').on('click',function(e){

				var 
				$this = $(this),
				i = $this.index(),
				isCur = $this.is('.actived');

				if( !isCur ){

					$('.order_manage_contain').empty();
					PRE_OM.lodemore.is(':visible') && PRE_OM.lodemore.hide();

					$('.order_manage_contain').html(); // 清空数据

					$this.addClass('actived').siblings().removeClass('actived');

					PRE_OM.preOrderStatus = PRE_OM.preOrderStatusHash[ i ];

					common.preColumn.setItem( i );

					pub.PAGE_INDEX = 1; // 页码重置

					PRE_OM.apiHandle.pre_order_list.init();
				}
			});
			$('.myOrder_man_item','.myOrder_management_top').eq( +PRE_OM.tabIndex ).trigger('click'); // 触发点击事件

			//点击返回
		    $(".header_left").on("click",function(){
		    	common.preColumn.removeItem();
		    	common.jumpLinkPlain( 'my.html' );
		    });
		    // 点击加载更多
		    $('.management_contain').on('click','.lodemore.loadMore',function(){				
    			common.stopEventBubble( e );
    			pub.PAGE_INDEX++;
    			PRE_OM.apiHandle.pre_order_list.init();
	    	});

	    	//跳转到订单详情页面
    		$('.order_manage_contain').on('click','.order_manage_content',function(){
    			var	
    			$this = $(this),
    			orderCode = $this.attr( 'dataCode' );
    			common.orderCode.setItem( orderCode );
    			common.orderBack.setItem( '2' );
    			common.jumpLinkPlain( "preOrderDetail.html" );
    		});	

    		//支付定金跳转
			$('.order_manage_contain').on('click','.order_sunmit_status1',function(e){
				common.stopEventBubble(e);
		        common.orderCode.setItem( $(this).parent().attr('datacode') );
		        common.orderBack.setItem( '2' );
		        common.jumpLinkPlain( 'order_pay.html?search=pre' );
			});	

			//尾款支付跳转
			$('.order_manage_contain').on('click','.order_sunmit_status2',function(e){

				common.stopEventBubble(e);
				var 
				$this = $(this),
				datacode = $this.parent().attr("datapreordercode"), // 尾款订单
				orderCode = datacode ? datacode : $this.parent().attr( 'dataCode' );
				common.orderCode.setItem( orderCode );
			    common.orderBack.setItem( '2' );
		        if( !!datacode ){
		        	common.jumpLinkPlain( 'order_pay.html' );
		        }else{
		        	common.orderType.setItem( "3" );
					common.jumpLinkPlain( 'order_set_charge.html' );
		        } 			    		
			});

			//点击删除
			$('.order_manage_contain').on('click','.order_sunmit_status3',function(e){
				common.stopEventBubble(e);
				var $this = $(this);
		        PRE_OM.orderCode = $this.parent().attr('datacode'); // 支付定金订单 订单号
		        PRE_OM.listNode = $this.parents('.order_manage_content');
		        common.dialog.show('确定删除订单？',function(){},function(){
		        	PRE_OM.source = 'orderCode' +  PRE_OM.orderCode;
					PRE_OM.sign = common.encrypt.md5( PRE_OM.source + "key" + common.secretKeyfn() ).toUpperCase();
					PRE_OM.apiHandle.order_del.init();
		        });
			});	
		}
	};
	// 预购订单管理初始化
	PRE_OM.init = function(){
		PRE_OM.paramListInit(); // 初始化参数列表
		PRE_OM.eventHandle.init(); 
	};


	/************************************ 订单详情模块 ***************************************/

	// 命名空间

	pub.preOrderDetail = {};
	var PRE_OD = pub.preOrderDetail;

	PRE_OD.paramListInit = function(){

		PRE_OD.orderCode = common.orderCode.getItem(); // 订单编号

		PRE_OD.orderType = PRE_OD.orderCode.substring( 8, 10 ); // 订单类型

		PRE_OD.method = PRE_OD.orderType == '07' ? 'pre_order_details' : 'order_details'; // 获取接口类型

		PRE_OD.source = "preOrderCode" + PRE_OD.orderCode;

		PRE_OD.sign = common.encrypt.md5( PRE_OD.source + "key" + common.secretKeyfn() ).toUpperCase();

		// 不同状态 不同操作 定金支付订单 , 需要增加其他状态在这里配置参数即可
		PRE_OD.OPERATE = [
	    	{ text : '已作废',     className : 'delete-btn',    btnText : '删除'},
	    	{ text :'',            className : 'hide',          btnText : ''},
	    	{ text : '待付定金',   className : 'unpay-operate', btnText : ''},
	    	{ text : '待付尾款', className : '',              btnText : '', bookend : {className : 'wait-pay-btn', btnText : '付尾款'}, notretainage : {className : 'pay-left-btn', btnText : '支付尾款'} },
	    	{ text : '待付尾款', className : '',              btnText : '', bookend : {className : 'wait-pay-btn', btnText : '付尾款'}, notretainage : {className : 'pay-left-btn', btnText : '支付尾款'} }
		];
		// 订单支付方式
		PRE_OD.PAYWAY = ['支付方式：账户余额','','','支付方式：微信支付','支付方式：连连支付','支付方式：账户余额','支付方式：在线支付'];

		// 提示信息处理    弹窗 apiMethod 存方法
		PRE_OD.TIP_MESSAGE = { 
			'refundBtn' : { text : '确定退款？', apiMethod : 'order_refund' }, 
			'unpayOperate' : { text : '确定取消订单？', apiMethod : 'order_cancle' }, 
			'deleteBtn' : { text : '确定删除订单？', apiMethod : PRE_OD.method == 'pre_order_details' ? 'pre_order_del' : 'order_del'  }
		};

		PRE_OD.API_METHOD = null; // 存储接口方法

		PRE_OD.URL_RELATED = {
			'order_refund' : 'orderDetails.html',
			'order_cancle' : 'PreOrder_management.html',
			'order_del' : 'PreOrder_management.html',
			'pre_order_del': 'PreOrder_management.html'
		};


	};

	PRE_OD.substr = function ( str ){ 
		return ( str + '' ).substring(5,16); 
	};
	PRE_OD.apiHandle = {
		init : function(){
			PRE_OD.apiHandle.order_details.init();
		},
		order_details : {
			init : function(){
				common.ajaxPost({
					method : PRE_OD.method,
					orderCode : PRE_OD.orderCode,
					tokenId : pub.tokenId,
					sign : PRE_OD.sign,
					source : PRE_OD.source
				},function( d ){
					PRE_OD.orderType == '07' ? PRE_OD.apiHandle.order_details.apiData( d ) : PRE_OD.apiHandle.order_details.apiData1( d );
				});
			},
			apiData : function( d ){

				d = d.data;
				
		    	//头部信息
		    	$('.create_time').html('下单时间：' + d.createTime );
		    	$('.frontMoney_pay').html('实付定金：￥' + common.toFixed( d.frontMoney ) );
		    	$('.frontMoney_time').html('定金支付时间：' + PRE_OD.substr( d.preGoods.frontMoneyStart ) + '——' + PRE_OD.substr( d.preGoods.frontMoneyEnd ) );
		    	$('.retainage_time').html('尾款支付时间：' + PRE_OD.substr( d.preGoods.retainageStart ) + '——' + PRE_OD.substr( d.preGoods.retainageEnd ) );
		    	//订单创建时间等展示
		    	$('.order_set_list').show();
		    	$('.preOrder_num').html('订单编号：' + d.orderCode );

		    	// 不同状态 对应不同操作处理
		    	(function(){
		    		var curStatus = PRE_OD.OPERATE[ d.payStatus + 1 ];
		    		// console.log(curStatus,d.payStatus,'123');
		    		$('.order_status').html( curStatus.text );
		    		$('.order_situation').addClass( curStatus.className ).find( '.oprate-btn' ).text( curStatus.btnText );
		    		if( d.payStatus == '2' || d.payStatus == '3' ){
		    			$('.order_situation').addClass( curStatus[ d.preGoods.preStatus ].className ).find( '.oprate-btn' ).text( curStatus[ d.preGoods.preStatus ].btnText );
		    		}
		    		$('.group1').show().find(".order_set_list_right").html('￥' + common.toFixed( d.frontMoney ) );
		    	})();

		    	PRE_OD.apiHandle.order_details.htmlRender( d ); // 渲染商品信息
			},
			apiData1 : function( d ){ // 尾款订单
				d = d.data;
				// 状态 操作 直接配置相应的参数
				PRE_OD.OPERATE = [
					{ text : '已作废', className : 'delete-btn', btnText : '删除' },
					{ text : '', 	   className : 'hide',           btnText : ''},
					{ text : '',       className : 'hide',           btnText : ''},
					{ text : '',       className : 'hide',           btnText : ''},
					{ text : '待付尾款', className : 'pay-left-btn', btnText : '支付尾款'},
					{ text: '' ,           className : '', 
						payStatus : [
							{text : '已退款', className : 'hide', btnText : ''}, // -3
							{text : '退款中', className : 'hide', btnText : ''}, // -2
							{text : '', className : 'hide', btnText : ''},
							{text : '', className : 'hide', btnText : ''},
							{text : '', className : 'hide', btnText : ''},
							{text : '', className : 'hide', btnText : ''},
							{text : '已付款', className : 'refund-btn', btnText : '退款'}, // 3
							{text : '待收货', className : '', btnText : ''}, // 4
							{text : '已签收', className : 'comment-btn', btnText : '评价'}, // 5
							{text : '已完成', className : '', btnText : ''}, // 6
							{text : '已完成', className : '', btnText : ''} // 7
						]
					}
				];

		    	$('.preOrder_num').html('订单编号：' + d.preOrderRecord.orderCodeRetainage);
		    	// 订单状态  用户操作处理
		    	(function(){
		    		var 
		    		payStatus = d.preOrderRecord.payStatus,
		    		operate = PRE_OD.OPERATE,
		    		orderStatus = d.orderInfo.orderStatus;
			    	$('.order_status').html( operate[ +payStatus + 1 ].text );
			    	$('.order_situation').addClass(  operate[ +payStatus + 1 ].className ).find('.oprate-btn').text( operate[ +payStatus + 1 ].btnText );
			    	if( payStatus == '4' ){
			    		$('.order_status').html( operate[ +payStatus + 1 ].payStatus[ +orderStatus +3 ].text );
			    		$('.order_situation').addClass( operate[ +payStatus + 1 ].payStatus[ +orderStatus +3 ].className ).find('.oprate-btn').text( operate[ +payStatus + 1 ].payStatus[ +orderStatus +3 ].btnText );
			    	}
		    	}());


		    	$('.create_time').html('下单时间：' + d.preOrderRecord.createTime);
		    	$('.frontMoney_pay').html('实付定金：￥' + common.toFixed( d.preOrderRecord.frontMoney ) );
		    	$('.retainage_pay').show().html('实付尾款：￥' + common.toFixed( d.preOrderRecord.retainage ) );
		    	$('.frontMoney_time').html('定金支付时间：' + PRE_OD.substr( d.preOrderRecord.preGoods.frontMoneyStart ) + '——' + PRE_OD.substr( d.preOrderRecord.preGoods.frontMoneyEnd ));
		    	$('.retainage_time').html('尾款支付时间：' + PRE_OD.substr( d.preOrderRecord.preGoods.retainageStart ) + '——' + PRE_OD.substr( d.preOrderRecord.preGoods.retainageEnd ) );	    		    	
		    	
		    	$('.order_pay').html( PRE_OD.PAYWAY[ +d.orderInfo.payMethod ] ); // 支付方式

		        $('.order_message').show().html('留言信息：' + d.orderInfo.message ); 

		        //配送方式及地址显示           
		    	$('.delivery,.take_goods_address_contain,.order_set_list').show();

		    	if( d.orderInfo.pickUpMethod == '1' ){
		        	$('.deli_take_good').html('门店自提');
		        	$('.take_goods_address').hide().next('.set_charge_address').show();
		        	$('.set_address_top').html('店名：' + d.firmInfo.firmName);
		        	$('.set_address_bottom').html( d.firmInfo.address );
		        	$('.set_job_time_left').html('营业时间：' + d.firmInfo.pickUpTime);        	
		        }else if( d.orderInfo.pickUpMethod == '2' ){
		        	$('.deli_take_good').html('送货上门');
		        	$('.take_goods_address').show().next('.set_charge_address').hide();
		        	$('.goods_person_name').html(d.orderInfo.customName);
		        	$('.goods_person_phone').html(d.orderInfo.customMobile);
		        	$('.goods_person_address').html(d.orderInfo.receiveAddress);
		        };
		   
		        PRE_OD.apiHandle.order_details.htmlRender( d ); // 渲染商品信息
		        //订单金额详情 
		        $('.my_order_list1').show().find(".order_set_list_right").html( '￥' + common.toFixed( d.preOrderRecord.frontMoney ))
		        	.next('.my_order_list2').show().find(".order_set_list_right").html( '￥' + common.toFixed( d.preOrderRecord.retainage ))
		        	.next('.my_order_list3').show().find(".order_set_list_right").html( '￥' + common.toFixed( d.orderInfo.postCost ));
		    	d.orderInfo.payMethod == "5" && $('.my_order_list4').show().find(".order_set_list_right").html('-￥' + common.toFixed( d.orderInfo.mothReduceMoney ));
		    	$('.my_order_list5').show().find(".order_set_list_right").html('￥' + common.toFixed( d.orderInfo.realPayMoney ));
			},
			htmlRender :function( d ){
				if( d.orderInfo ){ //尾款订单
					var 
					orderInfo = d.orderInfo.orderDetailsList[0],
					goodsLogo = orderInfo.goodsLogo,
					goodsName = orderInfo.goodsName,
					specInfo = orderInfo.specInfo,
					buyNum = orderInfo.buyNumber, // 购买的数量
					frontMoney = d.preOrderRecord.preGoods.frontMoney, // 定金
					retainage = d.preOrderRecord.preGoods.retainage; // 尾款
				}else{ // 定金订单
					var 
					goodsInfo = d.goodsInfo,
					goodsLogo = goodsInfo.goodsLogo,
					goodsName = goodsInfo.goodsName,
					specInfo = goodsInfo.specInfo,
					buyNum = goodsInfo.buyNumber,
					frontMoney = d.preGoods.frontMoney,
					retainage = d.preGoods.retainage;
				}
		        //商品展示
	        	var html = '';
	        	html += '<dl class="gds_box clearfloat">'
	        	html += '    <dt>'
	        	html += '         <img src="' + goodsLogo + '" alt="" />' 
	        	html += '         <img class="gds_goods_te" src="../img/icon_yu_s.png" alt="" />'	
	        	html += '    </dt> '
	        	html += '    <dd>'
	        	html += '         <div class="gds_right_top">' + goodsName + '</div>'
	        	html += '         <div class="gds_right_center">'
	        	html += '		    <div class="gds_goods_mess float_left">' + specInfo + '</div>'
				html += '		    <div class="gds_num_price float_right clearfloat">'
				html += '	            <p class="gds_num float_right">X<span>' + buyNum + '</span></p>'
				html += '	            <p class="gds_num float_right"><span></span></p>'
				html += '           </div>'
	        	html += '         </div>'
	        	html += '       <div class="gds_right_bottom">'
	        	html += '			<p class="float_left">定金：<span class="font_color">￥' + common.toFixed( frontMoney ) + '</span></p>'
				html += '			<p class="float_left">尾款：<span class="font_color">￥' + common.toFixed( retainage )+ '</span></p>'              	          	
	        	html += '         </div>' 
	        	html += '    </dd>'
	        	html += '</dl>'
		        $('.order_goods_contain_details').html( html );
				$(".gds_box").css("border-bottom","1px solid #FFF"); 
			}
		},
		unite_deal : {
			init : function(){
				common.ajaxPost({
					method : PRE_OD.API_METHOD,
					orderCode : PRE_OD.orderCode,
					tokenId : pub.tokenId,
					sign : PRE_OD.sign,
					source : PRE_OD.source
				},function( d ){
					d.statusCode == '100000' ? common.jumpLinkPlain( PRE_OD.URL_RELATED[ PRE_OD.API_METHOD ] ) : common.prompt( d.statusStr );
				})
			}
		}
	};
	PRE_OD.eventHandle = {
		init : function(){
			// 返回上一级
			common.jumpLinkSpecial('.header_left',function(){
				// switch( +common.orderBack.getItem() ){
				// 	case 1 : common.jumpLinkPlain( 'order_management.html' ); break;
				// 	case 2 : common.jumpLinkPlain( 'PreOrder_management.html' ); break;
				// };
				common.jumpLinkPlain( ['','order_management.html','PreOrder_management.html'][+common.orderBack.getItem()] );
			});

			$('.order_situation').click(function( e ){
				common.stopEventBubble(e);
				var 
				key ,
				$this = $(this),
				commentBtn = $this.is('.comment-btn'),
				payLeftBtn = $this.is('.pay-left-btn'),
				className = /unite-deal/.test( e.target.className );

				key = $this.is('.delete-btn') ? 'deleteBtn' : 
				$this.is('.refund-btn') ? 'refundBtn' : 
				$this.is('.unpay-operate') ? 'unpayOperate' : '';
				if( className ){
					if( commentBtn ){ // 是评论
						common.preColumn.removeItem();
						common.orderColumn.removeItem();
						common.jumpLinkPlain( 'order_evaluation.html' );
					}else if( payLeftBtn ){ // 支付尾款
						var orderType = PRE_OD.orderCode.substring( 8, 10 );
						if( orderType == '07' ){ // 尾款 下单
							common.orderType.setItem("3");
							common.jumpLinkPlain( 'order_set_charge.html' );
						}else{
			                common.jumpLinkPlain( 'order_pay.html' );
						}
					}else{
						PRE_OD.API_METHOD = PRE_OD.TIP_MESSAGE[ key ].apiMethod; // 接收方法
						common.dialog.show( PRE_OD.TIP_MESSAGE[ key ].text, function(){},function(){
							PRE_OD.apiHandle.unite_deal.init();
						});
					}
				}
				/paying/.test( e.target.className ) && common.jumpLinkPlain( 'order_pay.html?search=pre' ); // 去支付
			});
		}
	};

	PRE_OD.init = function(){
		PRE_OD.paramListInit();// 参数初始化
		PRE_OD.apiHandle.init();
		PRE_OD.eventHandle.init();
	};




















	// 父模块 事件处理
	pub.eventHandle = {};
	
	// 父模块 几口数据处理
	pub.apiHandle = {};

	//换肤
	pub.apiHandle.change_app_theme = {
		init:function(){
			if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
				switch( pub.moduleId ){
					case 'preOrderManagement' : (function(){
						$(".myOrder_management_top,.management_contain").addClass("skin"+sessionStorage.getItem("huanfu"))
					})(); break;
					case 'preOrderDetail' :  (function(){
						$(".order_details,.pickUpcode-box,.position-label-box,.delivery,.take_goods_address_contain,.order_goods_contain_details,.order_set_list").addClass("skin"+sessionStorage.getItem("huanfu"))
					})();  break;
				}
				
			}
		}
	}
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
			case 'preOrderManagement' : PRE_OM.init(); break;
			case 'preOrderDetail' : PRE_OD.init(); break;

		}
	};

	module.exports = pub;
});