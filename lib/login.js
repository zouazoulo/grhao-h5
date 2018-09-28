/*
* login scirpt for Zhangshuo Guoranhao
*/ 

define('login',['common'],function(require, exports, module){

	var common = require('common');

	// 命名空间

	var pub = {};
	
	pub.openId = common.openId.getItem();

	pub.domain = common.WXDOMAIN;
	pub.appid = common.WXAPPID;

	pub.weixinCode = common.getUrlParam('code'); // 获取url参数

	pub.openId = common.openId.getKey();

	!common.storeInfo.getKey() && common.jumpLinkPlain('../index.html');

	pub.firmId = common.storeInfo.getKey() ? common.getStoreInfo().id : undefined;

	

	// 属性
	$.extend(pub,{
		
		phoneNum : null, // 手机号
		
		password : null, // 密码
				
		verify_code : null, // 用户输入验证码值

		login_type : null, // 存储登录方式

		send_sms_type : null, // 存储登录或注册 验证码类型

	});

	// 获取验证码类型
	pub.send_sms_type = $('[data-sms-type]').attr('data-sms-type');

	pub.key = null;// 图片验证码编号

	// 倒计时
	pub.time = 59;
	pub.countDown = function(){
		var id = setInterval(function(){
			if ( pub.time == 0 ) {
				pub.time = 59; // 重置倒计时值
				$(".zs_time").hide();
				$(".zs_get_verify_code").show().html('重新获取');
				clearInterval(id);
				id = null;
			}else{
				$(".zs_time").css({"color":"#f76a10","background":"none"}).html("( "+pub.time+"s 后重试 )");
			}
			pub.time--;
		},1000);
	};

	// 发送验证码
	pub.send_sms = {
		init : function(){

			common.ajaxPost({
				method : 'send_sms',
				mobile: pub.phoneNum,
				type : pub.send_sms_type,
				key : pub.key,
				authcode : pub.imgCode
			},function(d){
				if( d.statusCode == "100000" ){
					common.prompt( '验证码已发送，请查收' );
					$('input[disabled]').removeAttr('disabled');
				}else{
					common.prompt( d.statusStr );
				} 
			},function(d){

			});
		}
	};

	// 动态登录 + 账户登录
	pub.login = {};

	pub.login.dfd1 = $.Deferred(); 
	pub.login.dfd2 = $.Deferred();

	pub.userBasicParam = null; // 参数
	pub.login.jumpMake = common.jumpMake.getItem(); // 跳转指向
	pub.login.bool = common.goodid.getKey(); // 是否存在商品ID

	pub.get_weixin_code  = function(){
        common.ajaxPost({
            method: 'get_weixin_code',
            weixinCode : pub.weixinCode
        },function( d ){
            if( d.statusCode == '100000' && d.data.fromWX == 1 ){
                pub.openId =  d.data.openId;
                common.openId.setItem( pub.openId ); // 存opendId
            }else{
                common.prompt( d.statusStr );
            }
        });
    };
    // 切换门店
    pub.choice_firm = function( firmId ){
    	common.ajaxPost($.extend({},pub.userBasicParam,{
    		method : 'choice_firm',
    		firmId : firmId
    	}),function( d ){
    		switch( +d.statusCode ){
    			case 100000 : (function(){
	    			var user_data = common.user_datafn();
	    			user_data.firmId = firmId; // 切换后从新更新 firmId
	    			common.user_data.setItem( common.JSONStr( user_data ) );
	    			common.storeInfo.setItem( common.JSONStr( d.data ) ); 
		    		pub.login.dfd1.resolve(); 
    			}()); break;
    			case 100901 : (function(){
	    			common.timestamp.removeItem();
	    			pub.login.dfd1.resolve(); 
    			}()); break;
    		}
    	},function(d){
    		pub.login.dfd1.resolve(); 
    	})
    };

	pub.login.apiHandle = {
		init : function( node ){
			common.ajaxPost( pub.login_type, function( d ){
				d.statusCode == '100000' ? pub.login.apiHandle.apiData( d ) : common.prompt(d.statusStr);
			},function(){
			},function(){
				node.removeClass('clicked');
			});
		},
		apiData : function( d ){
			var 
			infor = d.data.cuserInfo;
			var user_data = {
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
			pub.userBasicParam = {
				userId : infor.id,
				source : "userId" + infor.id,
				sign : common.encrypt.md5( "userId" + infor.id + "key" + d.data.secretKey ).toUpperCase(),
				tokenId : d.data.tokenId
			};
			// 给app端传用户信息 分享使用
			common.user_data.setItem( common.JSONStr(user_data) );
			common.tokenId.setItem( d.data.tokenId );
			common.secretKey.setItem( d.data.secretKey );
			function pageSwitch (){
				common.setMyTimeout(function(){
					var 
					jumpMake = common.jumpMake.getItem(),
					bool = common.goodid.getKey(),
					goodsId = bool ? "?goodsId=" + common.goodid.getItem() : '',
					pathNames = [
						"moregoods.html",
						"seckill.html",
						"seckillDetail.html" + goodsId,
						"preDetails.html" + goodsId,
						"my.html",
						"store.html",
						"month_service.html",
						"cuopon.html",
						"goodsDetails.html" + goodsId,
						"moregoods.html?type=TAO_CAN",
						"moregoods.html?type=JU_HUI",
						"seckillDetaila.html" + goodsId,
						"cart.html",
						'red_package_rain.html'
					];
					if( 0 < jumpMake && jumpMake < 15 ){
						bool && common.goodid.removeItem();
						common.jumpMake.removeItem();
						var str;
						// 历史记录管理
						switch( +jumpMake ){
							case 3 :
							case 12 : str = 'seckill.html'; break;// 秒杀详情 -> 秒杀换购 列表
							case 4 : str = 'pre.html'; break;
							case 9 : str = 'moregoods.html'; break;
						};
						common.historyReplace( str );
						common.jumpLinkPlain( pathNames[ jumpMake-1 ] );
					}else{
						common.jumpLinkPlain("../index.html");
					}
				},500);
			}
			function tempfn( id ){
				pub.choice_firm( id );
				pub.login.dfd1.done(function(){
					pageSwitch();
				});
			}
			if( common.userId.getKey() ){
				if( infor.id != common.userId.getItem() ){
					if( pub.firmId != infor.firmId ){
						common.dialog.init().show('账户更换，是否切换为当前门店？',function(){
							tempfn( infor.firmId );
							common.timestamp.removeItem();
							common.good.removeItem();
						},function(){
							tempfn( pub.firmId )
						});
					}else{
						tempfn( infor.firmId );
					}
					common.userId.setItem( infor.id ); // 用户ID
				}else{
					tempfn( pub.firmId );
				}
			}else{
				common.userId.setItem( infor.id ); // 用户ID
				tempfn( pub.firmId );
			}

			
		}
	};
	// 图片验证码
	pub.verification = {
		init : function(){
			common.ajaxPost({
				method : 'verification'
			},function( d ){
				if( d.statusCode == '100000' ){
					$('.imgCode_box .img_code').attr( 'src','data:image/jpeg;base64,' + d.data.code );
					pub.key =  d.data.key;
				}else{
					common.prompt( d.statusStr );
				}
			});
		}
	};
	// 登录事件初始化函数
	pub.login.eventHandle = { 

		init : function(){
			// 登录方式切换
			$(".login_main_top li").on("click",function(){
				var 
				$this = $(this),
				i = $this.index(),
				isCur = $this.is('.actived');
				if( !isCur ){
					$this.addClass('actived').siblings().removeClass('actived');
					$('.login_main_content').find('ul').eq(i).addClass('show').show().siblings().removeClass('show').hide();
					i == 1 && pub.onceRun();
				}
			});

			// 登录
			$('.login_btn').click(function(){

				var 
				box = $('.login_main_content .show'),
				index = box.index(),
				$this = $(this);
				if($this.hasClass('clicked')){
					return;
				}

				pub.phoneNum = box.find('.zs_phoneNumber').val();// 获取活动 tab 的手机号
				
				if(!common.PHONE_NUMBER_REG.test( pub.phoneNum )){
					common.prompt('手机号输入错误');return;
				}

				if( index == 0 ){
					pub.password = $('#login_password').val();
					if( pub.password == '' ){
						common.prompt('请输入密码'); return;
					}
				}
				pub.verify_code = $('#verify_code').val();
				pub.login_type = [{
						method:'login',
						mobile:pub.phoneNum,
						password : common.pwdEncrypt( pub.password )
					},{
						method : 'dynamic_login',
						mobile : pub.phoneNum,
						smsCode : pub.verify_code
					}][index];
				$this.addClass('clicked');
				pub.login.apiHandle.init($this);
			});

			// 微信授权处理
			if( !pub.openId && common.isWeiXin() ){
				pub.weixinCode ? pub.get_weixin_code() : common.jumpLinkPlain('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+pub.appid+'&redirect_uri=' + pub.domain + '/html/login.html&response_type=code&scope=snsapi_userinfo&state=grhao&connect_redirect=1#wechat_redirect');
			}
			// 点击跳转
			common.jumpLinkSpecial('.header_left','../index.html');

			pub.onceRun = common.onceRun( pub.verification.init, pub );
		}
	};

	/**
		以下注册模块
	*/

	// 注册 命名空间

	pub.register = {};

	pub.repeatPassword = null; // 重复密码

	// 注册事件处理
	pub.register.eventHandle = {
		init : function(){
			$('.regsiter_btn').on('click',function(){
				var $this = $(this);
				if( $this.hasClass('clicked') ){
					return;
				}
				pub.phoneNum = $('#reg_phoneNumber').val();
				pub.verify_code = $('#verify_code').val();
				pub.password = $('#reg_password').val();
				pub.repeatPassword = $('#reg_password_again').val();
				
				if( !common.PHONE_NUMBER_REG.test( pub.phoneNum ) ){
					common.prompt('手机号输入错误'); return;
				}
				if( pub.verify_code == '' ){
					common.prompt('请输入图形验证码'); return;
				}
				if( pub.password == '' ){
				    common.prompt('请输入密码'); return;
				}
				if( !common.PWD_REG.test( pub.password ) ){
				    common.prompt('密码格式不正确'); return;
				}
				if( pub.repeatPassword == '' ){
				    common.prompt('请再次输入密码'); return;
				}
				if(pub.password != pub.repeatPassword ){
					common.prompt('两次密码输入不一致'); return;
				}
				$this.addClass('clicked');
				pub.register.regist.init( $this );
			});
			common.jumpLinkSpecial('.header_left','login.html');
			pub.verification.init(); // 获取图片验证码
		}
	};

	

	// 注册接口
	pub.register.regist = {

		init : function( node ){
			var data = {
				method:'regist',
			    mobile:pub.phoneNum,					
			    smsCode:pub.verify_code,
			    pwd:common.pwdEncrypt( pub.password ),
			    confirmPwd:common.pwdEncrypt( pub.repeatPassword )
			};
			common.ajaxPost( data, function( d ){
				switch( +d.statusCode ){
					case 100000 : pub.register.regist.apiData( d ); break;
					case 100510 : common.dialog.init({
			    		btns : [{ klass : 'dialog-confirm-btn', txt : '确定'}]
			    	}).show('该手机号已注册',function(){}); break;
			    	default : common.prompt( d.statusStr );
				};
			},function(){
			},function(){
				node.removeClass('clicked');
			});	
		},
		apiData : function(d){
			var infor = d.data.cuserInfo;
			var user_data = {
			    cuserInfoid : infor.id,
			    firmId : infor.firmId,
			    faceImg : infor.faceImg,
			    petName : infor.petName,
			    realName : infor.realName,
			    idCard : infor.idCard,
			    mobile : infor.mobile,
			    sex : infor.sex,
			    isRegOpenfire:infor.isRegOpenfire
			};
			pub.userBasicParam = {
				userId : infor.id,
				source : "userId" + infor.id,
				sign : common.encrypt.md5( "userId" + infor.id + "key" + d.data.secretKey ).toUpperCase(),
				tokenId : d.data.tokenId
			};
			common.user_data.setItem( common.JSONStr(user_data) );
			common.tokenId.setItem( d.data.tokenId );
			common.secretKey.setItem( d.data.secretKey );
			common.userId.setItem( infor.id );
			pub.choice_firm( pub.firmId );
			$('.regsiter_pack').css({'display':'none'});
			$('.success').css({'display':'block'});
			var t = 3,time = setInterval(function(){					
				if( t == 0 ){
					clearInterval(time);
					time = null;
					common.jumpLinkPlain('../index.html');
				}else{
					$('.regsiter_time').html( t );					
				}
				t--;
			},1000);
		}
	};

	pub.eventHandle = {

		init : function(){
			// 获取验证码
			$('.zs_get_verify_code').on('click',function(){

				pub.phoneNum = $(".show .zs_phoneNumber").val();
				pub.imgCode = $('#img_code').val();

				if( pub.phoneNum == '' ){
					common.prompt('请输入手机号'); return;
				}
				if( !common.PHONE_NUMBER_REG.test( pub.phoneNum ) ){
					common.prompt('请输入正确的手机号'); return;
				}
				if( pub.imgCode == '' ){
					common.prompt('请输入图片验证码'); return;
				}
				$(".zs_get_verify_code").hide();
				$(".zs_time").show().css({"color":"#f76a10","background":"none"}).html('(60s后重试)');
				pub.countDown();// 倒计时开始
				pub.send_sms.init(); // 请求验证码
			});
			
			$('.imgCode_box .img_code').click(function(){
				pub.verification.init(); // 获取图片验证码
			});
		}
	};
	// 换肤
	pub.apiHandle = {
		change_app_theme : {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					$(".login_main_content,.regsiter_pack,.login_btn").addClass("skin"+sessionStorage.getItem("huanfu"))
				}
			}
		}
	};
	pub.init = function(){
		if (!common.huanfu.getKey()) {
			common.change_app_theme();
			common.defHuanfu.done(function(){
				pub.apiHandle.change_app_theme.init();
			})
		}else{
			pub.apiHandle.change_app_theme.init();
		}
		pub.eventHandle.init(); // 公共模块
		switch( +pub.send_sms_type ){
			case 1 : pub.register.eventHandle.init(); break; // 注册初始化
			case 5 : pub.login.eventHandle.init(); // 登录初始化
		};
		
	};

	module.exports = pub;

});