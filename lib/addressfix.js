define('addressfix',['common'],function(require, exports, module){

    var common = require('common');

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

	pub.bool1 = common.addObj.getKey();
	
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
    	init :function(addr){
    		var consignee = addr.consignee || '',//用户名
    			mobile = addr.mobile ||'',//手机号
    			street = addr.street || '',//门牌号
    			
    			provinceName = addr.pname || addr.provinceName || '',//省provinceName
    			cityname = addr.cityname || addr.cityName || '',//市
    			countyName = addr.adname || addr.countyName || '',//县区
    			county = addr.adcode || addr.county || '',//县区编码
    			
    			latitude = (addr.location && addr.location.lat) || addr.latitude || '',//纬度
    			longitude = (addr.location && addr.location.lng) || addr.longitude || '',//经度
    			addName = addr.name || addr.addName || '',//地址的名称
    			address = addr.address || '';//地址的描述
    		
    		
    		
    		$("#person_name").val( consignee );
            $("#person_phone").val( mobile );
            $("#person_moreAddress").val( street );
            //$("#person_area").val( addr.provinceName + "," + addr.cityName + "," + addr.countyName );
           	var obj = {
           		provinceName:provinceName ? provinceName : '',
           		cityname: cityname ? cityname :'',
           		countyName:countyName ? countyName :'',
           		county:county ? county :'',
           		latitude:latitude ? latitude :'',
           		longitude:longitude ? longitude:'',
           		address:address ? address :'',
           		addName:addName ? addName :''
           	}
            $("#person_area").data( "data",JSON.stringify(obj));
            var str = (addName ? "<p class='name'>"+addName+"</p>" : '' ) + (address ?  "<p class='address'>"+address+"</p>" : '')
            $("#person_area").html( str ? str : '请选择收货地址');
    	},
    	address_update : {
    		init : function(){
    			common.ajaxPost($.extend({
    				method : 'address_update_two',
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
    				method : 'address_add_two'
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
				//部分地址对象
				var addr = JSON.parse($('#person_area').data('data'));
				
				AFP.consignee = $("#person_name").val(); //用户姓名
				AFP.mobile = $("#person_phone").val(); //手机号
				AFP.street = $("#person_moreAddress").val(), //地址的详细信息

				AFP.provinceName = addr.provinceName; // 省
				//AFP.province = areaCodeArr[0], // 省代码 

				AFP.cityName = addr.cityname; // 市
				//AFP.city = areaCodeArr[1], // 市代码 

				AFP.countyName = addr.countyName; // 区
				AFP.county = addr.county; // 区代码
				
				AFP.latitude = addr.latitude;
				AFP.longitude = addr.longitude
				
				AFP.addName = addr.addName;
				AFP.address = addr.address;
				
				if( AFP.consignee == '' ){
					common.prompt("请输入用户名"); return;
				}
				if( AFP.mobile == '' || !common.PHONE_NUMBER_REG.test( AFP.mobile ) ){
					common.prompt("请输入正确的手机号"); return;
				}
				if( !AFP.addName ){
					common.prompt("请选择收货地址"); return;
				}
				if( AFP.street == '' ){
					common.prompt("请输入详细地址"); return;
				}
				pub.bool ? AF.apiHandle.address_update.init() : AF.apiHandle.address_add.init();
			});
			$("#person_area").on("click",function(){
				/*跳转之前先将本页面的数据存储*/
				//部分地址对象
				var addr = $('#person_area').data('data');
				var consignee = $("#person_name").val(); //用户姓名
				var mobile = $("#person_phone").val(); //手机号
				var street = $("#person_moreAddress").val(); //地址的详细信息
				
				var provinceName = addr.provinceName,//省
	    			cityname = addr.cityname,//市
	    			adname = addr.adname,//县区
	    			adcode = addr.adcode,//县区编码
	    			lat = addr.lat,//纬度
	    			lng = addr.lng,//经度
	    			name = addr.name,//地址的名称
	    			address = addr.address;//地址的描述
	    		
	    		var obj = $.extend({},{
					'consignee':consignee,
					'mobile':mobile,
					'street':street
				},JSON.parse(addr));
				common.addObj.setItem(JSON.stringify(obj))
				window.location.replace("addressMap.html?addr="+pub.searchAddr);
			})
    	},
    };


    AF.init = function(){
    	
    	var addObj = pub.bool1 ? JSON.parse(common.addObj.getItem()) : null;
        var addr = {};
        pub.bool ? (function(){
            addr = common.JSONparse( common.addressData.getItem() );
            AF.addrId = addr.id;
            
            $('.header_title,title').html('编辑收货地址');
        }()) : (function(){
        	$('.header_title,title').html('新增收货地址');
        })();
    	var d = $.extend({}, addr , addObj);
    	
        //$.dtd.resolve( LAreaData, 1 );
		AF.apiHandle.init(d);
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