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
/*	pub.inputScroll = {
    	init:function(){
    		alert(1)
    		var winHeight = $(window).height();  //获取当前页面高度
	        
	        $(window).resize(function () {
	            var thisHeight = $(this).height();
	            
	            if ( winHeight - thisHeight > 140 ) {
	                //键盘弹出
					//alert("键盘弹出")
					$(".im_message").height(thisHeight - 220);
	            } else {
	            	//$(".im_message").scrollTop($(".im_message_main").height())
	                //键盘收起
	                //alert("键盘收起")
	                $(".im_message").height(thisHeight - 220);
	                $(".im_message").scrollTop($(".im_message_main").height() + 220)
	            }
	        })
    	}
    }*/
	/*
	 */
	//果然好IM相关的配置
	var config = {
		userId:'',
		BOSH_SERVICE:'http://im.grhao.com:7070/http-bind/',
		domain:'grhao.com',
		password:'e10adc3949ba59abbe56e057f20f883e',//e10adc3949ba59abbe56e057f20f883e
		toUserId:'',
	};
	/*
	 * 	msg对象的管理
	*/
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
			var arr = this.getMsgAll();
				arr.splice(index,1,item);
			localStorage.setItem(this.key,JSON.stringify(arr))
		},
		//判断本地是否有这条消息
		isMessageId:function(id){
			var arr = this.getMsgAll();
			var resultArr = arr.filter(function(item){
				return item.msgId == id;
			})
			if (resultArr.length) {
				return true;
			}else{
				return false;
			}
		}
	}
	
	//strophe 管理 连接openfire 发送接受消息
	var stropheObj = {
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
			strophe.userName = config.userId+'@'+config.domain+'/Smack';
			//用户密码
			strophe.userPassword = config.password
			
			strophe.login();
		},
		//用户登录openfire
		login:function(){
			if(!stropheObj.connected) {
				stropheObj.connection = new Strophe.Connection(stropheObj.BOSH_SERVICE);
				stropheObj.connection.connect(stropheObj.userName, stropheObj.userPassword, stropheObj.onConnect);
			
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
			console.log(stropheObj)
			console.log(status)
			//CONNECTED: 5, - The connection has succeeded 连接成功
			// 大块分为连接进行中
			//连接失败
			//连接
            if (status == Strophe.Status.CONNECTED) {
                console.log("连接！");
                stropheObj.connected = true;
                pub.Vue.BossServerStatus = 4;
                // 当接收到<message>节，调用onMessage回调函数
                stropheObj.connection.addHandler(stropheObj.onMessage, null, 'message', null, null, null);

                // 首先要发送一个<presence>给服务器（initial presence）
                stropheObj.connection.send($pres().tree());
                
                //获取订阅的主题信息
				//stropheObj.connection.pubsub.getSubscriptions(stropheObj.onMessage,5000);
				stropheObj.connection.send($pres({
				 	to: stropheObj.toUserId + '@' + stropheObj.domain+'/Smack',//buddy jid
				 	type:"subscribe"
				}));

                //连接中的状态
                //CONNECTING: 1,The connection is currently being made 目前正在进行连接
                //AUTHENTICATING: 3,The connection is authenticating 连接正在认证。
                //
            }else if(status == Strophe.Status.CONNECTING || status == Strophe.Status.AUTHENTICATING) {
            	
            	//CONNECTING: 1,The connection is currently being made 目前正在进行连接
            	if (status == Strophe.Status.CONNECTING) {
                    console.log(status+"目前正在进行连接！");
                     //AUTHENTICATING: 3,The connection is authenticating 连接正在认证。
                } else if (status == Strophe.Status.AUTHENTICATING) {
                    console.log(status+"连接正在认证。！");
                } 
                //剩下的就是连接失败了
			}else{
				if (status == Strophe.Status.ERROR || status == Strophe.Status.CONNFAIL || status == Strophe.Status.AUTHFAIL || status == Strophe.Status.DISCONNECTED || status == Strophe.Status.DISCONNECTING || status == Strophe.Status.CONNTIMEOUT) {
					stropheObj.connected = false;
					//ERROR: 0,An error has occurred 发生错误
					if (status == Strophe.Status.ERROR) {
	                    console.log(status+"发生错误！");
	                    //CONNFAIL: 2,The connection attempt failed 连接尝试失败
	                } else if (status == Strophe.Status.CONNFAIL) {
	                    console.log(status+"连接尝试失败！");
	                    //AUTHFAIL: 4, The authentication attempt failed 身份验证尝试失败
	                } else if (status == Strophe.Status.AUTHFAIL) {
	                     console.log(status+"身份验证尝试失败！");
	                    //DISCONNECTED: 6,The connection has been terminated 连接已终止。
	                } else if (status == Strophe.Status.DISCONNECTED) {
	                    console.log(status+"连接断开！");
	                    
	                    //DISCONNECTING: 7,The connection is currently being terminated 当前正在终止连接
	                } else if (status == Strophe.Status.DISCONNECTING) {
	                    console.log(status+"连接失败！");
						//CONNTIMEOUT: 10 The connection has timed out 连接已超时
	                } else if (status == Strophe.Status.CONNTIMEOUT) {
	                    console.log(status+"连接已超时！");
	                    
	                } 
				}else{
					//剩下的两个不是太懂---暂时不做处理
					//ATTACHED: 8,The connection has been attached 连接已附加
	                if (status == Strophe.Status.ATTACHED) {
	                    console.log(status+" 连接已附加！");
	                    
						//REDIRECT: 9,The connection has been redirected 连接已被重定向
	                } else if (status == Strophe.Status.REDIRECT) {
	                    console.log(status+"连接已被重定向！");
	                    
					}
				}
			}
		},
		// 接收到<message>
		onMessage:function (msg) {
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
					if (!msgObj.isMessageId(o.msgId)) {
						pub.Vue.msgBody = pub.Vue.msgBody.concat([$.extend({},o,{
	                        ascription:2,
						})]);
						msgObj.saveMsg($.extend({},o,{
	                        ascription:2,
						}));
					}
				}
		    }
		    return true;
		    
		    //消息去重
		    function messageRemoval(item){
		    	
		    }
		},
		//发送消息
		send_msg:function(v,t){
			var content = v.content;
 			bo = {
 				"msgId":v.msgId,
 				"msgType":v.msgType,
 				"createTime":v.createTime,
 				"content": v.content,
 				"fromUser":stropheObj.userjid,
 				"toUser":stropheObj.toUserId
            };
            msgObj.saveMsg($.extend({},bo,{
                ascription:1,
            }));
			// 创建一个<message>元素并发送
			var msg = $msg({
				to: stropheObj.toUserId + '@' + stropheObj.domain+'/Smack', 
				from: stropheObj.userjid + '@' + stropheObj.domain,
				type: 'chat'
			}).c("body", null, JSON.stringify(bo));
			console.log(msg.tree())
			stropheObj.connection.send(msg.tree());


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
	var msgBodys = [];
	
	/*
	 pub初始化
	 * */
	var pub = {
		strophe:stropheObj,
	};
	/*
	 configData 配置的一些数据==》为消息展示服务
	 * */
	var configData = {
		userServerImg:'../img/default_avatar_friend.png',
		userImg:'../img/default_user.png',
	}
	/*
	 Vue对象的创建
	 * */
	pub.Vue = new Vue({
		el: '#app',
		data: {
			title:'分配客服中',
			//表示客服的状态 0表示未分配客服  1表示已分配客服  3表示后台也没有客服
			userServerStatus:0,
			//openfier 的连接状态  。  4 为连接成功  3为断开连接了
			/*
			 分析：
			 服务的连接状态\
			 1.成功
			 2.失败
			 3.表示连接断开了
			 4.表示连接进行中
			 0.连接错误
			 * */
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

			//isFocus:false,//表示input输入框得焦和失焦
			
			screenHeight:document.body.clientHeight,//表示页面内容的高度
			screenWidth: document.body.clientWidth,
			inputScrollInterval:null,//input上获取焦点时候开启的定时器
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
        	this.isSpecVersion = this.checkVersion();
        	
        	this.inputScroll();
        },
        beforeMount : function(){
        	console.log("beforeMount		//挂载之前")
        	
        },
        updated : function(){
        	console.log("updated			//数据被更新后");
        	/*
        	 不能写在监听里面手机端有bug
        	 * */
        	/*var tarEle = $(".im_message");
        		tarEleInner = $(".im_message_box");
        	console.log("原始高度"+this.msgInnerHeight);
        	console.log("更新后的高度"+tarEleInner.height())
        	if (this.isLoging) {
        		tarEle.scrollTop(tarEleInner.height() - this.msgInnerHeight - 60);
        	} else{
        		if (this.Voice) {

				}else{
                    if (tarEleInner.height() > tarEle.height()) {
                        tarEle.scrollTop(tarEleInner.height())
                    }
				}

        	}
        	this.msgInnerHeight = tarEleInner.height();
        	this.isLoging = false;*/
        },
        watch:{
        	//监听高度变化
        	/*screenHeight:function(val,oldVal){
        		console.log('new: %s, old: %s', val, oldVal)
        		
	            if (!this.timer) {
                    this.timer = true
                    let that = this
                    setTimeout(function () {
                        // that.screenWidth = that.$store.state.canvasWidth
                        if ( oldVal - val > 140 ) {
			                //键盘弹出
							//alert("键盘弹出")
							$(".im_message").height(val - 220);
			                $(".im_message").scrollTop($(".im_message_main").height())
			            } else {
			                //键盘收起
			                //alert("键盘收起")
			                $(".im_message").height(val - 110);
			                $(".im_message").scrollTop($(".im_message_main").height())
			            }
                        that.timer = false
                    }, 400)
	            }
        	},*/
        	//监听消息的内容发生长度的变化时候在进行scroll
        	msgBody:function(val,oldVal){
        		console.log("msgBody："+val.length + ","+oldVal.length)
        		var _this = this;
        		if (val.length != oldVal.length) {
        			if (!this.timer) {
	                    this.timer = true
	                    var that = this
	                    setTimeout(function () {
	                        
				        	var tarEle = $(".im_message");
				        		tarEleInner = $(".im_message_box");
				        	if (_this.isLoging) {
				        		tarEle.scrollTop(tarEleInner.height() - _this.msgInnerHeight - 60);
				        		_this.isLoging = false;
				        	} else{
				        		if (!_this.Voice) {
				                    if (tarEleInner.height() > tarEle.height()) {
				                        tarEle.scrollTop(tarEleInner.height())
				                    }
								}
				        	}
				        	_this.msgInnerHeight = tarEleInner.height();
	                        that.timer = false;
	                        
	                    },10)
		           }
        			
        		}
        	}
        },
		methods:{
			send_msg:function(o){
				var d = {},m='';
				 d = $.extend({},msgData, o);
				d.createTime = d.msgId = Date.parse(new Date());
				this.msgBody = this.msgBody.concat([d]);
				//this.msgBody.push(d);
				if(o.msgType == 'text'){
                    this.openar[1].value = ''
					pub.strophe.send_msg(d);
				}
			},
			text_focus:function(d){
				var o = d || true;
				o ? $("#text").focus() : $("#text").blur();
			},
			getIOSVersion:function (ua) {
		         ua = ua || navigator.userAgent;
		         var match = ua.match(/OS ((\d+_?){2,3})\s/i);
		         return match ? match[1].replace(/_/g, '.') : 'unknown';
		    },
		    checkVersion: function () {
	             var iosVsn = this.getIOSVersion().split('.');
	             return +iosVsn[0] == 11 && +iosVsn[1] >= 0 && +iosVsn[1] < 3;
	        },
            getPoint:function (e) {
				console.log("得焦")
                /*pub.Vue.isFocus = true;
				if (common.isApple()){
                    window.setTimeout(function(){
                        window.scrollTo(0,document.body.clientHeight);
                    }, 500);
                }*/
               	var _this = this;
               	var target = e.srcElement;
               	
                if (this.isSpecVersion) {
	                 // ios11.0-11.3 对scrollTop及scrolIntoView解释有bug
	                 // 直接执行会导致输入框滚到底部被遮挡
	            } else {
	                 /*setTimeout(function () {
	                     this.scrollToView()
	                     this.interval = setInterval(this.scrollToView.bind(this), 500);
	                 }.bind(this), 200)*/
	                setTimeout(function(){
	            		target.scrollIntoView(true);
	            		_this.inputScrollInterval = setInterval(function(){target.scrollIntoView(true);},500)
	               	},200)
	            }
            },
            lostPoint:function (e) {
                console.log("失焦")
                /*
                pub.Vue.isFocus = false;
                */
               	var target = e.srcElement;
               	this.inputScrollInterval && clearInterval(this.inputScrollInterval);
            },
			img_updata:function(d){
				var _this = this;
				var imgobj = {};
				var input = $("#file");
				input.unbind("click").click();
		        input.unbind('change').on('change', function (e) {
		        	/*var Orientation;
		        	var files = input[0].files,
					fNum = files.length,
					URL = window.URL || window.webkitURL;
					var blob= '';
					if(!files[0])return;
					EXIF.getData(files[0], function() {  
					    var Orientation = EXIF.getTag(this, 'Orientation');
					   
					    
						var fr = new FileReader();
						
						
						fr.onload = function () {
							for(var i=0;i<fNum;i++){
								if(files[i].type.search(/image/)>=0){
									blob = URL.createObjectURL(files[i]);
								}
							};
							var ext = '.' + document.getElementById('file').files[0].name.split('.').pop();
							var config = {
								bucket: 'zhangshuoinfo',
								expiration: parseInt((new Date().getTime() + 3600000) / 1000),
								// 尽量不要使用直接传表单 API 的方式，以防泄露造成安全隐患
								form_api_secret: 'LaubRPoyoLzq9tJ82/z+RSmFUVY=',
								
							};
							
							var imgobj = {
								content:blob,
		                        msgType:"image",
		                        path:config.expiration
							};
							_this.send_msg(imgobj)
							
							var instance = new Sand(config);
							var options = {
						        'x-gmkerl-thumb': '/compress/true',
								'notify_url': 'http://zhangshuoinfo.b0.upaiyun.com',
							};
							instance.setOptions(options);
							instance.upload( + parseInt((new Date().getTime() + 3600000) / 1000) + ext);
			
			            };
		                fr.readAsDataURL(files[0]);
					});*/
		            var files = input[0].files,
					fNum = files.length,
					URL = window.URL || window.webkitURL;
					var blob= '';
					if(!files[0])return;
					for(var i=0;i<fNum;i++){
						if(files[i].type.search(/image/)>=0){
							blob = URL.createObjectURL(files[i]);
							
						}
					};
					var ext = '.' + document.getElementById('file').files[0].name.split('.').pop();
					var config = {
						bucket: 'zhangshuoinfo',
						expiration: parseInt((new Date().getTime() + 3600000) / 1000),
						// 尽量不要使用直接传表单 API 的方式，以防泄露造成安全隐患
						form_api_secret: 'LaubRPoyoLzq9tJ82/z+RSmFUVY=',
						
					};
					var imgobj = {
						content:blob,
                        msgType:"image",
                        path:config.expiration
					};
					_this.send_msg(imgobj)
					
					var instance = new Sand(config);
					var options = {
				        'x-gmkerl-thumb': '/compress/true/rotate/auto',
						'notify_url': 'http://zhangshuoinfo.b0.upaiyun.com',
					};
					instance.setOptions(options);
					instance.upload( + parseInt((new Date().getTime() + 3600000) / 1000) + ext);
		        });
		        $(document).unbind('uploaded').on('uploaded', function(e) {
		        	
					var data = e.originalEvent.detail;
					var src = "http://"+data.bucket_name+".b0.upaiyun.com"+data.path;
					imgobj = {
						content:src,
                        msgType:"image",
					};
					var path = data.path.split(".")[0].substr(1)
					var d  = getImageObj(path);
					var d0 = {
						ascription:d[0]['ascription'],
						content:src,
						createTime:d[0]['createTime'],
						msgId:d[0]['msgId'],
						msgType:d[0]['msgType'],
						status:d[0]['status'],
					}
					pub.strophe.send_msg(d0);
					msgObj.updateItem(d0,d[1]);
				});
				/*
				查找获取图片的消息对象
				 */
				function getImageObj (path){
					var arr = _this.msgBody;
					console.log(arr)
					var indexVal = null;
					var msgObj = arr.filter(function(item,index){
						if (item.path == path) {
							indexVal = index;
							return item;
						}
					})
					return [msgObj[0],indexVal];
				};
				//
				function compress(img,Orientation) {
			        var initSize = img.src.length;
			        var w = img.width;
			        var h = img.height;
			        
	                // 控制上传图片的宽高
	                if(w > h && w > 750){
	                    w = 750;
	                    h = Math.ceil(750 * h/ w);
	                }else if(w < h && h > 1334){
	                    w = Math.ceil(1334 * w / h);
	                    h = 1334;
	                }
			        
			        
			        
			        
					var canvas = document.createElement("canvas");
					var ctx = canvas.getContext("2d");
					 	canvas.width = w;
			        	canvas.height = h;
			        if(Orientation && Orientation != 1){
	                    switch(Orientation){
	                        case 6:     // 旋转90度
	                            canvas.width = h;    
	                            canvas.height = w;    
	                            ctx.rotate(Math.PI / 2);
	                            // (0,-imgHeight) 从旋转原理图那里获得的起始点
	                            ctx.drawImage(img, 0, -h, w, h);
	                            break;
	                        case 3:     // 旋转180度
	                            ctx.rotate(Math.PI);    
	                            ctx.drawImage(img, -w, -h, w, h);
	                            break;
	                        case 8:     // 旋转-90度
	                            canvas.width = h;    
	                            canvas.height = w;    
	                            ctx.rotate(3 * Math.PI / 2);    
	                            ctx.drawImage(img, -w, 0, w, h);
	                            break;
	                    }
	                }else{
	                    ctx.drawImage(img, 0, 0, w, h);
	                }
					
			        ndata = canvas.toDataURL("image/jpeg", 0.8);
			
			        return ndata;
			    };
		        function upload(basestr, Orientation) {
		        	
			       /* var basestr = basestr.split(",")[1];
			        
			       	var formdata = $.extend({},{
						"method":"face_img_upload_two",
			        	"angle":Orientation,
			        	"faceimg":basestr,
					}, pub.userBasicParam);
					
			        pub.apiHandle.img_upload(formdata , ".loginPhoto");*/
			        
			    };
		        //计算图片文件的大小
				function imgsize(str){
					var str=str.substring(22);
					var equalIndex= str.indexOf('=');
					if(str.indexOf('=')>0){
					    str=str.substring(0, equalIndex);
					}
					var strLength=str.length;
					var fileLength=parseInt(strLength-(strLength/8)*2);
					return fileLength
				}
				//图片base64编码转化成blob对象
				function convertImgDataToBlob(base64Data) {
	                  var format = "image/jpeg";
	                  var base64 = base64Data;
	                  var code = window.atob(base64.split(",")[1]);
	                  var aBuffer = new window.ArrayBuffer(code.length);
	                  var uBuffer = new window.Uint8Array(aBuffer);
	                  for(var i = 0; i < code.length; i++){
	                      uBuffer[i] = code.charCodeAt(i) & 0xff ;
	                  }
	                  console.info([aBuffer]);
	                  console.info(uBuffer);
	                  console.info(uBuffer.buffer);
	                  console.info(uBuffer.buffer==aBuffer); //true
	                  var blob=null;
	                  try{
	                      blob = new Blob([uBuffer], {type : format});
	                  }
	                  catch(e){
	                      window.BlobBuilder = window.BlobBuilder ||
	                      window.WebKitBlobBuilder ||
	                      window.MozBlobBuilder ||
	                      window.MSBlobBuilder;
	                      if(e.name == 'TypeError' && window.BlobBuilder){
	                          var bb = new window.BlobBuilder();
	                          bb.append(uBuffer.buffer);
	                          blob = bb.getBlob("image/jpeg");
	                      }
	                      else if(e.name == "InvalidStateError"){
	                          blob = new Blob([aBuffer], {type : format});
	                      }
	                      else{
	                      }
	                  }
	                  alert(blob.size);
	                  return blob;
	                 
	              };
				
			},
			add_img:function(){
				//确定是连接的状态在发送消息
				if (pub.strophe.connected) {
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
				}else{
					common.prompt1({
						flag:1,
						msg:"当前不可发送消息，请确认网络连接状态或重新进入咨询页面！",
						callback:function(){
							console.log("prompt1回调")
						}
					});
				}
				
			},
			bigImg:function(e,item,index){
				/*var $this = $(this);*/
				console.log("start-----------------");
				console.log(new Date());
				var prevImgs = [];
				console.log(e);
				var target = e.target;
				var isBig = $("body").attr("data-big");
				console.log(isBig)
				if (target.nodeName == "IMG") {
					console.log("start111111111-----------------");
					console.log(new Date());
					if (!isBig) {
						
						var nw = target.naturalWidth;
						var nh = target.naturalHeight;
						
						var parBox = $("body")[0];
						var parW = parBox.clientWidth;
						var parH = parBox.clientHeight;
						
						var nw_nh = nw/nh;
						var parW_parH = parW/parH;
						
						$("body").attr("data-big",true);
						
						var src = target.currentSrc;
						var imgIndex=0,l=1;
						console.log("start222222222-----------------");
						console.log(new Date());
						//var nood = el.find("img"),l=nood.length,arrImg=[];
						var div = $("<div class='img_preview'  style='display:none'><div id='swiper_content' class='swiper_content' style='transition-duration: 0.5s; transform: translateX(0px);'></div></div>");
						$("body").append(div);
						var html = '<div class="slide"><img src= "'+src+'" /></div>';
						
						var noodpar = $(".img_preview"),w = noodpar.width();
						
						noodpar.find(".swiper_content").append(html).width(w);
						//noodpar.css({"display":"block","background":"#000000"}).find(".slide").width(w);
						$("body").css("overflow-y","hidden")
						var moveX,endX,cout = 0,moveDir;
						var movebox = document.querySelector(".img_preview .swiper_content");
						movebox.style.transform = "translateX(" + (-imgIndex * w) + "px)";
						if (nw_nh < parW_parH) {
							movebox.style.overflowY = "scroll";
						}
						cout = imgIndex;
						noodpar.css({"background":"#000000"}).find(".slide").width(w);
						console.log("start333333333-----------------");
						console.log(new Date());
						setTimeout(function(){
							noodpar.show();
							console.log("end-----------------");
							console.log(new Date());
						},100)
						/*movebox.addEventListener("touchstart", boxTouchStart, false);
			            movebox.addEventListener("touchmove", boxTouchMove, false);
			            movebox.addEventListener("touchend", boxTouchEnd, false);*/
			            movebox.addEventListener("click", boxClick, false);
			            function boxClick(e){
			            	movebox.parentNode.remove();
			            	$("body").css("overflow-y","auto").removeAttr("data-big");
			            }
						/*function boxTouchStart(e){
			                var touch = e.touches[0];
			                startX = touch.pageX;
			                endX = parseInt(movebox.style.transform.replace("translateX(",""));
			           }
			            function boxTouchMove(e){
			                var touch = e.touches[0];
			                moveX = touch.pageX - startX; 
							if(cout == 0 && moveX > 0){
								return false;
							}
							if(cout == l-1 && moveX < 0){	
								return false;
							}
							movebox.style.transform = "translateX(" + (endX + moveX) + "px)";
			            }
			            function boxTouchEnd(e){
			                moveDir = moveX < 0 ? true : false;
							if(moveDir){
								if(cout<l-1){
			                        movebox.style.transform = "translateX(" + (endX-w) + "px)";
			                        cout++;
			                   }
			               	}else{
			                    if(cout == 0){
			                        return false;
			                    }else{
									movebox.style.transform = "translateX(" + (endX+w) + "px)";
									cout--;
								}
			                }
			            }*/
					}
				}
			},
			clickMessage:function(e,item,index){
				
				if (item.msgType == 'voice') {
					this.play_voice(e,item,index)
				}else if (item.msgType == 'image'){
					this.bigImg(e,item,index);
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
					str = calcStyle (o.content)
					//str = "<img src = '"+o.content+"' />"
				}else if (o.msgType == "voice") {
					str = o.strVoiceTime+'"'
				};
				return str;
				
				function calcStyle(src){
					var ele = $("<img src='"+src+"' />");
					var target = ele[0];
					var nw = target.naturalWidth;
					var nh = target.naturalHeight;
					
					
					var sj_w,sj_h;
					var nw_nh = nw/nh;
					var nh_nw = nh/nw;
					if (nw_nh > 4/3) {
						sj_w = 350;
						sj_h = 350 * nh_nw;
					}else{
						sj_h = 262.5;
						sj_w = nw_nh * 262.5;
					}
					return "<img src = '"+src+"'  style='width: "+sj_w+"px;height: "+sj_h+"px;' />"
					
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
						
					    var playPromise = audio.play();//audio.play();// 这个就是播放  
					   	
		                playPromise.then(function(){
		                	console.log("done.");
		                	pub.Vue.msgBody[index].read = '2';
		                }).catch(function(){
		                	common.prompt("音频加载失败.");
		                });
					    console.log(audio.paused)
					    
					    
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
					
          			try{
          				var index = $(e.target).attr("data-index");
          				
	          			pub.Vue.msgBody[index].read = '1';
	          			//调用msgObj对象的更新消息接口
	          			var o = pub.Vue.msgBody[index];
	          			var i = getMsgObjIndex(index);
          			}catch(e){
          				//TODO handle the exception
          				console.log('error')
          			}
          			msgObj.updateItem(o,i);
          			if (!common.isApple()) {
          				//判断的结果
	          			var result = getNoread(index);
	          			if (result) {
	          				creatVoice(result.item,result.index);
	          			}else{
	          				console.log("没有未读的语音消息")
	          			}
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
					var len1 = pub.Vue.msgBody.length;
					/*if (len > _this.size * _this.index) {
          				return len%_this.size + (len/_this.size - _this.index)* _this.size + (+index+1);
          			}else{
          				return index;
          			}*/
          			return (len - len1 + parseInt(index))
				}
          	},
          	boxScroll:function(e){
          		var len = msgObj.msgDates.length;
          		var _this = this;
          		if (e.target.scrollTop == 0) {
          			console.log("le "+ this.size * this.index);
          			console.log(len)
          			if (len > this.size * this.index) {
          				this.isLoging = true;
	          			this.index = this.index +1;
	          			var msgO = msgObj.getMsg(this.index , this.size);
	          			if (msgO.length) {
	          				setTimeout(function(){
	          					_this.msgBody = msgO.concat(_this.msgBody);
	          					
	          				},2000);
	          			}
          			}
          		}
          	},
          	inputScroll:function(){
          	
          		var winHeight = $(window).height();  //获取当前页面高度
		        
		        $(window).resize(function () {
		            var thisHeight = $(this).height();
		            
		            if ( winHeight - thisHeight > 140 ) {
		                //键盘弹出
						//alert("键盘弹出")
						$(".im_message").scrollTop($(".im_message_main").height());
		            } else {
		            	//$(".im_message").scrollTop($(".im_message_main").height())
		                //键盘收起
		                //alert("键盘收起")
		                $(".im_message").scrollTop($(".im_message_main").height() + 220)
		            }
		        })
          	}
		}
	});
	//android环境下的input弹出问题处理
    if (common.isAndroid()){
        
	}
    
	//ios环境下的弹出框处理事件
	if (common.isApple()){
        $(document).on('focusin', function () {
            //软键盘弹出的事件处理
           // alert("软键盘弹出的事件处理")
			//$(".im_message_footer").css("position","relative")
        	//$(".im_message_footer")[0].scrollIntoView(false);
        });

        $(document).on('focusout', function () {
            //软键盘收起的事件处理
			//alert("软键盘收起的事件处理")
            //$(".im_message_footer").css("position","fixed")
        });
	}
    // 接口处理命名空间
 	pub.apiHandle = {
 		init:function(){
 			pub.apiHandle.iminfo_regist()
 			pub.apiHandle.iminfo_list();
 			pub.dfd.done(function(){
 				pub.dfdDefault.done(function(){
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
 			/*common.ajaxPost({
	            method:'iminfo_regist',
	            userId:pub.userId
	        },function( d ){
	            if( d.statusCode == '100000' ){
	            	if(d.data == 2 || d.data == 1){
	            		
	            	}else{
	            		config.userId = ''
	            	}
	            }else{
	            	config.userId = ''
	                common.prompt( d.statusStr );
	            }
	            pub.dfd.resolve();
	        });*/
	        config.userId = pub.userId;
	        configData.userImg = (common.user_datafn().faceImg == '') ? "../img/icon_touxiang.png" : common.user_datafn().faceImg;
	        pub.dfd.resolve();
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
			common.jumpLinkSpecial('.header_left',function(){
				window.history.back();
			});
			
			
			$('.preview-modal').on('click',function(){
				$(this).hide();
				$('body').removeClass('locked');
				$(document).off('touchstart touchmove');
			});
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
 			//pub.wxConfig.init();
 		}
 		pub.apiHandle.init()
 		pub.eventHandle.init(); // 模块初始化事件处理
 		
 		
	};
 	// require.async('https://hm.baidu.com/hm.js?2a10c871d8aa53992101d3d66a7812ae'); // 百度统计
	module.exports = pub;
});	
