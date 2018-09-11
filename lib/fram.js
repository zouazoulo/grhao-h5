define('fram',['common','farmCanves','framView','vue'],function(require, exports, module){
	
	var common = require('common');
	var farmCanves = require('farmCanves');
	var framView = require("framView");
	
	// 农场命名空间
	var pub = {};
	
	pub._state = common.getUrlParam('farmerId');
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
	let PageType = 1;//1为默认情况  为自己农场场景  2表示为好友农场场景

	let maskCloudData = {
		inTime:800,
		outTime:1200,
		data:[{
			name:'clold1',
			star:{
				x:720,y:-300,
			},
			end:{
				x:90,y:10,
			},
		},{
			name:'clold2',
			star:{
				x:720,y:100,
			},
			end:{
				x:50,y:160,
			},
		},{
			name:'clold3',
			star:{
				x:720,y:600,
			},
			end:{
				x:100,y:360,
			},
		},{
			name:'clold4',
			star:{
				x:-1100,y:-100,
			},
			end:{
				x:-700,y:100,
			},
		},{
			name:'clold5',
			star:{
				x:-1100,y:400,
			},
			end:{
				x:-700,y:400,
			},
		},{
			name:'clold6',
			star:{
				x:-1100,y:1100,
			},
			end:{
				x:-100,y:690,
			},
		},{
			name:'clold7',
			star:{
				x:0,y:-1000,
			},
			end:{
				x:-250,y:-350,
			},
		}]
		
		
	};
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
		cropInfo:null,
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
		sharData:{
			title:"果然好农场，免费种植水果送回家",
			imgUrl:'http://testboss.grhao.cn/img_root/custom_active/zt3/laohuji.png',
			desc:'和我一起种水果吧！！！'
			
		}
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
			isWx:false,//是否是微信环境
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
			cropInfo:null,
			/*{
				curGrowthCycle : {
					logo:'../img/farmImg/emptyLand.png'
				}
			}*/
			/*
			 农场等级列表
			 * */
			farm_level:[],
			/*
			 标示 一个ajax请求的状态
			 none 表示当前没有请求
			 wait 表示一个请求在等待中
			 fail 请求失败
			 success成功
			 * */
			ajaxState:'wait',
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
		    getWidth: function () {
		      if (this.storehouseInfo.data.length > 2) {
		      	return (this.storehouseInfo.data.length * 270)+"px"
		      }else{
		      	return "630px"
		      }
		      
		    },
		    __width:function(){
		    	var farmLevel = this.farmLevel;
		    	var farm_level = this.farm_level;
		    	var farm_grade = farmLevel.levelNum;
		    	var farmExp = farmLevel.exp;
		    	
		    	var num =  getGrade(farmExp,farm_grade,farm_level)
		    	console.log(num)
		    	if (num) {
		    		num = num -1;
		    		return ((farmExp - farm_level[num].startExp)/(farm_level[num].endExp-farm_level[num].startExp))*400 +"px"
		    	}else{
		    		return '1px'
		    	}
		    	
		    	//简单的判断--递归--当前信息----等级信息
		    	function getGrade(farmExp,farm_grade,farm_level){
		    		if (farm_level[farm_grade]) {
		    			//console.log(farm_level[farm_grade].endExp)
		    			if (farmExp >  farm_level[farm_grade].endExp) {
			    			return getGrade(farmExp,(farm_grade+1),farm_level)
			    		}else{
			    			return farm_grade;
			    		}
		    		}else{
		    			return false;
		    		}
		    	}
		    },
		    getFriedsWidth:function(){
		    	if (this.friedsInfo.length > 3) {
			      	return (this.friedsInfo.length * 232)+"px"
			    }else{
			      	return "750px"
			    }
		    },
		    expHtml:function(){
		    	var farmLevel = this.farmLevel;
		    	var farm_level = this.farm_level;
		    	var farm_grade = farmLevel.levelNum;
		    	var farmExp = farmLevel.exp;
		    	
		    	var num =  getGrade(farmExp,farm_grade,farm_level)
		    	console.log(num)
		    	if (num) {
		    		num = num -1;
		    		return ((farmExp - farm_level[num].startExp)+'/'+(farm_level[num].endExp-farm_level[num].startExp));
		    	}
		    	
		    	//简单的判断--递归--当前信息----等级信息
		    	function getGrade(farmExp,farm_grade,farm_level){
		    		if (farm_level[farm_grade]) {
		    			//console.log(farm_level[farm_grade].endExp)
		    			if (farmExp >  farm_level[farm_grade].endExp) {
			    			return getGrade(farmExp,(farm_grade+1),farm_level)
			    		}else{
			    			return farm_grade;
			    		}
		    		}else{
		    			return false;
		    		}
		    	}
		    	
		    }
		},
        watch : {
        	PageStatus:function(val,oldVal){
        		console.log("val="+val+",oldVal="+oldVal);
        		if (val == 2 && oldVal == 1) {
        			
        		}
        	},
        	cropInfo:function(val,oldVal){
        		console.log(oldVal);
        		console.log("val="+val+",oldVal="+oldVal);
        		val = $.extend({},val, {
        			'weed':pub.apiHandle.weed_out,
        			'worm':pub.apiHandle.farm_disinsection,
        			'pick':pub.apiHandle.pick_fruit,
        			'steal':pub.apiHandle.steal_fruit,
        			'pageType':pub.Vue.PageType
        		});
        		changeData()
        		function changeData(){
        			if (pub.mainView.status == 1) {
        				pub.mainView.creatTreeContainer(val,pub.Vue.id);
        			}else{
        				setTimeout(function(){
		        			changeData()
		        		},100)
        			}
        		}
        	}
        },
		methods: {
			goBack:function(){
				
				if (pub.Vue.PageType == 2) {
					//pub.apiHandle.friend_farm.init(this.id,1)
					
					pub.maskView.maskMove();
					setTimeout(function(){
						pub.apiHandle.farm_main.init();
					},700)
				}else{
					console.log("back")
					window.location.href = "../html/my.html"
				}
			},
			goToRule:function(){
				window.location.href = "../html/farmRule.html"
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
				pub.apiHandle.trends.init();
				pub.Vue.ajaxState = 'wait'
				
				$("#trends").removeClass("dynamic-wrapper-hide").addClass("dynamic-wrapper-show")
				pub.Vue.isMask = true;
				pub.Vue.isMaskData = 'dynamicInfo';
	      	},
	      	clickGetMoreDynamic:function(){
	      		if (pub.Vue.dynamicInfo.isLast) {
	      		}else{
	      			pub.Vue.pageNo += 1;
	      			pub.apiHandle.trends.init()
	      		}
	      		
	      	},
	      	//好友
			getFrieds: function (data) {  
	            console.log("getFrieds")
	            pub.apiHandle.farm_friend_list.init();
	            pub.Vue.ajaxState = 'wait'
	            pub.Vue.isMask = true;
				pub.Vue.isMaskData = 'friedsInfo';
				$("#friend").removeClass("friend-wrapper-hide").addClass("friend-wrapper-show");
				/*$("#friend").show();
				$("#friend").animate({
					height: "526px"
				});*/
	      	},
	      	invitationFriend:function(){
	      		console.log("邀请好友");
	      		pub.creatDataModule.friedsInfo(false);
	      		setTimeout(function(){
	      			common.prompt1({
		                flag:1,
		                msg:"点击右上角，发送给指定微信好友<br/>好友点击链接后即可成为好友",
		                callback:function(){
							
		                }
		            })
	      		},300)
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
					pub.maskView.maskMove();
					setTimeout(function(){
						if (dataId == pub.Vue.id) {
							pub.apiHandle.friend_farm.init(dataId,1)
						}else{
							pub.apiHandle.friend_farm.init(dataId,2)
						}
					},700)
					
				}
			},
			//土地
			getLand: function (data) {
	            pub.apiHandle.farm_land_list.init();
	            this.ajaxState = 'wait';
	            $("#land").removeClass("landInfo-wrapper-hide").addClass("landInfo-wrapper-show")
	            pub.Vue.isMask = true;
				pub.Vue.isMaskData = 'landInfo';
	            /*$("#land").show();
				$("#land").animate({
					height: "956px"
				},function(){
					pub.Vue.isMask = true;
					pub.Vue.isMaskData = 'landInfo';
				});*/
	      	},
	      	//土地
			goToLand: function (data) {
				var dataId = data.id;
				if (dataId) {
					if (this.farmLand.id == dataId) {
						
					}else{
						pub.maskView.maskMove();
						setTimeout(function(){
							pub.apiHandle.farm_land.init(dataId);
						},700)
					}
				}else{
					
				}
				
	      	},
	      	//仓库
			getStorehouse: function (event,index) {  
	            console.log("getStorehouse ")
	            let target = event.target;
	            if (target) {
	            	pub.apiHandle.storehouse.init(0);
	            	pub.Vue.ajaxState = 'wait';
	            	pub.Vue.isMask = true;
					pub.Vue.isMaskData = 'storehouseInfo';
					$("#storehouse").removeClass("storehouse-wrapper-hide").addClass("storehouse-wrapper-show");
					/*$("#storehouse").show();
					$("#storehouse").animate({
						height: "610px"
					});*/
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
	      		console.log()
	      		var id = target.getAttribute("data-id");
	      		var type = pub.Vue.storehouseInfo.type;
	      		var landId = pub.Vue.farmLand.id;
	      		var fruitId
	      		if (type == 0) {
	      			pub.apiHandle.plant_seed.init(id,landId);
	      		}else if (type == 1){
	      			if (pub.Vue.cropInfo) {
                        fruitId = pub.Vue.cropInfo.id;
                        pub.apiHandle.use_fertilizer.init(id,fruitId);
					}else {
                        common.prompt1({
                            flag:1,
                            msg:"当前土地没有种植作物",
                            callback:function(){

                            }
                        })
					}
	      		}else if (type == 2){
	      			console.log("duihuan")
	      			//pub.apiHandle.use_fertilizer.init(id,fruitId);
	      			var index = target.getAttribute("data-index");
	      			var data = pub.Vue.storehouseInfo.data[index];
	      			sessionStorage.setItem("farmFruit",JSON.stringify(data));
	      			window.location.href = "../html/farmExchange.html"
	      		}
	      	},
	      	useSeed:function(){
	      		console.log("useSeed ")  
	      	},
	      	//水
			getWatering: function (data) {  
	            console.log("getWatering ");
	            console.log(this.waterTimes)
	            if (this.waterTimes == "x0") {
	            	common.prompt1({
	            		flag:1,
						msg:"您今天的浇水次数已经用完咯！",
						callback:function(){
						}
	            	})
	            }else{
	            	if (this.cropInfo) {
	            		if (!this.cropInfo.hasRipe) {
	            			console.log(!$(".watering").data("isClick"))
	            			if (!$(".watering").data("isClick")) {
	            				$(".watering").data("isClick",true);
	            				var fruitId = this.cropInfo.id;
			            		pub.apiHandle.water_times.init(fruitId,function(){
			            			pub.mainView.creatWater();
			            		})
	            			}
	            			
		            		
	            		}else{
	            			common.prompt1({
			            		flag:1,
								msg:"当前作物已成熟，不能浇水哦！",
								callback:function(){
								}
			            	})
	            		}
	            	}else{
	            		common.prompt1({
		            		flag:1,
							msg:"当前土地没有种植作物哦！",
							callback:function(){
							}
		            	})
	            	}
	            }
	      	},
	      	/*
	      	 * 添加好友
	      	 */
	      	farm_friend_add:function(otherId){
	      		var otherId = otherId;
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
				pub.Vue.waterTimes = 'x0' ;
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
					note = note.substr(0,note.length);
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
			}else{
				/*$("#trends").animate({
					height: "0"
				},function(){
					
					$("#trends").hide();
				});*/
				$("#trends").removeClass("dynamic-wrapper-show").addClass("dynamic-wrapper-hide");
				pub.Vue.dynamicInfo = dateModule.dynamicInfo;
				pub.Vue.isMask = false;
				pub.Vue.isMaskData = null;
			}
		},
		//好友列表
		friedsInfo:function(obj){
			if (obj) {
				var o = obj.objects;
				pub.Vue.friedsInfo = o;
			}else{
				$("#friend").removeClass("friend-wrapper-show").addClass("friend-wrapper-hide");
				pub.Vue.friedsInfo = dateModule.friedsInfo;
				pub.Vue.isMask = false;
				pub.Vue.isMaskData = null;
				/*$("#friend").animate({
					height: "0"
				},function(){
					pub.Vue.friedsInfo = dateModule.friedsInfo;
					pub.Vue.isMask = false;
					pub.Vue.isMaskData = null;
					$("#friend").hide();
				});*/
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
			}else{
				$("#land").removeClass("landInfo-wrapper-show").addClass("landInfo-wrapper-hide");
				pub.Vue.landInfo = dateModule.landInfo;
				pub.Vue.isMask = false;
				pub.Vue.isMaskData = null;
				/*$("#land").animate({
					height: "0"
				},function(){
					pub.Vue.landInfo = dateModule.landInfo;
					pub.Vue.isMask = false;
					pub.Vue.isMaskData = null;
					$("#land").hide();
				});*/
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
			}else{
				pub.Vue.cropInfo = dateModule.cropInfo;
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
					
				}else if (type == 1) {
				}else if (type == 2) {
				}
				console.log(dateModule.storehouseInfo)
				
				pub.Vue.storehouseInfo = dateModule.storehouseInfo;
				
			}else{
				$("#storehouse").removeClass("storehouse-wrapper-show").addClass("storehouse-wrapper-hide");
				dateModule.storehouseInfo.data = dateModule.storehouseInfo.list[0]['dataArr'] 
					= dateModule.storehouseInfo.list[1]['dataArr'] 
					= dateModule.storehouseInfo.list[2]['dataArr'] = [];
					
				pub.Vue.storehouseInfo = dateModule.storehouseInfo;
				pub.Vue.isMask = false;
				pub.Vue.isMaskData = null;
				/*$("#storehouse").animate({
					height: "0"
				},function(){
					dateModule.storehouseInfo.data = dateModule.storehouseInfo.list[0]['dataArr'] 
					= dateModule.storehouseInfo.list[1]['dataArr'] 
					= dateModule.storehouseInfo.list[2]['dataArr'] = [];
					
					pub.Vue.storehouseInfo = dateModule.storehouseInfo;
					pub.Vue.isMask = false;
					pub.Vue.isMaskData = null;
					$("#storehouse").hide();
				});*/
			}
		},
		cropInfo:function(obj){
			if (obj) {
				pub.Vue.cropInfo= obj;
			}else{
				pub.Vue.cropInfo = dateModule.cropInfo;
			}
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
      		pub.creatDataModule.cropInfo(farmLandFruit)
      		
      		pub.creatDataModule.farmExp(v.farm);
      		pub.creatDataModule.farmLandCount(v.farmLandCount);
      		
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
      		pub.creatDataModule.cropInfo(farmLandFruit)
      		
      		pub.creatDataModule.farmExp(v.farm);
      		pub.creatDataModule.farmLandCount(v.farmLandCount);
      	},
      	/*
      	 采摘
      	 * */
      	pick_fruit:function(v){
      		//操作记录
      		pub.creatDataModule.operationRcd(v.operationRcd);
      		
      		//农场的作物动态模型
      		var farmLandFruit = dateModule.cropInfo;
      		pub.creatDataModule.cropInfo(farmLandFruit)
      		
      		pub.creatDataModule.farmExp(v.farm);
      		pub.creatDataModule.farmLandCount(v.farmLandCount);
      	},
      	/*
      	 偷取
      	 * */
      	steal_fruit:function(v){
      		//操作记录
      		var operationRcd = v.operationRcd;
      		pub.creatDataModule.operationRcd(operationRcd);
      		
      		//农场的作物动态模型
      		var farmLandFruit = v.farmLandFruit;
      		pub.creatDataModule.cropInfo(farmLandFruit)
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
      		pub.creatDataModule.cropInfo(farmLandFruit)
      		
      		pub.creatDataModule.farmExp(v.farm);
      		pub.creatDataModule.farmLandCount(v.farmLandCount);
      		
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
      		pub.creatDataModule.cropInfo(farmLandFruit)
      		
      		pub.creatDataModule.farmExp(v.farm);
      		pub.creatDataModule.farmLandCount(v.farmLandCount);
      	},
      	/*
      	 浇水
      	 * */
      	water_times:function(v){
      		//操作记录
      		var operationRcd = v.operationRcd;
      		setTimeout(function(){
      			pub.creatDataModule.operationRcd(operationRcd);
      		},3000)
      		
      		
      		//农场的作物动态模型
      		var farmLandFruit = v.farmLandFruit;
      		setTimeout(function(){
      			pub.creatDataModule.cropInfo(farmLandFruit);
      			pub.creatDataModule.waterTimes(v.waterTimes);
      			pub.creatDataModule.farmExp(v.farm);
      			pub.creatDataModule.farmLandCount(v.farmLandCount);
      			$(".watering").data("isClick",false);
      		},5000)
      		
      		
      	},
      	//操作记录
      	operationRcd:function(oper){
      		/**
			 * 类型<br>
			 * 1、浇水<br>
			 * 2、除虫<br>
			 * 3、除草<br>
			 * 4、施肥<br>
			 * 5、收割<br>
			 * 6、签到<br>
			 * 7、栽种<br>
			 * 8、偷取<br>
			 * 9、被偷取<br>
			 * 10、水果兑换
			 */
      		if (oper.type == 7 || oper.type == 4) {
      			common.prompt1({
					flag:1,
					msg:oper.note,
					callback:function(){
						
					}
				});
      			pub.creatDataModule.storehouseInfo(false);
      		}else if (oper.type == 3 || oper.type == 2 || oper.type == 1 || oper.type == 5 || oper.type == 8 || oper.type == 9) {
      			common.prompt1({
					flag:1,
					msg:oper.note,
					callback:function(){
						
					}
				});
      		};
      		//pub.creatDataModule.farmExp(oper.exp)
      	},
      	/*
      	 好友农场
      	 * */
      	friend_farm:function(v){
      		
      		pub.creatDataModule.userInfo(v.farmer);
			pub.creatDataModule.farmLevel(v.farmLevel , v.farm);
			pub.creatDataModule.farmLand(v.farmLand);
			pub.creatDataModule.farmLandCount(v.farmLandCount);
			pub.creatDataModule.cropInfo(v.farmLandFruit);
			
			pub.creatDataModule.friedsInfo(false);
      	},
      	farm_level:function(v){
      		console.log(v);
      		
      		pub.Vue.farm_level = v;
      	},
      	/*
      	 农场经验
      	 
      	 参数为浇水之后的经验值
      	 * */
      	farmExp:function(m){
      		console.log(m);
      		
      		//经验值列表
      		var list = pub.Vue.farm_level;
      		
      		var FarmLeave = list[m.grade -1];
      			
      		pub.creatDataModule.farmLevel(FarmLeave,m);
      		var experience = {
      			count:function(a,b){
					return a*400/b
				},
				addExp :function(a,b,c,d,callback){
					let exp = experience.count(a,c); 
					let startexp = experience.count(b,c);
					if( exp + startexp < 400){
						$(".exp").animate({width:startexp+exp},500)
					}
					if(exp + startexp > 400){
						let e = a+b-c ;
						let newExp =  experience.count(e,d); 
						$(".exp").animate({width:startexp+exp},800);
						$(".exp").queue(function () {
						 	$(".exp").css('width','0');
					    	$(this).dequeue();
						});
						$(".exp").animate({width:newExp},500);
					}
				}
      		}
      	}
	}
	
	//农场接口
	pub.apiHandle = {
		init: function() {
			$.ajaxSetup({
				url: common.APIFARM,
			})
			pub.mainView = farmCanves.mainView;
			pub.mainView.init();
			
			pub.maskView = farmCanves.maskView;
			pub.maskView.init({
				className:'canver_change_scene',
				dataModule:maskCloudData,
			});
			
        	pub.eventHandle.init();
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
				
				pub.Vue.PageType = 1;
				
				common.isWeiXin() && (function(){
					var Url = (function(){
						var iswhy = location.href.indexOf("?")
						if (iswhy > 0) {
							return location.href.split("?")[0] + "?farmerId="+v.farm.farmerId;
						}else{
							return location.href+"?farmerId="+v.farm.farmerId;
						}
					})()
	 				common.weixin.config( location.href.split('#')[0] );
	 				var shareData = $.extend({},dateModule.sharData,{
	 					link:Url
	 				})
	 				common.weixin.share( shareData );
	 			}());
				//加好友
				if (sessionStorage.getItem('recommendFarmId') && sessionStorage.getItem('recommendFarmId') != ''  ) {
					if (v.farm.farmerId == sessionStorage.getItem('recommendFarmId')) {
					}else{
						pub.Vue.farm_friend_add(sessionStorage.getItem('recommendFarmId'));
					}
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
				pub.creatDataModule.farm_level(v);
			}
		},
		//土地接口
		farm_land_list: { 
			init: function() {
				common.ajaxPost({
					method: 'farm_land_list',
					farmerId: pub.Vue.userInfo.farmId
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_land_list.apiData(d) : function(){
						common.prompt(d.statusStr);
						pub.Vue.ajaxState = 'fail';
					}
				})
			},
			apiData: function(d) {
				var v = d.data;
				pub.creatDataModule.landInfo(v);
				pub.Vue.ajaxState = 'success'
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
						d.statusCode == "100000" ? pub.apiHandle.storehouse.api.apiData(d,type) : function(){
							common.prompt(d.statusStr);
							pub.Vue.ajaxState = 'fail';
						}
					})
				},
				apiData: function(d,type) {
					var v = d.data;
					var html = "";
					pub.creatDataModule.storehouseInfo(v.objects,type);
					pub.Vue.ajaxState = 'success'
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
					d.statusCode == "100000" ? pub.apiHandle.farm_friend_list.apiData(d) : function(){
						common.prompt(d.statusStr);
						pub.Vue.ajaxState = 'fail';
					}
				})
			},
			apiData: function(d) {
				var v = d.data;
				pub.creatDataModule.friedsInfo(v);
				pub.Vue.ajaxState = 'success'
			}
		},
		farm_friend_add:{ //添加好友
			init: function(ownId,otenerId) {
				common.ajaxPost({
					method: "farm_friend_add",
					ownId:ownId,
					otherId:otenerId,
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_friend_add.apiData(d) : 'common.prompt(d.statusStr)';
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
					d.statusCode == "100000" ? pub.apiHandle.trends.apiData(d) : function(){
						common.prompt(d.statusStr);
						pub.Vue.ajaxState = 'fail';
					}
				})
			},
			apiData: function(d) {
				var v = d.data;
				pub.creatDataModule.dynamicInfo(v);
				pub.Vue.ajaxState = 'success'
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
				pub.creatDataModule.signIn(v.operationRcd);
				pub.creatDataModule.farmExp(v.farm);
				pub.creatDataModule.farmLandCount(v.farmLandCount);
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
					d.statusCode == "100000" ? pub.apiHandle.water_times.apiData(d,call_back) : function(){
						common.prompt(d.statusStr);
						pub.Vue.ajaxState = 'fail';
					}
				})
			},
			apiData: function(d,call_back) {
				var v = d.data;
				
				//pub.creatDataModule.water_times(v);
				
				call_back({
					callBack:pub.creatDataModule.water_times(v),
				});
				pub.Vue.ajaxState = 'success'
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
		//偷取水果
		steal_fruit:{
			init: function(id,call_back) {
				common.ajaxPost({
					method: 'steal_fruit',
					farmerId: pub.Vue.id,
					farmLandFruitId:id,
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.steal_fruit.apiData(d,call_back) : common.prompt(d.statusStr);
				})
			},
			apiData: function(d,call_back) {
				var v = d.data;
				pub.creatDataModule.steal_fruit(v);
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
		
	
	};
	
	
	pub.eventHandle = {
		init:function(){}
	}
	//使用微信code获取openid
	pub.get_weixin_code  = function(){
		$.ajaxSetup({
			url:common.API,
		})
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
			$.ajaxSetup({
				url:common.API,
			})
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
			
			/*
			页面参数初始化
			 * */
			pub.userData = common.user_datafn();
			pub.userId = pub.userData.cuserInfoid;
			//登陆完成后再进行初始化
			pub.apiHandle.init();
    	},
    };
	
	pub.init = function(){
		var recommendFarmId = common.getUrlParam("farmerId");
			if (recommendFarmId) {
				sessionStorage.setItem('recommendFarmId',recommendFarmId)
			}
		if (pub.logined) {
			//登陆完成后再进行初始化
			pub.apiHandle.init();
		}else{
			if (common.isWeiXin()) {
				pub.weixinCode = common.getUrlParam('code'); // 获取url参数
				pub.state = common.getUrlParam("state");//获取url机器编码参数
				var state = 'state=grhfarm';
				/*if (sessionStorage.getItem("recommendFarmId")) {
					state = 'state='+sessionStorage.getItem("recommendFarmId")
				}*/
				console.log(state)
				!pub.openId ? (function(){
	 				pub.weixinCode ? pub.get_weixin_code() : common.jumpLinkPlain("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+pub.appid+"&redirect_uri=" + pub.domain + "/html/grhFarm.html?a=1&response_type=code&scope=snsapi_userinfo&"+ state+ "&connect_redirect=1#wechat_redirect");
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