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
					
					if (arr1.length !=0) {
						$.each(arr1, function(i,item1) {
							var id = item1.id;
							$.each(arr2, function(j,item2) {
								if (id == item2.id) {
									pub.refresh_shopcart.datadiff(item1,item2)
								}
								console.log(id + ',' + item2.id)
							});
						});
					}
					
					
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
		},
		datadiff: function(arr1,arr2){
			console.log(arr1)
			console.log(arr2)
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
		pub.allgoodsList = cart.allgoodsId();
		if (pub.allgoodsList != '') {
			pub.refresh_shopcart.init();
		}
		common.footerNav(function( i ){
			var url = ['../index.html','moregoods.html','cart.html','my.html'];
			common.jumpLinkPlain(url[i]);
		});
		
		cart.style_change();
		
		
	};
	var goodsObj = cart.allgoods();
	console.log(cart.goodlist2())
	var vue = new Vue({
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
        	cart.htmlInit()
        },
        beforeMount : function(){
        	console.log("beforeMount		//挂载之前")
        	console.log(this)
        	console.log(this.goodsObj.length)
        },
        updated : function(){
        	
        },
        updated : function(){
        	console.log("updated			//数据被更新后")
        	console.log(this)
        },
        activated : function(){
        	console.log("activated			//组件激活时调用")
        	console.log(this)
        },
        methods : function(){
        	console.log("mounted			//挂载之后")
        },
		methods: {
			
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
					
					if (parseInt(goods.maxCount) > parseInt(goods.packageNum)) {
						if(parseInt(goods.sum) >= parseInt(goods.packageNum)) {
							goods.sum = goods.packageNum;
							common.prompt("库存不足");
							
						}
					}else{
						if(parseInt(goods.sum) >= parseInt(goods.maxCount)) {
							goods.sum = goods.maxCount;
							common.prompt("此商品限购"+goods.maxCount+"件");
							
						}
					}
				}else{
					if(parseInt(goods.sum) >= parseInt(goods.packageNum)) {
						goods.sum = goods.packageNum;
						common.prompt("库存不足");
						
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
					
					if (parseInt(goods.maxCount) > parseInt(goods.packageNum)) {
						if(parseInt(goods.sum) >= parseInt(goods.packageNum)) {
							goods.sum = goods.packageNum;
							common.prompt("库存不足");
						}
					}else{
						if(parseInt(goods.sum) >= parseInt(goods.maxCount)) {
							goods.sum = goods.maxCount;
							common.prompt("此商品限购"+goods.maxCount+"件");
							
						}
					}
				}else{
					if(parseInt(goods.sum) >= parseInt(goods.packageNum)) {
						goods.sum = goods.packageNum;
						common.prompt("库存不足");
						
					}
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
			        	
			        }) : common.prompt('您还没有选择商品哦')
				}
			},
			//单个删除操作
			delgood : function (index) {
				var $this = this;
				var obj = []
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
			},
			//本地数据的更新
			updataLocal : function(){
				common.good.setItem(JSON.stringify(this.goodsObj));
				
			}
		}
	})
	
	module.exports = pub;
});