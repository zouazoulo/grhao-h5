/**
* 	index scirpt for Zhangshuo Guoranhao
*/ 
define('index', ['common'], function(require, exports, module){
	
	var common = require('common');

	// 首页 命名空间

	var pub = {};
	
	pub.openId = common.openId.getItem();

	pub.accountRelatived = common.accountRelatived.getItem();

	pub.dfd = $.Deferred();//主要用于商品接口的延时对象

	pub.dfdDefault = $.Deferred();//主要用与选择门店弹框的延时对象

	pub.accountRelative = $.Deferred();//主要用户账户关联的延时对象

	pub.storeInfo = null; // 门店信息

	pub.firmId = undefined; // 门店ID

	pub.paramListInit = function(){
	 	pub.logined = common.isLogin(); // 已经登录
	 	pub.logined && common.autoLogin(); // 执行自动登录
	};


 	// 接口处理命名空间

 	pub.apiHandle = {};
 	pub.apiHandle.init = function(){
 		var me = this;
 		//先判断是否为扫码进入-判断依据为链接上的参数
 		if (common.watmId.getItem()) {
			//将用户的默认门店改为当前门店，用户无感知
			pub.firmId = common.watmId.getItem();
			me.firm_default.init();
		}else{
			//使用用户的默认门店
			if( common.storeInfo.getKey() ){
				pub.storeInfo = common.getStoreInfo();
				pub.firmId = pub.storeInfo.id; // 取存储的ID
				common.temp1.getKey() ? me.firm_default.apiData( pub.storeInfo, true ) : me.firm_default.init();
			}else{
				pub.dfdDefault.done(function(){
					common.setMyTimeout(function(){
						common.dialog.init().show('请选择门店',function(){
						},function(){
							common.jumpLinkPlain('html/store.html');
						});
					},300);
				});
				me.firm_default.init();
			}
		}
		
 		if( common.timestamp.getKey() ){
 			var json = common.JSONparse( common.timestamp.getItem('timestamp') );
 			if( json.timestamp > Date.now() ){
	 			me.main_page_goods.apiData( json.con );
 			}else{
 				common.timestamp.removeItem();
 				pub.dfd.done(function(){
			 		me.main_page_goods.init();
			 	});
 			}
 		}else{
 			pub.dfd.done(function(){
		 		me.main_page_goods.init();
 			});
 		}
 	};

 	// 默认门店
 	pub.apiHandle.firm_default = {
 		init : function(){
 			common.ajaxPost({
 				method : 'firm_default',
 				firmId : pub.firmId 
	 		},function(d){
	 			switch( +d.statusCode ){
	 				case 100000 : pub.apiHandle.firm_default.apiData( d.data ); break;
	 				case 100400 : common.clearData(); break;
	 				case 100901 : common.dialog.init({
	 					btns : [{ klass : 'dialog-confirm-btn', txt : '确认'}]
	 				}).show('门店信息不存在，请重新选择门店', function(){common.jumpLinkPlain('html/store.html')}); break;
	 			}

	 		});
 		},
 		apiData : function( data, symbol ){
 			common.temp1.setItem('temp1');
 			var 
 			d = data,
	 		pNode = $('.index_tit p'),
	 		spanNode = pNode.eq(0).find("span");
	 		spanNode.eq(0).html( d.cityName ).next().html( d.countyName );
			pNode.eq(1).html( d.firmName );
			if( symbol != true ){ // 存储不存在
				pub.storeInfo = data;
				pub.firmId = d.id;
				common.storeInfo.setItem( common.JSONStr( data ) );
			}
			data.type == 5 && $('.index_center_wrap > dl').css('opacity',0.5);
			if(!pub.watmId){
				pub.dfdDefault.resolve();
			}
			pub.dfd.resolve();
			pub.apiHandle.custom_activity_firm_list.init();
			console.log(d)
			var firmId ={
				id:d.id,
				firmName:d.firmName,
				address:d.address
			}
			sessionStorage.setItem('firmId',JSON.stringify(firmId))
			
 		}
 	};
 	pub.apiHandle.custom_activity_firm_list = {
 		init : function(){
 			common.ajaxPost({
 				method : 'custom_activity_firm_list',
 				firmId : pub.firmId
 			},function( d ){
 				if( d.statusCode == "100000" && d.data.length != 0 ){
	 				$('#shop-active-data-box').html( $('#shop-active-data').tmpl( d.data ) );
	 				var swiper = new Swiper('.shop-active-container', {
				     	slidesPerView: 4,
				      	spaceBetween: 30,
				      	onTap: function( swiper,e ){
	      		 			common.first_data.removeItem();
	      					common.two_data.removeItem();
	      					common.seckill.removeItem();
				      		common.jumpLinkPlain( swiper.clickedSlide.getAttribute('h5Url') );
				      	}
				    });
 				}else{
 					$('.shop-active-container').css('padding','6px');
 				}
 			});
 		}
 	};
 	// 首页商品列表
 	pub.apiHandle.main_page_goods = {
 		init : function(){
 			var me = this;
 			common.ajaxPost({
 				method : 'main_page_goods',
 				firmId : pub.firmId,
 				websiteNode : pub.storeInfo.websiteNode
	 		},function( d ){
	 			switch( +d.statusCode ){
	 				case 100000 : me.apiData( d ); break;
	 				case 100400 : common.clearData(); break;
	 				case 100901 : common.dialog.init().show('当前门店信息不存在，请重新选择门店',function(){},function(){common.jumpLinkPlain('html/store.html')}); break; 
	 			}
	 		});
 		},
 		apiDataDeal : function( data ){
			var 
			html = '',
			goodsInfo = '';
			for(var i in data) {
				goodsInfo = data[i].goodsInfo;
				var arr = [];
				goodsInfo.isHot == 1 && arr.push('isHot');
				goodsInfo.isNew == 1 && arr.push('isNew');
				goodsInfo.isRecommend == 1 && arr.push('isRecommend');
				goodsInfo.isSale == 1  && arr.push('isSale');
				html += '<dl data="' + goodsInfo.id + '" goods-box="goods-box">'
				html += '	<dt>'
				html += '		<img ' + ( i < 6 ? 'src' : 'data-src'  ) + '=' + goodsInfo.goodsLogo  + ' class="fadeIn"/>'
				html += '<div class="box">'
				for(var k = 0; k < arr.length; k++){ html += '<span class="goodSatce ' + arr[k] + '"></span>' }
				html += '</div>'
				html += '	</dt>'
				html += '	<dd>'
				html += '		<p>' + goodsInfo.goodsName + '</p>'
				html += '		<p class="clearfloat">'
				html += '			<span class="float_left">'+ goodsInfo.specInfo + '</span>'
				html += '			<span class="float_right">￥'+ goodsInfo.nowPrice + '</span>'
				html += '		</p>'
				html += '	</dd>'
				html += '</dl>'
			}
			$(".index_inner").html( html );
 		},
 		apiData : function( d ){
 			var 
 			json = {},
 			me = this,
			data = d.data;
 			if( !common.timestamp.getKey() && data.adInfoList.length != 0 && data.mainPageGoodsDetails.length != 0 ){
 				json.timestamp = Date.now() + 3 * 60 * 1000;
 				json.con = d;
 				common.timestamp.setItem( common.JSONStr( json ) );
 			}
			data.adInfoList.length != 0 && common.bannerShow( data.adInfoList, '.index_banner', function( d ){
				var html = '', i = 0, link = null;
				for ( i in d ){
					html += '<div class="swiper-slide"><a href="' + ( d[i].linkUrl ? d[i].linkUrl : 'javascript:void(0)' ) + '"><img src="' + d[i].adLogo + '" /></a></div>'
				}
				return html;
			});

			$(".index_inner").empty();

			data.mainPageGoodsDetails.length != 0 && me.apiDataDeal( data.mainPageGoodsDetails );
 			common.isWeiXin() && (function(){
 				common.weixin.config( location.href.split('#')[0] );
 				common.weixin.share( d.data.customShare );
 			}());
 		}
 	};
 	pub.get_weixin_code  = function(){
        common.ajaxPost({
            method: 'get_weixin_code',
            weixinCode : pub.weixinCode
        },function( d ){
            if( d.statusCode == '100000' && d.data.fromWX == 1 ){
                pub.openId =  d.data.openId;
				//pub.openId = 'oLC2v0vzHkVYsoMKzSec5w78rfSs'
                common.openId.setItem( pub.openId ); // 存opendId
                //pub.accountRelative.resolve(); // 触发账户关联接口
                //获取openId后台判断如果注册的情况下就返回用户信息   没有注册的情况下后台默认注册
                pub.apiHandle.scan_qrcode_login.init()
            }else{
                common.prompt( d.statusStr );
            }
        });
    };
	//微信自动登录
	pub.apiHandle.scan_qrcode_login = {
		init:function(){
			common.ajaxPost({
	            method: 'scan_qrcode_login',
	            openId : pub.openId
	    	},function( d ){
	            if( d.statusCode == '100000'){
					pub.apiHandle.scan_qrcode_login.apiData(d);		                
	            }else{
	            	common.prompt( d.statusStr );
	            }
	        });
		},
		apiData:function(d){
			var infor = d.data.cuserInfo,
				user_data = {
				    cuserInfoid : infor.id,
				    firmId : infor.firmId,
				    faceImg : infor.faceImg,
				    petName : infor.petName,
				    realName : infor.realName,
				    idCard : infor.idcard,
				    mobile : infor.mobile,
				    sex : infor.sex,
				    isRegOpenfire:infor.isRegOpenfire
				};
			common.user_data.setItem( common.JSONStr(user_data) );
			localStorage.setItem('tokenId',d.data.tokenId)
			common.secretKey.setItem( d.data.secretKey );
			//登陆完成后再进行门店初始化
			pub.apiHandle.init();
    	},
    };
	//换肤
	pub.apiHandle.change_app_theme = {
		init:function(){
			if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
				$(".index_header,.index_inner,.footer").addClass("skin"+sessionStorage.getItem("huanfu"))
			}
		}
	}
 	// 事件处理初始化
	pub.eventHandle = {
		
		init : function(){

	 		//底部跳转问题
	 		common.footerNav(function( i ){
	 			if( i == 1 ){
		 			common.first_data.removeItem();
					common.two_data.removeItem();
	 			}
				common.jumpLinkPlain( ['../index.html','./html/moregoods.html','./html/cart.html','./html/my.html'][i] );
	 		});

			//点击跳转详情页面
			$('.index_inner').on('click', "dl[goods-box]", function() {
				common.jumpLinkPlain( "html/goodsDetails.html?goodsId=" + $(this).attr("data") );
			});

			// $(".index_center_wrap").on('click', "dl", function() {
			// 	if( pub.storeInfo.type != 5 ){
			// 		common.first_data.removeItem();
			// 		common.two_data.removeItem();
			// 		var i = $(this).attr("data");
			// 		var pathNames = ["html/moregoods.html?type=TAO_CAN","html/moregoods.html?type=JU_HUI","html/seckill.html","html/pre.html"];
			// 		i == "3" && common.seckill.setItem('1');
			// 		common.jumpLinkPlain( pathNames[ i - 1 ] );
			// 	}
			// });
			$(".index_center_wrap").on('click', ".index_center_center", function() {
				common.jumpLinkPlain("html/month_service.html");
			});
			common.jumpLinkSpecial( '.index_rigth','html/search.html' ); //跳转搜索页面
			common.jumpLinkSpecial( '.index_tit','html/store.html' ); // 跳转到门店

			// $('#shop-active-data-box').on('li div','click',function(){
			// 	console.log( $(this).attr('h5Url'));
			// 	common.jumpLinkPlain( $(this).attr('h5Url') );
			// });
		}
		
 	};

 	// 模块初始化
 	pub.init = function(){

 		//pub.paramListInit(); // 参数初始化
 		
 		pub.logined = common.isLogin(); // 判断是否登录
 		
 		pub.isWeiXin = common.isWeiXin();
 		
 		pub.watmId = common.getUrlParam("firmId");//获取机器编码id
 		
 		if (pub.watmId && pub.watmId != 'grhao') {
 			common.watmId.setItem(pub.watmId);
 		}
 		//pub.domain = 'http://weixin.grhao.com';
 		pub.domain = common.WXDOMAIN;
 		pub.appid = common.WXAPPID;
 		if (pub.isWeiXin) {
 			pub.weixinCode = common.getUrlParam('code'); // 获取url参数
			pub.state = common.getUrlParam("state");//获取url机器编码参数
			
			if (pub.logined) {
				
				common.autoLogin(); // 执行自动登录
				
				/*if (common.watmId.getItem()) {
					//将用户的默认门店改为当前门店，用户无感知
				}else{
					//使用用户的默认门店
				}*/
				pub.apiHandle.init(); // 模块初始化接口数据处理
			}else{
				
				var state = 'state='+(pub.watmId ? pub.watmId : 'grhao');
				//测试掌烁科技wxe92e098badc60fab正式果然好商城wxf9dd00234aa6e921
				/*!pub.openId ? (function(){
	 				pub.weixinCode ? pub.get_weixin_code() : common.jumpLinkPlain("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+pub.appid+"&redirect_uri=" + pub.domain + "/index.html&response_type=code&scope=snsapi_userinfo&"+ state+ "&connect_redirect=1#wechat_redirect");
	 			}()) : (function(){
	 				//!pub.accountRelatived && pub.logined && pub.accountRelative.resolve(); // 关联
	 				//使用openId去进行登录操作
	 				pub.apiHandle.scan_qrcode_login.init()
	 			}());*/
	 			pub.weixinCode ? pub.get_weixin_code() : common.jumpLinkPlain("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+pub.appid+"&redirect_uri=" + pub.domain + "/index.html&response_type=code&scope=snsapi_userinfo&"+ state+ "&connect_redirect=1#wechat_redirect");
			}
 		}else{
 			
 			if (pub.logined) {
				
				common.autoLogin(); // 执行自动登录
				
				
				pub.apiHandle.init(); // 模块初始化接口数据处理
				
			}else{
				//存储watmId；用于账号登录之后的门店。
				pub.apiHandle.init();
			}
 			
 		}
 		
 		
		
		
		
 		

 		/*
			用户退出账号后，不能再使用 openId 登录，意味着只要使用 tokenId 登录即可
 		*/
 		

		
		
 		// 账户绑定逻辑处理
/*		pub.isWeiXin && (function(){
 			!pub.openId ? (function(){
 				pub.weixinCode ? pub.get_weixin_code() : common.jumpLinkPlain("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf9dd00234aa6e921&redirect_uri=" + pub.domain + "/test0319/&response_type=code&scope=snsapi_userinfo&"+ state+ "&connect_redirect=1#wechat_redirect");
 			}()) : (function(){
 				!pub.accountRelatived && pub.logined && pub.accountRelative.resolve(); // 关联
 			}());
 		}());
		
		
 		pub.accountRelative.done( pub.apiHandle.weixin_binding.init ); // 账户绑定接口
*/
 		// 微信授权处理
		// !pub.openId && common.isWeiXin() && pub.weixinCode &&  pub.get_weixin_code();

 		
 		
 		common.lazyload(); // 懒加载
 		
 		pub.eventHandle.init(); // 模块初始化事件处理
		
		$('.footer_item[data-content]','#foot').attr('data-content', common.getTotal() );
		if (!common.huanfu.getKey()) {
			common.change_app_theme();
			common.defHuanfu.done(function(){
				pub.apiHandle.change_app_theme.init();
			})
		}else{
			pub.apiHandle.change_app_theme.init();
		}
		
 	};
 	common.refresh();
 	// require.async('https://hm.baidu.com/hm.js?2a10c871d8aa53992101d3d66a7812ae'); // 百度统计
	module.exports = pub;
});	
