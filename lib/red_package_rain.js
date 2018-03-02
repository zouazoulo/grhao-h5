
define('package',['common'],function(require,exports,module){

	var pub = {};
	var common = require('common');

	var location = window.location;

	var history = window.history; 

	// console.log( common.user_datafn(),' common.user_datafn()');

	pub.logined = common.isLogin();

	if( pub.logined ){
		pub.userId = common.user_datafn().cuserInfoid; // 用户ID
	}


	pub.dialog = common.dialog.init({ btns : [  { klass : 'dialog-confirm-btn', txt : '确定'} ] }); 

	pub.wind = common.getWind();

	// 定义节点

	pub.packageRedRain = $('#package-red-rain'); // 红包雨盒子

	pub.packageUnit = pub.packageRedRain.find( '#package-unit' ); // 开红包盒子

	pub.closeRedRainNode = $('.close-red-rain'); // 关闭红包雨


	// swiper.load = ;

	pub.loadmore = $('.loadmore');
	pub.refreshText = $('.refresh');

	pub.pageIndex = 1;

	pub.dfd = $.Deferred();

	pub.dfd1 = null // 

	pub.storeInfo = common.JSONparse( common.storeInfo.getItem() );
	pub.websiteNode = pub.storeInfo.websiteNode;
	// pub.dfd1 = $.Deferred(); // 用户接口

	/*
		红包类	
	*/


	function RedPackageRain( options ){
		var defaultOptions = {
			el : '#package-red-rain', // 红包容器
			speed : 5000, // 表示动画持续时间
			// rains : [], // 用于存储红包
			density : 150, // 红包密度，产生红包的速度
			scale : 1, // 默认红包大小
			offset : 5, // 偏移距离
			rate : 0.75, // 缩放临界值
			scaleMax : 1.2,
		};
		this.options = $.extend(defaultOptions, options || {} );
		// this.start();
	};
	RedPackageRain.prototype = {
		constructor : RedPackageRain,
		create : function(){
			var options = this.options;
			var w = pub.wind.width;
			var h = pub.wind.height;
			var scaleMax = options.scaleMax;
			var rate = options.rate;
			// 红包产生区域
			// var xStart = parseInt( ( w / 2 )*( Math.random() + 1), 10);
			var xStart = parseInt( w * Math.random(), 10);
			var yStart = parseInt( ( h / 4 ) * Math.random(), 10);
			// var xEnd = parseInt( (w / 2)*Math.random()-(w / 2), 10);
			var xEnd = parseInt( xStart - w / options.offset, 10);
			var yEnd = parseInt ( h * ( Math.random() + 1 ) , 10);
			var ran = Math.random();
			var scaleR =  ran < rate ? ( ( rate + ran ) > scaleMax ? scaleMax : ( rate + ran )  ) : ran;
			var scale = ( this.options.scale *  scaleR ).toFixed(2);
			// var transform = 'transform:translate3d(' + xStart + 'px,' + yEnd + 'px,' + 0 + ') scale3d(' + scale +',' + scale + ',1);-webkit-transform:translate3d(' + xStart + 'px,' + yEnd + 'px,' + 0 +') scale3d(' + scale +',' + scale + ',1)';
			var style = 'top:' + (-yStart) + 'px;left:' + xStart + 'px;transform:scale3d(' + scale +',' + scale + ',1);-webkit-transform:scale3d(' + scale +',' + scale + ',1);';
			
			$('<span class="red-package" style="' + style + '"><span>').appendTo(options.el).animate({
				top : yEnd,
				left : xEnd,
			},options.speed,'linear',function(){
				var node = $(this).remove();
				node = null;
			});
		},
		start : function(){
			this.timer = setInterval(function(){
				this.create();
			}.bind(this),this.options.density );
		},
		stop : function(){
			clearInterval( this.timer );
			$(this.options.el).find('.red-package').remove();
		}
	};

	// 实例话 红包雨实例
	pub.redPackageIns = new RedPackageRain();


	pub.parseDate = function( time ){
		return new Date( time.trim().replace(/\-/g,'\/') );
	};
	pub.preZero = function( data ){
		if( !isNaN( data ) ){
			if(+data < 10 ) 
				return '0' + data;
			return data;
		}
	};
	pub.dateFormat = function( time ){
		var arr = [];
		if ( time > 0 ) {
			var days = parseInt( time / 1000 / 60 / 60 / 24 );
			var hous = pub.preZero( parseInt( time / 1000 / 60 / 60 % 24 )+ days * 24 );
			var min = pub.preZero( parseInt( time / 1000 / 60 % 60 ) );
			var sec = pub.preZero( parseInt( time / 1000 % 60 ) );
			arr.push(hous, min, sec);
		}
		return arr;
	};


	pub.timeDown = function(){
		var spanNodes = $('#package-time').find('span');
		pub.diffTime = pub.parseDate( pub.startTime ) - pub.parseDate( pub.systemTime );
		pub.clientCurTime = Date.now() + pub.diffTime;
		function timeDeal(){
			spanNodes.each(function(i,item){
				$(this).text( pub.dateFormat( pub.diffTime )[i] );
			});
		};
		pub.timer = setInterval(function(){
			pub.diffTime = pub.clientCurTime - Date.now();
			if( pub.diffTime <= 1000 ){
				clearInterval( pub.timer );
				$('.package-doing').show().prev().hide();
				$('.package-operation').removeClass('no end').addClass('start');
			}
			timeDeal();
		},1000);
		timeDeal();
	};


	pub.apiHandle = {
		init : function(){
			this.coupon_rain.init();
		},
		coupon_rain : {
			init : function( bool ){
				common.ajaxPost({
					method : 'coupon_rain',
					websiteNode : pub.websiteNode
				},function( d ){
					if( d.statusCode == '100000' ){
						var data = d.data;
						var couponRain = data.couponRain;
						var adInfoList = data.adInfoList;
						pub.systemTime = data.systemTime;
						pub.startTime = couponRain.startTime; 
						var status = couponRain.status;
						bool && $('.package-operation').removeClass('start end no');
						if( adInfoList ){
							$('#swiper-wrapper2-data-box').html( $('#swiper-wrapper2-data').tmpl( data.adInfoList ) );
							new Swiper('.swiper-container2',{
								direction: 'horizontal',
								loop: true,
								autoplay:5000,
								paginationClickable:true,
								autoplayDisableOnInteraction : false,
								pagination: '.swiper-pagination' 
							});
						}

						couponRain ? pub.dfd.resolve( couponRain.id ) : (function(){
							$('.package-undo').show().next().hide();
							$('.package-operation').removeClass('start end').addClass('no');
							$('#package-time').find('span').each(function(i,item){
								$( item ).html('00');
							}); return;	
						}()); 

						if( status == 1 ){
							if(  pub.systemTime > pub.startTime && pub.systemTime < couponRain.stopTime ){
								$('.package-doing').show().prev().hide();
								$('.package-operation').removeClass('no end').addClass('start');
							}else if( pub.systemTime < pub.startTime ){
								$('.package-undo').show().next().hide();
								pub.timeDown();
							}
						}else if( status == 2 ){
							$('.package-doing').show().prev().hide();
							$('.package-operation').removeClass('no start').addClass('end');
						}
						// 红包规则
						(function(){
							var desc = data.grhDesc.desc;
							var ruleStr = $.map( desc.replace(/(\n+|\r+)/g,'$').split(/\$+/g),function(item){
								if( item ) return '<p>' + item + '</p>';
							});
							$('#coupon_rain-rule-data-box').html( ruleStr );
						}());

					}else{
						pub.dfd.reject();
						pub.dialog.show( d.statusStr );
					}
				},function(){
					pub.dfd.reject();
				});
			}
		},
		coupon_user_raffle : {
			init : function(){
				common.ajaxPost({
					method : 'coupon_user_raffle',
					userId : pub.userId,
					couponRainId : pub.couponRainId
				},function( d ){
					var json = {
						'100806' : '活动不存在',
					};
					var node = pub.packageUnit.show().addClass('actived').find('.package-info p').eq(0);
					pub.dfd1 = $.Deferred();
					switch( +d.statusCode ){
						case 100000 : (function(){
							pub.packageRedRain.show();
							+d.data == 0 ? (function(){
								node.text('很抱歉').next().html('这是一个空包哦'); pub.dfd1.reject();
							}()) : (function(){
								node.text('恭喜你！').next().html('抢到了<span>' + d.data + '</span>元红包'); pub.dfd1.resolve();
							}());
						}()); break;
						case 100807 : pub.dialog.show('红包活动已结束<br/>请您下次早点来哦',function(){
							history.back();
							pub.apiHandle.coupon_rain.init( true );
						}); break;
						case 100808 : (function(){
							node.text('你已抢过红包了').next().html('请您下次活动再来哦'); pub.dfd1.resolve();
						}()); break;
						default :  
						pub.packageRedRain.hide();
						common.dialog.init({
							btns : [{ klass : 'dialog-confirm-btn', txt : '确认'}]
						}).show( (json[ d.statusCode ] || d.statusStr),function(){
							history.back();
							pub.pageIndex = 1;
							pub.closeRedRainNode.show();
							pub.dialog = common.dialog.init({ btns : [  { klass : 'dialog-confirm-btn', txt : '确定'} ] }); 
						});
					}
					pub.closeRedRainNode.hide();
				});
			}
		},
		coupon_rain_rcd_list : {
			init : function( bool ){
				common.ajaxPost({
					method : 'coupon_rain_rcd_list',
					pageNo : pub.pageIndex,
					couponRainId : pub.couponRainId,
					pageSize : 20
				},function( d ){
					if( d.statusCode == '100000' ){
						pub.isEnd = d.data.isLast;
						if( bool ){
							$('#coupon_rain_rcd_list-data-box').find('.swiper-slide').remove();
							pub.refreshText.html('刷新成功！');
							var timer = setTimeout(function(){
								pub.refreshText.slideUp();
								clearTimeout( timer );
								timer = null;
							},500);
						}
						if( pub.isEnd ) pub.loadmore.html('没有更多数据');
						pub.loadmore.before( $('#coupon_rain_rcd_list-data').tmpl( d.data.objects ) );
					}else{
						pub.dialog.show( d.statusStr );		
					}
				});
			}
		}
	};

	pub.eventHandle = {
		init : function(){
			var closeRedRainNode = pub.closeRedRainNode;
			$('#modal-box').on('click',function(e){
				var className = e.target.className;
				if( className == 'modal-box' ){
					closeRedRainNode.show();
					$(this).fadeOut();
				}
			});
			// 抢红包
			pub.packageRedRain.on('click','.red-package',function(){
				pub.redPackageIns.stop();
				pub.apiHandle.coupon_user_raffle.init();
			});
			// 红包确认按钮
			$('#confirm-btn').click(function(){
				history.back();
				pub.packageUnit.removeClass('actived').hide();
				closeRedRainNode.show();
				pub.dfd1.done(function(){
					pub.apiHandle.coupon_rain_rcd_list.init( true );
				}).fail(function(){
					history.back();
				});
				pub.packageRedRain.hide();
			});
			// 开始
			$('.package-box').on('click','.package-operation',function(){
				var $this = $(this);
				var isStart = $this.is('.start');
				if( !pub.logined ){
					common.jumpMake.setItem( 14 );
					common.jumpLinkPlain( 'login.html' );
					return;
				}
				if( isStart ){
					history.pushState({page:'red_package_rain',title:'红包雨'},'','#red_package_rain');
					pub.packageRedRain.fadeIn(300);
					pub.redPackageIns.start();
					closeRedRainNode.show();
				}
			});

			// 规则
			$('.rule.btn-check').click(function(){
				$('#modal-box').fadeIn();
				pub.closeRedRainNode.hide();
			});

			$('.package.btn-check').click(function(){
				common.jumpLinkPlain( pub.logined ? 'cuopon_management.html' : 'login.html' );
			});

			// 关闭红包雨
			closeRedRainNode.click(function(){
				history.back();
			});
			window.onpopstate = function( e ){
				if( !e.state ){
					pub.redPackageIns.stop();
					pub.packageRedRain.hide();
				}
			};

			// 列表接口
			pub.dfd.done(function( id ){
				pub.couponRainId = id;
				pub.apiHandle.coupon_rain_rcd_list.init();
			});


			pub.swiper = {};
			var swiper = pub.swiper;
			
			swiper.ins = new Swiper('.swiper-container',{
				speed: 300,
				slidesPerView: 'auto',
				freeMode: true,
		        direction: 'vertical',
				onTouchEnd : function(me){
					var node = $('#coupon_rain_rcd_list-data-box');
					var _viewHeight = node[0].offsetHeight;
					var slide = node.find('.swiper-slide')[0];
		            var _contentHeight = slide ? slide.offsetHeight : ( 36 + 'px' );
		             // 上拉加载
		            if(me.translate <= _viewHeight - _contentHeight - 50 && me.translate < 0) {
		                if( !pub.isEnd ){
		                	pub.pageIndex++;
		                	pub.apiHandle.coupon_rain_rcd_list.init();
		                    pub.loadmore.show().html('上拉加载更多...');
		                }else{
		                	pub.loadmore.show().html('没有更多数据');
		                }
		            }
					if( me.translate >= 20 ) {
					    pub.refreshText.html('正在刷新...').show();
					    pub.loadmore.html('上拉加载更多');
					    pub.pageIndex = 1;
					    pub.apiHandle.coupon_rain_rcd_list.init( true, me );
					}else if( me.translate >= 0 && me.translate < 20 ){
						pub.refreshText.html('').hide();
					}
					return false;
				},
				onTouchMove : function( me ){
					var translate = me.translate || 0;
		            if( translate < 20 &&  translate > 0) {
						pub.refreshText.html('下拉刷新...').show();
					}else if( translate > 20 ){
						pub.refreshText.html('释放刷新...');
					}
            	},
            	onTouchStart : function( me ){
            		me.update();
            	}
			});
		},
	};





	pub.init = function(){
		if( location.hash == '#red_package_rain' ){
			history.back();
		}
		['eventHandle','apiHandle'].forEach(function(item){
			pub[ item ].init();
		});
	};
	module.exports = pub;
});