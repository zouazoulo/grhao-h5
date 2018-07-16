define('adderessManagement',['common'],function(require, exports, module){

    var common = require('common');

/********************************** 地址管理 模块 ******************************* */

    // 命名空间

    pub = {};

    pub.moduleId = $('[module-id]').attr('module-id') == 'addr';
    pub.logined = common.isLogin(); // 是否登录
    !common.storeInfo.getKey() && common.jumpLinkPlain('../index.html'); 
    if( pub.logined ){
    	pub.userId = common.user_datafn().cuserInfoid;
    	pub.source = "userId" + pub.userId;
    	pub.sign = common.encrypt.md5( pub.source + "key" + common.secretKeyfn() ).toUpperCase();
    	pub.tokenId = common.tokenIdfn();
    }else{
        common.jumpLinkPlain( '../index.html' );
    }

	pub.bool = common.addressData.getKey(); // addressData 数据存储是否存在

	pub.userBasicParam = {
		userId : pub.userId,
		source : pub.source,
		sign : pub.sign,
		tokenId : pub.tokenId
	};

    pub.searchAddr = common.getUrlParam('addr');

	pub.addrId = null; // 地址ID
	pub.defaultBtn = null; // 默认选择按钮

    // 地址列表 接口数据处理命名空间
    pub.apiHandle = {
    	init : function(){
    		var me = this;
    		me.address_manager.init();
    	},
    	address_manager : {
    		init : function(){
    			var me = this;
    			common.ajaxPost($.extend({
    				method:'address_manager',
    			}, pub.userBasicParam ),function( d ){
    				d.statusCode == "100000" && me.apiData( d );
    			});
    		},
    		apiData : function( d ){
    			var 
    				data = d.data,
    			 	html = '';
				for (var i in data) {
					var obj = data[i];
					html += '<div class="contain_address" addr-id="' + obj.id + '" >'
					html += '	<div class="management_address"  >'
					html += '        <div class="management_address_top clearfloat">'
					html += '	         <div class="management_address_name">' + obj.consignee + '</div>'
					html += '	         <div class="management_address_phone">' + obj.mobile + '</div>'
					html += '        </div>'
					html += '       <div class="management_address_bottom">' + obj.provinceName + obj.cityName + obj.countyName +"&nbsp;&nbsp;"+  obj.addName + '</div>'
					html += '       <div class="management_address_bottom" style="font-size:24px">' + obj.address + obj.street + '</div>'
				    html += '    </div>'
					html += '	<div class="address_set clearfloat" >'
					
					html += '		<div class="default_address operate ' + ['','','default_bg'][ obj.isDefault+1 ] + '">默认地址</div>'

					html += '		<div class="editor_address operate">编辑</div>'
					html += '		<div class="delete_address operate">删除</div>'
					html += '	</div>'
					html += '</div>'
				}
				$(".address_management").append(html);
				$(".add_address").show();
				$.data( $('body')[0],'addressList', d.data );
    		}
    	},
    	address_default : {
    		init : function(){
    			common.ajaxPost($.extend({
    				method:'address_default',
    				addrId : pub.addrId
    			},pub.userBasicParam),function( d ){
    				if ( d.statusCode == "100000" ) {
						$(".default_bg",".address_management").removeClass("default_bg");
						pub.defaultBtn.addClass("default_bg");
					} else{
						common.prompt( d.statusStr )
					}
    			});
    		}
    	},
    	address_delete : {
    		init : function(){
    			common.ajaxPost($.extend({
    				method : 'address_delete',
    				addrId : pub.addrId,	
    			},pub.userBasicParam),function( d ){
    				if( d.statusCode == "100000" ){
                       $( '[addr-id="' + pub.addrId + '"]' ).remove();
                       pub.bool && $('[addr-id]').length == 0 && common.addressData.removeItem();
                    }
                    
    			});
    		}
    	}
    };
    
    // 事件处理 
    pub.eventHandle = {
    	init : function(){

            //common.dialog.init();
    		// 选择默认地址
    		$(".address_management").on('click',".operate",function(){

    			var 
    			$this = $(this),
    			isEditor = $this.is('.editor_address'),
    			isDelete = $this.is('.delete_address'),
    			isDefault = $this.is('.default_address'),
    			isCur = $this.is('.default_bg');

    			pub.addrId = $this.parents('.contain_address').attr('addr-id');
    			// 默认地址选择
    			if( isDefault && !isCur ){ 
    				pub.defaultBtn = $this;
    				pub.apiHandle.address_default.init(); 
    				return;
    			} 
    			// 删除
    			if( isDelete ){
    				common.dialog.init();
                    common.dialog.show('确定要删除吗？',function(){},function(){
                        pub.apiHandle.address_delete.init();
                    });
					return;
    			}

    			if( isEditor ){
    				var 
    				index = $this.parents('.contain_address').index(),
    				addrInfo = common.JSONStr( $.data($('body')[0],'addressList')[index] );

					common.addressData.setItem( addrInfo );
                    // var url =  !pub.searchAddr ? "address.html" : "address.html?addr=" + pub.searchAddr;
					common.jumpLinkPlain( !pub.searchAddr ? "address.html" : "address.html?addr=" + pub.searchAddr );
    			}
			});
			
			// 点击添加
			common.jumpLinkSpecial(".add_address",function(){
				pub.bool && common.addressData.removeItem();
                window.location.replace( !pub.searchAddr ? 'address.html' : 'address.html?addr=' + pub.searchAddr);
			});

			// 返回上一页
    		common.jumpLinkSpecial('.header_left',function(){ 
                if( !pub.searchAddr ){
        			window.location.replace( 'orderSettlement.html?dom=dom' + Math.floor(Math.random() * 100000 ) );
                }else{
                    window.location.replace('my.html');
                }
    		});

    		$(".address_management").on('click',".management_address",function(){
    			var 
    			index = $(this).parents('.contain_address').index(),
    			d = $.data($('body')[0],'addressList')[index];
    			if (!d.latitude && !d.longitude) {
    				common.dialog.init({btns : [
						{ klass : 'dialog-confirm-btn', txt : '确认'}
					]});
	                common.dialog.show('当前地址没有定位信息，请先编辑然后选择地址定位信息？',function(){
	                	
	                });
    			} else{
    				var addrInfo = common.JSONStr( d ); // 取出数据并存储
					common.addressData.setItem( addrInfo );
                	window.location.replace( 'orderSettlement.html?dom=dom' + Math.floor(Math.random() * 100000 ) );
    			}
    			
                // common.historyReplace( '../index.html' );
			});
    		!common.addType.getKey() && $('.address_management').off('click','.management_address'); // 判断是否从订单进入
    	},
    };

	//换肤
	pub.apiHandle.change_app_theme = {
		init:function(){
			if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
				$(".add_address").addClass("skin"+sessionStorage.getItem("huanfu"))
			}
		}
	}
	pub.wxConfig = {
		init:function(){
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

					wx.config({

					    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
					    appId: appId, // 必填，公众号的唯一标识
					    timestamp : timestamp, // 必填，生成签名的时间戳
					    nonceStr: nonceStr, // 必填，生成签名的随机串
					    signature: signature,// 必填，签名，见附录1

					    jsApiList:["scanQRCode"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
					});
					wx.ready(function(){ 
						wx.checkJsApi({
			            	jsApiList: ['scanQRCode'],
			            	success: function (res) {
			 
			            	}
			            })
					});
					wx.error(function(res){

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
    	if (!common.huanfu.getKey()) {
			common.change_app_theme();
			common.defHuanfu.done(function(){
				pub.apiHandle.change_app_theme.init();
			})
		}else{
			pub.apiHandle.change_app_theme.init();
		}
		pub.apiHandle.init();
		pub.eventHandle.init();
		common.addObj.getItem() && common.addObj.removeItem();
    };

	module.exports = pub;
})