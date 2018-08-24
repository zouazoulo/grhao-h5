define('fram',['common','farmCanves','vue'],function(require, exports, module){
	
	var common = require('common');
	
	var farmCanves = require('farmCanves');
	
	// 农场命名空间
	var pub = {};
	
	pub.domain = common.WXDOMAIN;
	pub.appid = common.WXAPPID;
	
	pub.logined = common.isLogin(); // 登陆状态
	
	/*
	PageStatus 
	 关于页面加载的全局状态的定义
	*/
	let PageStatus = {
		Initialization:1,//数据初始化的加载阶段页面显示一个canves的加载动画
		interaction:2,//页面可交互状态
		
		InitializationError:-1,//初始化时候失败--（包含登陆失败，调用农场初始化接口失败）
		
		
		
		
	}
	let PageType = 1;//1为默认情况  为自己农场场景  2表示为好友农场场景
	
	
	
	//接口	
	pub.apiHandle = {
		init:function(){
			//农场数据初始化开始
			
			
		},
		
		
		
	}
	
	
	
	
	//使用微信code获取openid
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
				    sex : infor.sex
				};
			common.user_data.setItem( common.JSONStr(user_data) );
			localStorage.setItem('tokenId',d.data.tokenId)
			common.secretKey.setItem( d.data.secretKey );
			//登陆完成后再进行初始化
			pub.apiHandle.init();
    	},
    };
	
	pub.init = function(){
		if (pub.logined) {
			
			//登陆完成后再进行初始化
			pub.apiHandle.init();
			
		}else{
			if (common.isWeiXin()) {
				pub.weixinCode = common.getUrlParam('code'); // 获取url参数
				pub.state = common.getUrlParam("state");//获取url机器编码参数
				
				
				
				!pub.openId ? (function(){
	 				pub.weixinCode ? pub.get_weixin_code() : common.jumpLinkPlain("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+pub.appid+"&redirect_uri=" + pub.domain + "/html/grhFarm.html&response_type=code&scope=snsapi_userinfo&"+ state+ "&connect_redirect=1#wechat_redirect");
	 			}()) : (function(){
	 				//使用openId去进行登录操作
	 				pub.apiHandle.scan_qrcode_login.init()
	 			}());
				
				
				var state = 'state=grhFram';
				common.jumpLinkPlain("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+pub.appid+"&redirect_uri=" + pub.domain + "/html/grhFarm.html&response_type=code&scope=snsapi_userinfo&"+ state+ "&connect_redirect=1#wechat_redirect");
				
				
			}else{
				common.jumpLinkPlain("../index.html?type=fram");
			}
		}
	}
	
	module.exports = pub;
})