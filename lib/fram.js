define('fram',['common','farmCanves','framView','vue'],function(require, exports, module){
	
	var common = require('common');
	
	var farmCanves = require('farmCanves');
	
	var framView = require("framView");
	
	// 农场命名空间
	var pub = {};
	
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
	}
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
	let PageType = 1;//1为默认情况  为自己农场场景  2表示为好友农场场景
	/*
	 分析页面DOM数据结构
	 * */
	
	var dateModule = {
		//用户信息
		userInfo:{
			userId:'',//用户的果然好id-》userId
			faceImg:'',//农场用户的头像
			farmId:'',//农场的ID
			petName:'',//用户的昵称
		},
		hasSignIn:false,//标示用户是否签到--默认值为false
		waterTimes:0,//标示当前用户的浇水次数---默认值为0
		farmLandCount:1,//标示当前用户的土地数量---默认值为1
		//农场等级信息
		farmLevel:{
			levelNum:'',//等级数
			startExp:'',//等级起始经验值
			endExp:'',//等级结束经验值
			exp:'',//当前的经验值
		},
		//动态信息
		dynamicInfo:{
			
		},
		//仓库信息
		storehouseInfo:[{
			name:'种子',
			method:'farm_seed_list',
			dataArr:[],
			active:false,
		},{
			name:'道具',
			method:'farm_fertilizer_list',
			dataArr:[],
			active:false,
		},{
			name:'果实',
			method:'farm_fruit_list',
			dataArr:[],
			active:false,
		}],
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
			pageNo: common.PAGE_INDEX,
			pageSize: common.PAGE_SIZE,
			isMaskData:null,//表示遮罩显示时候的----使他显示的view对象
			hasSignIn:false,//标示用户是否签到--默认值为false没有签到
			waterTimes:0,//标示当前用户的浇水次数---默认值为0
			farmLandCount:0,//标示当前用户的土地数量---默认值为1
			userInfo:{},//用户信息
			signIn:{},//用户签到信息
			farmLevel:{},//农场等级信息
			//仓库信息
			storehouseInfo:[{
				name:'种子',
				method:'farm_seed_list',
				dataArr:[],
				active:false
			},{
				name:'道具',
				method:'farm_fertilizer_list',
				dataArr:[],
				active:false
			},{
				name:'果实',
				method:'farm_fruit_list',
				dataArr:[],
				active:false
			}],
			dynamicInfo:{},//动态消息对象
			friedsInfo:{},//好友信息列表
			landInfo:{},//土地信息
			
		},
        beforeCreate : function(){
        	
        },
        created : function(){
        	console.log("created			//创建完成")
        	
        },
        beforeMount : function(){
        	console.log("beforeMount		//挂载之前")
        	
        },
        updated : function(){
        	console.log("updated			//数据被更新后")
        	
        },
        watch : {
        	PageStatus:function(val,oldVal){
        		console.log("val="+val+",oldVal="+oldVal);
        		if (val == 2 && oldVal == 1) {
        			farmCanves.creatCanves();
        			pub.eventHandle.init();
        		}
				
        	}
        },
		methods: {
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
				
			},
			//签到
			getSignIn: function (data) {
	            pub.apiHandle.frame.init()
	      	},
	      	//动态
			getDynamic: function (event) {  
	            console.log("getDynamic ") 
	            let target = event.target;
				let data = target.getAttribute("data");
				
				if (data) {
					console.log(data);
				}else{
					console.log('1');
				}
				pub.apiHandle.trends.init()
				/*$("#trends").animate({
					height: "748px"
				});
				*/
	      	},
	      	//好友
			getFrieds: function (data) {  
	            console.log("getFrieds ")  
	            pub.apiHandle.farm_friend_list.init()
	      	},
	      	invitationFriend:function(){
	      		console.log("邀请好友")
	      	},
	      	//土地
			getLand: function (data) {  
	            console.log("getLand ")
	            pub.apiHandle.land.init();
	      	},
	      	//仓库
			getStorehouse: function (event,index) {  
	            console.log("getStorehouse ")
	            let target = event.target;
	            if (target) {
	            	pub.apiHandle.storehouse.init(0);
	            }else{
	            	if (pub.Vue.storehouseInfo[index].dataArr.length != 0) {
	            		pub.creatDataModule.storehouseInfo(pub.Vue.storehouseInfo[index].dataArr , index);
	            	}else{
	            		pub.apiHandle.storehouse.init(index);
	            	}
	            }
	      	},
	      	//水
			getWatering: function (data) {  
	            console.log("getWatering ")  
	      	},
	      	
	      
		}
	})
	/*
	 数据模型创建
	*/
	pub.creatDataModule = {
		//
		baseDate:function(){
			pub.Vue.PageStatus = PageStatus.Initialization;
			pub.Vue.PageType = PageType;
		},
		PageStatus:function(status){
			pub.Vue.PageStatus = status;
		},
		PageType:function(type){
			pub.Vue.PageStatus = type;
		},
		//遮罩层的状态 true 表示显示
		isMask:function(isTrue){
			pub.Vue.isMask = isTrue;
		},
		//标示用户是否签到--默认值为false
		hasSignIn:function(isTrue){
			pub.Vue.hasSignIn = isTrue;
		},
		//标示当前用户的浇水次数---默认值为0
		waterTimes:function(num){
			if (num) {
				pub.Vue.waterTimes ='x'+ num;
			}else{
				pub.Vue.waterTimes = 0 ;
			}
			
		},
		///标示当前用户的土地数量---默认值为1
		farmLandCount:function(num){
			if (num) {
				pub.Vue.farmLandCount ='x'+ num;
			}else{
				pub.Vue.farmLandCount = 'x1';
			}
			
		},
		userInfo:function(obj){
			var o = {
				userId:obj.userId,//用户的果然好id-》userId
				faceImg:obj.faceImg,//农场用户的头像
				farmId:obj.id,//农场的ID
				petName:obj.petName,//用户的昵称
			}
			pub.Vue.userInfo = o;
		},
		signIn:function(obj){
			if (obj) {
				var o = {
					imgUrl:'../img/farmImg/p2x.png',
					htmlStr:'<p>'+obj.exp+'</p><p>浇水次数 + 3</p><p>'+obj.fertilizer+'</p>'
				};
				pub.Vue.signIn = o;
				pub.Vue.isMask = true;
				pub.Vue.isMaskData = 'siginIn';
			}else{
				pub.Vue.signIn = {};
				pub.Vue.isMask = false;
				pub.Vue.isMaskData = null;
			}
			
		},
		farmLevel:function(obj,obj2){
			var o = {
				levelNum:obj.levelNum,//等级数
				startExp:obj.startExp,//等级起始经验值
				endExp:obj.endExp,//等级结束经验值
				exp:obj2.exp,//当前的经验值
			}
			pub.Vue.farmLevel = o;
		},
		
		//动态信息
		dynamicInfo:function(obj){
			if (obj) {
				var o = {
					pageNo:obj.pageNo,
					isLast:obj.isLast,
					objects:obj.objects,
				};
				if (o.pageNo == 1) {
					$("#trends").animate({
						height: "748px"
					});
					pub.Vue.dynamicInfo = o;
					
				}else{
					
				}
				pub.Vue.isMask = true;
				pub.Vue.isMaskData = 'dynamicInfo';
			}else{
				$("#trends").animate({
					height: "0"
				},function(){
					pub.Vue.dynamicInfo = {};
					pub.Vue.isMask = false;
					pub.Vue.isMaskData = null;
				});
			}
		},
		//好友列表
		friedsInfo:function(obj){
			if (obj) {
				var o = {
					pageNo:obj.pageNo,
					isLast:obj.isLast,
					objects:obj.objects,
				};
				
				pub.Vue.friedsInfo = o;
				pub.Vue.isMask = true;
				pub.Vue.isMaskData = 'friedsInfo';
				
				$("#friend").animate({
					height: "526px"
				});
				
			}else{
				$("#friend").animate({
					height: "0"
				},function(){
					pub.Vue.friedsInfo = {};
					pub.Vue.isMask = false;
					pub.Vue.isMaskData = null;
				});
			}
		
		},
		//土地信息
		landInfo:function(obj){
			if (obj) {
				pub.Vue.landInfo = obj;
				pub.Vue.isMask = true;
				pub.Vue.isMaskData = 'landInfo';
				$("#land").animate({
					height: "956px"
				});
			}else{
				$("#land").animate({
					height: "0"
				},function(){
					pub.Vue.landInfo = {};
					pub.Vue.isMask = false;
					pub.Vue.isMaskData = null;
				});
			}
		},
		//仓库
		storehouseInfo:function(obj,type){
			if (obj) {
				dateModule.storehouseInfo[type].active = true;
				
				if (type == 0) {
					pub.Vue.isMask = true;
					pub.Vue.isMaskData = 'storehouseInfo';
					$("#storehouse").animate({
						height: "610px"
					});
					dateModule.storehouseInfo[1].active =  dateModule.storehouseInfo[2].active = false;
				}else if (type == 1) {
					dateModule.storehouseInfo[0].active =  dateModule.storehouseInfo[2].active = false;
				}else if (type == 2) {
					dateModule.storehouseInfo[0].active =  dateModule.storehouseInfo[1].active = false;
				}
				console.log(dateModule.storehouseInfo)
				
				
				
				
				pub.Vue.storehouseInfo = dateModule.storehouseInfo;
				
			}else{
				$("#storehouse").animate({
					height: "0"
				},function(){
					pub.Vue.storehouseInfo = dateModule.storehouseInfo;
					pub.Vue.isMask = false;
					pub.Vue.isMaskData = null;
				});
			}
		},
		
	}
	
	
	//农场接口
	pub.apiHandle = {
		init: function() {
			pub.apiHandle.index.init();
		},
		index:{
			init: function() {
				common.ajaxPost({
					method: 'farm_main',
					userId: pub.userId
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.index.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function(d) {
				var v = d.data;
				pub.creatDataModule.userInfo(v.farmer);
				pub.creatDataModule.farmLevel(v.farmLevel , v.farm);
				pub.creatDataModule.hasSignIn(v.hasSignIn);
				pub.creatDataModule.waterTimes(v.waterTimes);
				pub.creatDataModule.farmLandCount(v.farmLandCount);
				/*
				 数据请求成功
				*/
				pub.Vue.PageStatus = PageStatus.interaction;
			}
		},
		land: { //土地接口
			init: function() {
				common.ajaxPost({
					method: 'farm_land_list',
					farmId: pub.Vue.userInfo.farmId
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.land.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function(d) {
				var v = d.data;
				/*var html = "";
	
				for(var i in v) {
					html += `<li data="${v[i].id}">
								<dl class="active"></dl>
								<p class="color_b">${v[i].no}号土地</p>
								</li>`
	
				}
				$(".land_content")[0].innerHTML = html;*/
				pub.creatDataModule.landInfo(true);
			}
	
		},
		storehouse: { //仓库
			init: function(type) {
				var type = type || 0;
				pub.apiHandle.storehouse.api.init(type);
			},
			api:{
				init:function(type){
					common.ajaxPost({
						method: pub.Vue.storehouseInfo[type].method,
						farmerId: pub.Vue.userInfo.farmId,
						pageNo: pub.Vue.pageNo,
						pageSize: pub.bigSize,
					}, function(d) {
						d.statusCode == "100000" ? pub.apiHandle.storehouse.api.apiData(d,type) : console.log("未知参数");
					})
				},
				apiData: function(d,type) {
					var v = d.data;
					var html = "";
					
					pub.creatDataModule.storehouseInfo(v,type);
					
				}
			},
			seed: { // 种子
				init: function() {
					common.ajaxPost({
						method: 'farm_seed_list',
						farmerId: pub.Vue.userInfo.farmId,
						pageNo: pub.Vue.pageNo,
						pageSize: pub.bigSize,
					}, function(d) {
						d.statusCode == "100000" ? pub.apiHandle.storehouse.seed.apiData(d) : console.log("未知参数");
					})
				},
				apiData: function(d) {
					var v = d.data;
					var html = "";
					/*var num = v.length;
					var w = $(".show li").width();
					for(var i in v) {
						html += ``
					}
					$(".show")[0].innerHTML = html
					$(".show").width(270 * num)*/
					pub.creatDataModule.storehouseInfo(v);
					
				}
			},
			fertilizer: { //化肥
				init: function() {
					common.ajaxPost({
						method: 'farm_fertilizer_list',
						farmerId: 4,
						pageNo: 1,
						pageSize: 10
					}, function(d) {
						d.statusCode == "100000" ? pub.apiHandle.storehouse.fertilizer.apiData(d) : console.log("未知参数");
					})
				},
				apiData: function(d) {
					var v = d.data.objects;
					var html = "";
					var num = v.length;
					var w = $(".show li").width();
					for(var i in v) {
						html += `<dl data="${v[i].fertilizerId}">
									<dt class="ccsl">${v[i].name}</dt>
									<dd class="num">x${v[i].count}</dd>
									<dd><img src="${v[i].logo}"/></dd>
									<dd><span class="button">立即使用</span></dd>
								</dl>`
					}
					$(".show")[0].innerHTML = html
					$(".show").width(270 * num)
				}
			},
			fruit: { //水果
				init: function() {
					common.ajaxPost({
						method: 'farm_fruit_list',
						farmerId: 4,
						pageNo: 1,
						pageSize: 10
					}, function(d) {
						d.statusCode == "100000" ? pub.apiHandle.storehouse.fruit.apiData(d) : console.log("未知参数");
					})
				},
				apiData: function(d) {
					var v = d.data.objects;
					var html = "";
					var num = v.length;
					var w = $(".show li").width();
					for(var i in v) {
						html += `<dl data="${v[i].seedId}">
									<dt class="ccsl">${v[i].name}</dt>
									<dd class="num">x${v[i].num}</dd>
									<dd><img src="${v[i].logo}"/></dd>
									<dd><span class="button">立即使用</span></dd>
								</dl>`
					}
					$(".show")[0].innerHTML = html;
					$(".show").width(270 * num)
				}
			}
		},
		farm_friend_list: { //好友列表
			init: function() {
				common.ajaxPost({
					method 	 : "farm_friend_list",
					ownId	 :pub.Vue.userInfo.farmId,
					pageNo	 :pub.Vue.pageNo,
					pageSize :pub.bigSize,
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_friend_list.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function(d) {
				var v = d.data;
				/*var html = "";
				
				for(var i in v){
					html +=	`<dl>
							<dt class=" "><img src="./img/tx.png"/ ></dt>
							<dd class='name ellipsis'>${v[i].friendName}</dd>
							<dd class='no'>No.3</dd>
						</dl>`
				}
				$("#friend .right")[0].innerHTML = html;*/
				pub.creatDataModule.friedsInfo(v);
				
			}
		},
		farm_friend_add:{ //添加好友
			init: function() {
				common.ajaxPost({
					method 	 : "farm_friend_add",
					ownId 	 :4,
					otherId	 :2
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_friend_add.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function() {
	
			}
		},
		trends: { //动态
			init: function() {
				common.ajaxPost({
					method: 'operation_rcd_list',
					farmerId: pub.Vue.userInfo.farmId,
					pageNo: pub.Vue.pageNo,
					pageSize: pub.Vue.pageSize
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.trends.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function(d) {
				var v = d.data;
				/*var html = "";
				for(var i in v) {
					html += `<li>
							<p> ${v[i].createTime}</p>
							<p>签到成功+${v[i].exp}</p>
						</li>`
				}
				$('.trends_content')[0].innerHTML = html;*/
				pub.creatDataModule.dynamicInfo(v);
			}
		},
		frame: { //签到
			init: function() {
				common.ajaxPost({
					method: 'farm_sign_in',
					farmerId: pub.Vue.userInfo.farmId
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.frame.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function(d) {
				var v = d.data;
				v = {
					fertilizer:'123456',
					exp:'123456'
				}
				pub.creatDataModule.signIn(v);
			}
		},
		weed_out: { //除草
			init: function() {
				common.ajaxPost({
					method: 'weed_out',
					farmLandFruitId:21
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.weed_out.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function() {
	
			}
	
		},
		water_times: { //浇水
			init: function() {
				common.ajaxPost({
					method: 'water_times',
					farmLandFruitId: 21
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.water_times.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function() {
	
			}
	
		},
		pick_fruit: { //采摘水果
			init: function() {
				common.ajaxPost({
					method: 'pick_fruit',
					farmSeedId: 5,
					farmLandId: 1
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.pick_fruit.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function() {
	
			}
		},
		plant_seed: { //种种子
			init: function() {
				common.ajaxPost({
					method: 'plant_seed',
					farmSeedId: 5,
					farmLandId: 6
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.plant_seed.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function() {
	
			}
		},
		use_fertilizer: { //使用化肥
			init: function() {
				common.ajaxPost({
					method: 'use_fertilizer',
					fertilizerId: 1,
					farmLandFruitId: 21
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.use_fertilizer.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function() {
	
			}
		},
		farm_disinsection: { //除虫
			init: function() {
				common.ajaxPost({
					method: 'farm_disinsection',
					farmLandFruitId: 21
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_disinsection.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function() {
	
			}
		},
		friend_farm:{
			init: function() {
				common.ajaxPost({
					method: 'friend_farm',
					farmerId: 4
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.friend_farm.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function() {
	
			}
		},
		steal_fruit:{
			init: function() {
				common.ajaxPost({
					method: 'steal_fruit',
					farmerId: 4,
					farmLandFruitId:21
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.steal_fruit.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function() {
	
			}
		}
	
	};
	
	
	pub.eventHandle = {
		init:function(){
			if (pub.Vue.PageType == 1) {
				
			}else{
				
			}
			//pub.eventHandle.frame();
			
			//pub.eventHandle.trends();
			//pub.eventHandle.land();
			
			//pub.eventHandle.storehouse();
			pub.eventHandle.watering();
		},
		land: function() { //土地
			$(".land").on("click", function() {
				$("#land").animate({
					height: "956px"
				});
				//$("#mask").show();
				pub.apiHandle.land.init()
			})
			/*$(".common_close, #mask").on("click", function() {
				$("#land").animate({
					height: "0"
				});
				$("#mask").hide();
			})*/
	
			$(".land_content").on("click", "li", function() {
				$(".common_wrap").animate({
					height: "0px"
				});
				//$("#mask").hide();
			})
	
		},
		storehouse: function() { //仓库
			/*$(".storehouse_w").on("click", function() {
				$("#storehouse").animate({
					height: "610px"
				});
				//$("#mask").show();
				$(".menu li").eq(0).addClass("active").siblings().removeClass("active");
				pub.apiHandle.storehouse.init();
			})*/
			/*$(".common_close, #mask").on("click", function() {
				$("#storehouse").animate({
					height: "0"
				});
				$("#mask").hide();
			})*/
			$(".menu li").on("click", function() {
				$(this).addClass("active").siblings().removeClass("active");
				switch($(this).attr("data")) {
					case "0":
						$(".show").attr("data","0");
						pub.apiHandle.storehouse.seed.init()
						break;
					case "1":
					$(".show").attr("data","1");
						pub.apiHandle.storehouse.fertilizer.init()
						break;
					case "2":
					$(".show").attr("data","2");
						pub.apiHandle.storehouse.fruit.init()
						break;
				}
			})
			$(".show").on("click", ".button", function() {
				
				$("#storehouse").animate({
					height: "0"
				});
				//$("#mask").hide();
				switch($(this).parents(".show").attr("data")){
					case "0":
						let tree = window.Tree.newTree("tree2x.png");
						gameScene.addChild(tree);	
						pub.apiHandle.plant_seed.init();
						break;
					case "1":
						pub.apiHandle.use_fertilizer.init();
						break;
					case "2":
						pub.apiHandle.pick_fruit.init()
						break;
				}
			
	//			var count = 0;
	//			let grass = window.Grass.newGrass();
	//			grass.on('pointerdown', window.Grass.click);
	//			grass.anchor.set(0.5);
	//			gameScene.addChild(grass);
	//			grass.filters = [window.Grass.filerO];
	//			hiding();
	//
	//			let insect = Insect.newInsect();
	//			insect.on('pointerdown', window.Insect.click);
	//			insect.anchor.set(0.5);
	//			gameScene.addChild(insect);
	//			insect.filters = [window.Insect.filerO];
	//			hide()
	//
	//			function hiding() {
	//				requestAnimationFrame(hiding)
	//				grass.scale.x = 1 + Math.sin(count) * 0.04; //动态气泡
	//				grass.scale.y = 1 + Math.cos(count) * 0.04;
	//				count += 0.1;
	//				if(window.Grass.state == 'none') {
	//					if(window.Grass.opcity <= 1) {
	//						window.Grass.opcity -= 0.01;
	//						grass.filters = [new PIXI.filters.AlphaFilter(window.Grass.opcity)];
	//					} else {
	//						window.Grass.state = "play";
	//					}
	//				}
	//			};
	//
	//			function hide() {
	//				requestAnimationFrame(hide)
	//				insect.scale.x = 1 + Math.sin(count) * 0.04; //动态气泡
	//				insect.scale.y = 1 + Math.cos(count) * 0.04;
	//				count += 0.1;
	//				if(window.Insect.state == 'none') {
	//					if(window.Insect.opcity <= 1) {
	//						window.Insect.opcity -= 0.01;
	//						insect.filters = [new PIXI.filters.AlphaFilter(window.Insect.opcity)];
	//					} else {
	//						window.Insect.state = "play";
	//					}
	//				}
	//			};
			})
		},
		trends: function() { //日志
			/*$(".dynamic").on("click", function() {
				$("#trends").animate({
					height: "748px"
				});
				//$("#mask").show();
				pub.apiHandle.trends.init()
			})*/
			/*$(".common_close, #mask").on("click", function() {
				$("#trends").animate({
					height: "0"
				});
				//$("#mask").hide();
			})*/
		},
		frame: function() { //签到
			
			/*$("body").on("click", ".close , .common_mask", function() {
				$("#frame , #mask").hide();
			})*/
		},
		friend: function() { //好友
			
			$("#friend .right").on("click","dl",function(){
	//			pub.apiHandle.friend_farm.init();
				pub.apiHandle.steal_fruit.init();
			})
			$(".friend_bottom").on("click" ,function(){
				pub.apiHandle.farm_friend_add.init()
				console.log(1)
			})
		},
		watering: function() { //浇水
			$(".watering").on("click", function() {
				window.Watering.state = "play";
				pub.apiHandle.water_times.init();
	
			})
		},
		commons: function(ele, num, id) { //共同部分
			/*ele.on("click", function() {
				id.animate({
					height: num
				});
				$("#mask").show();
	
			})
			$(".common_close, #mask").on("click", function() {
				id.animate({
					height: "0"
				});
				$("#mask").hide();
			})*/
		},
		getNowFormatDate: function() {
			var date = new Date();
			var seperator1 = "-";
			var seperator2 = ":";
			var month = date.getMonth() + 1;
			var strDate = date.getDate();
			if(month >= 1 && month <= 9) {
				month = "0" + month;
			}
			if(strDate >= 0 && strDate <= 9) {
				strDate = "0" + strDate;
			}
			var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
				"&nbsp;&nbsp;&nbsp;" + date.getHours() + seperator2 + date.getMinutes() +
				seperator2 + date.getSeconds();
			return currentdate;
		}
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
                pub.scan_qrcode_login.init()
                
            }else{
                common.prompt( d.statusStr );
            }
        });
    };
	//微信自动登录
	pub.scan_qrcode_login = {
		init:function(){
			common.ajaxPost({
	            method: 'scan_qrcode_login',
	            openId : pub.openId
	    	},function( d ){
	            if( d.statusCode == '100000'){
					pub.scan_qrcode_login.apiData(d);		                
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
				var state = 'state=grhFram';
				
				!pub.openId ? (function(){
	 				pub.weixinCode ? pub.get_weixin_code() : common.jumpLinkPlain("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+pub.appid+"&redirect_uri=" + pub.domain + "/html/grhFarm.html&response_type=code&scope=snsapi_userinfo&"+ state+ "&connect_redirect=1#wechat_redirect");
	 			}()) : (function(){
	 				//使用openId去进行登录操作
	 				pub.scan_qrcode_login.init()
	 			}());
			}else{
				common.jumpLinkPlain("../index.html?type=fram");
			}
		}
	}
	
	module.exports = pub;
})