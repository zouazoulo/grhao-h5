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
	};
	console.log(farmCanves)
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
			isNoRead:false,//是否有未读动态
			pageNo:1,//动态的当前页
			isLast:true,//是否是最后一页
			dynamicList:[],//动态的消息列表
		},
		//好友列表
		friedsInfo:[],
		//仓库信息
		storehouseInfo:{
			type:0,
			data:[],
			list:[{
				name:'种子',
				method:'farm_seed_list',
				dataArr:[],
			},{
				name:'道具',
				method:'farm_fertilizer_list',
				dataArr:[]
			},{
				name:'果实',
				method:'farm_fruit_list',
				dataArr:[]
			}]
		},
		//土地信息
		landInfo:{
			landList:[]
		},
		//当前农场土地信息
		farmLand:{
			
		},
		//农场作物信息
		cropInfo:null
		/*{
			curGrowthCycle:{
				
			},
			id:null,
			
			 是否有虫  
			 草
			
			hasWeed:false,
			hasWorm:false,
			//是否成熟
			ripe:false,
			//当前阶段剩余小时数
			upHours:0,
		}*/
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
			urlParm:null,//页面URL后面拼接的参数
			isMaskData:null,//表示遮罩显示时候的----使他显示的view对象
			hasSignIn:false,//标示用户是否签到--默认值为false没有签到
			waterTimes:0,//标示当前用户的浇水次数---默认值为0
			farmLandCount:0,//标示当前用户的土地数量---默认值为1
			id:null,//用户的标示不会改变----农场的ID
			userInfo:{},//用户信息
			signIn:{},//用户签到信息
			farmLevel:{},//农场等级信息
			//仓库信息
			storehouseInfo:{
				type:0,
				data:[],
				list:[{
					name:'种子',
					method:'farm_seed_list',
					dataArr:[],
				},{
					name:'道具',
					method:'farm_fertilizer_list',
					dataArr:[]
				},{
					name:'果实',
					method:'farm_fruit_list',
					dataArr:[]
				}]
			},
			/*
			 //动态消息对象
			 * */
			dynamicInfo:{
				isNoRead:false,//是否有未读动态
				pageNo:1,//动态的当前页
				isLast:true,//是否是最后一页
				dynamicList:[],//动态的消息列表
			},
			friedsInfo:[],//好友信息列表
			//土地信息
			landInfo:{
				landList:[]
			},
			//农场当前的土地信息
			farmLand:{
				
			},
			//农场当前的作物信息
			cropInfo:null
			/*{
				curGrowthCycle : {
					logo:'../img/farmImg/emptyLand.png'
				}
			}*/
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
        			//farmCanves.creatCanves();
        			
        			pub.mainView.init();
        			pub.eventHandle.init();
        		}
				
        	},
        	cropInfo:function(val,oldVal){
        		console.log(oldVal);
        		console.log("val="+val+",oldVal="+oldVal);
        		//changeData()
        		/*function changeData(){
        			console.log(1)
        			if (pub.mainView.status == 1) {
        				var fruitId = val.id;
        				var farmLandId = val.farmLandId;
        				pub.mainView.creatTreeContainer(val);
        				
        				
        				var hasWeed = val.hasWeed;
        				if (hasWeed) {
        					pub.mainView.creatGrass({
        						type:'grass',
        						id:fruitId,
        						click:pub.apiHandle.weed_out
        					})
        				}
        				var hasWorm = val.hasWorm
        				if (hasWorm) {
        					pub.mainView.creatWorm({
        						type:'worm',
        						id:fruitId,
        						click:pub.apiHandle.farm_disinsection
        					})
        				};
        				var hasRipe = val.hasRipe
        				if (hasRipe) {
        					pub.mainView.creatPick({
        						type:'pick',
        						id:farmLandId,
        						click:pub.apiHandle.pick_fruit
        					})
        				};
        				
        			}else{
        				setTimeout(function(){
		        			changeData()
		        		},100)
        			}
        		}*/
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
				pub.Vue.pageNo = 1;
			},
			//签到
			getSignIn: function (data) {
				if (!this.hasSignIn) {
					pub.apiHandle.signIn.init()					
				}
	      	},
	      	//动态
			getDynamic: function (event) {  
	            console.log("getDynamic ") 
	            //pub.apiHandle.pick_fruit.init(pub.Vue.farmLand.id)
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
	            console.log("getFrieds")
	            pub.apiHandle.farm_friend_list.init()
	      	},
	      	invitationFriend:function(){
	      		console.log("邀请好友")
	      	},
	      	/*
	      	 好友农场
	      	 * */
			goToFarm:function(data){
				var dataId = data.id;
				console.log(this.userInfo.farmId);
				console.log(data)
				if (this.userInfo.farmId == dataId) {
					common.prompt("当前已经在这个农场了");
				}else{
					if (dataId == this.id) {
						pub.apiHandle.friend_farm.init(dataId,1)
					}else{
						pub.apiHandle.friend_farm.init(dataId,2)
					}
					
				}
			},
			//土地
			getLand: function (data) {
	            pub.apiHandle.farm_land_list.init();
	      	},
	      	//土地
			goToLand: function (data) {
				var dataId = data.id;
				if (this.farmLand.id == dataId) {
					
				}else{
					pub.apiHandle.farm_land.init(dataId);
					//pub.apiHandle.friend_farm.init(dataId)
				}
	            //pub.apiHandle.land.init();
	      	},
	      	//仓库
			getStorehouse: function (event,index) {  
	            console.log("getStorehouse ")
	            let target = event.target;
	            if (target) {
	            	pub.apiHandle.storehouse.init(0);
	            }else{
	            	if (pub.Vue.storehouseInfo['list'][index].dataArr.length != 0) {
	            		pub.creatDataModule.storehouseInfo(pub.Vue.storehouseInfo['list'][index].dataArr , index);
	            	}else{
	            		pub.apiHandle.storehouse.init(index);
	            	}
	            }
	      	},
	      	clickStorehoseUse:function(e){
	      		console.log("clickStorehoseUse")  
	      		let target = event.target;
	      		var id = target.getAttribute("data-id");
	      		var type = pub.Vue.storehouseInfo.type;
	      		var landId = pub.Vue.farmLand.id;
	      		var fruitId = pub.Vue.cropInfo.id;
	      		if (type == 0) {
	      			pub.apiHandle.plant_seed.init(id,landId);
	      		}else if (type == 1){
	      			pub.apiHandle.use_fertilizer.init(id,fruitId);
	      		}else if (type == 2){
	      			console.log("duihuan")
	      			//pub.apiHandle.use_fertilizer.init(id,fruitId);
	      		}
	      	},
	      	useSeed:function(){
	      		console.log("useSeed ")  
	      	},
	      	//水
			getWatering: function (data) {  
	            console.log("getWatering ");
	            if (this.waterTimes == 0) {
	            	common.prompt1({
	            		flag:1,
						msg:"没有浇水次数了",
						callback:function(){
							
						}
	            	})
	            }else{
	            	if (this.cropInfo.id) {
	            		var fruitId = this.cropInfo.id;
	            		pub.apiHandle.water_times.init(fruitId)
	            	}else{
	            		common.prompt1({
		            		flag:1,
							msg:"当前土地没有种植作物",
							callback:function(){
								
							}
		            	})
	            	}
	            }
	      	},
	      	/*
	      	 * 添加好友
	      	 */
	      	farm_friend_add:function(){
	      		var otherId = 16;
	      		var id = pub.Vue.userInfo.farmId;
	      		
	      		pub.apiHandle.farm_friend_add.init(id,otherId);
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
				var noteStr='';
				var note = obj.note;
				if (note) {
					note = note.substr(0,note.length -1);
					var noteArr = note.split(",");
					noteStr ='<p>' +  noteArr.join("</p><p>") + "</p>";
				}
				var o = {
					imgUrl:'../img/farmImg/p2x.png',
					htmlStr:noteStr
				};
				pub.Vue.signIn = o;
				pub.Vue.hasSignIn = true;
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
		/*是否有动态消息*/
		isdynamicInfo:function(n){
			if (n) {
				pub.Vue.dynamicInfo = $.extend({},dateModule.dynamicInfo,{
					isNoRead:true,//是否有未读动态
				})
			}
		},
		//动态信息
		dynamicInfo:function(v){
			if (v) {
				var o = {};
				if (pub.Vue.pageNo == 1) {
					o = {
						isNoRead:false,//是否有未读动态
						pageNo:1,//动态的当前页
						isLast:v.isLast,//是否是最后一页
						dynamicList:v.objects,//动态的消息列表
					}
				}else{
					o = $.extend({},pub.Vue.dynamicInfo, {
						isNoRead:false,//是否有未读动态
						pageNo:pub.Vue.pageNo,//动态的当前页
						isLast:v.isLast,//是否是最后一页
						dynamicList:pub.Vue.dynamicInfo.dynamicList.concat(v.objects),//动态的消息列表
					});
				}
				pub.Vue.dynamicInfo = o;
				if (o.pageNo == 1) {
					$("#trends").animate({
						height: "748px"
					});
					pub.Vue.isMask = true;
					pub.Vue.isMaskData = 'dynamicInfo';
				}
				
			}else{
				$("#trends").animate({
					height: "0"
				},function(){
					pub.Vue.dynamicInfo = dateModule.dynamicInfo;
					pub.Vue.isMask = false;
					pub.Vue.isMaskData = null;
				});
			}
		},
		//好友列表
		friedsInfo:function(obj){
			if (obj) {
				var o = obj.objects;
				
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
					pub.Vue.friedsInfo = dateModule.friedsInfo;
					pub.Vue.isMask = false;
					pub.Vue.isMaskData = null;
				});
			}
		
		},
		//当前农场土地信息
		farmLand:function(obj){
			if (obj) {
				pub.Vue.farmLand = obj;
			}else{
				pub.Vue.farmLand = dateModule.farmLand;
			}
		},
		//土地信息
		landInfo:function(obj){
			if (obj) {
				
				pub.Vue.landInfo.landList = obj;
				console.log(pub.Vue.landInfo.landList)
				$("#land").animate({
					height: "956px"
				},function(){
					pub.Vue.isMask = true;
					pub.Vue.isMaskData = 'landInfo';
				});
			}else{
				$("#land").animate({
					height: "0"
				},function(){
					pub.Vue.landInfo = dateModule.landInfo;
					pub.Vue.isMask = false;
					pub.Vue.isMaskData = null;
				});
			}
		},
		//切换土地的接口
		farm_land:function(v){
			var farmLand = v.farmLand;
			var farmLandFruit = v.farmLandFruit;
			if (farmLand) {
				pub.Vue.farmLand = farmLand;
			}else{
				pub.Vue.farmLand = dateModule.farmLand;
			}
			if (farmLandFruit) {
				pub.Vue.cropInfo = farmLandFruit;
				console.log(farmLandFruit)
				pub.mainView.creatTreeContainer(farmLandFruit);
			}else{
				console.log("-------------")
				pub.Vue.cropInfo = dateModule.cropInfo;
				console.log(dateModule.cropInfo)
				pub.mainView.creatTreeContainer(dateModule.cropInfo);
			}
			pub.creatDataModule.landInfo(false);
		},
		//仓库
		storehouseInfo:function(obj,type){
			if (obj) {
				dateModule.storehouseInfo.data = obj;
				dateModule.storehouseInfo['list'][type].dataArr = obj;
				dateModule.storehouseInfo['type'] = type;
				if (type == 0) {
					pub.Vue.isMask = true;
					pub.Vue.isMaskData = 'storehouseInfo';
					$("#storehouse").animate({
						height: "610px"
					});
				}else if (type == 1) {
				}else if (type == 2) {
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
		cropInfo:function(obj){
			if (obj) {
				pub.Vue.cropInfo= obj;
			}else{
				pub.Vue.cropInfo = dateModule.cropInfo;
			}
			//
		},
		/*
      	种种子
      	 * */
      	plant_seed:function(v){
      		//操作记录
      		var operationRcd = v.operationRcd;
      		pub.creatDataModule.operationRcd(operationRcd);
      		
      		//农场的作物动态模型
      		var farmLandFruit = v.farmLandFruit;
      		console.log(farmLandFruit)
      		pub.mainView.creatTreeContainer(farmLandFruit);
      		
      	},
      	/*
      	 使用化肥
      	 * */
      	use_fertilizer:function(v){
      		//操作记录
      		var operationRcd = v.operationRcd;
      		pub.creatDataModule.operationRcd(operationRcd);
      		
      		//农场的作物动态模型
      		var farmLandFruit = v.farmLandFruit;
      		console.log(farmLandFruit)
      		pub.mainView.creatTreeContainer(farmLandFruit);
      	},
      	/*
      	 采摘
      	 * */
      	pick_fruit:function(v){
      		//操作记录
      		pub.creatDataModule.operationRcd(v);
      		
      		//农场的作物动态模型
      		var farmLandFruit = dateModule.cropInfo;
      		pub.mainView.creatTreeContainer(farmLandFruit);
      	},
      	/*
      	 除虫
      	 * */
      	farm_disinsection:function(v){
      		//操作记录
      		var operationRcd = v.operationRcd;
      		pub.creatDataModule.operationRcd(operationRcd);
      		
      		//农场的作物动态模型
      		var farmLandFruit = v.farmLandFruit;
      		console.log(farmLandFruit)
      		pub.mainView.creatTreeContainer(farmLandFruit);
      		
      	},
      	/*
      	 除草
      	 * */
      	weed_out:function(v){
      		//操作记录
      		var operationRcd = v.operationRcd;
      		pub.creatDataModule.operationRcd(operationRcd);
      		
      		//农场的作物动态模型
      		var farmLandFruit = v.farmLandFruit;
      		console.log(farmLandFruit)
      		pub.mainView.creatTreeContainer(farmLandFruit);
      	},
      	/*
      	 浇水
      	 * */
      	water_times:function(v){
      		//操作记录
      		var operationRcd = v.operationRcd;
      		pub.creatDataModule.operationRcd(operationRcd);
      		
      		//农场的作物动态模型
      		var farmLandFruit = v.farmLandFruit;
      		console.log(farmLandFruit)
      		pub.mainView.creatTreeContainer(farmLandFruit);
      	},
      	//操作记录
      	operationRcd:function(oper){
      		console.log(oper);
      		if (oper.type == 7) {
      			common.prompt1({
					flag:1,
					msg:oper.note,
					callback:function(){
						
					}
				});
      			pub.creatDataModule.storehouseInfo(false);
      		}else if (oper.type == 4) {
      			common.prompt1({
					flag:1,
					msg:oper.note,
					callback:function(){
						
					}
				});
      			pub.creatDataModule.storehouseInfo(false);
      		}else if (oper.type == 3) {
      			common.prompt1({
					flag:1,
					msg:oper.note,
					callback:function(){
						
					}
				});
      		}
      	},
      	/*
      	 好友农场
      	 * */
      	friend_farm:function(v){
      		console.log(v);
      		
      		pub.creatDataModule.userInfo(v.farmer);
			pub.creatDataModule.farmLevel(v.farmLevel , v.farm);
			pub.creatDataModule.farmLand(v.farmLand);
			pub.creatDataModule.farmLandCount(v.farmLandCount);
			pub.creatDataModule.cropInfo(v.farmLandFruit);
			
			pub.mainView.creatTreeContainer(v.farmLandFruit);
			
			pub.creatDataModule.friedsInfo(false);
      	}
	}
	
	
	//农场接口
	pub.apiHandle = {
		init: function() {
			pub.mainView = farmCanves.mainView;
			pub.apiHandle.farm_main.init();
		},
		farm_main:{
			init: function() {
				common.ajaxPost({
					method: 'farm_main',
					userId: pub.userId
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_main.apiData(d) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d) {
				var v = d.data;
				
				pub.Vue.id = v.farmer.id;
				
				pub.creatDataModule.userInfo(v.farmer);
				pub.creatDataModule.farmLevel(v.farmLevel , v.farm);
				pub.creatDataModule.hasSignIn(v.hasSignIn);
				pub.creatDataModule.waterTimes(v.waterTimes);
				pub.creatDataModule.farmLandCount(v.farmLandCount);
				pub.creatDataModule.isdynamicInfo(v.operationCount);
				pub.creatDataModule.farmLand(v.farmLand);
				
				pub.creatDataModule.cropInfo(v.farmLandFruit);
				/*
				 数据请求成功
				*/
				pub.Vue.PageStatus = PageStatus.interaction;
				
				//加好友
				if (false) {
					pub.Vue.farm_friend_add();
				}else{
					
				}
				pub.apiHandle.farm_level.init();
			}
		},
		//等级列表接口
		farm_level:{
			init:function(){
				common.ajaxPost({
					method: 'farm_level'
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_level.apiData(d) : common.prompt(d.statusStr);
				})
			},
			apiData:function(d){
				var v = d.data;
				console.log(v);
			}
		},
		//土地接口
		farm_land_list: { 
			init: function() {
				common.ajaxPost({
					method: 'farm_land_list',
					farmerId: pub.Vue.userInfo.farmId
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_land_list.apiData(d) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d) {
				var v = d.data;
				pub.creatDataModule.landInfo(v);
			}
	
		},
		farm_land:{
			init: function(id) {
				common.ajaxPost({
					method: 'farm_land',
					farmLandId: id
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_land.apiData(d) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d) {
				var v = d.data;
				pub.creatDataModule.farm_land(v);
			}
		},
		//仓库
		storehouse: { 
			init: function(type) {
				var type = type || 0;
				pub.apiHandle.storehouse.api.init(type);
			},
			api:{
				init:function(type){
					common.ajaxPost({
						method: pub.Vue.storehouseInfo['list'][type].method,
						farmerId: pub.Vue.userInfo.farmId,
						pageNo: pub.Vue.pageNo,
						pageSize: pub.bigSize,
					}, function(d) {
						d.statusCode == "100000" ? pub.apiHandle.storehouse.api.apiData(d,type) : common.prompt(d.statusStr);
					})
				},
				apiData: function(d,type) {
					var v = d.data;
					var html = "";
					pub.creatDataModule.storehouseInfo(v.objects,type);
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
					d.statusCode == "100000" ? pub.apiHandle.farm_friend_list.apiData(d) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d) {
				var v = d.data;
				pub.creatDataModule.friedsInfo(v);
				
			}
		},
		farm_friend_add:{ //添加好友
			init: function(ownId,otenerId) {
				common.ajaxPost({
					method: "farm_friend_add",
					ownId:ownId,
					otherId:otenerId,
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_friend_add.apiData(d) : common.prompt(d.statusStr);
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
					d.statusCode == "100000" ? pub.apiHandle.trends.apiData(d) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d) {
				var v = d.data;
				pub.creatDataModule.dynamicInfo(v);
			}
		},
		signIn: { //签到
			init: function() {
				common.ajaxPost({
					method: 'farm_sign_in',
					farmerId: pub.Vue.userInfo.farmId
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.signIn.apiData(d) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d) {
				var v = d.data;
				pub.creatDataModule.signIn(v);
				
			}
		},
		weed_out: { //除草
			init: function(id,call_back) {
				common.ajaxPost({
					method: 'weed_out',
					farmLandFruitId:id
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.weed_out.apiData(d,call_back) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d,call_back) {
				var v = d.data;
				pub.creatDataModule.weed_out(v);
				call_back();
			}
		},
		farm_disinsection: { //除虫
			init: function(id,call_back) {
				common.ajaxPost({
					method: 'farm_disinsection',
					farmLandFruitId: id
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_disinsection.apiData(d,call_back) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d,call_back) {
				var v = d.data;
				pub.creatDataModule.farm_disinsection(v);
				call_back();
			}
		},
		water_times: { //浇水
			init: function(id,call_back) {
				common.ajaxPost({
					method: 'water_times',
					farmLandFruitId: id
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.water_times.apiData(d,call_back) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d,call_back) {
				var v = d.data;
				pub.creatDataModule.water_times(v);
				call_back();
			}
	
		},
		//采摘水果
		pick_fruit: { 
			init: function(landId,call_back) {
				common.ajaxPost({
					method: 'pick_fruit',
					farmLandId: landId,
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.pick_fruit.apiData(d,call_back) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d,call_back) {
				var v = d.data;
				pub.creatDataModule.pick_fruit(v);
				call_back();
			}
		},
		//种种子
		plant_seed: { 
			init: function(seedId,landId) {
				common.ajaxPost({
					method: 'plant_seed',
					farmSeedId: seedId,
					farmLandId: landId
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.plant_seed.apiData(d) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d) {
				var v = d.data;
				//种种子
				pub.creatDataModule.plant_seed(v)
				
			}
		},
		//使用化肥
		use_fertilizer: { 
			init: function(id,fruitId) {
				common.ajaxPost({
					method: 'use_fertilizer',
					fertilizerId: id,
					farmLandFruitId: fruitId
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.use_fertilizer.apiData(d) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d) {
				var v = d.data;
				pub.creatDataModule.use_fertilizer(v);
			}
		},
		//好友农场
		friend_farm:{
			init: function(id,type) {
				common.ajaxPost({
					method: 'friend_farm',
					farmerId: id
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.friend_farm.apiData(d,type) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d,type) {
				var v = d.data;
				pub.creatDataModule.friend_farm(v);
				
				pub.Vue.PageType = type;
			}
		},
		steal_fruit:{
			init: function() {
				common.ajaxPost({
					method: 'steal_fruit',
					farmerId: 4,
					farmLandFruitId:21
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.steal_fruit.apiData(d) : common.prompt(d.statusStr);
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
			//pub.eventHandle.watering();
		},
		storehouse: function() { //仓库
			
			
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
				var state = 'state='+pub.state;
				
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