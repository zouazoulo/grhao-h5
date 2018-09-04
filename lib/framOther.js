define('framOther',['common','framView','vue'],function(require, exports, module){
	
	var common = require('common');
	var framView = require("framView");
	// 农场命名空间
	var pub = {};
	
	pub.muduleId = $('[module-id]').attr('module-id');
	
	pub.domain = common.WXDOMAIN;
	pub.appid = common.WXAPPID;
	pub.bigSize = '100';
	pub.logined = common.isLogin(); // 登陆状态
	
	if (pub.logined) {
		pub.userData = common.user_datafn();
		pub.userId = pub.userData.cuserInfoid;
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
	/*
	PageStatus 
	 关于页面加载的全局状态的定义
	*/
	let PageStatus = {
		Initialization:1,//数据初始化的加载阶段页面显示一个canves的加载动画
		
		interaction:2,//页面可交互状态
		
		InitializationError:-1,//初始化时候失败--（包含登陆失败，调用农场初始化接口失败）
		
		changeScene:3,//表示改变场景时候的状态
		
		changeSceneError:-3,//改变场景时候请求接口失败（土地，好友，）
		
	};
	let PageType = 1;//1为默认情况 兑换  2表示兑换成功

	
	/*
	 分析页面DOM数据结构
	 * */
	
	var dateModule = {
		
		
		
	}
	
	
	
	/*
	使用VUe的双向数据绑定
	实现页面的状态管理
	 * */
	pub.Vue = new Vue({
		el: '#appVue',
		data: {
			PageStatus : PageStatus.Initialization,
			PageType : PageType,
			isMask:false,//遮罩层的状态 true 表示显示
			
			isWx:false,//是否是微信环境
			urlParm:null,//页面URL后面拼接的参数
			isMaskData:null,//表示遮罩显示时候的----使他显示的view对象
			titleText:'',
			ruleList:[],
			fruit:{},//水果数据
			exchangeBtnStatus:1,//默认为1 不可兑换 2为可以兑换
			exchangeErrorMsg:null,//兑换的错误信息
			addressInfo:{},
			fruitNum:null,
		},
        beforeCreate : function(){
        	
        },
        created : function(){
        	console.log("created			//创建完成")
        	this.isWx = common.isWeiXin();
        },
        beforeMount : function(){
        	console.log("beforeMount		//挂载之前")
        	
        },
        updated : function(){
        	console.log("updated			//数据被更新后")
        	
        },
        computed: {
		    // 计算属性width
		   /* _fruitNum:{
		    	get:function(){
	                return this.fruitNum;
	            
	            },
	            set:function(newValue){
	            	
	            	console.log(n)
	            	
	            	console.log(this.fruitNum)
	            }
		    }*/
		},
        watch : {
        	PageStatus:function(val,oldVal){
        		console.log("val="+val+",oldVal="+oldVal);
        	},
        	fruitNum:function(val,oldVal){
        		console.log("val="+val+",oldVal="+oldVal);
        		var n = val.replace(/[^\d]/g,'');
        		if (n == 0) {
            		this.fruitNum='';
            	}else{
            		this.fruitNum=n;
            	}
            	if (n > parseInt(this.fruit.num /this.fruit.rate)) {
            		this.exchangeErrorMsg = "当前已超出可兑换的数量"
            	}else{
            		this.exchangeErrorMsg = null;
            	}
            	
        	},
        	PageType:function(val,oldVal){
        		console.log("val="+val+",oldVal="+oldVal);
        		if (val == 2 && oldVal == 1) {
        			
        		}
        	}
        },
		methods: {
			goBack:function(){
				window.location.href = "../html/grhFarm.html"
			},
			//关闭遮罩
			closeMask:function(event){
				let target = event.target;
				let view_name = target.getAttribute("data-obj");
				if (view_name == 'siginIn') {
					pub.creatDataModule.signIn(false);
				}else if (view_name == 'dynamicInfo'){
					pub.creatDataModule.dynamicInfo(false);
				}else if (view_name == 'friedsInfo'){
					pub.creatDataModule.friedsInfo(false);
				}else if (view_name == 'landInfo'){
					pub.creatDataModule.landInfo(false);
				}else if (view_name == 'storehouseInfo'){
					pub.creatDataModule.storehouseInfo(false);
				}
				pub.Vue.pageNo = 1;
			},
			contentRex:function(item){
				var str = ''
				if (typeof item == "string") {
					str = item.trim();
					str = str.replace(/\r\n/g, "<br/>")
				}else{
					str = item.toString();
				}
		    	return str;
		   	},
		   	goAddressList:function(){
		   		common.addType.setItem( "10" );
		   		window.location.href = "address_management.html?addr=exc"
		   	},
		   	exchangeFruit:function(e){
		   		var target = event.target;
		   		var isActive = $(target).is('.active');
		   		if (isActive) {
		   			farmExchange.apiHandle.exchange_fruit.init();
		   		}
		   	}
		}
	})
	
	
	//农场接口
	pub.apiHandle = {
		init: function() {
			
		},
	};
	/*
	 农场规则
	 * 
	 * */
	var farmRule = {};
	
	farmRule.apiHandle = {
		init:function(){
			farmRule.apiHandle.farm_desc.init();
		},
		farm_desc:{
			init:function(){
				common.ajaxPost({
					method: 'farm_desc',
				}, function(d) {
					d.statusCode == "100000" ? farmRule.apiHandle.farm_desc.apiData(d) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d) {
				var v = d.data;
				console.log(v);
				pub.Vue.ruleList = v;
			}
		}
	};
	farmRule.eventHandle = {
		init:function(){
			
		},
	}
	
	farmRule.init = function(){
		
		farmRule.apiHandle.init();
		farmRule.eventHandle.init();
	}
	/*
	 兑换
	 * */
	
	var farmExchange = {
		
	};
	farmExchange.apiHandle = {
		init:function(){
			pub.Vue.fruit = JSON.parse(sessionStorage.getItem("farmFruit"));
			// 用户配送地址
			if( common.addType.getKey() && common.addressData.getKey() ){
				farmExchange.apiHandle.AddrInfoRender( common.JSONparse( common.addressData.getItem() ) ); // 地址数据渲染
			}else{
				console.log(common)
				farmExchange.apiHandle.address_default_show.init(); // 地址获取
			}
			console.log(pub.Vue.fruit)
		},
		// 默认地址
		address_default_show : {
			init : function(){
				$.ajaxSetup({
					url: common.API,
				})
				common.ajaxPost($.extend({},{
					method : 'address_default_show',
					
				}, pub.userBasicParam ),function( d ){
					switch( +d.statusCode ){
						case 100000 : farmExchange.apiHandle.AddrInfoRender( d.data ); break; // 配送地址渲染
						case 100300 : 
						case 100505 : $('.set_charge_address1').find('.group1').hide().next().show().html( "请选择收货地址" ); break;
					};
				},function( d ){
					common.prompt( d.statusStr );
				},function(){
					//pub.addrDtd.resolve();
				});
			}
		},
		AddrInfoRender:function(d){
			pub.Vue.addressInfo = d;
		},
		exchange_fruit:{
			init:function(){
				$.ajaxSetup({
					url: common.APIFARM,
				})
				common.ajaxPost($.extend({},{
					method: 'exchange_fruit',
					userId: pub.userId,
					farmFruitId:pub.Vue.fruit.id,
					fruitNum:pub.Vue.fruitNum,
					addrId:pub.Vue.addressInfo.id
					
				}, pub.userBasicParam ),function( d ){
					d.statusCode == "100000" ? farmExchange.apiHandle.exchange_fruit.apiData(d) : common.prompt(d.statusStr);
				},function( d ){
					common.prompt( d.statusStr );
				});
			},
			apiData:function(d){
				var v= d.data;
				pub.Vue.PageType = 2;
				
			}
		}
	};
	farmExchange.eventHandle = {
		init:function(){
			
		},
	}
	
	farmExchange.init = function(){
		
		farmExchange.apiHandle.init();
		farmExchange.eventHandle.init();
	}
	
	
	
	pub.init = function(){
		switch( +pub.muduleId ){
			
			case 1 : farmRule.init(); break; // 农场规则
			case 2 : farmExchange.init(); break; // 农场规则
		};
	}
	
	module.exports = pub;
})