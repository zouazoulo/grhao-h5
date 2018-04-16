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

	pub.shop_cart_submit = {
		init : function(){
			common.ajaxPost($.extend({}, pub.userBasicParam, {
				method : 'shop_cart_submit',
				goodsList : pub.goodsList
			}),function( d ){
				if ( d.statusCode == "100000" ) {
					common.orderType.setItem( '1' );
					common.jumpLinkPlain( "order_set_charge.html" );
				}else if (d.statusCode == "100613"){
					pub.shop_cart_submit.apiData(d)
				}else{
					common.prompt( d.statusStr );
				}
			},function( d ){
				common.prompt( d.statusStr );
			},function(){
				$('.settle','#total').html('结算');
			})
		}, 
		apiData:function(d){
			var arr1 = cart.allgoods();//本地存储的商品数组
			var arr2 = d.data;//后台返回的商品数组
			var arr = [],index=[],istrue = null;
			if (arr1.length !=0) {
				for (var i = 0; i < arr1.length ; i++) {
					var id = arr1[i].id;
					istrue = true;
					for (var j in arr2) {
						if (id  == j) {
							arr1[i] = pub.shop_cart_submit.datadiff(arr1[i],arr2[j]);
							index.push(i)
							delete arr2.j;
							arr.unshift(arr1[i]);
							istrue = false;
							break;
						}
					}
					if (istrue) {
						arr.push(arr1[i])
					}
				}
			}
			pub.Vue.goodsObj = {};
			setTimeout(function(){
				pub.Vue.goodsObj = arr;
				localStorage.setItem("good",JSON.stringify(arr));
				common.prompt( d.statusStr );
			},100)
		},
		datadiff:function(arr1,arr2){
			arr1['msg'] = arr2;
			return arr1;
		},
		scrollCount:function(index){
			/*var h = document.documentElement.clientHeight;
			var innerH = h - $(".header_wrap").height() - $(".footer_wrap").height() - $("#total").height();
			var hall = $("#app").height();
			
			var indexh = $(".line-wrapper").height() * (index+1);
			console.log(hall)
			console.log(indexh);
			console.log(innerH)
			console.log($(document).scrollTop())*/
			
		}
	};
	
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
					var arr1 = cart.allgoods();//本地存储的商品数组
					var arr2 = d.data;//后台返回的商品数组
					var arr = []
					if (arr1.length !=0) {
						for (var i = 0; i < arr1.length ; i++) {
							var id = arr1[i].id;
							for (var j = 0; j < arr2.length ; j++) {
								var id2 = arr2[j].id;
								if (id  == id2) {
									var z = pub.refresh_shopcart.datadiff(arr1[i],arr2[j]);
									arr2.splice(j,1);
									arr.push(z);
									break;
								}
							}
						}
					}
					pub.Vue.goodsObj = arr
				}else{
					common.prompt( d.statusStr );
				}
			},function( d ){
				common.prompt( d.statusStr );
			},function(){
				$('.settle','#total').html('结算');
			})
		},
		datadiff: function(arr1,arr2){
			var obj = {};
			obj['id'] = arr1['id'];
			obj['type'] = arr1['type'];
			obj['name'] = arr2['goodsName'];
			obj['sum'] = arr1['sum'];
			obj['price'] = arr2['nowPrice'];//*"price":0.01,"
			obj['logo'] = arr2['goodsLogo'];
			obj['specifications'] = arr2['specInfo'];
			obj['maxCount'] = arr2['maxBuyNum'];
			obj['packageNum'] = arr2['packageNum'];
			obj['status'] = arr1['status'];
			obj['updata'] = arr2['status'] == -1 ? false :true;
			obj['oldPrice'] = arr2['nomalPrice'];
			obj['msg'] = '';
			if (!obj['updata']) {
				obj['msg'] = '已下架';
			} else{
				
				if (arr2['purchaseQuantity'] != 0) {
					obj['msg'] = arr2['purchaseQuantity']+'份起购';
				}
				if (arr1['maxCount'] != arr2['maxBuyNum']) {
					if (!!arr2['maxBuyNum'] && !!arr1['maxCount']) {
						if (parseInt(arr1['sum']) > parseInt(arr2['maxBuyNum'])) {
							obj['msg'] = '限购'+arr2['maxBuyNum']+'件';
						}
					}
				}
				
			}
			return obj;
		}
	}
	var goodsObj = cart.allgoods();
	pub.init = function(){
		if (!common.huanfu.getKey()) {
			common.change_app_theme();
			common.defHuanfu.done(function(){
				pub.apiHandle.change_app_theme.init();
			})
		}else{
			pub.apiHandle.change_app_theme.init();
		}
		pub.allgoodsList = cart.allgoodsId();
		if (pub.allgoodsList != '') {
			pub.refresh_shopcart.init();
		}
		common.footerNav(function( i ){
			var url = ['../index.html','moregoods.html','cart.html','my.html'];
			common.jumpLinkPlain(url[i]);
		});
		
		cart.style_change();
		
		
		pub.Vue = new Vue({
			el: '#app',
			data: {
				goodsObj: goodsObj,
				totalMoney: 0,
				allChecked: false,
			},
	        beforeCreate : function(){
	        	
	        },
	        created : function(){
	        	console.log("created			//创建完成")
	        	this.isChooseAll()
	        	this.calTotalMoney();
	        	cart.htmlInit();
	        	
	        	/*$("#app").height(h - $(".header_wrap").height() - $(".footer_wrap").height())*/
	        	
	        },
	        beforeMount : function(){
	        	console.log("beforeMount		//挂载之前")
	        	/*console.log(this)
	        	console.log(this.goodsObj.length)*/
	        },
	        updated : function(){
	        	console.log("updated			//数据被更新后")
	        	var nood = $("#ul-box .line-wrapper");
	        	nood.each(function(i,item){
	        		$(item).find('.line-normal-wrapper').css("margin-left","0px");
	        	})
	        	$("#app").height($("#ul-box").height())
	        },
			methods: {
				getCardNum: function (data, on) {  
		            pub.vue1.$emit('translate', data);  
		      	},
				// 全部商品全选
				chooseAllGoods: function() {
					console.log(this)
					var flag = true;
					var str = '';
					var $this = this;
					
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
					this.calTotalMoney();
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
						goods.sum++;
					} else if(numChange == -1) {
						goods.sum--;
					}
		
					if(goods.sum <= 1) {
						goods.sum = 1;
					}
					
					if (goods.maxCount != '' && parseInt(goods.maxCount) > 0) {
					
						if(parseInt(goods.sum) >= parseInt(goods.maxCount)) {
							goods.sum = goods.maxCount;
							goods.msg = ''
							common.prompt("此商品限购"+goods.maxCount+"件");
							
						}
					}
					this.updataLocal();
					this.calTotalMoney();
				},
		
				// 用户填写容错处理
				numEntry: function( index) {
					var goods = this.goodsObj[index];
					if(goods.sum <= 1) {
						goods.sum = 1;
					}
					if (goods.maxCount != '' && parseInt(goods.maxCount) > 0) {
						
						if(parseInt(goods.sum) >= parseInt(goods.maxCount)) {
							goods.sum = goods.maxCount;
							common.prompt("此商品限购"+goods.maxCount+"件");
							
						}
					}else{
						
					}
					this.updataLocal();
					
					this.calTotalMoney();
				},
		
				// 计算商品总金额
				calTotalMoney: function() {
					var oThis = this;
					this.totalMoney = 0;
					for(var i = 0, len = this.goodsObj.length; i < len; i++) {
						var list = this.goodsObj[i];
						if (list['status'] == 1) {
							oThis.totalMoney += parseFloat(list.price) * parseFloat(list.sum);
						}
					}
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
				        	$this.isChooseAll();
				        	$this.calTotalMoney()
				        	$this.updataLocal();
				        	cart.style_change();
				        	
				        }) : common.prompt('您还没有选择商品哦')
					}
				},
				//单个删除操作
				delgood : function (index) {
					var $this = this;
					var obj = [];
					for(var i = 0, len = $this.goodsObj.length; i < len; i++) {
						var list = $this.goodsObj[i];
						if (i != index) {
							obj.push(list);
						}
					}
					$this.goodsObj = obj;
		        	$this.isChooseAll();
		        	$this.calTotalMoney()
		        	$this.updataLocal();
		        	cart.style_change();
				},
				//本地数据的更新
				updataLocal : function(){
					common.good.setItem(JSON.stringify(this.goodsObj));
					cart.style_change();
					
				},
				scrollevent:function(){
					console.log(this)
				},
				//提交购物车
				submitgoshop : function(){
					var $this = this;
					pub.goodsList = cart.goodlist1();
					if (pub.logined) {
						if (cart.getgoodsNum() == 0) {
							common.prompt("购物车为空");return;
						}else{
							$this.isChoose() ? pub.shop_cart_submit.init() : common.prompt('您还没有选择商品哦')
							
						}
						
					}else{
						
						common.jumpMake.setItem("13");
						common.jumpLinkPlain("login.html")
						
					}
					
				}
			}
		})
	};
	module.exports = pub;
});