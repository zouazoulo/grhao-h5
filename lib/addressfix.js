define('addressfix',['common','LAreaData','LArea'],function(require, exports, module){

    var common = require('common');
    require('LAreaData');
	require('LArea'); 

/********************************** 地址管理 模块 ******************************* */

    // 命名空间

    pub = {};

    // pub.moduleId = $('[module-id]').attr('module-id') == 'addr';

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

/********************** 地址修改和添加 ***********************/
	// 命名空间
    pub.addrFix = {};
    var AF = pub.addrFix; // 
    
    // AF.addrId = null; // 地址编号


    AF.param = {}; // 存用户修改参数
    var AFP = AF.param; // 参数 

    // AFP.consignee = null; // 姓名
    // AFP.mobile = null; // 手机号
    // AFP.provinceName = null; // 省
    // AFP.province = null; // 省代码
    // AFP.cityName = null; // 市
    // AFP.city = null; // 市代码
    // AFP.countyName = null; // 区
    // AFP.county = null; // 区代码
    // AFP.street = null; // 街道

    // 地址修改 接口数据处理
    AF.apiHandle = {
    	init :function(){},
    	address_update : {
    		init : function(){
    			common.ajaxPost($.extend({
    				method : 'address_update',
    				addrId : AF.addrId
    			},pub.userBasicParam,AFP),function( d ){
    				if ( d.statusCode == '100000' ) {
                        $.removeData($('body')[0],'addressList');
                        window.location.replace( !pub.searchAddr ? 'address_management.html' : 'address_management.html?addr=' + pub.searchAddr);
					} else{
						common.prompt( d.statusStr );
					}
    			})
    		}
    	},
    	address_add : {
    		init : function(){
    			common.ajaxPost($.extend({
    				method : 'address_add'
    			},pub.userBasicParam,AFP),function( d ){
    				if ( d.statusCode == '100000' ) {
                        $.removeData($('body')[0],'addressList');
                        window.location.replace( !pub.searchAddr ? 'address_management.html' : 'address_management.html?addr=' + pub.searchAddr);
					}else{
						common.prompt( d.statusStr )
					}
    			})
    		}
    	}
    };

    // 地址修改 事件处理
    AF.eventHandle = {

    	init : function(){

			//点击返回按钮
			common.jumpLinkSpecial('.header_left',function(){
				window.history.back();
			});

			$('#btn_save').click(function(){

				var 
				areaArr = $('#person_area').val().split(","),
				areaCodeArr = $("#value1").val().split(",");
				
				AFP.consignee = $("#person_name").val(); //用户姓名
				AFP.mobile = $("#person_phone").val(); //手机号
				AFP.street = $("#person_moreAddress").val(), //地址的详细信息

				AFP.provinceName = areaArr[0], // 省
				AFP.province = areaCodeArr[0], // 省代码 

				AFP.cityName = areaArr[1], // 市
				AFP.city = areaCodeArr[1], // 市代码 

				AFP.countyName = areaArr[2], // 区
				AFP.county = areaCodeArr[2]; // 区代码

				if( AFP.consignee == '' ){
					common.prompt("请输入用户名"); return;
				}
				if( AFP.mobile == '' || !common.PHONE_NUMBER_REG.test( AFP.mobile ) ){
					common.prompt("请输入正确的手机号"); return;
				}
				if( areaArr.length == 0 ){
					common.prompt("请选择城市"); return;
				}
				if( AFP.street == '' ){
					common.prompt("请输入详细地址"); return;
				}
				pub.bool ? AF.apiHandle.address_update.init() : AF.apiHandle.address_add.init();
			});

    	},
    };


    AF.init = function(){
        pub.bool ? (function(){
            var addr = common.JSONparse( common.addressData.getItem() );
            AF.addrId = addr.id;
            $("#person_name").val( addr.consignee );
            $("#person_phone").val( addr.mobile );
            $("#person_area").val( addr.provinceName + "," + addr.cityName + "," + addr.countyName );
            $("#value1").val( addr.province + "," + addr.city + "," + addr.county );
            $("#person_moreAddress").val( addr.street );
            $('.header_title,title').html('编辑收货地址');
        }()) : $('.header_title,title').html('新增收货地址');
        $.dtd.resolve( LAreaData, 1 );
		AF.apiHandle.init();
		AF.eventHandle.init();
    };
	//换肤
	pub.apiHandle = {
		change_app_theme : {
			init:function(){
				if (common.huanfu.getItem() && common.huanfu.getItem() != 1) {
					$(".address_reverse").addClass("skin"+sessionStorage.getItem("huanfu"))
				}
			}
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
    	AF.init();  // 编辑和添加
    };

	module.exports = pub;
})