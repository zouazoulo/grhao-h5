/*
* common scirpt for Zhangshuo Guoranhao
*/
/*! jQuery v1.8.3 jquery.com | jquery.org/license */

define('common',['md5','sha1','jquery','swiper','weixinSDK','module'],function(require, exports, module){

	require('sha1');
	// 命名空间 ZS = Zhangshuo
	var ZS = {};
	ZS.encrypt = require('md5');
	ZS.wx = require('weixinSDK')['myFn'](window);
	require('jquery');
	require('swiper');
	require('module');
	$.extend(ZS,{
	
		API : "http://61.164.113.168:8090/grh_api/server/api.do", // 测试
 
		// 每页显示的个数
		PAGE_SIZE : 10,
		// 页码索引
		PAGE_INDEX : 1,
		PAY_METHOD : 5, // 支付方式5.表示月卡支付 6.表示在线支付
		PICK_UP_METHOD : 1, //提货方式  默认为 1.门店自提，2.送货上门
		// 用户代理
		UA : navigator.userAgent.toLowerCase(),
		// 定时器ID
		TIMER_ID : null,
		// 密码 正则
		PWD_REG : /^[^\s]{6,20}$/,
		// 
		BANK_CARD_REG : /^\d{16}|\d{19}$/,
		// 手机号正则
		PHONE_NUMBER_REG : /^(13[0-9]|14[5|7]|15[0-9]|17[0-9]|18[0-9])\d{8}$/,
		// 身份证 正则
		ID_CARD_REG : /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/,
		//域名地址'http://wx.grhao.cn/lifei'，'http://weixin.grhao.com'
		WXDOMAIN : "http://wx.grhao.cn/lifei", //测试
		//appid 测试掌烁科技wxe92e098badc60fab正式果然好商城wxf9dd00234aa6e921
		WXAPPID : "wxe92e098badc60fab", //测试
	});
	//换肤延时对象
	ZS.defHuanfu = $.Deferred();
	// 构造HTML5存储方式 
	function Memory( key, way ){
	    this.way = way;
	    this.key = key;
	};
	Memory.prototype = {
		constructor : Memory,
	    map : {
	        'session' : window.sessionStorage,
	        'local' : window.localStorage
	    },
	    setItem : function( value ){
	        this.map[this.way].setItem( this.key, value )
	    },
	    getItem : function(){
	        return this.map[this.way].getItem( this.key );
	    },
	    removeItem : function(){
	        this.map[this.way].removeItem( this.key );
	    },
	    clear : function(){
	        this.map[this.way].clear();
	    },
	    getKey : function(){
	        return this.key in this.map[this.way];
	    }
	};

	(function(){
		var div = $("<h5 class='networkError'>您的网络好像不太给力</h5>");
		
		window.addEventListener('online',  function(){
			$(".networkError").length && $("body").find(".networkError").remove()
		});
  		window.addEventListener('offline', function(){
  			if ($(".networkError").length == 0) {
				$("body").append(div)
			}
  		});
	})(ZS)

	/**
	 *	数据存储 统一管理
	*/

	var locals = [
		'local', // 清空所有local
		'tokenId', // 存储 tokenId
		'secretKey', // 存储 secretKey
		'user_data', // 存储用户信息
		'jumpMake', // 跳转
		'orderType', // 1.普通商品 2.秒杀商品 3.预购商品
		'good', // 购物车商品信息
		'orderBack', // 订单入口 
		'openId',
		'userId',
		'storeInfo', // 存数据信息
		'accountRelatived', // 账户关联
		'addObj',//新增地图选择地址使用
	].forEach(function( item ){
		ZS[item] = new Memory( item, 'local' );
	});
	var sessions = [
		'session', // 清空所有session
		'first_data', // 
		'two_data',
		'goodid', // 标记临时 id 
		'seckill', // 换购 + 秒杀商品信息
		'logined', // 登录状态 
		'sortCouponId',
		'addType', // 标记地址管理页面入口 + 订单结算 tab 切换
		'addressData', // 存储地址数据
		'seckillGood', // 秒杀商品信息
		'orderCode', // 订单码 / 编号
		'orderColumn', // 订单 tab
		'preColumn', // 预购订单 tab 
		'temp1',
		'location',
		'appData', // app字段
		'timestamp', // 
		'temp',
		'commentInfo', // 评论信息

		'watmId'  ,//watm机器id
		'huanfu' ,//换肤管理
		'gameType' // 标记地址管理页面入口 + 订单结算 tab 切换
	].forEach(function( item ){
		ZS[item] = new Memory( item, 'session' );
	});
	// 获取 tokenId 的值
	ZS.tokenIdfn = function(){
		if( this.tokenId.getKey() ){
			return this.tokenId.getItem();
		}
	};

	// 获取 secretKey 的值
	ZS.secretKeyfn = function(){
		if(this.secretKey.getKey()){
			return this.secretKey.getItem();
		}
	};

	// 全局设置ajax请求
	$.ajaxSetup({
		url: ZS.API,
		dataType: 'jsonp'
		//timeout : 100 //超时时间设置，单位毫秒
	});

	// 统一接口处理函数
	ZS.ajaxPost = function(data, done, fail, finish ){
		done = typeof done !== 'function' ? function(){} : done;
		fail = typeof fail !== 'function' ? function( d ){d.status == 0 ? (function(){
			!window.navigator.onLine && ZS.prompt("网络连接异常")
		})() : '' } : fail;
		finish = typeof finish !== 'function' ? function(XMLHttpRequest,status){
			if(status=='timeout'){console.log("finish");}
			//超时,status还有success,error等值的情况ajaxTimeoutTest.abort();alert("超时");
		} : finish;
		$.ajax({
			data : data,
			success : done,
			error : fail,
			complete : finish
		});
	};

	ZS.autoLogin = function(){
		var data = {
			method : 'auto_login',
			tokenId : ZS.tokenIdfn()
		};
		ZS.ajaxPost(data,function(d){
			if ( d.statusCode != '100000' ) {
				ZS.prompt( d.statusStr );
				ZS.tokenId.removeItem();
				ZS.secretKey.removeItem();
				ZS.user_data.removeItem();
				ZS.session.clear();
			}else{
				ZS.logined.setItem('logined');
			}
		},function(d){
			ZS.prompt(d.statusStr);
			ZS.tokenId.removeItem();
			ZS.secretKey.removeItem();
			ZS.user_data.removeItem();
			ZS.session.clear();
		});
	};
	
	ZS.change_app_theme = function(){
		ZS.ajaxPost({
			method : 'change_app_theme'
		},function( d ){
			if (d.statusCode == '100000') {
				sessionStorage.setItem("huanfu",d.data.type)
				ZS.defHuanfu.resolve();
			}
		});
	}

	$.extend(ZS,{

		// 自定义定时器
		setMyTimeout : function( fn, t ){
			this.TIMER_ID && clearTimeout(this.TIMER_ID);
			this.TIMER_ID = null;
			this.TIMER_ID = setTimeout( fn, t );
		},

		// 判断是否为移动设备
		isPhone : function(){
			var 
			ua = this.UA,
	        bIsIpad = ua.match(/ipad/i) == "ipad",
	        bIsIphoneOs = ua.match(/iphone os/i) == "iphone os",
	        bIsMidp = ua.match(/midp/i) == "midp",
	        bIsUc7 = ua.match(/rv:1\.2\.3\.4/i) == "rv:1.2.3.4",
	        bIsUc = ua.match(/ucweb/i) == "ucweb",
	        bIsAndroid = ua.match(/android/i) == "android",
	        bIsCE = ua.match(/windows ce/i) == "windows ce",
	        bIsWM = ua.match(/windows mobile/i) == "windows mobile";
		    return bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM;
		},
		// APP
		isApp : function(){
			return this.UA.match(/grh_app/i) == 'grh_app';
		},
		// 安卓设备
		isAndroid : function(){
			return this.UA.match(/android/i) == "android";
		},
		isApple : function(){
			return this.UA.match(/iphone os/i) == "iphone os";
		},
		// 判断环境是否为微信
		isWeiXin : function(){
			return this.UA.match(/MicroMessenger/i) == 'micromessenger';
		},
		// JSONstring to jsonObject
		JSONparse : function( jsonStr ){ 
			return JSON.parse( jsonStr );
		},

		// jsonObject to JSONstring
		JSONStr : function( json ){ 
			return JSON.stringify( json );
		},

		// 处理普通的页面跳转
		jumpLinkPlain : function( url ){
			url = url || window.location.href;
			if (!window.navigator.onLine) {
				return;
				//ZS.prompt("网络未连接");
			}
			window.location.href = url;
			return true; 
		},

		// 处理需要事件触发
		jumpLinkSpecial : function( ele, callback ){ 
			$( ele ).on('click',function(){
				typeof callback === 'function' ? callback() : ZS.jumpLinkPlain(callback);
			});
		},

		// 组织冒泡
		stopEventBubble : function(e){
			return e.stopPropagation();
		},

		// 判断是否已经登录
		isLogin : function(){
			return this.tokenId.getKey();
		},

		// banner轮播图
		bannerShow : function( data, box, callback, pagination ){
			pagination = pagination || '.swiper-pagination';
			var html = callback( data );
			$( box + " .swiper-wrapper" ).html( html );
			var mySwiper = new Swiper (box, {
			    direction: 'horizontal',
			    loop: true,
			    autoplay:5000,
			    paginationClickable:true,
			    autoplayDisableOnInteraction : false,
			    pagination: pagination // 如果需要分页器
			});
		},

		alertShow : function( ele, callback){
			$(ele).on('click',function(e){
	    		ZS.stopEventBubble(e);
	    		$('.alert_box,.my_bg').css({'display':'block'});
	  			$("body").css("overflow-y","hidden");
	  			if( typeof callback == "function" )  callback();
	    	});
		},

		alertHide : function(){
			$('.alert_delete').on('click',function(e){
	    		ZS.stopEventBubble(e);
	    		$('.alert_box,.my_bg').css({'display':'none'});
	  			$("body").css("overflow-y","auto")
	    	});
			$('.my_bg').on('click',function(e){
	    		ZS.stopEventBubble(e);
	    		$('.alert_box,.my_bg').css({'display':'none'});
	  			$("body").css("overflow-y","auto");
	    	});
		},

		// 弹窗
		nodeTemp : null,
		//同一页面内不同box之前的切换
		switchInput : function( opt ){
			var _selt = this,
				tit = opt.title,
				node1 = opt.node1,
				node2 = opt,node2,
				callBack = opt.callBack;
	        
			tit = tit || title;
			$('.header_title').html( tit );
			document.title = tit;
			
			$( node1 ).fadeOut(100,function(){
				$( node2 ).fadeIn(200);
				if (callBack) {
					callBack()
				}
			});
			
		},
		
		prompt : function( str, t ){

			var 
			promptNode = $('#prompt-node'),
			t = t || 2300;

			promptNode[0] && promptNode.remove();

			var promptNode = $('<div class="prompt" id="prompt-node"></div>').appendTo('body');

			promptNode.html( '<p>' + str + '</p>' )
			.css("margin-left",- promptNode.outerWidth() / 2 )
			.fadeIn(300);

			this.setMyTimeout(function(){
				ZS.nodeTemp = promptNode.remove();
				ZS.nodeTemp = null; 
			},t);
		},
		prompt1 : function(opt){
			var obj = this,
	        	flag = opt.flag,
	        	msg = opt.msg,
	        	time = opt.time || 2000,
	        	callback = null || opt.callback;
		    if (!$('#modPromptDiv').length) {
	            $('body').append('<div id="modPromptDiv" class="mod_prompt" style="display: none;"></div><div id="modPromptMask" class="mod_prompt_mask" style="display: none;"></div>');
	        }else{
	        	$('#modPromptDiv').remove();
	        	$('body').append('<div id="modPromptDiv" class="mod_prompt" style="display: none;"></div><div id="modPromptMask" class="mod_prompt_mask" style="display: none;"></div>');
	        }
		    var $el = $('#modPromptDiv')
	          , $cover = $('#modPromptMask');
		    switch (flag) {
	        case 1:
	            $el.html('<p class="text">'+msg+'</p>');
	            break;
	        }
		    setTimeout(function() {
	            $el.addClass('show fixed').fadeIn(200,function(){
	            	setTimeout(function(){
	            		$el.remove();
	            		if (callback) {
	            			callback();
	            		}
	            	},time)
	            });
	            $cover.addClass('show fixed').fadeIn(200,function(){
	            	setTimeout(function(){
	            		$cover.remove()
	            	},time)
	            });
	        }, obj.isAndroid() ? 100 : 200);
	        
		},
		tip : function(str){
			var $node = $('.prompt');
			str = str || '已加入购物车';
			if($node[0]){ return; }
			$('<div class="prompt" id="prompt-node"></div>').html('<p>' + str + '</p>').appendTo('body').show().css('margin-left',-92);
			this.setMyTimeout(function(){
				ZS.nodeTemp = $('.prompt').remove();
				ZS.nodeTemp = null; 
			},600);
		},
		getTotal : function(){
			var total = 0,i;
			if( !!localStorage.good ){
				var localGoodsList = ZS.JSONparse( localStorage.good );
		    	for ( i in localGoodsList) {
		    		total += parseInt( localGoodsList[i].sum, 10 );
		    	}
		    	return total;
			}
			return 0;
		},
		getUrlParam : function ( mid ) {
            var reg = new RegExp("(^|&)" + mid + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if ( r != null )  
            	return decodeURIComponent( r[2] ); 
            return null;
        },

        user_datafn : function(){

			if ( ZS.user_data.getKey() ) {
				var userInfo = ZS.JSONparse( ZS.user_data.getItem() );
				return {
					cuserInfoid : userInfo.cuserInfoid,
					firmId : userInfo.firmId,
					faceImg : userInfo.faceImg,
					petName : userInfo.petName,
					realName : userInfo.realName,
					idCard : userInfo.idCard,
					mobile : userInfo.mobile,
					sex : userInfo.sex
				}
			}
		},

		// 懒加载
		lazyload : function(){

			var height = $(window).height();

			$(window).on('scroll',function(){

				var 
				len = $('.lazyload img[data-src]').length,
				top = $(this).scrollTop();

				len == 0 && $(window).off('scroll');

				$('.lazyload img[data-src]').each(function(){
					var
					$this = $(this), 
					offsetTop = $this.parents('dl').offset().top;
					$this.addClass('fadeIn');
					if( height + top > offsetTop  ){
						var dataSrc = $this.attr('data-src');
						$this.attr('src',dataSrc);
						$this.removeAttr('data-src');
					}					
				});
			});
		},

		// 加密
		pwdEncrypt : function(  val ){
			if( !val && val != 0 ) return;
			var md = this.encrypt.md5(val);
			var sha = $.sha1(val);
			var pwdstr= sha + md;
			pwdstr = pwdstr.substring(0, 9) + "s" + pwdstr.substring(10, 19) + "h" + pwdstr.substring(20, 29) + "l" + pwdstr.substring(30, 39) + "s" + pwdstr.substring(40, 49) + "u" + pwdstr.substring(50, 59) + "n" + pwdstr.substring(60, 69) + "y" + pwdstr.substring(70, 72);
			pwdstr = pwdstr.substring(36, 72) + pwdstr.substring(0, 36);
			pwdstr = pwdstr.substring(0, 70);
			pwdstr = pwdstr.substring(0, 14) + "j" + pwdstr.substring(14, 28) + "x" + pwdstr.substring(28, 42) + "q" + pwdstr.substring(32, 46) + "y" + pwdstr.substring(56, 70) + "3";
			pwdstr = pwdstr.substring(40, 75) + pwdstr.substring(0, 40);
			return pwdstr;
		},

		getGoodsIds : function(){
			var arr = [];
			if( !!localStorage.good ){
				var localGoodsList = ZS.JSONparse( localStorage.good );
				if( localGoodsList.length != 0 ){
					localGoodsList.forEach(function(v,k){
						arr.push( v.id );
					});
					return arr.join(',');
				}
			}
		},
		footerNav : function( fn ){
			$("#foot .footer_item").on('click',function(){
				var 
				i = $(this).index(),
				cur = $("#foot").find('.actived').index();
				if( i == cur ) return;
				if( i == 2 ){
					var ids = ZS.getGoodsIds();
					if( !ids || ZS.temp.getKey() ){
						fn(2); return;
					}
					!!ids && !ZS.temp.getKey() && ZS.ajaxPost({
						method : 'get_now_goods',
						goodIds : ids
					},function(d){
						if( d.statusCode == "100000" ){
							ZS.temp.setItem('temp');
							var localGoodsList = ZS.JSONparse( localStorage.good );

							if( $.isArray( d.data ) && d.data.length != 0 ){
								$.each( localGoodsList, function(k1,v1){
									$.each( d.data, function(k2,v2){
										if(v1.id == v2.id){
											v1.price = v2.nowPrice;
											v1.oldPrice = v2.nomalPrice;
										}
									});
								});
								ZS.good.setItem( ZS.JSONStr(localGoodsList) );
							};
						}
					}, function(){
					},function(){
						fn(2);
					});
				}else{
					fn(i);
				}
				
		    });
		},
		toFixed : function( num, several){
			several = several || 2;
			if( typeof +num != 'number') 
				return 0;
			return Number( num ).toFixed( several );
		},

		onceRun : function( fn, context ){
			return function(){
				if( typeof fn === 'function' ){
					fn.apply( context || this, arguments );
					fn = null;
				}
			}
		},
		historyReplace : function( pathName, data, title ){ 
			data = data || '';
			title = title || '';
			return window.history.replaceState( data, title, pathName );
		},
		fadeIn : function( el, t, fn ){
			el = el || 'body';
			t = t || 300;
			fn = typeof fn === 'function' ? fn : undefined;
			$( el ).fadeIn( t, fn );
		},
		clearData : function(){
			this.tokenId.removeItem();
			this.user_data.removeItem();
			this.secretKey.removeItem();
			this.session.clear();
		},
		getFirmDefault : function( firmId ){
			ZS.ajaxPost({
				method : 'firm_default',
				firmId : firmId
			},function( d ){
				ZS.storeInfo.setItem( ZS.JSONStr( d ) );
			});
		},
		getStoreInfo : function(){
			return ZS.JSONparse( ZS.storeInfo.getItem() );
		},
		refresh : function(){
			var isPageHide = false;
		    window.addEventListener('pageshow', function ( e ) {
		      	isPageHide && window.location.reload();
		    });
		    window.addEventListener('pagehide', function ( e ) {
		      	isPageHide = true;
		    });
		},
		getWind : function(){
			return {
				width : $(window).width(),
				height : $(window).height()
			};
		},
		createPopup	: function(opt) {
	        var obj = this,
	        	flag = opt.flag,
	        	stopMove = opt.stopMove,
	        	msg = opt.msg,
	        	noCoverEvent = opt.noCoverEvent,
	        	stopMoveFun = function(e) {
		            e.preventDefault();
		        },
		        btnClose = false,
		        btnConfirm = false,
		        btnCancel = false,
		        btnEvent = function() {
	            	obj.setDelayTime();
	            	$('#modAlertDiv,#modAlertMask').hide().removeClass(' mod_alert_info show fixed');
	        	};
	        if (!$('#modAlertDiv').length) {
	            $('body').append('<div id="modAlertDiv" class="mod_alert" style="display: none;"></div><div id="modAlertMask" class="mod_alert_mask" style="display: none;"></div>');
	        }
	        var $el = $('#modAlertDiv')
	          , $cover = $('#modAlertMask');
	        switch (flag) {
	        case 1:
	            $el.html('<i class="icon"></i><p>您还没关注京东服务号，<br>关注后才可以收到微信提醒噢~</p><div class="follow"><img src="' + JD.img.getImgUrl('//img11.360buyimg.com/jdphoto/s280x280_jfs/t3469/354/312631197/5626/21e9275b/5806d31eN2884548b.png', 180, 180) + '" alt="京东二维码"><p class="text">长按二维码关注</p></div>');
	            break;
	        case 2:
	            $el.addClass('mod_alert_info');
	            $el.html('<span class="close"></span><h3 class="title">' + opt.title + '</h3><div class="inner">' + opt.msg + '</div>');
	            btnClose = 'span.close';
	            break;
	        case 3:
	            if (opt.isNeedInfo)
	                $el.addClass('mod_alert_info');
	            $el.html('<p>' + msg + '</p><p class="btns"><a href="javascript:void(0);" class="btn btn_1">' + (opt.btnTxt || '知道了') + '</a></p>');
	            btnConfirm = 'p.btns';
	            break;
	        case 4:
	            $el.html((opt.icon != 'none' ? ('<i class="icon' + (opt.icon != 'info' ? (' icon_' + opt.icon) : '') + '"></i>') : '') + '<p>' + msg + '</p><p class="btns"><a href="javascript:;" class="btn btn_2">' + opt.cancelText + '</a><a href="javascript:;" class="btn btn_1">' + opt.okText + '</a></p>');
	            btnConfirm = 'a.btn_1';
	            btnCancel = 'a.btn_2';
	            break;
	        case 5:
	            msg = '<i class="icon"></i><p>' + msg + '</p><div class="verify_input"><input class="input" type="text" id="verifyInput"><span class="wrap"><img src="' + (obj.priceVerify.img || '//fpoimg.com/75x30') + '" alt="点击刷新" id="verifyCodeImg"></span></div><p class="warn_text" id="warnTip">验证码错误，请重新输入</p>';
	            $el.html(msg + '<p class="btns"><a href="javascript:void(0);" class="btn btn_1">提交</a></p>');
	            break;
	        case 6:
	            $el.html('<span class="close"></span><i class="icon"></i><p>' + msg + '</p><p class="small">' + opt.small + '</p><p class="btns">' + '<a href="javascript:void(0);" class="btn" style="background: #e4393c;color: #fff">' + opt.btnTxt + '</a></p>');
	            btnClose = 'span.close';
	            btnConfirm = 'p.btns';
	            break;
	        case 7:
	            $el.addClass('mod_alert_info');
	            $el.html('<span class="close"></span><h3 class="title">手机号码登录</h3><div class="verify_inputs"><div class="verify_input"><input class="input" type="tel" mark="phonenum" placeholder="请输入手机号" maxlength="11"></div><div class="verify_input"><input class="input" mark="imgcode" type="text" placeholder="请输入图形码"><span class="wrap" mark="genimgcode"><img mark="img"/></span></div><div class="verify_input"><input class="input" mark="msgcode" type="text" placeholder="请输入验证码"><div class="verify_input_btn" mark="sendcode">发送验证码</div><div class="verify_input_btn type_disabled" style="display:none;"><span mark="sendcodesed"></span>后重发</div></div></div><p class="warn_text" style="display:none;" mark="errtips"></p><p class="btns"><a href="javascript:" class="btn btn_1">登录</a></p>');
	            btnClose = 'span.close';
	            btnConfirm = 'p.btns';
	            break;
	        case 8:
	            $el.addClass('mod_alert_info');
	            $el.html('<span class="close"></span><h3 class="title">历史收货人校验</h3><p class="alignLeft">您已有京东账号，为了保障账号安全，需要对您历史已完成订单的收货人信息进行校验（任意一个即可）</p><div class="verify_input type_no_padding"><input class="input" mark="shname" type="text" placeholder="历史完成订单的收货人姓名"></div><p class="warn_text" style="display:none;" mark="errtips"></p><p class="btns"><a href="javascript:" class="btn btn_1">完成校验去结算</a></p>');
	            btnClose = 'span.close';
	            btnConfirm = 'p.btns';
	            break;
	        case 9:
	            $el.html((opt.icon != 'none' ? ('<i class="icon' + (opt.icon != 'info' ? (' icon_' + opt.icon) : '') + '"></i>') : '') + '<p>' + msg + '</p><p class="btns"><a href="javascript:;" class="btn btn_1">' + opt.okText + '</a><a href="javascript:;" class="btn btn_2">' + opt.cancelText + '</a></p>');
	            btnConfirm = 'a.btn_1';
	            btnCancel = 'a.btn_2';
	            break;
	        }
	        
	        setTimeout(function() {
	            $el.show().addClass('show fixed');
	            $cover.show().addClass('show fixed');
	            
	        }, obj.isAndroid() ? 100 : 200);
	        
	        $el.off();
	        if (btnClose) {
	            $el.on('click', btnClose, function(e) {
	                btnEvent();
	                opt.onClose && opt.onClose();
	            });
	        }
	        if (btnConfirm) {
	            $el.on('click', btnConfirm, function() {
	                var keep = false;
	                if (opt.onConfirm) {
	                    keep = !!opt.onConfirm();
	                }
	                if (keep)
	                    return;
	                btnEvent();
	            });
	        }
	        if (btnCancel) {
	            $el.on('click', btnCancel, function() {
	                btnEvent();
	                opt.onCancel && opt.onCancel();
	            });
	        }
	        if (!noCoverEvent) {
	            $cover.off().on('click', function() {
	                btnEvent();
	                opt.onClose && opt.onClose();
	            });
	        }
	        console.log(new Date())
	       
	    },
	    createGamePopup : function(opt) {
	        var obj = this,
	        	flag = opt.flag,
	        	imgUrl = opt.imgUrl,
	        	msg = opt.msg,
	        	noCoverEvent = opt.noCoverEvent,
	        	stopMoveFun = function(e) {
		            e.preventDefault();
		        },
		        btnClose = false,
		        btnConfirm = false,
		        btnCancel = false,
		        btnEvent = function() {
	            	obj.setDelayTime();
	            	$('#modGameDiv,#modGameMask').hide().removeClass(' mod_alert_info show fixed');
	        	};
	        if (!$('#modGameDiv').length) {
	            $('body').append('<div id="modGameDiv" class="mod_game" style="display: none;"></div><div id="modGameMask" class="mod_game_mask" style="display: none;"></div>');
	        }
	        var $el = $('#modGameDiv')
	          , $cover = $('#modGameMask');
	        switch (flag) {
	        case 1:
	            $el.html('<span class="close"></span><div class="icon_box"><img src="'+imgUrl+'"/></div><div class="msg">'+msg+'</div><div class="btn" data-url="index.html">去使用</div>');
	            btnClose = 'span.close';
	            btnConfirm = 'div.btn'
	            break;
	        case 2:
	            $el.html('<span class="close"></span><div class="icon_box"><img src="'+imgUrl+'"/></div><div class="msg">'+msg+'</div>');
	            btnClose = 'span.close';
	            break;  
	        }
	         setTimeout(function() {
	            $el.show().addClass('show fixed');
	            $cover.show().addClass('show fixed');
	            
	        }, obj.isAndroid() ? 100 : 200);
	        
	        $el.off();
	        if (btnClose) {
	            $el.on('click', btnClose, function(e) {
	                btnEvent();
	                opt.onClose && opt.onClose();
	            });
	        }
	        if (btnConfirm) {
	            $el.on('click', btnConfirm, function() {
	                var keep = false;
	                if (opt.onConfirm) {
	                    keep = !!opt.onConfirm();
	                }
	                if (keep)
	                    return;
	                btnEvent();
	            });
	        }
	        if (!noCoverEvent) {
	            $cover.off().on('click', function() {
	                btnEvent();
	                opt.onClose && opt.onClose();
	            });
	        }
	        
	    },
		setDelayTime : function() {
	        window.holdAction = true;
	        setTimeout(function() {
	            window.holdAction = false;
	        }, 400);
	    },
	});

	
	ZS.weixin = {
		isReadyDone : false,
		count : 0,
		config : function( url ){
			var wx = ZS.wx;
			var self = this;

			ZS.ajaxPost({
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

					    jsApiList:["onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ","onMenuShareQZone"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
					});
					wx.ready(function(){ self.isReadyDone = true; });
					wx.error(function(res){

						// alert(common.JSONStr(res))// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
					});
				}		
			}, function( d ){
				alert("分享插件升级中。。。");
			});
		},

		share : function( data, done, cancle ){

		    var done = typeof done !== 'function' ? function(){} : done; // 判断done是否为函数 不是则默认匿名函数
		    var cancle = typeof cancle !== 'function' ? function(){} : cancle;
		    var self = this;
		    var wx = ZS.wx; // 接收vx
		    if( !self.isReadyDone ){
		      	self.count++ < 6 && ZS.setMyTimeout(function(){ self.share( data, done, cancle)},1000 );
		        return;
		    }
		    self.count = 0;
		    var dataConfig = {
	    	    title: data.title,
	    	    link: document.location.origin,
	    	    imgUrl: data.imgUrl,
	    	    success: done,
	    	    cancel: cancle
		    };
		    wx.onMenuShareTimeline( dataConfig );
		    wx.onMenuShareAppMessage( dataConfig );
		    wx.onMenuShareQQ( dataConfig );
		    wx.onMenuShareWeibo( dataConfig ); 
		}
	};
	ZS.MAP = {
		// 存储左边信息
		coords : { 
			user : [], 
			store : [] 
		},
		init : function(){
			var w = $(window).width();
			var h = $(window).height();
			var MAP = this;
			$('#map-container').width( w ).height( h - 96 );
			// 地图实例化
			MAP.ins = new AMap.Map('map-container',{
				resizeEnable: true,
			    zoom : 15,
			    center: [120.1823616,30.24423873] 
			});
		},
		// 获取地址信息
		getGeocoder : function( done, fail ){
			var MAP = this;
			var done = typeof done == 'function' ? done : function(){ alert('必须为函数') };
			var fail = typeof fail == 'function' ? fail : function(){ alert('必须为函数') };
	        AMap.service('AMap.Geocoder',function(){//回调函数
			    geocoder = new AMap.Geocoder({ //实例化Geocoder
			        city: "010"//城市，默认：'全国'
			    });
			});
			geocoder.getAddress( MAP.coords.user, function( status, result ) {
			    ( status === 'complete' && result.info === 'OK' ) ? done( result ) : fail(); 
			});
		},
		getPositionCoords : function( done, fail ){
			var done = typeof done == 'function' ? done : function(){ alert('必须为函数') };
			var fail = typeof fail == 'function' ? fail : function(){ alert('必须为函数') };
			var MAP = this;
			MAP.ins.plugin('AMap.Geolocation',function(){
		        geolocation = new AMap.Geolocation({
		            enableHighAccuracy: true,
		            timeout: 10000,          
		    	});
		    	geolocation.getCurrentPosition();
		    	AMap.event.addListener(geolocation, 'complete', done);
		        AMap.event.addListener(geolocation, 'error', fail);
		    });
		},

		setMakerCoords : function( content ){
			// 清空地图，待重新绘制
			var MAP = this;
			MAP.ins.clearMap();
			if( MAP.coords.user.length == 2 ){
				var icon = new AMap.Icon({
					image: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
					size: new AMap.Size(19, 31)
				});
				var maker1 = new AMap.Marker({
		        	map : MAP.ins,
		            icon: icon,
		            position: MAP.coords.user,
		        });
		        var maker2 = new AMap.Marker({
		        	map : MAP.ins,
		            position: MAP.coords.user,
		            content : '当前位置',
		            offset: new AMap.Pixel(12,-54)
		        });
	       	}
	       	var icon = new AMap.Icon({
				image: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
				size: new AMap.Size(19, 31)
			});
	       	// 图标
			var maker3 = new AMap.Marker({
	        	map : MAP.ins,
	            position: MAP.coords.store,
	            icon: icon
	        }); 
	        // 内容
	        var maker4 = new AMap.Marker({
	        	map : MAP.ins,
	            position: MAP.coords.store,
	            content : content,
	            offset: new AMap.Pixel(12,-54),
	        });
		},

		setManyMakerCoords : function( data ){
			var MAP = this;
			MAP.markerArr = [];
			MAP.ins.clearMap();
			data && data.forEach(function(v){
				var needleList = ZS.JSONStr( v );
				var mark_dot = "http://webapi.amap.com/theme/v1.3/markers/n/mark_" + ( v.type == 5 ? 'r': 'b' ) +".png";
		       	var icon = new AMap.Icon({
					image: mark_dot,
					size: new AMap.Size(19, 31)
				});
				var position = [ +v.longitude, +v.latitude ];
				var marker = new AMap.Marker({
		        	map : MAP.ins,
		        	icon: icon,
		            position: position,
		        });
		        var marker1 = new AMap.Marker({
		        	map : MAP.ins,
		        	position: position,
		        	content : v.firmName + '<span style="display:none">' + needleList + '</span>',
		        	offset: new AMap.Pixel(12,-54),
		        });
		        MAP.markerArr.push( marker1 );
			});
		}
	};


	ZS.Dialog = function( options ){
		var defaultOptions = {
			container : 'dialog-box',
			btns : [ 
				{ klass : 'dialog-cancel-btn', txt:'取消'},
				{ klass : 'dialog-confirm-btn', txt : '确认'}
			]
		};
		this.options = $.extend(defaultOptions, options || {});
	};
	ZS.Dialog.prototype = {
		$body : $('body'),
		constructor : ZS.Dialog,
		show : function( title ){
			var 
			_self = this,
			args = Array.prototype.slice.apply(arguments),
			options = _self.options;
			console.log(options);
			args.shift();
			
			_self.$body.addClass('locked');
			_self.$dialog.show().find('.dialog-title').html( title );
			$.each(options.btns,function( k, v ){
				$('.' + v.klass ).data( 'fn',args[k] || function(){} );
			});
			$(document).on('touchstart',function(){
				$(document).on('touchmove',function( e ){
					e.preventDefault();
				});
			});
		},
		init : function(opt){
			
			var _self = this,
			options = $.extend(_self.options, opt || {}) ,
			btnsHTML = '',
			node = $('.' + options.container ).remove();
			node = null;
			console.log(options)
			$.each( options.btns, function( k, v ){
				btnsHTML += '<span class="' + v.klass + ' dialog-btn" >' + v.txt + '</span>';
			});
			$('<section class="' + options.container + '">' +
				'<div class="dialog-content">' +
					'<div class="dialog-title"></div>' + 
					'<div class="dialog-btns">' + btnsHTML + '</div>' +
				'</div>' +
				'</section>').appendTo('body');
			_self.$dialog = $('.' + options.container );
			_self._event();
			return _self;
		},
		_event : function(){
			var _self = this;
			var options = _self.options;
			_self.$dialog.on('click', '.dialog-btn', function(e){
				e.stopPropagation();
				_self.$body.removeClass('locked');
				$('.' + options.container ).hide();
				$(this).data('fn')();
				$(document).off('touchstart touchmove');
			});
			if (options.maskIsclick) {
				_self.$dialog.on("click",function(e){
					e.stopPropagation();
					if (e.srcElement.className == options.container) {
						_self.$body.removeClass('locked');
						$('.' + options.container ).hide();
					}
				})
			}
			
		}
	};
	ZS.dialog = new ZS.Dialog();
	$(document).on('click','#prompt-node',function(){
		var nodeTemp = $(this).remove();
		nodeTemp = null;
	});
	module.exports = ZS;
});

