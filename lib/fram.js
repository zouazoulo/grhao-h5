define('fram',['common','farmCanves','framView','vue'],function(require, exports, module){
	
	var common = require('common');
	
	var farmCanves = require('farmCanves');
	
	var framView = require("framView");
	
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
		
		changeScene:3,//表示改变场景时候的状态
		
		changeSceneError:-3,//改变场景时候请求接口失败（土地，好友，）
		
		
	}
	let PageType = 1;//1为默认情况  为自己农场场景  2表示为好友农场场景
	
	
	
	/*
	使用VUe的双向数据绑定
	实现页面的状态管理
	 * */
	pub.Vue = new Vue({
		el: '#appVue',
		data: {
			PageStatus : PageStatus.Initialization,
			PageType : PageType,
			
		},
        beforeCreate : function(){
        	
        },
        created : function(){
        	console.log("created			//创建完成")
        	
        },
        beforeMount : function(){
        	console.log("beforeMount		//挂载之前")
        	/*console.log(this)
        	console.log(this.goodsObj.length)*/
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
			getCardNum: function (data, on) {  
	            pub.vue1.$emit('translate', data);  
	      	}
		}
	})
	
	//农场接口
	pub.apiHandle = {
		init:function(){
			var main = framView.apiHandle.index;
			console.log(main.init())
		},
		
	}
	pub.apiHandle = {
		init: function() {
			pub.apiHandle.index.init();
		},
		index: { //农场主页接口
			init: function() {
				common.ajaxPost({
					method: 'farm_main',
					userId: 1
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.index.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function(d) {
				var v = d.data;
				var html = "";
	
				html = `<div class="top clearfix">
							<p class="user_name fl">${v.farmer.petName}</p>
							<p class="sign icon_rash fr" ><span>签到</span></p>
						</div>
						<div class="bottom">
							<span class='level'></span>
							<div class="blue_bg">
								<div class="data">
										<span class="left">
											${v.farmLevel.levelNum}
										</span>
										<span class="middle">
											${v.farmLevel.startExp}/${v.farmLevel.endExp}
										</span>
										<span class="right">
											${v.farmLevel.levelNum + 1}
										</span>
									</div>
								<div class="exp" style="width:${v.farm.exp}">
								</div>
							</div>
						</div>`
				$(".content").append(html);
				
				
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
					farmId: 2
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.land.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function(d) {
				var v = d.data;
				var html = "";
	
				for(var i in v) {
					html += `<li data="${v[i].id}">
								<dl class="active"></dl>
								<p class="color_b">${v[i].no}号土地</p>
								</li>`
	
				}
				$(".land_content")[0].innerHTML = html;
			}
	
		},
		storehouse: { //仓库
			init: function() {
				pub.apiHandle.storehouse.seed.init();
			},
			seed: { // 种子
				init: function() {
					common.ajaxPost({
						method: 'farm_seed_list',
						farmerId: 3,
						pageNo: 1,
						pageSize: 1
					}, function(d) {
						d.statusCode == "100000" ? pub.apiHandle.storehouse.seed.apiData(d) : console.log("未知参数");
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
					$(".show")[0].innerHTML = html
					$(".show").width(270 * num)
				}
			},
			fertilizer: { //化肥
				init: function() {
					common.ajaxPost({
						method: 'farm_fertilizer_list',
						farmerId: 3,
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
						html += `<dl data="${v[i].fertilizeId}">
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
						farmerId: 3,
						pageNo: 1,
						pageSize: 1
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
		trends: { //动态
			init: function() {
				common.ajaxPost({
					method: 'operation_rcd_list',
					firmId: 2,
					pageNo: 1,
					pageSize: 11
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.trends.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function(d) {
				var v = d.data;
				var html = "";
				for(var i in v) {
					html += `<li>
							<p> ${pub.event.getNowFormatDate()}</p>
							<p>${v[i].p}</p>
						</li>`
				}
				$('.trends_content').append(html)
			}
		},
		frame: { //签到
			init: function() {
				console.log(common)
				common.ajaxPost({
					method: 'farm_sign_in',
					farmerId: 1
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.frame.apiData(d) : console.log("未知参数");
				})
			},
			apiData: function(d) {
				var v = d.data;
				var html = "";
				html = `<div id="frame" class="frame" style="display:none">
								<span class="close"></span>
								<div class="icon">
									<img src="./img/p2x.png" alt="" />
								</div>
								<p>${v.exp}</p>
								<p>浇水次数 + 3</p>
								<p>${v.fertilizer}</p>
							</div>
						<div id ="mask" class="common_mask" style="display:none"></div>`
				$("body").append(html)
			}
		},
		weed_out: { //除草
			init: function() {
				common.ajaxPost({
					method: 'weed_out',
					farmLandFruitId: 1
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
					farmLandFruitId: 1
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
					farmSeedId: 1,
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
					farmerId: 3,
					seedId: 1,
					farmLandId: 1
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
					farmLandFruitId: 1
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
					farmLandFruitId: 1
				}, function(d) {
					d.statusCode == "100000" ? pub.apiHandle.farm_disinsection.apiData(d) : console.log("未知参数");
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
			pub.eventHandle.frame();
			
			pub.eventHandle.trends();
			pub.eventHandle.land();
			
			pub.eventHandle.storehouse();
			pub.eventHandle.watering();
		},
		
		land: function() { //土地
			pub.eventHandle.commons($(".land"), '956px', $("#land"));
			$(".land_content").on("click", " li", function() {
				$(".common_wrap").animate({
					height: "0px"
				});
				$("#mask").hide();
			})
	
		},
		storehouse: function() { //仓库
			$(".storehouse").on("click", function() {
				$("#storehouse").animate({
					height: "610px"
				});
				$("#mask").show();
				//				pub.apiHandle.storehouse.seed.init();
				$(".menu li").eq(0).addClass("active").siblings().removeClass("active");
			})
			$(".common_close, #mask").on("click", function() {
				$("#storehouse").animate({
					height: "0"
				});
				$("#mask").hide();
			})
	
			//pub.event.commons($(".storehouse"),'610px',$("#storehouse"));
			$(".menu li").on("click", function() {
				$(this).addClass("active").siblings().removeClass("active");
				switch($(this).attr("data")) {
					case "0":
						pub.apiHandle.storehouse.seed.init()
						break;
					case "1":
						pub.apiHandle.storehouse.fertilizer.init()
						break;
					case "2":
						pub.apiHandle.storehouse.fruit.init()
						break;;
				}
			})
		},
		trends: function() { //日志
			pub.eventHandle.commons($(".dynamic"), '748px', $("#trends"));
			$(".trends_wrap").on("click", ".load_more", function() {
	
				pub.apiHandle.trends.apiData()
			})
		},
		frame: function() { //签到
			$(".content").on("click", ".icon_rash", function() {
				$("#frame , #mask").show();
			})
			$("body").on("click", ".close , .common_mask", function() {
				$("#frame , #mask").hide();
			})
		},
		friend: function() { //好友
			pub.eventHandle.commons('500px');
		},
		watering: function() { //浇水
			$(".watering").on("click", function() {
				window.Watering.state = "play";
	
			})
		},
		commons: function(ele, num, id) { //共同部分
			ele.on("click", function() {
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
			})
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