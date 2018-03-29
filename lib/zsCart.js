define('zsCart',['common','goshopCar'],function(require,exports,module){

	var common = require('common');
	var cart = require( 'goshopCar' );
	var pub = {};

	
	pub.cartData = common.JSONparse( common.good.getItem() ); // 读取本地数据
	pub.logined = common.isLogin(); // 是否登录

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

	pub.allSelect = function(){
		var selectNode = $('.list.selected','#ul-box'),
		allSelectNode = $('#all-select','#total');
		if( selectNode[0] && pub.cartData.length == selectNode.length ){
			allSelectNode.addClass('selected');
		}else{
			allSelectNode.removeClass('selected');
		}
		allSelectNode.bind('click',function( e ){
			var $this = $(this),
			selected = $this.is('.selected'),
			listNode = $('.list','#ul-box');
			if( listNode.length == 0 ) return;
			pub.cartData = common.JSONparse( common.good.getItem() );
			if( selected ){
				$this.removeClass('selected');
				listNode.removeClass('selected');
				pub.cartData.forEach(function(v,i){ v.status = 0; });
			}else{
				$this.addClass('selected');
				listNode.addClass('selected');
				pub.cartData.forEach(function(v,i){ v.status = 1; });
			}
			common.good.setItem(common.JSONStr( pub.cartData ));
			cart.style_change();
		});
	};
	// 单选处理
	pub.pickUp = function(){
		$('#ul-box').on('click','.select-node',function(){
			pub.cartData = common.JSONparse( common.good.getItem() );
			var $this = $(this),
			listNode = $this.parents('.list'),
			selected = listNode.is('.selected'),
			id = listNode.attr('data');
			if( selected ){
				listNode.removeClass('selected');
				$('#all-select').removeClass('selected');
				pub.cartData.forEach(function(v,i){
					if( v.id == id ){ v.status = 0; common.good.setItem(common.JSONStr( pub.cartData )); return; }
				});
			}else{
				listNode.addClass('selected');
				pub.cartData.length == $('.list.selected').length && $('#all-select').addClass('selected');
				pub.cartData.forEach(function(v,i){
					if( v.id == id ){ v.status = 1; common.good.setItem(common.JSONStr( pub.cartData )); return; }
				});
			}
			cart.style_change();
		});
	};


	pub.drag = function(){
		window.addEventListener('load', function() {
          	var initX;
          	var moveX;
          	var diffX = 0;
          	var objectX = 0;
          	window.addEventListener('touchstart', function(event) {
	            var obj = $(event.target).parents('.list')[0];
	            if( !obj ){ return;}
	            if ( /(list)/.exec(obj.className)[1] == "list" ) {
	                initX = event.targetTouches[0].pageX;
	                objectX = (obj.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
	            }
	            var activeNode =  $('[active]','#ul-box');
	            if( activeNode[0] && !$(event.target).parents('.list').attr('active')){
	            	activeNode[0].style.WebkitTransform = "translateX(" + 0 + "px)"; 
	            	activeNode.removeAttr('active');
	            }
	            if (objectX == 0) {
	                window.addEventListener('touchmove', function(event) {
	                    var obj = $(event.target).parents('.list')[0];
	                    try{
		                    if ( /(list)/.exec(obj.className)[1] == "list" ) {
		                        moveX = event.targetTouches[0].pageX;
		                        diffX = moveX - initX;
		                        if (diffX >= 0) {
		                            obj.style.WebkitTransform = "translateX(" + 0 + "px)";
		                        }else if (diffX < 0) {
		                          	var l = Math.abs( diffX );
		                          	obj.style.WebkitTransform = "translateX(" + -l + "px)";
		                          	if (l > 120) { l = 120; obj.style.WebkitTransform = "translateX(" + -l + "px)"; }
		                          	$(event.target).parents('.list').attr('active','active');
		                    	}
		                  	}
	                    }catch(e){}
	              });
            	} else if (objectX < 0) {
	              	window.addEventListener('touchmove', function(event) {
	                 	var obj = $(event.target).parents('.list')[0];
	                 	try{
		                  	if (/(list)/.exec(obj.className)[1] == "list") {
		                    	moveX = event.targetTouches[0].pageX;
		                    	diffX = moveX - initX;
		                    	if (diffX >= 0) {
			                        var r = -120 + Math.abs(diffX); 
			                        obj.style.WebkitTransform = "translateX(" + r + "px)";
			                        if (r > 0) {  
			                        	r = 0; obj.style.WebkitTransform = "translateX(" + r + "px)"; 
			                        }
			                        $(event.target).parents('.list').removeAttr('active');
		                    	}else{ obj.style.WebkitTransform = "translateX(" + -120 + "px)"; }
		                  	}
	                 	}catch(e){}
	              	});
            	}
        	});
	        window.addEventListener('touchend', function(event) {
	            var obj = $(event.target).parents('.list')[0];
	            if( !obj ){ return;}
	            if (/(list)/.exec(obj.className)[1] == "list") {
	              	objectX = (obj.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
	              	if (objectX > -60) { 
	              		obj.style.WebkitTransform = "translateX(" + 0 + "px)"; objectX = 0;
	              	} else {
	                  	obj.style.WebkitTransform = "translateX(" + -120 + "px)"; objectX = -120;
	              	}
	            }
	        })
    	});


    	$('#ul-box').on('click','.delete-btn',function(){
    		var 
    		$this = $(this),
    		id = $this.parents('.list').attr('data');
    		pub.cartData = common.JSONparse( common.good.getItem() );
    		for(var i = 0; i < pub.cartData.length; i++ ){
				if( pub.cartData[i].id == id ){
					pub.cartData.splice(i,1);
					common.good.setItem( common.JSONStr( pub.cartData ));
					pub.cartData = common.JSONparse( common.good.getItem() );
					cart.style_change();
					break;
				}
    		}
			$this.parents('.list').remove();
			var 
			listLen = $('.list','#ul-box').length,
			selectDotLen = $('.selected','#ul-box').length;
			if( listLen == 0 ){
				$('#empty-cart').show().appendTo('#ul-box');
				$('#all-select','#total').removeClass('selected');
			}
			listLen == selectDotLen && listLen != 0 && $('#all-select','#total').addClass('selected')
			$('.footer_item[data-content]').attr('data-content',cart.getgoodsNum() );
    	});
	};

	pub.shop_cart_submit = {
		init : function(){
			common.ajaxPost($.extend({}, pub.userBasicParam, {
				method : 'shop_cart_submit',
				goodsList : pub.goodsList
			}),function( d ){
				if ( d.statusCode == "100000" ) {
					common.orderType.setItem( '1' );
					common.jumpLinkPlain( "order_set_charge.html" );
				}else{
					common.prompt( d.statusStr );
				}
			},function( d ){
				common.prompt( d.statusStr );
			},function(){
				$('.settle','#total').html('结算');
			})
		}
	};
	$('#select-delete').bind('click',function(e){
		common.stopEventBubble(e);
		pub.dataSourse = common.JSONparse( common.good.getItem() );
		pub.dealNode = $('.list.selected','#ul-box');

		if( $('.list','#ul-box').length == 0 ){
			common.prompt('购物车为空'); return;
		}
		if( pub.dealNode.length == 0 ){
			common.prompt('请选择商品'); return;
		}
		common.dialog.init().show('确定删除？',function(){},function(){
			pub.dealNode.each(function(){
				var dataId = $(this).attr('data');
				for(var i = 0; i < pub.dataSourse.length; i++ ){
					if( dataId ==  pub.dataSourse[i].id ){
						pub.dataSourse.splice(i,1); i--;
					}
				}
			});
			common.good.setItem( common.JSONStr( pub.dataSourse ) );
			var removeNode = pub.dealNode.remove();
			removeNode = null;
			$('.totalmoney','#total').text('¥0.00');
			$('.list','#ul-box').length == 0 && $('#empty-cart').show().appendTo('#ul-box');
			$('.footer_item[data-content]').attr( 'data-content', pub.dataSourse.length );
			$('#all-select','#total').removeClass('selected');
		});
	});
	// 换肤
	pub.apiHandle = {
		change_app_theme : {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					$("#zs-cart,.footer").addClass("skin"+sessionStorage.getItem("huanfu"))
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
		cart.car_goods();
		cart.eventHandle.init();
		common.footerNav(function( i ){
			var url = ['../index.html','moregoods.html','cart.html','my.html'];
			common.jumpLinkPlain(url[i]);
		});
		pub.allSelect();
		pub.pickUp();
		pub.drag();
		$('.settle','#total').bind('click',function(){
			if( $('.list','#ul-box').length == 0 ){
				common.prompt('购物车为空'); return;
			}
			if( $('.list.selected','#ul-box').length == 0 ){
				common.prompt('请选择商品'); return;
			}
			pub.goodsList = cart.goodlist1();  // 购物车清单
			if ( pub.logined ) {
				common.orderType.setItem( "1" );
				common.sortCouponId.removeItem(); // 优惠券临时移除
				pub.shop_cart_submit.init();
				$(this).html('结算中 ...');
			}else{
				common.jumpMake.setItem('13');
				common.jumpLinkPlain('login.html');
			}
		});
		cart.style_change();
		
	};
	module.exports = pub;
});