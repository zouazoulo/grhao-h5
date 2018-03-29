/*
* personal scirpt for Zhangshuo Guoranhao
*/ 

define('personal',['common'],function(require, exports, module){

	var common = require('common');

	// 命名空间

	var pub = {};
	pub.muduleId = $('[module-id]').attr('module-id');
	pub.userBasicParam = null; // 用来保存必要接口参数
	pub.timer_id = null; // 定时器ID

	// 是否登录 
	pub.logined = common.isLogin();

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
	}else{
		pub.muduleId != "0" && common.jumpLinkPlain( 'my.html' );
	}

	// 父模块接口数据 
	pub.apiHandle = {}
	pub.apiHandle = {
		init : function(){
			// 登录状态 信息处理
			if( pub.logined ){
				$(".loginPhoto").attr( "src",common.user_datafn().faceImg !="" ? common.user_datafn().faceImg + '?rom='+ Math.floor(Math.random()*1000000 ) : "../img/icon_touxiang.png" );
				$('.my_islogin,.main_top_right,.exit').css({'display':'block'});
				$('.my_name').html( common.user_datafn().petName );
				pub.apiHandle.userScoCouMon.init(); // 包月卡余额 + 果币 + 优惠券数量
			}else{
				$('.main_top_right,.exit').css({'display':'none'});	 
		        $('.my_nologin').css({'display':'block'});
			}
		},
		// 包月卡余额 + 果币 + 优惠券数量
		userScoCouMon : {
			init :function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'userScoCouMon'
				}),function( d ){
					pub.apiHandle.userScoCouMon.apiData( d );
				});
			},
			apiData : function( d ){
				if ( d.statusCode == "100000" ) {
					var data = d.data;
					$("#month_card").html("￥"+data.userMonthCard.systemMoney);
					$("#fruit_money").html(data.userAccountInfo.score+"枚");
					$('.wo_main_coupon').html(data.couponCount);
				}else if(  d.statusCode == "100400" ){
                        common.prompt( '登录已失效，请重新登陆' );
                        common.setMyTimeout(function(){
                            common.jumpLinkPlain( 'login.html' );
                        },1000);
                }else{
					$("#month_card").html("￥0");
					$("#fruit_money").html("0枚");
					$('.wo_main_coupon').html(0);
				}
			}
		},
		// 退出登录
		logout : {
			init : function(){
				common.ajaxPost({
					method : 'logout',
					tokenId : pub.tokenId
				},function( d ){
					if ( d.statusCode == '100000' ) {
						var huanfu = common.huanfu.getItem();
						common.session.clear();
						common.huanfu.setItem(huanfu)
						location.replace( location.href );
					}else{
						common.prompt( d.statusStr );
					}
				},function( d ){
					common.prompt( d.statusStr );
				},function(){
					common.tokenId.removeItem();
					common.secretKey.removeItem();
					common.user_data.removeItem();
				});
			}
		}
	};

	// 父模块事件处理 
	pub.eventHandle = {};
	pub.eventHandle.init = function(){

		common.jumpLinkSpecial('.main_top_left','../index.html'); // 点击跳到首页
		common.jumpLinkSpecial('.main_top_right','message_change.html'); // 进入个人信息修改

		$('.main_top_login').click(function(){
			if( common.isWeiXin() && !commom.opendId.getKey() ){
				common.jumpLinkPlain('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf9dd00234aa6e921&redirect_uri=http://weixin.grhao.com/html/login.html&response_type=code&scope=snsapi_userinfo&state=grhao&connect_redirect=1#wechat_redirect');
			}else{
				common.jumpLinkPlain('login.html');
			}
		});

		// 订单管理 + 我的预购 + 优惠券 + 收货地址 + 果币商城 + 在线充值 + 修改密码 + 帮助中心 + 设置
		$('.zs_personal').click(function(){
			var url = $(this).attr('data-url');
			if( pub.logined ){
				common.jumpLinkPlain( url );
			}else{
				common.jumpMake.setItem("5");
				common.jumpLinkPlain('login.html');
			}
		});

		// 点击退出
		$('.exit').on('click',function(){
	    	pub.apiHandle.logout.init();
	    }); 

		// 底部导航
		common.footerNav(function( i ){
			common.jumpLinkPlain(['../index.html','moregoods.html','cart.html','my.html'][i]);
		});

		$("#loginPhoto").on('change',function(){
	    	$("#cuserId").val( pub.userId );
	    	$("#tokenId").val( pub.tokenId );
	    	$("#sign").val( pub.sign );
	    	$("#source").val( pub.source );
			var tar = this,
				files = tar.files,
				fNum = files.length,
				URL = window.URL || window.webkitURL;
			if( !files[0] ) return;
			for( var i = 0; i < fNum; i++ ){
				if( files[i].type.search(/image/) >= 0){
					var blob = URL.createObjectURL(files[i]);
					document.getElementsByClassName('loginPhoto')[0].src = blob;
				}
			};
			$("#form2").submit();
		});
	};

	

/********************* 用户信息修改模块 *****************/

	// 命名空间

	pub.userInfoRepaired = {};

	var USER_INFO_REPAIRED =  pub.userInfoRepaired;

	// USER_INFO_REPAIRED.phone = null;  // 用户手机号
	// USER_INFO_REPAIRED.newPhoneNum = null; // 用户新号码
	// USER_INFO_REPAIRED.petName = null; // 用户昵称
	// USER_INFO_REPAIRED.realName = null; // 用户真实姓名
	// USER_INFO_REPAIRED.idCard = null; // 用户身份证号码
	// USER_INFO_REPAIRED.sex = null;  // 性别
	// USER_INFO_REPAIRED.verify_code = null; // 用户输入的验证码

	USER_INFO_REPAIRED.SEX = {'男':1,'女':2};
	// USER_INFO_REPAIRED.sex_num = null; // 接口数值


	// 用户信息修改 事件处理
	USER_INFO_REPAIRED.eventHandle = {
		init : function(){
			// 点击修改手机号码
			var bool = true;
			$('.message_phoneNumber').click(function(){
				USER_INFO_REPAIRED.switchInput('更换手机号码','.zs_address_box','.zs_phone_box');
				$('#phone_verify_code2').attr('disabled','disabled').val('');
				$('#phone_phoneNumber').val('');
				$('#phone_verify_code1').show().text('获取手机验证码');
				$('#phone_time').hide().text('');
				clearInterval( pub.timer_id );

				bool && (function(){
					window.history.pushState('','','./message_change.html');
					bool = false;
				}());
			});

			// 点击返回的处理
			$('.header_left').click(function(){
				// var isHide = $('.zs_phone_box').is(':hidden');
				// isHide && common.jumpLinkPlain('my.html');
				// !isHide && USER_INFO_REPAIRED.switchInput('修改信息','.zs_phone_box','.zs_address_box');
				$('.zs_phone_box').is(':hidden') ? common.jumpLinkPlain('my.html') : USER_INFO_REPAIRED.switchInput('修改信息','.zs_phone_box','.zs_address_box');
			});

			// 性别选择效果
			$('.message_sex').on('click',function(e){
				// var cur = e.target.nodeName.toLowerCase() == 'li';
				e.target.nodeName.toLowerCase() == 'li' && $('#message_sex').val( $(e.target).text() ); 
				$('.message_sex_choose').slideToggle(300);
			});

			// 点击发送验证码
			$('#phone_verify_code1').on('click',function(){
				USER_INFO_REPAIRED.time = 59;
				$("#phone_verify_code2").removeAttr("disabled");
				$("#phone_verify_code1").css("display",'none');
				$("#phone_time").css({"display":"block","color":"#f76a10","background":"none"}).html('(60s后重试)');
				USER_INFO_REPAIRED.apiHandle.send_sms.init();
				USER_INFO_REPAIRED.countDown(); // 验证码倒计时
			});




			// 提交手机修改信息
			$('.phone_submit').on('click',function(){
				 
				USER_INFO_REPAIRED.verify_code = $('#phone_verify_code2').val();
				USER_INFO_REPAIRED.newPhoneNum = $('#phone_phoneNumber').val();
				
				if( USER_INFO_REPAIRED.newPhoneNum == "" ){
					common.prompt('请输入手机号'); return;
				}

				if( !common.PHONE_NUMBER_REG.test( USER_INFO_REPAIRED.newPhoneNum ) ){
					common.prompt('手机号输入有误'); return;
				}
				USER_INFO_REPAIRED.apiHandle.update_mobile.init(); // 手机号更新
			});

			// 点击保存
			$('.main_reverse').on('click',function(){
			    USER_INFO_REPAIRED.petName = $('#message_nick').val();
			    USER_INFO_REPAIRED.realName = $('#message_name').val();
			    USER_INFO_REPAIRED.idCard = $('#message_IDcard').val();
			     
			    var sex = $('#message_sex').val();
			    USER_INFO_REPAIRED.sex_num = USER_INFO_REPAIRED.SEX[sex];

			    if( USER_INFO_REPAIRED.petName == '' ){
			    	common.prompt('请输入昵称'); return;
			    }
			    if( USER_INFO_REPAIRED.realName == '' ){
			    	common.prompt('请输入真实姓名'); return;
			    }
			    if( USER_INFO_REPAIRED.idCard == '' ){
			    	common.prompt( '请填写身份证号' ); return;
			    }
			    if(!common.ID_CARD_REG.test( USER_INFO_REPAIRED.idCard ) ){ 
			    	common.prompt('身份证号格式不正确'); return;
			    }
			    USER_INFO_REPAIRED.apiHandle.update_userinfo.init();
			});
			window.onpopstate = function(){
				USER_INFO_REPAIRED.switchInput('修改信息','.zs_phone_box','.zs_address_box');
			};


		}
	};

	// 用户信息修改 接口数据处理
	USER_INFO_REPAIRED.apiHandle = {
		init : function(){
			var me = this;
			me.show.init();
		},
	};

	// 用户基本信息展示接口
	USER_INFO_REPAIRED.apiHandle.show = {
		init : function(){
			var me = this;
			common.ajaxPost($.extend({},pub.userBasicParam,{
				method : 'show',
			}),function( d ){
				d.statusCode == "100000" && me.apiData( d );
			})
		},
		apiData : function( d ){
			var data = d.data;
			USER_INFO_REPAIRED.phone = data.mobile;
			$('#message_nick').val(data.petName);
		    $('#message_name').val(data.realName);
		    $('#message_IDcard').val(data.idcard).css({'color':'#b2b2b2'});
		   	data.idcard == '' && $('#message_IDcard').removeAttr("disabled");
		   	$('#message_sex').val(['男','女'][data.sex-1]);
		   	$('#message_phoneNumber').val(data.mobile);
		   	$('.phone_now').text('当前手机号：'+ data.mobile);
		}
	};

	// 验证码接口数据处理
	USER_INFO_REPAIRED.apiHandle.send_sms = {
		init : function(){
			common.ajaxPost($.extend({},pub.userBasicParam,{
				method : 'send_sms2',
				mobile : USER_INFO_REPAIRED.phone,
				type : '4'
			}),function( d ){
				d.statusCode == "100000" ? common.prompt("验证码已发送，请查收") : common.prompt( d.statusStr); 
			})
		}
	};

	// 手机号更新接口接口数据处理
	USER_INFO_REPAIRED.apiHandle.update_mobile = {
		init : function(){
			common.ajaxPost( $.extend({},pub.userBasicParam,{
				method : 'update_mobile',
				smsCode : USER_INFO_REPAIRED.verify_code,
				mobile : USER_INFO_REPAIRED.newPhoneNum
			}),function( d ){
				if ( d.statusCode == "100000" ) {

					var user_data = common.user_datafn();
						user_data.mobile = USER_INFO_REPAIRED.newPhoneNum;
					common.user_data.setItem(common.JSONStr( user_data ));
					common.prompt('手机号更新成功');
					common.setMyTimeout(function(){
						USER_INFO_REPAIRED.switchInput('修改信息','.zs_phone_box','.zs_address_box');
					},500);
					$('#message_phoneNumber').val( USER_INFO_REPAIRED.newPhoneNum );
				}else{
					common.prompt(d.statusStr);	
				}
			});
		}
	};

	//  修改用户信息接口数据处理
	USER_INFO_REPAIRED.apiHandle.update_userinfo = {
		init : function(){
			common.ajaxPost($.extend({},pub.userBasicParam,{
				method : 'update_userinfo',
				petName : USER_INFO_REPAIRED.petName,
				realName : USER_INFO_REPAIRED.realName,
				idCard : USER_INFO_REPAIRED.idCard,
				sex : USER_INFO_REPAIRED.sex_num
			}),function( d ){
				if ( d.statusCode=="100000" ) {
					var user_data = common.user_datafn();
					user_data.petName = USER_INFO_REPAIRED.petName;
					user_data.realName = USER_INFO_REPAIRED.realName;
					user_data.idCard = USER_INFO_REPAIRED.idCard;
					user_data.sex = USER_INFO_REPAIRED.sex_num;
					common.user_data.setItem( common.JSONStr( user_data ) );
					common.prompt('修改成功');
					common.setMyTimeout(function(){
						common.jumpLinkPlain('my.html');
					},600);
				}
			});
		}
	};


	// 个人用户信息 模块初始化 二级模块
	USER_INFO_REPAIRED.init = function(){
		USER_INFO_REPAIRED.apiHandle.init();
		USER_INFO_REPAIRED.eventHandle.init();
	};

	// 验证码倒计时
	USER_INFO_REPAIRED.countDown = function(){
		pub.timer_id = setInterval(function(){
			if ( USER_INFO_REPAIRED.time == 0 ) {
				$("#phone_time").css("display","none");
				$("#phone_verify_code1").css("display","block").html('重新获取')
				clearInterval( id );
				USER_INFO_REPAIRED.time = 59;
			}else{
				$("#phone_time").html("( " + USER_INFO_REPAIRED.time + " s后可重试 )");
			}
			USER_INFO_REPAIRED.time--;
		},1000);
	};

	// 切换 更新手机号 修改用户信息
	USER_INFO_REPAIRED.switchInput = function( title, node1, node2, tit ){
		tit = tit || title;
		$('.header_title').html( tit );
		document.title = title;
		$( node1 ).fadeOut(100,function(){
			$( node2 ).fadeIn(200);
		});
	};



	/************************* 优惠券管理模块 ***************************/

	// 优惠券 命名空间
	pub.coupon = {};
	var COUPON = pub.coupon;
	COUPON.code = "YHQ-DESC";

	pub.PAGE_SIZE = common.PAGE_SIZE; // 每页显示几条
	pub.PAGE_INDEX = common.PAGE_INDEX; // 第几页
	pub.COUPON_TYPES = ['来源:好友推荐赠送','来源:微博晒单成功赠送','来源:微信晒单成功赠送','来源:订单促销活动赠送','来源:随意赠送'];
	pub.CUOPON_RECEIVE_STATUS = ['立即领取','已领取'];

	COUPON.sortCouponId = null;

	// 优惠券 接口命名空间
	COUPON.apiHandle = {
		init : function(){
			COUPON.apiHandle.couponInfo_manager.init(); // 优惠券 管理 列表
		},
		// 优惠券信息列表
		couponInfo_manager : {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'couponInfo_manager',
	    	    	pageNo : pub.PAGE_INDEX,
	    	    	pageSize : pub.PAGE_SIZE
				}),function( d ){
					COUPON.apiHandle.couponInfo_manager.apiData( d );
				})
			},
			apiData : function( d ){
				var 
				html = '',
				data = d.data,
				isLast = data.lastPage;
console.log(data.totalCount == 0)

				$('.lodemore').html( isLast ? '没有更多数据了' : '点击加载更多数据' ).show()
			    //  isLast && $('.lodemore').html('没有更多数据了').show();
			    // !isLast && $('.lodemore').html('点击加载更多数据').show();
			    if( data.list == 0 ){ $('.lodemore').html('没有更多数据了').show();  }

				if (data.totalCount == 0 ) { $('.lodemore').html('暂无优惠卷').show(); return}
				
				for(var i in data.list){
					var lst = data.list[i];
					html += '<div class="cuopon_management_content clearfloat cuopon_status1' + lst.status + '">'
					html += '		<div class="cuopon_management_content_left">' + lst.couponMoney + '元</div>'            
					html += ' 	    <div class="cuopon_management_content_right">'
					html += '			<div class="cuopon_management_title">' + lst.couponName + '</div>'
					html += '			<ul class="cuopon_management_message">'
					html += '				<li>有效期至:' + lst.endTime + '</li>'
					html += '				<li>金额要求:订单金额满' + lst.leastOrderMoney + '元可用</li>'
					if( 0 < lst.howGet && lst.howGet < 6){
						html += '			<li>' + pub.COUPON_TYPES[lst.howGet-1] + '</li>'
					}else{
						html += '			<li>来源:自助领取</li>'
					}          		
					html += '			</ul>'
					html += '		</div>'
					html += '</div>'           		
				};
				$('.cuopon_management_contain').append( html );
			}
		},
		// 优惠券使用说明请求
		grh_desc : {

			init : function( code, callback){
				common.ajaxPost({
					method : 'grh_desc',
    				code : code 
				},function( d ){
					callback( d );
					// COUPON.apiHandle.grh_desc.apiData( d );
				})
			},
			apiData : function( d ){
				if( d.statusCode == "100000" ){
					var data = d.data;
    				var str = data.desc;
					$('.alert_title').html( data.title );
					$('.alert_content').html( str.replace(/\r\n/g, "<br />") );
    			}else{
    				common.prompt( d.statusStr );
    			}
			}
		},
		// 优惠券列表
		get_sort_coupon : {
			init : function(){
				common.ajaxPost({
					method : 'get_sort_coupon',
   	    			userId : pub.userId
				},function( d ){
					COUPON.apiHandle.get_sort_coupon.apiData( d );	
				})
			},
			apiData : function( d ){
				d.statusCode == "100000" ? COUPON.apiHandle.get_sort_coupon.apiDataDeal( d ) : common.prompt( d.statusStr );
			},
			apiDataDeal : function( d ){

		    	var html = '', i = 0;
		    	
		    	if (!d.data.length) {
		    		console.log(d.data.length)
		    		$(".zs-coupon-box .cuopon_contain").html("<p>暂无在线优惠卷可以领取。</p>");
		    		$(".cuopon_contain p").css({"text-align":"center",'line-height':'300px',"font-size":'30px'})
		    		return
		    	}
		    	for( i in d.data ){
		    		var list = d.data[i];
		    		html += '<div class="cuopon_content clearfloat">'
		    		html += '<div class="cuopon_content_center">'
		    		html += '<div class="cuopon_title">' + list.sortName + '</div>'
		    		html += '<ul class="cuopon_message">'
		    		html += '<li>有效期至：' + list.endTime + '</li>'
		    		html += '<li>金额要求：单笔订单满' + list.leastOrderMoney + '元</li>'
		    		html += '</ul>'
		    		html += '</div>'
		    		html += '<div class="cuopon_content_right" dataId="' + list.id + '">'
		    		html += '<div class="cuopon_money">' + list.sortMoney + '元</div>'

		    		html += '<div class="cuopon_receive cuopon_receive' + list.flag + '">' + pub.CUOPON_RECEIVE_STATUS[ list.flag ] + '</div>' 

		    		html += '</div>'
		    		html += '</div>'
		    	};
		    	$('.cuopon_contain').html(html);
		    	$('.cuopon_receive1').css({ 'color':'rgb(51,51,51)', 'border':'none' });
			}
		},
		// 领取优惠券
		goto_coupon : {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'goto_coupon',
   	    			sortCouponId : COUPON.sortCouponId
				}),function( d ){
					if( d.statusCode == "100000" ){
	   	    			$('.cuopon_receive0').css({'color':'rgb(51,51,51)','border':'none'}).html('已领取');
	   	    			$('.pop').find('.pop_prompt').html('优惠券领取成功');
	   	    			COUPON.apiHandle.get_sort_coupon.init(); // 优惠券列表
	    				COUPON.sortCouponId = null;
	   	    		}
				},function( d ){
					$('.pop').find('.pop_prompt').html('优惠券领取失败');
				});
			}
		}
	};

	// 优惠券 事件命名空间
	COUPON.eventHandle = {
		init : function(){

			// 点击跳转到首页
		    $('.cuopon_management_contain').on('click','.cuopon_status11',function(){
		    	common.jumpLinkPlain( "../index.html" );
		    });
	    	
	    	// 点击加载更多
	    	$('.lodemore').on('click',function(){				
				if ( $(this).html() != '没有更多数据了' ) {
					pub.PAGE_INDEX++;
					COUPON.apiHandle.couponInfo_manager.init();
				}else{
					$(this).off('click');
				}				
			});
			// 使用规则的弹出 和 隐藏
    		common.alertShow('.cuopon_management_top_right',function(){
    			COUPON.apiHandle.grh_desc.init(COUPON.code,COUPON.apiHandle.grh_desc.apiData);
    		});
    		common.alertHide();
    		// 优惠券管理 优惠券列表 切换
    		var bool = true;
    		$('.cuopon_management_top_left').click(function(){
    			USER_INFO_REPAIRED.switchInput.call(COUPON,'优惠券','.zs-couponManager-box','.zs-coupon-box','在线获取优惠券');
    			bool && (function(){
    				COUPON.apiHandle.get_sort_coupon.init();
    				window.history.pushState('','','./cuopon_management.html');
    				bool = false;
    			}());
    		});

    		$('.header_left').click(function(){
				$('.zs-coupon-box').is(':visible') ? USER_INFO_REPAIRED.switchInput.call(COUPON,'优惠券管理','.zs-coupon-box','.zs-couponManager-box') : window.history.back();
			});

			window.onpopstate = function(){
				USER_INFO_REPAIRED.switchInput.call(COUPON,'优惠券管理','.zs-coupon-box','.zs-couponManager-box');
				$('.pop').hide();
			}

			//点击立即领取
		    $('.cuopon_contain').on('click','.cuopon_receive0',function(){
		    	var $this = $(this);
		    		COUPON.sortCouponId = $this.parent().attr('dataId');
		    	if ( pub.logined ) { // 判断是否登录
		    		if( $this.html() === '立即领取' ){
			    		$('.pop').css({'display':'block'});
			    		$("body").css("overflow-y","hidden");
			    		COUPON.apiHandle.goto_coupon.init();	
			    	}
		    	} else{
		    		common.jumpMake.setItem( "8" );
		    		common.jumpLinkPlain( "login.html" );
		    	}
		    });

		    //点击弹出框确定
		    $('.pop_makeSure').on('click',function(){
		        $("body").css("overflow-y","auto");
		        $('.pop').css('display','none');
			}); 
			//点击遮罩层
		    $('.pop_bg').on('click',function(){
		    	$('.pop').css('display','none');
		    	$("body").css("overflow-y","auto");
		    });
		}
	};

	COUPON.init = function(){
		COUPON.apiHandle.init();
		COUPON.eventHandle.init();
	}



/****************************  果币模块  ************************/

	// 命名空间

	pub.fruitCoins = {};
	var FRUIT_COINS = pub.fruitCoins;

	// 果币 事件命名空间
	FRUIT_COINS.apiHandle = {
		init : function(){
			var me = this;
			me.user_score.init();
		},
		user_score : {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method:'user_score'
				}),function( d ){
					$(".fruitMall_wrap_top_left span").html( d.statusCode == "100000" ? d.data.score : '0' );
				});
			}
		}

	};

	// 果币 事件命名空间
	FRUIT_COINS.eventHandle = {
		init : function(){
			
			$('.header_left').click(function(){
				var url = $('[data-fruit]').attr('data-fruit');
				switch( url ){
					case 'fruit_get' : common.jumpLinkPlain('fruitMall.html'); break;
					case 'fruit_exchange' : common.jumpLinkPlain('fruitMall.html'); break;
					default : common.jumpLinkPlain('my.html');
				};
			});
			common.jumpLinkSpecial('.fruitMall_wrap_content_left','fruit_exchange.html'); // 跳转到果币兑换记录页面
			common.jumpLinkSpecial('.fruitMall_wrap_content_right','fruit_get.html'); // 跳转到获取果币记录页面
		},
	};
	// 果币模块初始化
	FRUIT_COINS.init = function(){
		FRUIT_COINS.apiHandle.init();
		FRUIT_COINS.eventHandle.init();
	};

/****************************  修改密码模块  ************************/

	// 命名空间

	pub.passwordFix = {};
	var PASSWORD_FIX = pub.passwordFix;

	// PASSWORD_FIX.oldPwd = null; // 原密码
	// PASSWORD_FIX.newPwd = null; // 新密码
	// PASSWORD_FIX.confirmPwd = null; // 确认密码

	PASSWORD_FIX.bool = false;

	// 修改密码 接口处理
	PASSWORD_FIX.apiHandle = {
		init : function(){

		},
		update_pwd : {
			init : function(){
				common.ajaxPost($.extend({},pub.userBasicParam,{
					method : 'update_pwd',
					pwd : common.pwdEncrypt( PASSWORD_FIX.oldPwd ),
					newPwd : common.pwdEncrypt( PASSWORD_FIX.newPwd ),
					confirmPwd : common.pwdEncrypt( PASSWORD_FIX.confirmPwd )
				}),function( d ){
					switch( +d.statusCode ){
						case 100000 : (function(){
							common.prompt( '修改成功' ); 
							common.setMyTimeout(function(){
					    		common.jumpLinkPlain('my.html');
					    	},500);
						}()); break;
						case 100503 : common.prompt( '原密码错误' ); break;
						default : common.prompt( d.statusStr );
					}
				},function( d ){
					common.prompt( d.statusStr );
				},function(){
					PASSWORD_FIX.bool = false;
				});
			}
		}
	};

	// 修改密码事件处理
	PASSWORD_FIX.eventHandle = {
		init : function(){
			common.jumpLinkSpecial('.header_left','my.html'); // 返回上一页

			$('.pwd_change_reverse').on('click',function(){
				
			 	PASSWORD_FIX.oldPwd = $('.old_pwd input').val(), // 用户输入的旧密码
			    
			    PASSWORD_FIX.newPwd = $('.new_pwd input').val(), // 用户输入的新密码
			    
			    PASSWORD_FIX.confirmPwd = $('.confirm_pwd input').val(); // 再次确认新密码

				if( PASSWORD_FIX.oldPwd == '' ){
					common.prompt('请输入原始密码'); return;
				}
				if( PASSWORD_FIX.newPwd == '' ){
					common.prompt( '请输入新密码' ); return;
				}
				if(!common.PWD_REG.test( PASSWORD_FIX.newPwd )){
				    common.prompt('密码格式不正确'); return;				
				}
				if( PASSWORD_FIX.confirmPwd == '' ){
					common.prompt('请输入确认密码'); return;	  
			    }
			    if( PASSWORD_FIX.oldPwd == PASSWORD_FIX.newPwd ){
					common.prompt('新密码与原密码一样'); return;
				}
				if( PASSWORD_FIX.confirmPwd != PASSWORD_FIX.newPwd ){	
					common.prompt('确认密码与新密码不一致'); return;
				}
				if( PASSWORD_FIX.bool ){
					return;
				}

				PASSWORD_FIX.bool = true;
				PASSWORD_FIX.apiHandle.update_pwd.init();

			});
			
		},
	};

	// 修改模块密码初始化
	PASSWORD_FIX.init = function(){
		PASSWORD_FIX.apiHandle.init();
		PASSWORD_FIX.eventHandle.init();
	};


	/********************** 帮助模块 ***********************/

	// 命名空间

	pub.help = {};
	var HELP = pub.help;


	HELP.code = null; // 保存 code 
	HELP.urlParam = null; // url 参数

	HELP.item = { // 请求的页面和对应的 code 值
		'contact':['LXFS-DESC','联系方式'],
		'pre_deal':['YGGX-DESC','预购协议'],
		'relevent':['THH-DESC','退换货规则'],
		'couponUse_rule':['YHQ-DESC','优惠券使用规则'],
		'inspection':['YHQS-DESC','验货与签收'],
		'about_us':['GUWM-DESC','关于我们']	
	}

	// 帮助模块 接口数据处理 初始化
	HELP.apiHandle = {
		apiData : function( d ){
			if ( d.statusCode == '100000' ) {
					var html = '',
					data = d.data;
					html += '<div class="orderDeal">'
					html += '   <div class="orderDeal_title">' + data.title + '</div>'
					html += '   <ul class="orderDeal_content" style="font-size: 26px;line-height: 40px;"></ul>'
					html += '</div>'
					$('.main').append(html);
					var str = data.desc;
					$('.orderDeal_content').html( str.replace(/\r\n/g, "<br>") );
			}else{
				common.prompt( d.statusStr )
			}
		}
	};

	// 帮助模块 事件处理 初始化
	HELP.eventHandle = {
		init : function(){
			common.jumpLinkSpecial('.header_left',function(){
				window.history.back();
			});
			HELP.urlParam = common.getUrlParam('help'); // 接收url参数
			if( !!HELP.urlParam ){
				HELP.code = HELP.item[ HELP.urlParam ][0];
				$('.header_title,title').html( HELP.item[ HELP.urlParam ][1] );
				COUPON.apiHandle.grh_desc.init( HELP.code, HELP.apiHandle.apiData);
			}
		},
	};
	// 帮助模块初始化
	HELP.init = function(){
		HELP.eventHandle.init();
	};



	/********************** 设置模块 ***********************/

	// 命名空间

	pub.settings = {};
	var SETTINGS = pub.settings;

	// 设置模块事件处理 命名空间
	SETTINGS.eventHandle = {
		init : function(){
			var bool = true;
	       	$('.header_left').click(function(){
	       		$('.zs-setting-aboutus').is(':visible') ?
	       		USER_INFO_REPAIRED.switchInput.call(SETTINGS,'设置','.zs-setting-aboutus','.zs-setting-box') : common.jumpLinkPlain('my.html');
	       	});
	       	$('.about_us','.zs-setting-box').click(function(){
	       		USER_INFO_REPAIRED.switchInput.call(COUPON,'关于我们','.zs-setting-box','.zs-setting-aboutus');
	       		bool && (function(){
	       			COUPON.apiHandle.grh_desc.init(HELP.item.about_us[0], SETTINGS.apiHandle.apiData);
	       			window.history.pushState('','','./my_settlement.html');
	       			bool = false;
	       		}()); 
	       		
	       	});
	       	window.onpopstate = function(){
	       		USER_INFO_REPAIRED.switchInput.call(SETTINGS,'设置','.zs-setting-aboutus','.zs-setting-box');
			}
		},
	};

	// 设置模块接口 数据处理 命名空间
	SETTINGS.apiHandle = {
		init : function(){},
		apiData : function( d ){
			if ( d.statusCode == '100000' ) {
					var html = '';
					$('.main','.zs-setting-aboutus').html('');
					data = d.data;
					html += '<div class="orderDeal">'
					html += '   <div class="orderDeal_title">' + data.title + '</div>'
					html += '   <ul class="orderDeal_content" style="font-size: 26px;line-height: 40px;"></ul>'
					html += '</div>'
					$('.main','.zs-setting-aboutus').append(html);
					$('.orderDeal_content','.zs-setting-aboutus').html( data.desc.replace(/\r\n/g, "<br>") );
			}else{
				common.prompt( d.statusStr )
			}
		}
	};

	// 设置模块初始化
	SETTINGS.init = function(){
		SETTINGS.eventHandle.init();
		SETTINGS.apiHandle.init();
	};	
	// 换肤
	pub.apiHandle.change_app_theme = {
		init:function(){
			if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
				switch( +pub.muduleId ){
					case 0 : (function(){
						$(".main_top,.footer,.exit,.zs_address_box").addClass("skin"+sessionStorage.getItem("huanfu"))
					}()); break;
					case 1 : (function(){
						$(".zs_address_box,.zs_phone_box").addClass("skin"+sessionStorage.getItem("huanfu"))
					}()); break; // 修改个人信息
					case 2 : break; // 优惠券
					case 3 : (function(){
						$(".fruitMall_wrap_top,.fruitMall_wrap_bottom").addClass("skin"+sessionStorage.getItem("huanfu"))
					}()); break; // 果币
					case 4 : (function(){
						$(".pwd_change_reverse").addClass("skin"+sessionStorage.getItem("huanfu"))
					}()); break; // 修改密码
					case 5 : (function(){
						$(".main_tel").addClass("skin"+sessionStorage.getItem("huanfu"))
					}()); break; // 帮助中心
					case 6 : break; // 设置模块
				};
			}
		}
	}

	// 个人中心初始化函数
	pub.init = function(){
		if (!common.huanfu.getKey()) {
			common.change_app_theme();
			common.defHuanfu.done(function(){
				pub.apiHandle.change_app_theme.init();
			})
		}else{
			pub.apiHandle.change_app_theme.init();
		}
		switch( +pub.muduleId ){
			case 0 : (function(){
				pub.apiHandle.init(); // 父模块接口数据初始化
				pub.eventHandle.init(); // 父模块 事件 初始化
		 		$('.footer_item[data-content]','#foot').attr('data-content',common.getTotal());
			}()); break;
			case 1 : USER_INFO_REPAIRED.init(); break; // 修改个人信息
			case 2 : COUPON.init(); break; // 优惠券
			case 3 : FRUIT_COINS.init(); break; // 果币
			case 4 : PASSWORD_FIX.init(); break; // 修改密码
			case 5 : HELP.init(); break; // 帮助中心
			case 6 : SETTINGS.init(); break; // 设置模块
		};
		
	};

	module.exports = pub;

});