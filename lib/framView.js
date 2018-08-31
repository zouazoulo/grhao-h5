define('framView',[],function(require, exports, module){
	var common = {
		API: "http://61.164.113.168:8090/grh_api/server/farm.do",
	}
	$.ajaxSetup({
		url: common.API,
		dataType: "jsonp"
	});
	common.ajaxPost = function(e, t, n, i) {
		t = "function" != typeof t ? function() {} : t,
			n = "function" != typeof n ? function(e) {
				o.prompt(e.statusStr)
			} : n,
			i = "function" != typeof i ? function() {} : i,
			$.ajax({
				data: e,
				success: t,
				error: n,
				complete: i
			})
	};
	var pub = {}
	pub.apiHandle = {
		init: function() {
			pub.apiHandle.index.init();
		},
	
	};
	pub.event = {
		
	}
		
	module.exports = pub;
})
