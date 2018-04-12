define('zsCart',['common','goshopCar','vue'],function(require,exports,module){

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
	//更新购物车
	pub.refresh_shopcart = {
		init:function(){
			common.ajaxPost($.extend({}, {
				method : 'refresh_shopcart',
				gids : pub.allgoodsList
			}),function( d ){
				if ( d.statusCode == "100000" ) {
					var obj = {
						activityType:null,
						id:null,
						goodsName:null,
						nomalPrice:null,
						nowPrice:null,
						packageNum:null,
						specInfo:null,
						goodsLogo:null,
						maxBuyNum:null,
						status:null,
					}
					console.log(d.data);
				}else{
					common.prompt( d.statusStr );
				}
			},function( d ){
				common.prompt( d.statusStr );
			},function(){
				$('.settle','#total').html('结算');
			})
		}
	}

	pub.init = function(){
		/*if (!common.huanfu.getKey()) {
			common.change_app_theme();
			common.defHuanfu.done(function(){
				pub.apiHandle.change_app_theme.init();
			})
		}else{
			pub.apiHandle.change_app_theme.init();
		}
		pub.allgoodsList = cart.allgoods();
		pub.refresh_shopcart.init();
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
		cart.style_change();*/
		common.footerNav(function( i ){
			var url = ['../index.html','moregoods.html','cart.html','my.html'];
			common.jumpLinkPlain(url[i]);
		});
		
	};
	var goodsObj = cart.goodlist2();
	console.log(cart.goodlist2())
	var vue = new Vue({
		el: '#app',
		data: {
			goodsObj: goodsObj,
			totalMoney: 0,
			allChecked: false,
		},
		ready: function() {
			this.allChecked = this.isChooseAll();
		},
		// 条件多的时候  
        computed:{  
             
        },
		methods: {
			// 全部商品全选
			chooseAllGoods: function() {
				var flag = true;
				var str = '';
				var $this = this;
				/*if(this.allChecked) {
					for(var i = 0, len = this.goodsObj.length; i < len; i++) {
						if (good['status'] == '0') {
							$this.goodsObj[i]['status'] = 1;
						}
					}
					this.allChecked = !this.allChecked
				}else{
					if (this.isOldGoods()) {
						for(var i = 0, len = this.goodsObj.length; i < len; i++) {
							console.log($this.goodsObj[i])
							var good = $this.goodsObj[i];
							
							if (good['status'] == '-1') {
								if (flag) {
									str = "商品"+good['name']+"已下架";
									flag = !flag;
								}
								good.msg = "已下架"
							}else if (good['status'] == '0') {
								$this.goodsObj[i]['status'] = 1;
							}
						}
						!flag && common.prompt(str)
					}else{
						for(var i = 0, len = this.goodsObj.length; i < len; i++) {
							var good = $this.goodsObj[i];
								if (good['status'] == '0') {
									$this.goodsObj[i]['status'] = 1;
								}else if (good['status'] == '1') {
									$this.goodsObj[i]['status'] = 0;
									$this.allChecked = false;
								}
						}
						this.allChecked = !this.allChecked;
					}
				}*/
				
				for(var i = 0, len = this.goodsObj.length; i < len; i++) {
					var good = $this.goodsObj[i];
					if ($this.allChecked) {
						$this.goodsObj[i]['status'] = 0;
						
					} else{
						$this.goodsObj[i]['status'] = 1;
					}
				}
				$this.allChecked = !$this.allChecked;
				this.updataLocal();
				this.calTotalMoney();
			},
	
			// 单个选择
			choose: function(index, item) {
				var good = this.goodsObj[index];
				if (good['status'] == '0') {
					this.goodsObj[index]['status'] = 1;
					this.updataLocal()
					
				}else if (good['status'] == '1') {
					this.goodsObj[index]['status'] = 0;
					this.allChecked = false;
					this.updataLocal()
				}
				
				this.isChooseAll();
				this.cal(index);
			},
	
			// 判断是否选择所有商品的全选
			isChooseAll: function() {
				var flag1 = true;
				if (this.goodsObj.length == 0) {
					this.allChecked = false;
				}else{
					for(var i = 0, len = this.goodsObj.length; i < len; i++) {
						if(this.goodsObj[i]['status'] != 1) {
							flag1 = false;
							break;
						}
					}
					flag1 == true ? this.allChecked = true : this.allChecked = false;
				}
				
			},
			//判断是否选择商品
			isChoose :function(){
				var flag1 = false;
				for(var i = 0, len = this.goodsObj.length; i < len; i++) {
					if(this.goodsObj[i]['status'] == 1) {
						flag1 = true;
						break;
					}
				}
				return flag1;
			},
			//判断是够存在下架的商品
			isOldGoods : function(){
				var flag1 = false,i=0;
				for(i = 0, len = this.goodsObj.length; i < len; i++) {
					if(this.goodsObj[i]['updata'] == false) {
						flag1 = true;
						break;
					}
				}
				return flag1 ? this.goodsObj[i] : false;
			},
			// 商品数量控制
			numChange: function(index, numChange) {
				var goods = this.goodsObj[index],
					oThis = this;
				if(numChange == 1) {
					goods.count++;
				} else if(numChange == -1) {
					goods.count--;
				}
	
				if(goods.count <= 1) {
					goods.count = 1;
				}
				
				if (goods.maxCount != '' && parseInt(goods.maxCount) > 0) {
					
					if (parseInt(goods.maxCount) > parseInt(goods.packageNum)) {
						if(parseInt(goods.count) >= parseInt(goods.packageNum)) {
							goods.count = goods.packageNum;
							common.prompt("库存不足");
							return;
						}
					}else{
						if(parseInt(goods.count) >= parseInt(goods.maxCount)) {
							goods.count = goods.maxCount;
							common.prompt("此商品限购"+goods.maxCount+"件");
							return;
						}
					}
				}else{
					if(parseInt(goods.count) >= parseInt(goods.packageNum)) {
						goods.count = goods.packageNum;
						common.prompt("库存不足");
						return;
					}
				}
				this.updataLocal();
				this.cal(index);
			},
	
			// 用户填写容错处理
			numEntry: function( index) {
				var goods = this.goodsObj[index];
				if(goods.count <= 1) {
					goods.count = 1;
				}
				if (goods.maxCount != '' && parseInt(goods.maxCount) > 0) {
					
					if (parseInt(goods.maxCount) > parseInt(goods.packageNum)) {
						if(parseInt(goods.count) >= parseInt(goods.packageNum)) {
							goods.count = goods.packageNum;
							common.prompt("库存不足");
							return;
						}
					}else{
						if(parseInt(goods.count) >= parseInt(goods.maxCount)) {
							goods.count = goods.maxCount;
							common.prompt("此商品限购"+goods.maxCount+"件");
							return;
						}
					}
				}else{
					if(parseInt(goods.count) >= parseInt(goods.packageNum)) {
						goods.count = goods.packageNum;
						common.prompt("库存不足");
						return;
					}
				}
				this.updataLocal();
				
				this.cal(index);
			},
	
			// 计算商品总金额
			calTotalMoney: function() {
				var oThis = this;
				this.totalMoney = 0;
				for(var i = 0, len = this.goodsObj.length; i < len; i++) {
					var list = this.goodsObj[i];
					if (list['status'] == 1) {
						oThis.totalMoney += parseFloat(list.price) * parseFloat(list.count);
					}
				}
			},
	
	
			// 计算方法集合
			cal: function(index) {
				this.calTotalMoney();
			},
	
			// 删除操作
			delGoods: function() {
				var $this = this;
				var obj = []
				if ($this.goodsObj.length == 0) {
					common.prompt('购物车为空')
				}else{
					$this.isChoose() ? common.dialog.init().show("确定删除？", function() {}, function() {
			        	for(var i = 0, len = $this.goodsObj.length; i < len; i++) {
							var list = $this.goodsObj[i];
							if (list['status'] == 0) {
								obj.push(list);
							}
						}
			        	$this.goodsObj = obj;
			        	$this.isChooseAll()
			        	$this.updataLocal();
			        	
			        }) : common.prompt('您还没有选择商品哦')
				}
				
			},
			//本地数据的更新
			updataLocal : function(){
				common.good.setItem(JSON.stringify(this.goodsObj));
				
			}
	
		}
	})
	
	module.exports = pub;
});