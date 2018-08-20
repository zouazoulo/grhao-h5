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
	 vue 滑动事件
	 * */
	function vueTouch(el,binding,type){//触屏函数
	    var _this=this;
	    this.obj=el;
	    this.binding=binding;
	    this.touchType=type;
	    this.vueTouches={x:0,y:0};//触屏坐标
	    this.vueMoves=true;
	    this.vueLeave=true;
	    this.vueCallBack=typeof(binding.value)=="object"?binding.value.fn:binding.value;
	    this.obj.addEventListener("touchstart",function(e){
	        _this.start(e);
	    },false);
	    this.obj.addEventListener("touchend",function(e){
	        _this.end(e);
	    },false);
	    this.obj.addEventListener("touchmove",function(e){
	        _this.move(e);
	    },false);
	};
	vueTouch.prototype={
	    start:function(e){//监听touchstart事件
	        this.vueMoves=true;
	        this.vueLeave=true;
	        this.longTouch=true;
	        this.vueTouches={x:e.changedTouches[0].pageX,y:e.changedTouches[0].pageY};
	        this.time=setTimeout(function(){
	            if(this.vueLeave&&this.vueMoves){
	                this.touchType=="longtap"&&this.vueCallBack(this.binding.value,e);
	                this.longTouch=false;
	            };
	        }.bind(this),1000);
	    },
	    end:function(e){//监听touchend事件
	        var disX=e.changedTouches[0].pageX-this.vueTouches.x;//计算移动的位移差
	        var disY=e.changedTouches[0].pageY-this.vueTouches.y;
	        clearTimeout(this.time);
	        if(Math.abs(disX)>10||Math.abs(disY)>100){//当横向位移大于10，纵向位移大于100，则判定为滑动事件
	            this.touchType=="swipe"&&this.vueCallBack(this.binding.value,e);//若为滑动事件则返回
	            if(Math.abs(disX)>Math.abs(disY)){//判断是横向滑动还是纵向滑动
	                if(disX>10){
	                    this.touchType=="swiperight"&&this.vueCallBack(this.binding.value,e);//右滑
	                };
	                if(disX<-10){
	                    this.touchType=="swipeleft"&&this.vueCallBack(this.binding.value,e);//左滑
	                };
	            }else{
	                if(disY>10){
	                    this.touchType=="swipedown"&&this.vueCallBack(this.binding.value,e);//下滑
	                };
	                if(disY<-10){
	                    this.touchType=="swipeup"&&this.vueCallBack(this.binding.value,e);//上滑
	                };  
	            };
	        }else{
	            if(this.longTouch&&this.vueMoves){
	                this.touchType=="tap"&&this.vueCallBack(this.binding.value,e);
	                this.vueLeave=false
	            };
	        };
	    },
	    move:function(e){//监听touchmove事件
	        this.vueMoves=false;
	    }
	};
	
	Vue.directive("tap",{//点击事件
	    bind:function(el,binding){
	        new vueTouch(el,binding,"tap");
	    }
	});
	Vue.directive("swipe",{//滑动事件
	    bind:function(el,binding){
	        new vueTouch(el,binding,"swipe");
	    }
	});
	Vue.directive("swipeleft",{//左滑事件
	    bind:function(el,binding){
	        new vueTouch(el,binding,"swipeleft");
	    }
	});
	Vue.directive("swiperight",{//右滑事件
	    bind:function(el,binding){
	        new vueTouch(el,binding,"swiperight");
	    }
	});
	Vue.directive("swipedown",{//下滑事件
	    bind:function(el,binding){
	        new vueTouch(el,binding,"swipedown");
	    }
	});
	Vue.directive("swipeup",{//上滑事件
	    bind:function(el,binding){
	        new vueTouch(el,binding,"swipeup");
	    }
	});
	Vue.directive("longtap",{//长按事件
	    bind:function(el,binding){
	        new vueTouch(el,binding,"longtap");
	    }
	});
	/*
	 */
	//zhaoyh
	var config = {
		userId:'',
		BOSH_SERVICE:'http://im.grhao.com:7070/http-bind/',
		domain:'grhao.com',
		password:'123456',//e10adc3949ba59abbe56e057f20f883e
		toUserId:'',
	};
/*
 	msg对象的管理
 * */
	
	var msgObj = {
		init:function(key){
			var _this = this;
			this.Deferred = $.Deferred();//延时对象主要用来更新消息过期时间时候使用
			this.oneDayMillisecond = 86400000;
			this.key = key;
			//更新本地存储的消息
			this.updateMsg();
			
		},
		getMsgAll:function(){
			if (localStorage.getItem(this.key)) {
				var arr = JSON.parse(localStorage.getItem(this.key));
				return arr;
			}else{
				return [];
			}
		},
		/*
		 * 获取本地消息
		 * index  表示当前消息的页数
		 * size  表示请求的条数
		 */
		getMsg:function(index,size){
			if ((index * size) > this.msgLength ) {
				if (((+index - 1) * size) > this.msgLength ) {
					return []
				}else{
					return this.msgDates.slice(0,(this.msgLength - ((+index - 1) * size)));
				}
			}else{
				return this.msgDates.slice((this.msgLength - (index * size)),(this.msgLength - ((+index - 1) * size)));
			}
			
		},
		/*
		 undate的目的是删除掉过期的消息
		 * */
		updateMsg:function(){
			var _this = this;
			var msgAll = _this.getMsgAll();
			var nowTimestamp = Date.parse(new Date());
			//删除超时的消息
			function removeItem (msgAll){
				if (msgAll.length == 1) {
					if ((nowTimestamp - msgAll[0].createTime) > _this.oneDayMillisecond * 3) {
						localStorage.setItem(_this.key,JSON.stringify([]));
					}
				}else{
					var index = getIndex (msgAll);
					localStorage.setItem(_this.key,JSON.stringify(msgAll.slice(index)));
				}
			};
			//获取msgAll 过期的时间 节点
			function getIndex (msgAll) {
				var index = 0;
				for (var i = 0; i<msgAll.length ; i++ ) {
					//删除超过三天的数据
					if ((nowTimestamp - msgAll[i].createTime) > _this.oneDayMillisecond * 3  ) {
						index = i+1;
					}
				}
				return index;
			}
			if (msgAll.length != 0) {
				removeItem(msgAll);
				//msgDates 表示本地存储的所有消息
				_this.msgDates = _this.getMsgAll();
				//msgLength 表示本地存储的消息的条数
				_this.msgLength = _this.msgDates.length;
			}else{
				//msgDates 表示本地存储的所有消息
				_this.msgDates = [];
				//msgLength 表示本地存储的消息的条数
				_this.msgLength = 0;
			}
		},
		saveMsg:function(d){
			var arr = this.getMsgAll();
				arr.push(d);
			localStorage.setItem(this.key,JSON.stringify(arr))
		},
		//更新某一条信息的状态
		updateItem:function(item,index){
			console.log(item);
			console.log(index);
			var arr = this.getMsgAll();
				arr.splice(index,1,item);
			localStorage.setItem(this.key,JSON.stringify(arr))
		},
	}
	//strophe 管理
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
		/*
		* Status.ERROR - An error has occurred 发生错误
     *  Status.CONNECTING - The connection is currently being made 目前正在进行连接
     *  Status.CONNFAIL - The connection attempt failed 连接尝试失败
     *  Status.AUTHENTICATING - The connection is authenticating 连接正在认证。
     *  Status.AUTHFAIL - The authentication attempt failed 身份验证尝试失败
     *  Status.CONNECTED - The connection has succeeded 连接成功
     *  Status.DISCONNECTED - The connection has been terminated 连接已终止。
     *  Status.DISCONNECTING - The connection is currently being terminated 当前正在终止连接
     *  Status.ATTACHED - The connection has been attached 连接已附加
     *  Status.REDIRECT - The connection has been redirected 连接已被重定向
     *  Status.CONNTIMEOUT - The connection has timed out 连接已超时。

		Status: {
			ERROR: 0,
			CONNECTING: 1,
			CONNFAIL: 2,
			AUTHENTICATING: 3,
			AUTHFAIL: 4,
			CONNECTED: 5,
			DISCONNECTED: 6,
			DISCONNECTING: 7,
			ATTACHED: 8,
			REDIRECT: 9,
			CONNTIMEOUT: 10
		},
		* */
		// 连接状态改变的事件
		onConnect:function (status) {
			console.log(status)
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
				pub.Vue.BossServerStatus = 4;
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
					mo = o;
					
				if (o) {
					//消息发送成功 -1表示消息发送失败  0 表示消息发送中
					mo.status = 1;
					if (o.msgType == 'text') {
					}else if (o.msgType == 'image') {
					}else if (o.msgType == 'voice') {
						mo.read = '0';
					};
					pub.Vue.msgBody.push($.extend({},o,{
                        ascription:2,
					}));
					msgObj.saveMsg($.extend({},o,{
                        ascription:2,
					}));
				}
		    }
		    return true;
		},
		//发送消息
		send_msg:function(v,t){
			var content = v.content;
 			bo = {
 				"msgId":v.msgId,
 				"msgType":v.msgType,
 				"createTime":v.createTime,
 				"content": v.content,
 				"fromUser":strophe.userjid,
 				"toUser":strophe.toUserId
            };
            msgObj.saveMsg($.extend({},bo,{
                ascription:1,
            }));
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
    /*原始对象
    *
    * {
    * "msgId":1534691669292,
    * "msgType":"text",
    * "createTime":1534691669292,
    * "content":"2",
    * "fromUser":"8515",
    * "toUser":"2601"
    * }
    * */

    var msgData = {
		ascription:1,// 0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
        msgType:"text",
        content:"",
		/*type:0,//-1表示时间插入的，0表示文本 1表示图片 2表示语音
		createTime:Date.parse(new Date()),*/
		status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送
	};
	var msgDatas = [{
			ascription:2,//0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
			type:0,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
			time:'2018年8月13日 16:16',//
			createTime:new Date(),
			status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
			content:'如果消息类型为文本，则显示文本内容',
		},{
			ascription:1,//0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
			type:1,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
			time:'2018年8月13日 16:16',//
			createTime:'2018年8月13日 16:16',
			status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
			content:'http://zhangshuoinfo.b0.upaiyun.com/1534217467.jpg',
			
		},{
			ascription:2,//0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
			type:2,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
			time:'2018年8月13日 16:16',//
			createTime:'2018年8月13日 16:16',
			status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
			read:'0',//语音消息读没读的状态 默认为0没有读的状态 1为已读的状态2表示正在播放
			strVoiceTime:'10',
			
		},{
			ascription:1,//0表示是系统的提示  1表示是自己的消息  2表示是好友的消息
			type:2,//-1表示时间插入的，0表示文本 1表示图片 2表示语音 
			time:'2018年8月13日 16:16',//
			createTime:'2018年8月13日 16:16',
			status:1,//消息发送成功 -1表示消息发送失败  0 表示消息发送中
			read:'0',//语音消息读没读的状态 默认为0没有读的状态 1为已读的状态2表示正在播放
			strVoiceTime:'10',
			content:'http://www.w3school.com.cn/i/song.mp3',
		}
	];
	var msgBodys = [];
	/*
	 input change 事件
	 * */
	//图片上传
	
	/*
	
	* */
	var pub = {
		strophe:strophe,
	};
	/*
	 configData 配置的一些数据
	 * */
	var configData = {
		userServerImg:'img/default_avatar_friend.png',
		userImg:'img/default_user.png',
	}
	pub.Vue = new Vue({
		el: '#app',
		data: {
			title:'分配客服中',
			//表示客服的状态 0表示未分配客服  1表示已分配客服  3表示后台也没有客服
			userServerStatus:0,
			//openfier 的连接状态  。  4 为连接成功  3为断开连接了
			BossServerStatus:0,
			
			config:configData,//配置信息
			
			openar: data.datas,//操作区域的数据结构
			isWx:common.isWeiXin(),//false表示不是微信环境，true 表示是微信环境
			
			msgBody:msgBodys,
			Voice:null,
			isLoging:false,//是否是加载  默认位false   这个时候表示是新的消息
			index:0,//表示加载本地消息的页数
			size:10,//表示加载本地消息每页的条数
			
			msgInnerHeight:0,//表示消息容器的高度
			
			
		},
        beforeCreate : function(){
        	
        	if (common.isWeiXin()) {
        		//初始化操作按钮的数据
        		data.datas[0].type = 1;
        		//msgBodys =  
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
        	//pub.Vue.msgBody =
        	console.log()
        	
        },
        beforeMount : function(){
        	console.log("beforeMount		//挂载之前")
        	
        },
        updated : function(){
        	console.log("updated			//数据被更新后");
        	console.log(this.msgBody)
        	var tarEle = $(".im_message");
        		tarEleInner = $(".im_message_box");
        	console.log("原始高度"+this.msgInnerHeight);
        	console.log("更新后的高度"+tarEleInner.height())
        	if (this.isLoging) {
        		
        		tarEle.scrollTop(tarEleInner.height() - this.msgInnerHeight - 60)
        	} else{
        		if (tarEleInner.height() > tarEle.height()) {
	        		tarEle.scrollTop(tarEleInner.height())
	        	}
        	}
        	this.msgInnerHeight = tarEleInner.height();
        	this.isLoging = false;
        	
        },
		methods: {
			send_msg:function(o){
				var d = {},m='';
				if(o.msgType == 'text'){
                    this.openar[1].value = ''
                    this.text_focus();
				}
                d = $.extend({},msgData, o);

				d.createTime = d.msgId = Date.parse(new Date());
				console.log(d)
				this.msgBody.push(d);
				pub.strophe.send_msg(d);

			},
			text_focus:function(d){
				var o = d || true;
				o ? $("#text").focus() : $("#text").blur();
			},
			img_updata:function(d){
				var _this = this;
				var imgobj = {};
				var input = $("#file");
				input.unbind("click").click();
		        input.unbind('change').on('change', function (e) {
		            var files = input[0].files,
					fNum = files.length,
					URL = window.URL || window.webkitURL;
					if(!files[0])return;
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
						content:src,
                        msgType:"image",
					};
					_this.send_msg(imgobj)
				});
				
			},
			add_box:function(){
				console.log('add_box')
				pub.Vue.openar[2].active = !pub.Vue.openar[2].active;
			},
			add_img:function(){
				if (pub.Vue.openar[1].value) {
					console.log("发送消息处理")
                    var v = this.openar[1].value;
					if (v){
                        pub.Vue.send_msg({
                            content:v,
                            msgType:"text",
                        });
					} else{
						alert("消息不能为空！")
					}

				}else{
					pub.Vue.img_updata();
				}
			},
			getNameTime:function(o){
				var str = '';
				if (o.ascription == 2) {
					str += pub.imServer.staffName;
				}else if (o.ascription == 1){
					str += common.user_datafn().petName;
				}else {
					str += '***';
				}
				str += "<br/>"
				str += "<time class='time'>"+common.timestampToTime(o.createTime)+"</time>";

				return str;
			},
			getHtml:function(o){
				var str = '';
				//0表示文本1表示图片2表示语音
				if(o.msgType == "text"){
					str = o.content;
				}else if (o.msgType == "image") {
					str = "<img src = '"+o.content+"' />"
				}else if (o.msgType == "voice") {
					str = o.strVoiceTime+'"'
				};
				return str;
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
          		var audio = null,
          			_this = this;
          		creatVoice(item,index)
          		//创建一条语音
          		function creatVoice(item,index){
          			if (pub.Vue.Voice) {
          				var i = $(pub.Vue.Voice).attr("data-index");
          					console.log(i);
          					console.log(index);
          				//说明不是同一条消息
          				if (i != index) {
          					pub.Vue.Voice.pause();
          					pub.Vue.msgBody[i].read = '1';
          					//调用msgObj对象的更新消息接口
          					msgObj.updateItem(pub.Vue.msgBody[index],getMsgObjIndex(index));
          					
          					audio = pub.Vue.Voice = null;
          					audio = pub.Vue.Voice = $("<audio preload='auto' hidden='true' data-index='"+index+"'><source src='"+item.content+"' type='audio/mpeg'></audio>")[0]
		          			pub.Vue.Voice.addEventListener("ended",playCompletion)
		          			choosePlay(audio)
          				}else{
          					if (!pub.Vue.Voice.paused) {
	          					pub.Vue.Voice.pause();
	          					pub.Vue.msgBody[i].read = '1';
	          					//调用msgObj对象的更新消息接口
          						msgObj.updateItem(pub.Vue.msgBody[index],getMsgObjIndex(index));
	          				}else{
	          					audio = pub.Vue.Voice;
	          					choosePlay(audio)
	          				}
          				}
	          		}else{
	          			audio = pub.Vue.Voice = $("<audio preload='auto' hidden='true' data-index='"+index+"'><source src='"+item.content+"' type='audio/mpeg'></audio>")[0]
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
          			//调用msgObj对象的更新消息接口
          			msgObj.updateItem(pub.Vue.msgBody[index],getMsgObjIndex(index));
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
          				if (msgs[i].msgType == "voice" && msgs[i].read == '0') {
          					return {
          						item:msgs[i],
          						index:i,
          					}
          				}
          			}
          			return false;
				};
				//获取消息在本地的索引值
				function getMsgObjIndex(index){
					var len = msgObj.msgDates.length;
					
					if (len > _this.size * _this.index) {
          				return len%_this.size + (len/_this.size - _this.index)* _this.size;
          			}else{
          				return index;
          			}
				}
          	},
          	boxScroll:function(e){
          		var len = msgObj.msgDates.length;
          		console.log(e.target.scrollTop)
          		if (e.target.scrollTop == 0) {
          			console.log("le "+ this.size * this.index);
          			console.log(len)
          			if (len > this.size * this.index) {
          				this.isLoging = true;
          			
	          			this.index = this.index +1;
	          			var msgO = msgObj.getMsg(this.index , this.size);
	          			if (msgO.length) {
	          				console.log(this.msgBody)
	          				this.msgBody = msgO.concat(this.msgBody);
	          			}
          			}
          			
          			
          		}else{
          			
          		}
          	}
		}
	});
	
 	// 接口处理命名空间
 	pub.apiHandle = {
 		init:function(){
 			pub.apiHandle.iminfo_regist()
 			pub.apiHandle.iminfo_list();
 			pub.dfd.done(function(){
 				pub.dfdDefault.done(function(){
 					console.log("_____________________")
 					pub.strophe.init();
 					var key = config.userId + "_" +config.toUserId;
                    msgObj.init(key);
                    pub.Vue.index = pub.Vue.index + 1;
                    var arr = msgObj.getMsg(pub.Vue.index,pub.Vue.size);
                    console.log(arr)
                    pub.Vue.msgBody = arr;
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
	            		config.userId = pub.userId;
	            		configData.userImg = (common.user_datafn().faceImg == '') ? "img/icon_touxiang.png" : common.user_datafn().faceImg;
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
	            	console.log("2222222222222222222");
	            	if (d.data.staffCode) {
	            		pub.imServer = d.data;
		            	config.toUserId = pub.imServer.staffCode;
		            	
		            	pub.Vue.userServerStatus = '1';
						pub.Vue.title = '客服:'+pub.imServer.staffName + "为您服务";
	            	}else{
	            		pub.imServer = {};
						pub.Vue.userServerStatus = '2';
						pub.Vue.title = '客服走丢了';
		            	config.toUserId = ''
	            	}
	            }else if(d.statusCode == '101010'){
	            	pub.imServer = {};
					pub.Vue.userServerStatus = '2';
					pub.Vue.title = '客服走丢了';
	            	config.toUserId = ''
	            }else {
	            	pub.imServer = {};
	            	config.toUserId = ''
	                common.prompt( d.statusStr );
	            }
	            pub.dfdDefault.resolve();
	        });
 		}
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
