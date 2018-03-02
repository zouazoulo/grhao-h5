define('moregoods',['common','goshopCar'],function(require, exports, module){


	var common = require( 'common' );
	var cart = require( 'goshopCar' );

/************************************商品管理模块************************/

	// 命名空间

	pub = {};
	
	pub.logined = common.isLogin(); // 是否登录 

	pub.PAGE_INDEX = common.PAGE_INDEX; // 索引

	pub.PAGE_SIZE = common.PAGE_SIZE; // 页面显示数据个数

	pub.storeInfo = common.getStoreInfo();

	pub.loading = $('.click_load');

	pub.weixin = common.isWeiXin();

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

	// 商品

	pub.goods = {};
	var GOODS = pub.goods;

	pub.moduleId = $('[module-id]').attr( 'module-id' );

	GOODS.type = pub.storeInfo.type == 5 ? 'WATM' : common.getUrlParam( 'type' ); // 轮播入口，首页商品 

	GOODS.typeCode = null; // 一级类别，二级类别

	// GOODS.GOODS_TYPE = ['TAO_CAN','JU_HUI',''];

	GOODS.TITLE = { // 标题
		'TAO_CAN' : '礼盒套餐',
		'JU_HUI' : '钜惠活动',
		'' : '全部商品'
	} 

	// GOODS.isEnd = null; // 是否为最后一页

	// GOODSList = null;

	// 商品接口处理
	GOODS.apiHandle = {
		init : function(){
			GOODS.apiHandle.goods_first_type.init();
		},
		goods_first_type : {
			init : function(){
				common.ajaxPost({
					method : 'goods_first_type',
					type : GOODS.type,
					firmId : pub.storeInfo.id
				},function( d ){
					d.statusCode == "100000" ? GOODS.apiHandle.goods_first_type.apiData( d ) : common.prompt( d.statusStr );
				})
			},
			apiData : function( d ){
				var 
				data = d.data.firstType,
				html = '', i = 0,
				nodeBox = $(".more_top");

				nodeBox.empty();
				if( !$.isArray( data ) || data.length == 0 ){
					pub.loading.html('没有更多数据了！');return;
				}

				for ( i in data) {
					html +='<li class="first_item" data="' + data[i].typeCode + '">' + data[i].typeName + '</li>'
				}
				nodeBox.append( html ).width( data.length * 156 + 20 );

				if ( common.first_data.getKey() ) { //存储了一级目录
					GOODS.typeCode = common.first_data.getItem();
					$('.first_item[data="' + GOODS.typeCode + '"]','.more_top').addClass('more_first_click');
				} else{
					var firstItemNode = $('.first_item','.more_top').eq(0);
						firstItemNode.addClass("more_first_click");

						GOODS.typeCode = firstItemNode.attr('data');
				}
				// 调二级接口
				GOODS.apiHandle.goods_second_type.init();

				pub.weixin && (function(){
	 				common.weixin.config( location.href.split('#')[0] );
	 				common.weixin.share( d.data.customShare );
	 			}());
			}
		},
		goods_second_type : {
			init : function(){
				common.ajaxPost({
					method : 'goods_second_type',
					typeCode : GOODS.typeCode,
					firmId : pub.storeInfo.id
				},function( d ){
					d.statusCode == "100000" ? GOODS.apiHandle.goods_second_type.apiData( d ) : common.prompt( d.statusStr );
				})
			},
			apiData : function( d ){
				d = d.data;
				var 
				nodeBox = $(".more_bottom_left"),
				html = '';
				nodeBox.empty();

				if( !$.isArray( d ) || d.length == 0 ) return;
				
				for (var i in d) {
					html += '<li class="two_item" data="' + d[i].typeCode + '">' + d[i].typeName + '</li>'
				}

				nodeBox.append(html);

				var twoItem = $(".more_bottom_left .two_item");

				if( common.two_data.getKey() ){
					GOODS.typeCode = common.two_data.getItem();
					$('.two_item[data="' + GOODS.typeCode + '"]').addClass('more_two_click');
				}else{
					var twoItem=$(".more_bottom_left .two_item");
					twoItem.eq(0).addClass("more_two_click").siblings().removeClass("more_two_click");
					GOODS.typeCode = twoItem.eq(0).attr( "data" );
					common.two_data.setItem( GOODS.typeCode );
					$(".more_bottom_right").html('');
				}
				GOODS.apiHandle.goods_list.init();
			}
		},
		goods_list : {
			init : function(){
				common.ajaxPost({
					method : 'goods_list',
					typeCode : GOODS.typeCode,
					pageNo : pub.PAGE_INDEX,
					pageSize : pub.PAGE_SIZE,
					firmId : pub.storeInfo.id
				},function( d ){
					d.statusCode == "100000" && GOODS.apiHandle.goods_list.apiData( d );
				});
			},
			apiData : function( d ){
				d = d.data;
				GOODS.isEnd = d.isLast;
				var html = '',i;
				pub.loading.show().html( GOODS.isEnd ? "没有更多数据了！" : "点击加载更多！" );
				if(d.objects == "" || d.objects.length == 0) return;
				for ( i in d.objects ) {
					var obj = d.objects[i]
					var gdnum = cart.callbackgoodsnumber( obj.id );
					html += '<dl class="goods_item clearfloat lazyload" data="' + obj.id + '">'
					html += '	<dt><img src="' + obj.goodsLogo + '"/></dt>'
					html += '	<dd>'
					html += '		<p class="good_name">' + obj.goodsName + '</p>'
					html += '		<p class="good_describe clearfloat">'
					html += '			<span class="float_left">' + obj.specInfo + '</span>'
					if( +obj.purchaseQuantity != 0 ) html += '			<span class="float_right">' + obj.purchaseQuantity + '份起售</span>'  
					
					html += '		</p>'
					html += '		<p class="good_describe1">' + obj.goodsDescribe + '</p>'
					html += '		<div class="good_box" data-id="' + obj.id + '" data-max="' + obj.maxBuyNum + '" data-name="' + obj.goodsName + '" data-logo="' + obj.goodsLogo + '" data-price="' + obj.nowPrice + '" data-packagenum="' + obj.packageNum + '" data-specinfo="' + obj.specInfo + '" data-oldprice ="' + obj.nomalPrice + '"  data-purchaseQuantity = "' + obj.purchaseQuantity + '">'
					html += '			<span class="good_picre"><span>￥' + obj.nowPrice + '</span>&nbsp;<del>￥' + obj.nomalPrice + '</del></span>'
					html += '			<div class="good_number clearfloat">'
					if ( gdnum ) {
						html += '					<div class="minus_num zs-goods-icon"></div>'
						html += '					<div class="show_num" zs-goodsId="' + obj.id + '">' + gdnum + '</div>'
						html += '					<div class="add_num zs-goods-icon"></div>'
					} else{
						if ( +obj.packageNum == 0) {
							html +=  '		<div class="goods-sellout">已售罄</div>'
						}else{
							html += '					<div class="minus_num zs-goods-icon" style="display:none"></div>'
							html += '					<div class="show_num" style="display:none" zs-goodsId="' + obj.id + '">0</div>'
							html += '					<div class="add_num zs-goods-icon"></div>'
						}
					}
					html += '			</div>'
					html += '		</div>'
					html += '	</dd>'
					html += '</dl>'
				}
				
				$(".more_bottom_right").append( html );
			}
		}
	};

	// 商品事件处理
	GOODS.eventHandle = {
		init : function(){

			//点击一级列表
			$(".more_top").on('click','.first_item',function(){
				pub.PAGE_INDEX = 1;
				var 
				$this = $(this),
				dataItem = $this.attr('data'),
				baseLeft = $this.offset().left - $this.scrollLeft(),
				isCur = $this.is('.more_first_click');

				!isCur && $('.more_top_wrap').stop().animate({
					scrollLeft :  baseLeft - 300 
				}, 200);

				if( dataItem != common.first_data.getItem() ){
					$this.addClass("more_first_click").siblings().removeClass("more_first_click");
					pub.loading.show().html("正在加载中...");
					GOODS.typeCode = dataItem;
					common.first_data.setItem( GOODS.typeCode );
					common.two_data.removeItem();
					GOODS.apiHandle.goods_second_type.init();
				}
			});

			//点击二级列表获取商品列表
			$(".more_bottom_left").on('click','.two_item',function(){
				pub.PAGE_INDEX = 1;
				var 
				$this = $(this),
				j = $(this).index(),
				dataItem = $this.attr('data'),
				isCur = $this.is('.more_two_click');
				!isCur && $('.more_bottom_left_wrap').stop().animate({
					scrollTop :( 101 * ( j+1 ) - pub.scrollH/2 )
				}, 300);
				
				if ( dataItem != common.two_data.getItem() ) {
					pub.loading.show().html("正在加载中...");
					$this.addClass("more_two_click").siblings().removeClass("more_two_click");
					GOODS.typeCode = $this.attr('data');
					common.two_data.setItem( GOODS.typeCode );
					$('.more_bottom_right').html('');
					GOODS.apiHandle.goods_list.init();
				}
			});

			//点击返回首页
			common.jumpLinkSpecial(".header_left",function(){
				common.first_data.removeItem();
				common.two_data.removeItem();
				common.jumpLinkPlain("../index.html");
			});

			//点击加载更多
			pub.loading.on('click',function(){
				if (!GOODS.isEnd) {
					GOODS.typeCode = common.two_data.getItem();
					pub.PAGE_INDEX ++;
					GOODS.apiHandle.goods_list.init();
				}else{
					pub.loading.show().html("没有更多数据了！");
				}
			});

			//点击商品列表进行增减跳转详情
			$(".more_bottom_right").on('click','.goods_item',function(e){
				var goodsId = $(this).attr("data");
				common.jumpLinkPlain( "goodsDetails.html?goodsId=" + goodsId );
			});
			
		}
	};

	GOODS.init = function(){

		$("title,.header_title").html( GOODS.TITLE[ GOODS.type ] );

		//设置高度
		var 
		wh = document.documentElement.clientHeight,
		emptyH = $('.empty').height() + $('.empty1').height();

		$('.main').height( wh - emptyH );
		pub.scrollH = wh - emptyH -$('.more_top_wrap').height();
		$('.more_bottom_left_wrap,.more_bottom_right_wrap').height( pub.scrollH );

		GOODS.apiHandle.init();
		GOODS.eventHandle.init();
	}


	/************************************************** 商品详情模块 ******************************/

	// 命名空间

	pub.goodsDetail = {};
	var GD = pub.goodsDetail;
	GD.pageIndex = 1;
	GD.pageSize = 10;
	// GD.imgGot = true;
	
	// 商品详情 接口处理
	GD.apiHandle = {
		init : function(){
			GD.apiHandle.goods_show.init();
		},
		goods_show : {
			init : function(){
				common.ajaxPost({
					method : 'goods_show',
					goodsId : GD.goodsId,
				},function( d ){
					d.statusCode == "100000" && GD.apiHandle.goods_show.apiData( d );
				},function( d ){
					common.prompt( d.statusStr );
				},function( d ){
		 			GD.apiHandle.goods_comment_list.init();
				});
			},
			apiData : function( d ){
				d = d.data.goodsInfo;
				common.bannerShow( d, '.goodsDetails_img_box', function( data ){
					var 
					i,
					html = '',
					imgArr = data.goodsPics.trim().split(/\s*@\s*/);
					imgArr[ imgArr.length - 1 ] == '' && imgArr.pop();
					
					for ( i in imgArr ) {
						html += '<div class="swiper-slide "><img src="' + imgArr[ i ] + '" width="100%" /></div>'
					}
					return html;
				});
				var goodsNum = cart.callbackgoodsnumber( d.id ); // 获取本地商品数量
				if ( d.status != "1" ) {
					$(".gd_number").html( "商品已下架" );
				}else{
					if( !!goodsNum ){
						$(".gd_number .minus_num").show();
						$('.gd_number .show_num').show().html( goodsNum );
					}else{
						if ( d.packageNum <= "0" ) {
							$(".gd_number").html("已售罄").addClass('goods-sellout');
						} else{
							$(".gd_number .minus_num").hide();
							$('.gd_number .show_num').hide().html( goodsNum );
						}
					}
				} 
				//添加存储数据到元素
				$('.good_box1_box1').attr({
					'data-id' : d.id,
					'data-name' : d.goodsName,
					'data-price' : d.nowPrice,
					'data-logo' : d.goodsLogo,
					'data-specInfo' : d.specInfo,
					'data-max' : d.maxBuyNum,
					'data-oldprice' : d.nomalPrice,
					'data-packagenum' : d.packageNum,
					'data-purchaseQuantity' : d.purchaseQuantity
				});

				//展示商品信息
				$('.gd_goodName').html( d.goodsName );
				$('.gd_specification').find(".float_left").html( "规格：" + d.specInfo );
				//判断最低起售份数
				+d.purchaseQuantity != 0 && $('.gd_specification').find(".float_right").show().html( d.purchaseQuantity + "份起售" );
				$('.gd_price').html('<span>￥' + d.nowPrice + '</span>&nbsp;&nbsp;<del>￥' + d.nomalPrice + '</del>');
				$(".gd_goodsDescribe").html( d.goodsDescribe );
				d.goodsContext && $('.goodsDetails_box2_').find('li').eq(0).html( d.goodsContext);
				pub.weixin && (function(){
	 				common.weixin.config( location.href.split('#')[0] );
	 				common.weixin.share({
						title : d.goodsName,
						desc : d.goodsDescribe +"\n￥" + d.nowPrice + "/" + d.specInfo ,
					    link : window.location.href, // 分享链接
					    imgUrl : d.goodsLogo
					});
	 			}());
			}
		},
		goods_comment_list : {
			init : function(){
				common.ajaxPost({
					method : 'goods_comment_list',
					goodsId : GD.goodsId,
					pageNo : GD.pageIndex,
					pageSize : GD.pageSize
				},function( d ){
					if( d.statusCode == '100000' ){
						GD.isLast = d.data.isLast;
						GD.isLast && GD.loadMore.html('没有更多数据');
						if( d.data.objects.length == 0 ){ GD.loadMore.html('暂无评论').off('click'); return; }
						GD.loadMore.before($('#goods-comment-data').tmpl( d.data ));
					}else{
						GD.loadMore.html('暂无评论').off('click');
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
					GD.loadMore.hide();
				});
			}
		}
	};

	// 商品详情 事件处理
	GD.eventHandle = {};
	GD.eventHandle.init = function(){

		$('.preview-modal').on('click',function(){
			$(this).hide();
			$('body').removeClass('locked');
			$(document).off('touchstart touchmove');
		});

		// 设置轮播高度
		$(".goodsDetails_img_box").height(function(){ $(this).width(); });

		$('.switch-tab .switch-list').click(function(){
			var $this = $(this),
			i = $this.index(),
			isCur = $this.is('actived');
			if( isCur ) return;
			$this.addClass('actived').siblings().removeClass('actived');
			$('.switch-content').find('li').eq( i ).show().siblings().hide();
		});

		GD.loadMore.click(function(){
			if( !GD.isLast ){
				// GD.imgGot = true;
				GD.pageIndex++;
				GD.apiHandle.goods_comment_list.init();
			}else{
				$(this).off('click').html('没有更多数据');
			}
		});
		//返回按钮
		common.jumpLinkSpecial(".header_left",function(){
			window.history.back();
		});
		GD.ww = $(window).width();
		GD.wh = $(window).height();
		$(window).on('resize',function(){
			GD.ww = $(window).width();
			GD.wh = $(window).height();
		});
		$('#goods-comment-data-box').on('click','.comment-img img',function(){
			// console.log(common.getImageLink(),'common.getImageLink()');
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
				var wRate = nw / GD.ww;
				var hRate = nh / GD.wh;
				var scale = hRate > wRate ? 1/hRate : 1/wRate;
				var style = 'transform:translate3d(-50%,-50%,0) scale(' + scale + ');-webkit-transform:translate3d(-50%,-50%,0) scale(' + scale + ');-moz-transform:translate3d(-50%,-50%,0) scale(' + scale + ');-o-transform:translate3d(-50%,-50%,0) scale(' + scale + ');-ms-transform:translate3d(-50%,-50%,0) scale(' + scale + ');';
				$('.preview-modal').html('<img src="' + src + '" alt="" style="' + style + '"/>').show();
				$('body').addClass('locked');
				// var imgNode = $('.preview-modal').find('img');
				// var imgNodeW = Math.floor( imgNode.width() / 2 );
				// var imgNodeH = Math.floor( imgNode.height() / 2 );

				// imgNode.css({
				// 	'position' : 'absolute',
				// 	'top' : '50%',
				// 	'left' : '50%',
				// 	'margin-left' : -imgNodeW,
				// 	'margin-top' : -imgNodeH
				// });
				$(document).on('touchstart',function( e ){
					$(document).on('touchmove',function( e ){
						e.preventDefault();
					});
				});
			}
		});
		
	};


	GD.init = function(){

		GD.loadMore = $('#goods-comment-data-box').find('.clickmore');
		GD.goodsId = common.getUrlParam('goodsId');
		//返回顶部
		window.onscroll=function(){
			var scroll = document.body.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
			if( scroll >= 600){				
				$('.toTop').css({'display':'block'});			
			}else{
				$('.toTop').css({'display':'none'});
			}
		};
		$('.toTop').on('click',function(){
			$('html,body').animate({
				scrollTop : 0
			},500); 
		});

		$('.show_num').attr( 'zs-goodsId',GD.goodsId );
		GD.apiHandle.init();
		GD.eventHandle.init();
	};


	// 父模块
	pub.eventHandle = {
		init : function(){
			// 增加
			$(".zs-static-box").on('click','.add_num',function(e){
				common.stopEventBubble(e);
				var 
				$this = $(this), // 定义当前节点
				node = $this.parents('[data-id]'),
				dataId = node.attr("data-id"),
				dataName = node.attr("data-name"),
				dataPrice = node.attr("data-price"),
				dataLogo = node.attr("data-logo"),
				dataSpecInfo = node.attr("data-specinfo"),
				dataMax = node.attr("data-max"),
				dataPackagenum = node.attr("data-packagenum"),
				dataOldPrice = node.attr("data-oldprice"), 
				goodNum = cart.callbackgoodsnumber( dataId );

				if ( goodNum < dataPackagenum ) { // 库存
					if( +dataMax != 0 ){ // 限购
						if( goodNum < dataMax ){
							var num1 = cart.addgoods( dataId, dataName, dataPrice, dataLogo, dataSpecInfo, dataMax, dataPackagenum, dataOldPrice, 1 );
							common.tip();
							$this.siblings().eq(1).html( num1 );
							$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
						}else{
							common.prompt( "该商品限购" + dataMax + "件" )
						}
					}else{
						var num1 = cart.addgoods( dataId, dataName, dataPrice, dataLogo, dataSpecInfo, dataMax, dataPackagenum, dataOldPrice, 1 );
						common.tip();
						$this.siblings().eq(1).html( num1 );
						$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
					}			
				} else{
					common.prompt( "库存不足" );
				}
			});
			 //减少
	 		$(".zs-static-box").on('click','.minus_num',function(e){
				common.stopEventBubble(e);
				var $this = $(this);
				var dataId = $this.parents('[data-id]').attr("data-id");
                var num1 = cart.cutgoods( dataId );
                if ( num1 < '1' ) {
                	$this.hide().next().hide();
                } else{
                    $this.next().html( num1 );
            	}
                cart.style_change();
            });

            $(".zs-static-box").on('DOMNodeInserted','.show_num',function(){
               	var $this = $(this);
               	if ( $this.html() == 0 ) {
                    $this.hide().prev().hide();
               	} else{
                    $this.css('display',"inline-block").siblings().css('display','inline-block');
               	};
               	cart.style_change();
           	});
		}
	};
	// 接口
	pub.apiHandle = {
		init : function(){}
	};


	pub.init = function(){
		switch( pub.moduleId ){
			case 'goods' : GOODS.init(); break;
			case 'goodsDetail' : GD.init(); break;
		}

		pub.eventHandle.init();
 		$('.footer_item[data-content]','#foot').attr('data-content',cart.getgoodsNum());
		common.footerNav(function( i ){
			common.jumpLinkPlain(['../index.html','moregoods.html','cart.html','my.html'][i]);
		});
	};






	
	
	
	
		
	

	

	

	

	













	module.exports = pub;		
	

})