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
					html += '       <div class="management_address_bottom">' + obj.provinceName + obj.cityName + obj.countyName + obj.street + '</div>'
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

            common.dialog.init();
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
        			window.location.replace( 'order_set_charge.html?dom=dom' + Math.floor(Math.random() * 100000 ) );
                }else{
                    window.location.replace('my.html');
                }
    		});

    		$(".address_management").on('click',".management_address",function(){
    			var 
    			index = $(this).parents('.contain_address').index(),
    			addrInfo = common.JSONStr( $.data($('body')[0],'addressList')[index] ); // 取出数据并存储
				common.addressData.setItem( addrInfo );
                window.location.replace( 'order_set_charge.html?dom=dom' + Math.floor(Math.random() * 100000 ) );
                // common.historyReplace( '../index.html' );
			});
    		!common.addType.getKey() && $('.address_management').off('click','.management_address'); // 判断是否从订单进入
    	},
    };



    // 模块初始化
    pub.init = function(){
		pub.apiHandle.init();
		pub.eventHandle.init();
    };

	module.exports = pub;
})