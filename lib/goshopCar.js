/*
* goshopCar scirpt for Zhangshuo Guoranhao
*/ 
define('goshopCar',['common'],function(require, exports, module){
	var common = require('common');
	var goshopCar={
		memberfilter : ["goodsId",'count'], // 给后台数据 
		show : false,//购物车是否显示 默认为不显示的
		
		car_goods : function(){
			//显示购物车中的商品
			arr = goshopCar.goodlist2();

			var html='';
			for (var i = 0; i < arr.length; i++) {
				html += '<li class="list ' + ['','selected'][ arr[i].status ]+ '" data="' + arr[i].goodsId + '" packageNum="' + arr[i].packageNum + '" maxCount="' + arr[i].maxCount + '" price="' + arr[i].price + '">';
				html += 	'<ul class="sub-ul-box">';
				html += 		'<li class="sub-list select-node select"></li>';
				html += 		'<li class="sub-list oprate-ele">';
				html +=				'<img src="' + arr[i].logo + '" alt="" class="logo">';
				arr[i].type == 2 && ( html += '<img src="../img/icon_miao_s.png" alt="" class="goods-type"/>' );
				html +=				'<div class="content">';
				html +=					'<p class="dec">' + arr[i].name + '</p>';
				html +=					'<p class="unit">' + arr[i].specifications + '</p>';
				html +=					'<p class="oprate"><span class="minus_num actived">－</span><input class="show_num" value="' + arr[i].count + '" readonly="true" dataID="'+arr[i].goodsId+'"><span class="add_num">+</span></p>';
				html +=				'</div>';
				html +=			'</li>'
				html +=			'<li class="sub-list">';
				html +=				'<p class="curPrice">¥' + arr[i].price +'</p>';
				html +=				'<p class="oldPrice"><del>&nbsp;¥' + arr[i].oldPrice + '</del></p>';
				html +=			'</li>';
				html +=		'</ul>';
				html +=	 	'<div class="delete-btn">删除</div>';
				html +=	'</li>';
			}
			$('#zs-cart .ul-box').html( html );
		},
		style_change : function(){
			var num = goshopCar.getgoodsNum();
			if ( num == '0' ) {

				$('#empty-cart').show().appendTo('#ul-box');

				$('.totalmoney','#total').html('¥0.00' );

				$('#all-select').removeClass('selected');
				$('.footer_item[data-content]').attr('data-content',0 );

			} else{
				$('.totalmoney','#total').html('¥' + goshopCar.getgoodsMoney() );
				$('.footer_item[data-content]').attr('data-content',num );
			}
		},

		creat : function( id, name, price, logo, specifications, maxCount, packageNum, oldPrice, type, status ){ // 创建一个单品
			var goodsInfo = new Object();
				goodsInfo.id = parseInt(id);
				goodsInfo.type = type;
		        goodsInfo.name = name;
		        goodsInfo.sum = 1;
		        goodsInfo.price = parseFloat(price);
		        goodsInfo.logo = logo;
		        goodsInfo.specifications = specifications;
		        goodsInfo.maxCount = maxCount;
		        goodsInfo.packageNum = packageNum;
		        goodsInfo.status = status == undefined ? 1 : 0;
		        goodsInfo.oldPrice = oldPrice;
	        return goodsInfo;
		},
		//添加商品
		addgoods : function ( id, name, price, logo, specifications, maxCount, packageNum, oldPrice, type, status) {

		    if ( typeof localStorage.good  == "undefined" ) {
		    	var singleGoods = goshopCar.creat( id, name, price, logo, specifications, maxCount, packageNum, oldPrice, type, status );
		    	var arr = [];
		    	arr.push(singleGoods);
		    		localStorage.good = JSON.stringify( arr );
		        return 1;
		    } else{

		    	var localGoodsList = JSON.parse( localStorage.good ); // 本地商品列表

		        for (var i in localGoodsList ) {
		           	if ( localGoodsList[i].id == id ) {

		            	localGoodsList[i].sum = 1 + parseInt( localGoodsList[i].sum, 10);

		            	localStorage.good = JSON.stringify( localGoodsList );
		            	
		            	return localGoodsList[i].sum;
		        	};
		        };


		        var singleGoods = goshopCar.creat( id, name, price, logo, specifications, maxCount, packageNum, oldPrice, type, status );
		        	localGoodsList.push( singleGoods );
		        	localStorage.good = JSON.stringify( localGoodsList );

	            return 1;
		     
		    };
		},
		// 从购物车减少商品
		cutgoods : function ( id ) {

			var localGoodsList = JSON.parse( localStorage.good ); // 本地商品列表

			for (var i in localGoodsList ) {
				if ( localGoodsList[i].id == id ) {
		       		//之前已经有此类商品了
		       		if ( localGoodsList[i].sum == 1 ) {
		       			localGoodsList.splice(i,1);
		       			localStorage.good = JSON.stringify( localGoodsList );
		       			return 0;
		       		} else{
		       			localGoodsList[i].sum = parseInt( localGoodsList[i].sum, 10 ) - 1;
		            	localStorage.good = JSON.stringify( localGoodsList );
		            	return localGoodsList[i].sum;
		       		};
		    	};
			}
		},
		callbackgoodsnumber : function ( id ){ // 获取商品数量

			if ( typeof  localStorage.good  == "undefined" ) {
				return 0;
			}else{
				var i, localGoodsList = JSON.parse( localStorage.good );

				for ( i in localGoodsList ) {
					if ( localGoodsList[i].id == id ) {
						return localGoodsList[i].sum;
			    	};
				}
				return 0;
			};
		},
		//获取商品总数
		getgoodsNum : function  (){
			var total = 0,i;
			if( !!localStorage.good ){
				var localGoodsList = JSON.parse( localStorage.good );
		    	for ( i in localGoodsList) {
		    		total += parseInt( localGoodsList[i].sum, 10 );
		    	}
		    	return total;
			}
			return 0;

		},
		//获取商品总价格;
		getgoodsMoney : function (){
			var totalMoney = 0.00,i;
			if( !!localStorage.good ){
				var localGoodsList = JSON.parse( localStorage.good );
		    	for ( i in localGoodsList ) {
		    		if( localGoodsList[i].status == 1 ){
			    		totalMoney += parseInt( localGoodsList[i].sum, 10 )*parseFloat( localGoodsList[i].price, 10 );
		    		}
		    	}
		    	return totalMoney.toFixed(2);
			}
			return 0;
		},
		//获取商品列表 id 和 sum
		goodlist1 : function (){  // 后台字段处理

			if( !!localStorage.good ){
				var obj = {};
				var localGoodsList = [];
				// 筛选处理
				JSON.parse( localStorage.good.replace(/\"\s*id\"\s*/g,"\"goodsId\"").replace(/\"\s*sum\"\s*/g,"\"count\"") ).forEach(function(v){
					if(v.status == 1 ){
						localGoodsList.push( v );
					}
				});
				obj.goodsList = eval( JSON.stringify( localGoodsList, ['goodsId','count'] ) );
				return JSON.stringify(obj);
			}
			return 0;
		},
		//获取商品列表price sum 和 name
		goodlist2 : function (){
			if( !!localStorage.good ){
				return JSON.parse( localStorage.good.replace(/\"\s*id\"\s*/g,"\"goodsId\"").replace(/\"\s*sum\"\s*/g,"\"count\"") );
			}
			return 0;
		}
	}
	goshopCar.eventHandle = {
		init : function(){
			//添加点击增加事件
			$('#ul-box').on('click','.add_num',function(){
				var $this = $(this), 
					parentNode = $this.parents( '.list' ),
					goodId = parentNode.attr( 'data' ),
					packageNum = parseInt( parentNode.attr( 'packageNum' ), 10 ),
					maxCount = parentNode.attr( 'maxCount' ),
					numList = parseInt( $this.prev().val(), 10 );
				if ( numList < packageNum ) {
					if( maxCount != '0' && maxCount != "" ){
						if(numList < maxCount){
							var num = goshopCar.addgoods( goodId );
							$this.prev().val( num );
							goshopCar.style_change();
						}else{
							common.prompt( "该商品限购" + maxCount + "件" );
						}
					}else{
						var num = goshopCar.addgoods( goodId );
						$this.prev().val( num );
						goshopCar.style_change();
					}
				} else{
					common.prompt( "库存不足" );
				}
			});

			//添加减少事件
			$('#ul-box').on('click','.minus_num',function(){
				var $this = $(this),
				parentNode = $this.parents( '.list' ),
				id = parentNode.attr('data');

				//num当前商品数目 numb商品总数
				var numb = goshopCar.callbackgoodsnumber( id );
				if( numb == 1 ){
					common.tip('不能再减了哦');
					return;
				}
				var num = goshopCar.cutgoods( id );
				$this.next().val( num );
				goshopCar.style_change();
			});
			
		},
	}
	module.exports = goshopCar;

});