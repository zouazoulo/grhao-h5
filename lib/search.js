define('search',['common'],function(require, exports, module){

	var common = require('common');
	// 整体 命名空间 ( search + 门店位置 )
	pub = {};

	pub.paramListInit = function(){
		pub.logined = common.isLogin(); // 已经登录

	 	if( pub.logined ){
	 		// pub.firmId = common.user_datafn().firmId; // 门店ID
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
	 	}
		pub.muduleId = $('[module-id]').attr('module-id');
	};
	pub.storeInfo = common.JSONparse( common.storeInfo.getItem() ); // 获取门店信息

/***************************搜索模块***************************/
	pub.search = {};
	var SEARCH = pub.search; 
	SEARCH.paramListInit = function(){

		SEARCH.PAGE_SIZE = common.PAGE_SIZE; // 每页显示条数
		SEARCH.PAGE_INDEX = common.PAGE_INDEX; // 页码索引
		SEARCH.isEnd = false; // 有没有更多数据判断
		SEARCH.keyWord = null; // 热搜词
		SEARCH.hotWordbox = $('.search_star');
	};
	SEARCH.apiHandle = {
		init : function(){
			SEARCH.apiHandle.hot_search_data.init();
		},
		hot_search_data : {
			init : function(){
				common.ajaxPost({
					method : 'hot_search_data',
					firmId : pub.storeInfo.id
				},function( d ){
					d.statusCode == '100000' && SEARCH.apiHandle.hot_search_data.apiData( d );
				});
			},
			apiData : function( d ){
				var  
				data = d.data, 
				html = '', 
				i;
				for(i in data){ 
					html += '<li>' + data[i].keyword + '</li>';
				}
				$('.search_item_list').html( html );
			}
		},
		search_goods : {
			init : function(){
				common.ajaxPost({
					method : 'search_goods',
					keyWord : SEARCH.keyWord,
					pageNo : SEARCH.PAGE_INDEX,
					pageSize : SEARCH.PAGE_SIZE,
					firmId : pub.storeInfo.id
				},function( d ){
					d.statusCode == '100000' && SEARCH.apiHandle.search_goods.apiData( d );
				});
			},
			apiData : function( d ){

				var  data = d.data, html = '', obj, i;
				SEARCH.isEnd = data.isLast; // 最后一页
				if ( data.objects == 0 && SEARCH.isEnd ) {
					$(".search_none").show().siblings().hide();
				} else{
					$(".search_resurt").show().siblings().hide();
					for ( i in data.objects) {
						obj = data.objects[i];
						html +='<dl class="clearfloat" data-id="' + obj.id + '" type="' + obj.activityType + '">';
						if( obj.activityType == 2 ){
							html +=		'<dt><img src="' + obj.goodsLogo + '"/><img src="../img/icon_miao_s.png" alt="" class="icon-img"/></dt>';
						}else{
							html +=		'<dt><img src="' + obj.goodsLogo + '"/></dt>';
						}
						html +=		'<dd>'
						html +=			'<p class="good_name">' + obj.goodsName + '</h3>'
						html +=			'<p class="good_describe">' + obj.specInfo + '</p>'
						html +=			'<div class="good_picre_search"><span>￥' + obj.nowPrice + '</span>&nbsp;&nbsp;&nbsp;&nbsp;<del>￥' + obj.nomalPrice + '</del></div>'
						html +=		'</dd>'
						html +='</dl>'
					};
					$(".search_goods").append( html );
					$('.click_load').show().html( SEARCH.isEnd ? "没有更多数据了！" : "点击加载更多！" );
				}
			}
		}
	};
	// search 事件初始化
	SEARCH.eventHandle = {

		init : function(){

			var paramFn = function( value ){
				SEARCH.PAGE_INDEX = common.PAGE_INDEX; // 重置页码
				SEARCH.keyWord = value;
				$('.search_goods').empty();// 清空列表数据
				SEARCH.apiHandle.search_goods.init();
			};

			// 点击热搜词
			$(".search_item_list").on("click","li",function(){
				var val = $(this).html();
				$( '.search','.search_box').val( val );
				paramFn(val);

			});

			// 点击加载更多
			$('.click_load').on( 'click',function(){
				if( SEARCH.isEnd ){
					SEARCH.PAGE_INDEX++;
					SEARCH.apiHandle.search_goods.init();
				}
			});

			// 点击搜索
			$('.search_btn').on('click',function(){
				var keyWord = $('.search').val().replace(/\s*/g,'');
				keyWord != '' && paramFn( keyWord );
			});

			// 点击删除输入框内容
			$('.search_delete').on('click',function(){
				var 
				$this = $(this),
				val = $this.prev().val();
				val != '' && $this.prev().val('');
				SEARCH.hotWordbox.is(':hidden') && SEARCH.hotWordbox.show().siblings().hide();
			});

			// 输入判断
			$(".search").on("input propertychange",function(){
				var val = $(this).val();
				if ( val == '' || val.replace(/\s*/g,'') == '' ) {
					$(".search_star").show().siblings().hide();
				}
			});

			//点击跳转详情
			$(".search_goods").on("click","dl",function(){
				var 
				$this = $(this),
				type = $this.attr('type'),
				pathNames = [ "seckillDetail.html", "preDetails.html", "seckillDetaila.html" ],
				goodsId = $this.attr("data-id");

				if( 1 < type && type < 5){
					common.jumpLinkPlain( pathNames[type-2] + '?goodsId=' + goodsId );
				}else{
					common.jumpLinkPlain( "goodsDetails.html?goodsId=" + goodsId );
				}
			});

			// 返回上一页
			$('.search_left').on('click',function(e){
				var isHide = SEARCH.hotWordbox.is(':hidden');
				if( isHide ){
					$('.search_box').find('.search').val('');
					$('.search_resurt,.search_none').hide();
					SEARCH.hotWordbox.show();
				}else{
					common.jumpLinkPlain("../index.html");
				}
			});
		}
	};

	SEARCH.init = function(){
		!common.storeInfo.getKey() && common.jumpLinkPlain('../index.html'); 
		SEARCH.paramListInit(); // 参数初始化
		SEARCH.eventHandle.init();
		SEARCH.apiHandle.init();
	};

/************************************ 门店地址 *************************/
	
	// 命名空间

	pub.store = {};
	var STORE = pub.store;

	// 门店 接口命名空间

	STORE.dfd1 = $.Deferred();

	pub.userPosStatus = false;

	STORE.PAGE_INDEX = 1;

	STORE.PAGE_SIZE = 10;

	pub.tipMgsNode = $('.store-all').children('.tipMgs');

	pub.dataBox = $('#store-list-data-box');

	STORE.apiHandle = {
		init : function(){
			this.area_show.init();
		},
		choice_firm : {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'choice_firm',
					firmId : pub.firmId
				}),function( d ){
					if( d.statusCode == "100000" ){
						var user_data = common.user_datafn();
						user_data.firmId = pub.firmId;
						common.user_data.setItem( common.JSONStr( user_data ) );
						common.jumpLinkPlain( "../index.html" );
					}
				})
			}
		},
		choose_firm_list : {
			init : function(){
				common.ajaxPost({
					method : 'choose_firm_list',
					firmType : pub.firmType,
					county : pub.countyCode,
					street : pub.countyStreet,
					sortType : pub.sortType,
					longitude : pub.getLng,
					latitude : pub.getLat,
					pageSize : STORE.PAGE_SIZE,
					pageNo : STORE.PAGE_INDEX
				},function( d ){
					if( d.statusCode == '100000' ){
						STORE.isLast = d.data.hasPage.isLast;
						pub.tipMgsNode.show().html(STORE.isLast ? '没有更多数据' :'点击加载更多');
						if( d.data.hasPage.objects.length == 0 ){
							pub.tipMgsNode.html('没有更多数据');
						}else{
							pub.dataNeedle = d.data.noPage;
							pub.dataBox.append( $('#store-list-data').tmpl( d.data.hasPage ) );
							pub.dataBox.data('store-list', ( pub.dataBox.data('store-list') || [] ).concat( d.data.hasPage.objects )  );
						}
					}else{
						pub.tipMgsNode.show().html('没有更多数据');
					}
				});
			},
		},
		area_show : {
			init : function(){
				common.ajaxPost({
					method : 'area_show',
				},function( d ){
					d.statusCode == '100000' && $('#store-area-data-box').html( $('#store-area-data').tmpl( d ) );
				});
			}
		}
	};
	// 门店 事件处理命名空间
	STORE.eventHandle = {
		init : function(){

			// 
			// var getMakerContent = function(){
			// 	return this.getContent();
			// };
			var historyBool = true;
			var MAP = common.MAP;

			MAP.init(); // 地图初始化
			// var map = require('myMap');
			if( common.isAndroid() ){
				jQuery.fx.interval = 60;
			}
			$('.nav-tab > .nav-list').click(function(e){
				common.stopEventBubble( e );
				var $this = $(this),
				i = $this.index(),
				isCur = $this.is('.actived');

				if( !isCur ){
					$this.addClass('actived').siblings().removeClass('actived');
					$('.nav-modal-bg').fadeIn( 300 );
					$('.nav-group').eq(i).slideDown().siblings().hide();
				}else{
					$('.nav-modal-bg').fadeOut( 300 );
					$('.nav-group').eq(i).slideUp( 300, function(){
						$this.removeClass('actived');
					});
				}
			});

			$('.nav-group:not(:eq(1))').on('click','.nav-menu .menu-list',function( e ){
				common.stopEventBubble( e );
				var $this = $(this),
				i = $this.index();
				$this.addClass('actived').siblings().removeClass('actived');
				$this.parents('.nav-group').delay( 200 ).slideUp( 300, function(e){
					$('.nav-tab .nav-list').removeClass('actived');
				});
				pub.dataBox.empty().removeData('store-list');
				STORE.PAGE_INDEX = 1;
				$('.nav-modal-bg').fadeOut( 500 );
				if( $this.is('.firm-type') ){
					pub.firmType = $this.attr('firm-type');
					STORE.apiHandle.choose_firm_list.init();
				}else if( $this.is('.sort-type') ){
					pub.sortType = $this.attr('sort-type');
					STORE.apiHandle.choose_firm_list.init();
				}
			});
			$('.nav-group:eq(1)').on('click','.nav-menu .menu-list',function( e ){
				common.stopEventBubble( e );
				var $this = $(this),
				i = $this.index(),
				isCur = $this.is('.actived');
				if( isCur ) return;
				pub.countyCode = $this.attr('code');
				$this.addClass('actived').siblings().removeClass('actived');
				$('.nav-group:eq(1)').find('.nav-sub-menu .sub-menu-list').eq( i ).show().siblings().hide();
			});
			$('.nav-group:eq(1)').on('click','.sub-menu-list .item',function( e ){
				var $this = $(this),
				i = $this.index(),
				isCur = $this.hasClass('actived');
				pub.countyStreet = $this.attr('code');
				pub.dataBox.removeData('store-list');
				STORE.PAGE_INDEX = 1;
				pub.dataBox.empty();
				if( !isCur) {
					$this.addClass('actived').siblings().removeClass('actived');
					$('.nav-modal-bg').fadeOut(500);
				}else{
					$('.nav-modal-bg').fadeOut(500);	
				}
				$this.parents('.sub-menu-list').siblings().find('.item').removeClass('actived');
				$this.parents('.nav-group').delay(200).slideUp(300,function(e){
					$('.nav-tab .nav-list').removeClass('actived');
				});
				STORE.apiHandle.choose_firm_list.init();
			});
			
			$('#store-list-data-box').on('click','.list',function(e){
				var i = $(this).index();
				STORE.storeInfo = pub.dataBox.data('store-list')[i];
				if( $(e.target).is('.isCurNode') ){ // 是图标节点，并且授权成功
					if( pub.userPosStatus ){
						$('#map-container').show();
						$('#store-box').hide();
						$('.header_title').html('门店位置');
						pub.storeLng = STORE.storeInfo.longitude;
						pub.storeLat = STORE.storeInfo.latitude;
				        MAP.coords.store = [ +pub.storeLng, +pub.storeLat ];
				       	MAP.ins.setZoomAndCenter( 15, MAP.coords.store );
				        MAP.setMakerCoords( STORE.storeInfo.firmName );
				        if( historyBool ){
					        window.history.pushState('','','./store.html');
					        historyBool = false;
				        }
					}else{
						MAP.getPositionCoords();
					}
				}else{
					common.dialog.init({
						btns : [ { klass : 'dialog-cancel-btn', txt:'否'},{ klass : 'dialog-confirm-btn', txt : '是'}]
					}).show('是否切换到<span class="store-switch-tip">' + STORE.storeInfo.address + '</span>门店？',function(){},function(){
	                    common.timestamp.removeItem();
	                    pub.storeInfo.id != pub.storeInfo.id && common.good.removeItem();
	                    common.storeInfo.setItem(common.JSONStr( STORE.storeInfo ) );
						pub.logined ? function() {
	                        pub.firmId = pub.storeInfo.id;
	                        STORE.apiHandle.choice_firm.init();
	                    }() : common.jumpLinkPlain("../index.html");
					});
				}
			});
			
			$('.nav-modal-bg').click(function(){
				var $this = $(this);
				$('.nav-group').slideUp( 500, function(){
					$this.fadeOut( 500, function(){
						$('.nav-tab > .nav-list.actived').removeClass('actived');
					});
				});
			});

			pub.positionDetial = $('.position-detial');
			MAP.ins.on('complete',function(){
				MAP.coords.user = [];
				MAP.coords.store = [];
				MAP.getPositionCoords(function(data){
					pub.getLng = data.position.getLng();
			     	pub.getLat = data.position.getLat(); 
					MAP.coords.user = [ +data.position.getLng(), +data.position.getLat() ];
					STORE.apiHandle.choose_firm_list.init(); // 门店列表接口
					// 获取用户位置信息
					MAP.getGeocoder(function( result ){
						pub.userPosStatus = true;
						var addressComponent = result.regeocode.addressComponent,
						len = ( addressComponent.province + addressComponent.city ).length;
						pub.positionDetial.removeClass('locationFail').children('p').html( result.regeocode.formattedAddress.substr( len ) ); 
					},function(){
						pub.positionDetial.children('p').html( '定位失败' );
					});
				},function(){ // 无法获取用户位置
					pub.userPosStatus = true; 
		        	pub.sortType = undefined;
		        	STORE.apiHandle.choose_firm_list.init();
		        	pub.positionDetial.addClass('locationFail').children('p').html( '定位失败' );
		        	common.dialog.init({btns : [{ klass : 'dialog-confirm-btn', txt : '知道了'}]}).show('位置信息获取失败',function(){});
				});
			});

			var setStoreByMap = function(){
				var content = this.getContent();
				var info = common.JSONparse( $('<div>').html(content).children('span').text() );
				common.dialog.init({
					btns : [ { klass : 'dialog-cancel-btn', txt:'否'},{ klass : 'dialog-confirm-btn', txt : '是'}]
				}).show('是否切换到<span class="store-switch-tip">' + info.address + '</span>门店？',function(){},function(){
					common.timestamp.removeItem();
					info.id != pub.storeInfo.id && common.good.removeItem();
					common.storeInfo.setItem( common.JSONStr( info ) );
					common.timestamp.removeItem();
					pub.logined ? (function(){
						pub.firmId = info.id;
						STORE.apiHandle.choice_firm.init();
					}()) : common.jumpLinkPlain('../index.html');
					
				});
			}

			// 点击更多
			$('#checkAllMaker').on('click',function(){
				MAP.ins.setZoomAndCenter( 12, [120.227589,30.202263] );
		        if( historyBool ){
			        window.history.pushState('','','./store.html');
			        historyBool = false;
		        }
		        $('#map-container').show();
				$('#store-box').hide();
				MAP.setManyMakerCoords( pub.dataNeedle );

				MAP.markerArr.forEach(function(v){
					v.on('click',setStoreByMap);
				});
			});






			$('.header_left').click(function(){
				var 
				mapBox = $('#map-container'),
				isHide = mapBox.is(':hidden');
				if( !isHide ){
					mapBox.hide();
					$('#store-box').show();
					$('.header_title').html('门店选择');
				}else{
					common.jumpLinkPlain('../index.html');
				}
			});
			
			window.onpopstate = function(){
				historyBool = true;
				$('#map-container').hide();
				$('#store-box').show();
				$('.header_title').html('门店选择');	
			};
			$('.store-all #tipMgs').click(function(){
				if( !STORE.isLast ){
					STORE.PAGE_INDEX++;
					STORE.apiHandle.choose_firm_list.init();
				}
			});
		}
	};

	// 门店模块初始化
	STORE.init = function(){
		STORE.bodyNode = $('body');
		STORE.apiHandle.init();
		STORE.eventHandle.init();
	}
	// 模块初始化
	pub.init = function(){
		pub.paramListInit(); // 参数初始化
		switch( pub.muduleId ){
			case "search" : SEARCH.init();break;
			case "store" : STORE.init();break;
		};
	};
	module.exports = pub;
})
