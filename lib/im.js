/**
* 	index scirpt for Zhangshuo Guoranhao
*/ 
define('im', ['common'], function(require, exports, module){
	
	var common = require('common');

	// 首页 命名空间

	var pub = {};
	
	pub.openId = common.openId.getItem();

	pub.accountRelatived = common.accountRelatived.getItem();

	

	pub.accountRelative = $.Deferred();//主要用户账户关联的延时对象

	pub.storeInfo = null; // 门店信息

	pub.firmId = undefined; // 门店ID
	
	
		
	/*
	 =========================================================
	 * */

	/*
	 */
	//zhaoyh
	var config = {
		userId:'',
		BOSH_SERVICE:'http://im.grhao.com:7070/http-bind/',
		domain:'grhao.com',
		password:'123456',//e10adc3949ba59abbe56e057f20f883e
		toUserId:'',
	}
	var strophe = {
		init:function(options){
			var strophe = this;
			// XMPP服务器BOSH地址
			strophe.BOSH_SERVICE = config.BOSH_SERVICE;
			 
			// XMPP连接
			strophe.connection = null;
			 
			// 当前状态是否连接
			strophe.connected = false;
			 
			// 当前登录的JID
			strophe.userjid = config.userId;
			console.log(strophe.userjid)
			//发送消息的人jid
			strophe.toUserId = config.toUserId;
			console.log(strophe.toUserId)
			strophe.domain = config.domain;
			//用户名
			strophe.userName = config.userId+'@'+config.domain;
			//用户密码
			strophe.userPassword = config.password
			
			strophe.login();
		},
		//用户登录openfire
		login:function(){
			if(!strophe.connected) {
				console.log(config)
				strophe.connection = new Strophe.Connection(strophe.BOSH_SERVICE);
				strophe.connection.connect(strophe.userName, strophe.userPassword, strophe.onConnect);
			
			}
		},
		// 连接状态改变的事件
		onConnect:function (status) {
		    if (status == Strophe.Status.CONNFAIL) {
				alert("连接失败！");
		    } else if (status == Strophe.Status.AUTHFAIL) {
				alert("登录失败！");
		    } else if (status == Strophe.Status.DISCONNECTED) {
				alert("连接断开！");
				shophe.connected = false;
		    } else if (status == Strophe.Status.CONNECTED) {
				console.log("连接！");
				strophe.connected = true;
				
				// 当接收到<message>节，调用onMessage回调函数
				strophe.connection.addHandler(strophe.onMessage, null, 'message', null, null, null);
				
				// 首先要发送一个<presence>给服务器（initial presence）
				strophe.connection.send($pres().tree());
		    }
		},
		// 接收到<message>
		onMessage:function (msg) {
			console.log(msg)
			// 解析出<message>的from、type属性，以及body子元素
		    var from = msg.getAttribute('from');
		    var type = msg.getAttribute('type');
		    var elems = msg.getElementsByTagName('body');
		 
		    if (type == "chat" && elems.length > 0) {
				var body = elems[0],
					str = $(body).html(),
					o = JSON.parse(str),
					mo = {
						ascription:2,// 0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
						type:-1,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
						time:new Date(),//
						txt:'',//如果消息类型为文本，则显示文本内容
						imgUrl:'',//如果消息为图片，则显示图片的链接
						voiceUrl:'',//如果消息为语音则显示语音的链接
						status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
						userImg:'img/user.jpg'//头像地址
					};
				if (o) {
					mo.createTime = o.createTime;
					
					if (o.msgType == 'text') {
						mo.type = 0;
						mo.txt = o.content
					}else if (o.msgType == 'image') {
						mo.type = 1
						mo.imgUrl = o.content
					}else if (o.msgType == 'voice') {
						mo.type = 2;
						mo.voiceUrl = o.content;
						mo.read = '0';
						mo.strVoiceTime = o.strVoiceTime;
					};
					pub.Vue.msgBody.push(mo)
				}
		    }
		    return true;
		},
		//发送消息
		send_msg:function(v,t){
			var content = (function(v){
				if (v.type == 0) {
					return v.txt
				}else if (v.type == 1){
					return v.imgUrl
				}else if (v.type == 2){
					return v.voiceUrl
				}
			})(v);
			var msgType = (function(v){
				if (v.type == 0) {
					return "text"
				}else if (v.type == 1){
					return "image"
				}else if (v.type == 2){
					return 'voice'
				}
			})(v)
			var timestamp = Date.parse(new Date()),
 			bo = {
 				msgId:timestamp,
 				msgType:msgType,
 				createTime:timestamp,
 				content: content,
 				fromUser:strophe.userjid,
 				toUser:strophe.toUserId
 			}
			// 创建一个<message>元素并发送
			var msg = $msg({
				to: strophe.toUserId + '@' + strophe.domain, 
				from: strophe.userjid + '@' + strophe.domain,
				type: 'chat'
			}).c("body", null, JSON.stringify(bo));
			
			strophe.connection.send(msg.tree());
			
		}
	};
	
	//对于可操作区域的数据结构设计
	var data = {
		
		datas:[{
			type:0,//类型默认为0没有数据1表示为语音icon 2表示为键盘icon
			text:'',
			status:'0'//默认为0  没有开始录音的状态  1为开始录音   2 为录音结束  
		},{
			type:0,//类型0默认为input输入框1.为录音按钮
			text:'',
			value:'',
		},{
			type:0,//类型0为默认的add_icon 1.为发送按钮
			text:'',
			active:false//当微信环境下  点击弹出图片，相机，位置信息时为true
		}]
	};
	/*
	 消息data
	 * */
	var msgData = {
		ascription:1,// 0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
		type:0,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
		time:new Date(),//
		txt:'',//如果消息类型为文本，则显示文本内容
		imgUrl:'',//如果消息为图片，则显示图片的链接
		voiceUrl:'',//如果消息为语音则显示语音的链接
		status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
		userImg:''//头像地址
	}
	/*
	 input change 事件
	 * */
	//图片上传
	
	/*
	
	* */
	var pub = {
		strophe:strophe,
	};
	
	pub.Vue = new Vue({
		el: '#app',
		data: {
			openar: data.datas,
			isWx:common.isWeiXin(),//false表示不是微信环境，true 表示是微信环境
			msgBody:[{
				ascription:2,//0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
				type:0,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
				time:'2018年8月13日 16:16',//
				txt:'如果消息类型为文本，则显示文本内容',
				imgUrl:'如果消息为图片，则显示图片的链接',
				voiceUrl:'如果消息为语音则显示语音的链接',
				status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
				userImg:'img/user.jpg'//头像地址
			},{
				ascription:0,//0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
				type:0,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
				time:'2018年8月13日 16:16',//
				txt:'如果消息类型为文本，则显示文本内容',
				imgUrl:'如果消息为图片，则显示图片的链接',
				voiceUrl:'如果消息为语音则显示语音的链接',
				status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
				userImg:''//头像地址
			},{
				ascription:1,//0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
				type:1,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
				time:'2018年8月13日 16:16',//
				txt:'如果消息类型为文本，则显示文本内容',
				imgUrl:'http://zhangshuoinfo.b0.upaiyun.com/1534217467.jpg',
				voiceUrl:'如果消息为语音则显示语音的链接',
				status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
				userImg:'img/user1.jpg',//头像地址
				
			},{
				ascription:2,//0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
				type:2,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
				time:'2018年8月13日 16:16',//
				txt:'如果消息类型为文本，则显示文本内容',
				imgUrl:'如果消息为图片，则显示图片的链接',
				voiceUrl:'http://www.w3school.com.cn/i/song.mp3',
				status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
				userImg:'img/user.jpg',//头像地址
				read:'0',//语音消息读没读的状态 默认为0没有读的状态 1为已读的状态2表示正在播放
				strVoiceTime:'10'
			},{
				ascription:1,//0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
				type:2,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
				time:'2018年8月13日 16:16',//
				txt:'如果消息类型为文本，则显示文本内容',
				imgUrl:'如果消息为图片，则显示图片的链接',
				voiceUrl:'http://www.w3school.com.cn/i/song.mp3',
				status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
				userImg:'img/user.jpg',//头像地址
				read:'0',//语音消息读没读的状态 默认为0没有读的状态 1为已读的状态2表示正在播放
				strVoiceTime:'10'
			},],
			Voice:null,
		},
        beforeCreate : function(){
        	
        	if (common.isWeiXin()) {
        		//初始化操作按钮的数据
        		data.datas[0].type = 1;
        		
        	}
        },
        created : function(){
        	console.log("created			//创建完成")
        	if (common.isWeiXin()) {
	        	//监听语音播放完毕接口
	        	/*pub.wx.onVoicePlayEnd({
					success: function (res) {
						var localId = res.localId; // 返回音频的本地ID
						alert(localId)
					}
				});*/
        	}
        },
        beforeMount : function(){
        	console.log("beforeMount		//挂载之前")
        	
        },
        updated : function(){
        	console.log("updated			//数据被更新后")
        	
        },
		methods: {
			send_msg:function(o,t){
				var d = {},m='';
				if (t == 'img') {
					d = $.extend({},msgData, {
						imgUrl:o.imgUrl,
						userImg:'img/user1.jpg',
						type:1,
						
					});
					m = 'img'
				}else{
					var v = this.openar[1].value;
					if (v) {
						d = $.extend({},msgData, {
							txt:v,
							userImg:'img/user1.jpg'
						});
						m = 'text'
						this.openar[1].value = ''
						this.text_focus();
					}else{
						alert("消息内容不能为空")
					}
				}
				this.msgBody.push(d);
				pub.strophe.send_msg(d,m);
			},
			text_focus:function(d){
				var o = d || true;
				o ? $("#text").focus() : $("#text").blur();
			},
			img_updata:function(d){
				console.log(d);
				var _this = this;
				console.log("非微信环境处理");
				var imgobj = {};
				var input = $("#file");
				input.unbind("click").click();

				console.log("这里是否执行了两次")
		        input.unbind('change').on('change', function (e) {
		            var files = input[0].files,
					fNum = files.length,
					URL = window.URL || window.webkitURL;
					if(!files[0])return;
					console.log(this)
					for(var i=0;i<fNum;i++){
						if(files[i].type.search(/image/)>=0){
							var blob = URL.createObjectURL(files[i]);
							console.log(blob)
						}
					};
					var ext = '.' + document.getElementById('file').files[0].name.split('.').pop();
					var config = {
						bucket: 'zhangshuoinfo',
						expiration: parseInt((new Date().getTime() + 3600000) / 1000),
						// 尽量不要使用直接传表单 API 的方式，以防泄露造成安全隐患
						form_api_secret: 'LaubRPoyoLzq9tJ82/z+RSmFUVY='
					};
					var instance = new Sand(config);
					var options = {
						'notify_url': 'http://zhangshuoinfo.b0.upaiyun.com'
					};
					instance.setOptions(options);
					instance.upload( + parseInt((new Date().getTime() + 3600000) / 1000) + ext);
		        });
		        $(document).unbind('uploaded').on('uploaded', function(e) {
					//pub.person.addLog(e.detail);
					var data = e.originalEvent.detail;
					console.log(data)
					var src = "http://"+data.bucket_name+".b0.upaiyun.com"+data.path;
					imgobj = {
						imgUrl:src,
					}
					_this.send_msg(imgobj,'img')
				});
				
			},
			add_box:function(){
				console.log('add_box')
				pub.Vue.openar[2].active = !pub.Vue.openar[2].active;
			},
			add_img:function(){
				//alert("add_img")
				if (pub.Vue.openar[1].value) {
					console.log("发送消息处理")
					pub.Vue.send_msg('','text');
				}else{
					pub.Vue.img_updata('1');
				}
			},
			getHtml:function(o){
				//0表示文本1表示图片2表示语音
				if(o.type == 0){
					return o.txt;
				}else if (o.type == 1) {
					return "<img src = '"+o.imgUrl+"' />"
				}else if (o.type == 2) {
					return o.strVoiceTime+'"'
				}
			},
			//点击改变语音和键盘图标
			changeIcon:function(){
				this.openar[0].type = (this.openar[0].type == 1 ? 2 : 1);
			},
			//点击录音操作等
			gtouchstart:function(item){
				
				timeOutEvent = setTimeout(function(){
                 	pub.Vue.longPress(item)
              	},500);//这里设置定时器，定义长按500毫秒触发长按事件，时间可以自己改，个人感觉500毫秒非常合适
              	return false;
			},
			 //手释放，如果在500毫秒内就释放，则取消长按事件，此时可以执行onclick应该执行的事件
         	gtouchend:function(item){
            	clearTimeout(timeOutEvent);//清除定时器
            	if(timeOutEvent!=0){
                	//这里写要执行的内容（尤如onclick事件）
                	//vm.goChat(item);
                	console.log("取消长按")
            	}else{
            		console.log("长按结束")
	            	pub.wx.stopRecord({
						success: function (res) {
							var localId = res.localId;
							alert(localId);
						}	
					});
            	}
            	return false;
          	},
        	//如果手指有移动，则取消所有事件，此时说明用户只是要移动而不是长按
        	gtouchmove:function(item){
            	/*clearTimeout(timeOutEvent);//清除定时器
            	timeOutEvent = 0;*/
            	console.log(item)
        	},
        	//真正长按后应该执行的内容
        	longPress:function(item){
            	timeOutEvent = 0;
            	//执行长按要执行的内容，如弹出菜单
            	console.log("执行要干的事")
            	pub.wx.startRecord();
          	},
          	
          	call_wx_img:function(){
          		pub.Vue.openar[2].active = false;
          		pub.wx.chooseImage({
					count: 1, // 默认9
					sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
					success: function (res) {
						alert(JSON.stringify(res))
						var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
					}
				});
          	},
          	call_wx_camera:function(){
          		console.log("调用微信call_wx_camera")//, 'camera'
          		pub.Vue.openar[2].active = false;
          		pub.wx.chooseImage({
					count: 1, // 默认9
					sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
					success: function (res) {
						alert(JSON.stringify(res))
						var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
					}
				});
          	},
          	call_wx_position:function(){
          		console.log("调用微信call_wx_position");
          		pub.Vue.openar[2].active = false;
          		pub.wx.getLocation({
					type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
					success: function (res) {
						var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
						var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
						var speed = res.speed; // 速度，以米/每秒计
						var accuracy = res.accuracy; // 位置精度
						alert(JSON.stringify(res))
						openLocation(res)
					}
				});
          		
          		function openLocation(o){
          			var op = {
						latitude: 0, // 纬度，浮点数，范围为90 ~ -90
						longitude: 0, // 经度，浮点数，范围为180 ~ -180。
						name: '111111', // 位置名
						address: '2222222222', // 地址详情说明
						scale: 20, // 地图缩放级别,整形值,范围从1~28。默认为最大
						infoUrl: 'http://www.baidu.com' // 在查看位置界面底部显示的超链接,可点击跳转
					};
					op = $.extend({},op, o);
					//alert(JSON.stringify(op))
					alert("可以获取到的位置经纬度，但是适用API的适用场景应该为知道了某个地址的信息等   打开之后去导航之类的")
          			//pub.wx.openLocation(op);
          		}
          	},
          	/*语音播放*/
          	play_voice:function(e,item,index){
          		var audio = null;
          		
          		creatVoice(item,index)
          		//创建一条语音
          		function creatVoice(item,index){
          			if (pub.Vue.Voice) {
          				if (!pub.Vue.Voice.paused) {
          					var i = $(pub.Vue.Voice).attr("data-index");
          					pub.Vue.Voice.pause();
          					pub.Vue.msgBody[i].read = '1';
          				}
	          			audio = pub.Vue.Voice = null;
	          			return;
	          		}else{
	          			audio = $("<audio preload='auto' hidden='true' data-index='"+index+"'><source src='"+item.voiceUrl+"' type='audio/mpeg'></audio>")[0]
	          			pub.Vue.Voice = audio;
	          			pub.Vue.Voice.addEventListener("ended",playCompletion)
	          			choosePlay(audio)
	          		}
	          		
          		}
          		//语音的播放及销毁
				function choosePlay(audio){
					var index = $(pub.Vue.Voice).attr("data-index");
					if(audio.paused){ 
						audio.currentTime = 0;
					    audio.play();//audio.play();// 这个就是播放  
					    pub.Vue.msgBody[index].read = '2';
					}else{
						pub.Vue.Voice.removeEventListener("ended",function(){
							console.log("移除le监听事件");
						})
						audio.pause();// 这个就是暂停
						pub.Vue.Voice = audio = null;
						
					}
				}
				//播放完成执行
				function playCompletion (e) {
					console.log("播放完成");
          			var index = $(e.path[0]).attr("data-index");
          			pub.Vue.msgBody[index].read = '1';
          			//判断的结果
          			var result = getNoread(index);
          			if (result) {
          				creatVoice(result.item,result.index);
          			}else{
          				console.log("没有未读的语音消息")
          			}
				};
				
				//判断后面的消息中是否存在未读 的语音消息返回   语音消息的实体 及所在的索引
				function getNoread(index){
					var msgs = pub.Vue.msgBody,
          			msgL = msgs.length;
          			for (var i = index; i < msgL ; i++) {
          				if (msgs[i].type == "2" && msgs[i].read == '0') {
          					return {
          						item:msgs[i],
          						index:i,
          					}
          				}
          			}
          			return false;
				}
          	},
		}
	})
 	// 接口处理命名空间

 	pub.apiHandle = {
 		init:function(){
 			pub.apiHandle.iminfo_regist()
 			pub.apiHandle.iminfo_list();
 			pub.dfd.done(function(){
 				pub.dfdDefault.done(function(){
 					console.log("_____________________")
 					pub.strophe.init();
 				})
 			})
 		},
 		iminfo_regist:function(){
 			common.ajaxPost({
	            method:'iminfo_regist',
	            userId:pub.userId
	        },function( d ){
	            if( d.statusCode == '100000' ){
	            	if(d.data == 2 || d.data == 1){
	            		config.userId = pub.userId
	            		console.log("!!!!!!!!!!!!!!!!!!!")
	            	}else{
	            		config.userId = ''
	            	}
	            }else{
	            	config.userId = ''
	                common.prompt( d.statusStr );
	            }
	            pub.dfd.resolve();
	        });
 		},
 		iminfo_list:function(){
 			common.ajaxPost({
	            method: 'iminfo_list',
	       	},function( d ){
	            if( d.statusCode == '100000'  ){
	            	console.log("2222222222222222222")
	                pub.imServer = d.data;
	            	config.toUserId = pub.imServer.staffCode;
	            }else if(d.statusCode == '101010'){
	            	pub.imServer = {};
	            	config.toUserId = ''
	            }else {
	            	pub.imServer = {};
	            	config.toUserId = ''
	                common.prompt( d.statusStr );
	            }
	            pub.dfdDefault.resolve()
	        });
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
	
 	// 事件处理初始化
	pub.eventHandle = {
		
		init : function(){

	 		document.oncontextmenu=function(e){
			    //或者return false;
			    e.preventDefault();
			};
		}
		
 	};
 	
 	pub.wx = common.wx;
	pub.wxConfig = {
		init:function(){
			/*
			 分享接口
			 
			 onMenuShareTimeline -分享到朋友圈
			
			onMenuShareAppMessage - 分享给朋友
			
			onMenuShareQQ - 分享到QQ
			
			onMenuShareWeibo - 分享到腾讯微博
			
			onMenuShareQZone - 分享到QQ空间
			
			startRecord - 开始录音接口
			
			stopRecord - 停止录音接口
			
			onVoiceRecordEnd -- 监听录音自动停止接口
			
			playVoice -- 播放语音接口
			
			pauseVoice -- 暂停播放接口
			
			stopVoice -- 停止播放接口
			
			onVoicePlayEnd -- 监听语音播放完毕接口
			
			uploadVoice --上传语音接口
			
			downloadVoice -- 下载语音接口
			
			chooseImage -- 拍照或从手机相册中选图接口
			
			previewImage -- 预览图片接口
			
			uploadImage -- 上传图片接口
			
			downloadImage -- 下载图片接口
			
			getLocalImgData -- 获取本地图片接口
			、、备注：此接口仅在 iOS WKWebview 下提供，用于兼容 iOS WKWebview 不支持 localId 直接显示图片的问题。具体可参考《iOS网页开发适配指南》
			
			translateVoice -- 识别音频并返回识别结果接口
			
			getNetworkType -- 获取网络状态接口
			
			openLocation -- 使用微信内置地图查看位置接口
			
			getLocation -- 获取地理位置接口
			
			hideOptionMenu
			
			showOptionMenu
			
			hideMenuItems -- 批量隐藏功能按钮接口
			
			showMenuItems -- 批量显示功能按钮接口
			
			hideAllNonBaseMenuItem -- 隐藏所有非基础按钮接口
			
			showAllNonBaseMenuItem -- 显示所有功能按钮接口
			
			closeWindow -- 关闭当前网页窗口接口
			
			scanQRCode -- 调起微信扫一扫接口
			
			chooseWXPay -- 微信支付
			
			openProductSpecificView -- 跳转微信商品页接口
			
			addCard -- 批量添加卡券接口
			
			chooseCard -- 拉取适用卡券列表并获取用户选择信息
			
			openCard -- 查看微信卡包中的卡券接口
			 * */
			var url = location.href.split('#')[0];
			
			common.ajaxPost({
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
	
					pub.wx.config({
	
					    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
					    appId: appId, // 必填，公众号的唯一标识
					    timestamp : timestamp, // 必填，生成签名的时间戳
					    nonceStr: nonceStr, // 必填，生成签名的随机串
					    signature: signature,// 必填，签名，见附录1
	
					    //jsApiList:["getLocation"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
					    jsApiList: [
					        'checkJsApi',
					        'onMenuShareTimeline',
					        'onMenuShareAppMessage',
					        'onMenuShareQQ',
					        'onMenuShareWeibo',
					        'onMenuShareQZone',
					        'hideMenuItems',
					        'showMenuItems',
					        'hideAllNonBaseMenuItem',
					        'showAllNonBaseMenuItem',
					        'translateVoice',
					        'startRecord',
					        'stopRecord',
					        'onVoiceRecordEnd',
					        'playVoice',
					        'onVoicePlayEnd',
					        'pauseVoice',
					        'stopVoice',
					        'uploadVoice',
					        'downloadVoice',
					        'chooseImage',
					        'previewImage',
					        'uploadImage',
					        'downloadImage',
					        'getNetworkType',
					        'openLocation',
					        'getLocation',
					        'hideOptionMenu',
					        'showOptionMenu',
					        'closeWindow',
					        'scanQRCode',
					        'chooseWXPay',
					        'openProductSpecificView',
					        'addCard',
					        'chooseCard',
					        'openCard'
					    ]
					});
					pub.wx.ready(function(){ 
						pub.wx.checkJsApi({
			            	jsApiList: [
						        'checkJsApi',
						        'onMenuShareTimeline',
						        'onMenuShareAppMessage',
						        'onMenuShareQQ',
						        'onMenuShareWeibo',
						        'onMenuShareQZone',
						        'hideMenuItems',
						        'showMenuItems',
						        'hideAllNonBaseMenuItem',
						        'showAllNonBaseMenuItem',
						        'translateVoice',
						        'startRecord',
						        'stopRecord',
						        'onVoiceRecordEnd',
						        'playVoice',
						        'onVoicePlayEnd',
						        'pauseVoice',
						        'stopVoice',
						        'uploadVoice',
						        'downloadVoice',
						        'chooseImage',
						        'previewImage',
						        'uploadImage',
						        'downloadImage',
						        'getNetworkType',
						        'openLocation',
						        'getLocation',
						        'hideOptionMenu',
						        'showOptionMenu',
						        'closeWindow',
						        'scanQRCode',
						        'chooseWXPay',
						        'openProductSpecificView',
						        'addCard',
						        'chooseCard',
						        'openCard'
						    ],
			            	success: function (res) {
			 					console.log(res)
			            	}
			            })
					});
					pub.wx.error(function(res){
						console.log(0)
						// alert(common.JSONStr(res))// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
					});
				}		
			}, function( d ){
				alert("分享插件升级中。。。");
			});	
		}
	}
 	// 模块初始化
 	pub.init = function(){
 		pub.logined = common.isLogin(); // 是否登录
		pub.dfd = $.Deferred();//主要用于客服和用户注册的延时对象

		pub.dfdDefault = $.Deferred();//主要用与选择门店弹框的延时对象
		
		if( pub.logined ){
	    	pub.userId = common.user_datafn().cuserInfoid;
	    	pub.source = "userId" + pub.userId;
	    	pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
	    	pub.tokenId = common.tokenIdfn();
	    }else{
	        common.jumpLinkPlain( 'index.html' );
	    }
 		pub.isWeiXin = common.isWeiXin();
 		
 		if (pub.isWeiXin && common.openId.getItem()) {
 			pub.wxConfig.init();
 		}
 		pub.apiHandle.init()
 		pub.eventHandle.init(); // 模块初始化事件处理
	}
 	// require.async('https://hm.baidu.com/hm.js?2a10c871d8aa53992101d3d66a7812ae'); // 百度统计
	module.exports = pub;
});	
